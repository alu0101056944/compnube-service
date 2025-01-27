/**
 * University of La Laguna
 * High School of Engineering and Technology
 * Degree in Computer Science
 * Computación en la Nube
 *
 * @author Marcos Barrios
 * @since 07_04_2024
 * @desc Start script for the express server of the generic cloud computing
 *    service
 *
 */

'use strict';

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import process from 'process';
import { readFile, writeFile, access } from 'fs/promises'
import fs from 'fs/promises';
import { mkdirSync, readFileSync } from 'fs';
import { lookup } from "mime-types"

import JSZip from 'jszip';
import multer from 'multer';

import ServicesLoader from '../src/services/ServicesLoader.js';
import ServicesValidator from '../src/services/ServicesValidator.js';

import { config } from '../src/config.js';

import cors from 'cors';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * @summary Configure and run the webserver.
 */
async function execute() {
  const application = express();

  application.set('port', 8080);

  const PATH_TO_ROOT = path.join(__dirname, '../www');
  const PATH_TO_SRC = path.join(__dirname, '../src');
  application.use(express.static(PATH_TO_ROOT));
  application.use(express.static(PATH_TO_SRC));
  application.use(express.json());
  application.use(cors());

  // write a fresh requestLaunchs.json if needed
  try {
    await access('src/services/requestLaunchs.json', fs.constants.F_OK);
  } catch (error) {
    if (error.code === 'ENOENT') {
      const TEMPLATE = JSON.stringify({ launchs: {} }, null, 2);
      await writeFile('src/services/requestLaunchs.json', TEMPLATE);
    } else {
      console.error('Could not check whether requestLaunchs.json exists:' + error);
    }
  }

  // write a fresh requestAmount.json if needed
  try {
    await access('src/services/requestAmount.json', fs.constants.F_OK);
  } catch (error) {
    if (error.code === 'ENOENT') {
      const TEMPLATE = JSON.stringify({ totalAmountOfServiceRequests: 1 }, null, 2);
      await writeFile('src/services/requestAmount.json', TEMPLATE);
    } else {
      console.error('Could not check whether requestLaunchs.json exists:' + error);
    }
  }

  // setup file storage.
  const storage = multer.diskStorage({
    destination: (request, file, cb) => {
      const PATH = config.fileInputsPath + request.headers['x-service-id'];
      mkdirSync(PATH, { recursive: true });
      cb(null, PATH);
    },
    filename: (request, file, cb) => {
      cb(null, file.originalname);
    }
  });
  const upload = multer({ storage: storage });

  application.listen(application.get('port'), '0.0.0.0', function() {
    const DEFAULT_START_MESSAGE =
        'The server is running on http://<your machine IP addr>:';
    console.log(DEFAULT_START_MESSAGE + application.get('port'));
  });

  application.post('/execute', async (request, response) => {
    console.log('/execute called');
    console.log('Job request obtained');

    // register request on requestLaunchs
    const fileWithRuns =
        await readFile('src/services/requestLaunchs.json', 'utf-8');
    const jsonWithRuns = JSON.parse(fileWithRuns);
    jsonWithRuns.launchs[request.body.id] = request.body;
    await writeFile('src/services/requestLaunchs.json',
        JSON.stringify(jsonWithRuns, null, 2));

    // create updates file for the request
    const WRITE_PATH = config.requestUpdatesPath + request.body.id + '.json';
    console.log(WRITE_PATH);
    const firstUpdate = { executionState: 'Job created, execution pending' };
    await writeFile(WRITE_PATH, JSON.stringify({ updates: [firstUpdate] }));

    // create file inputs folder for the request
    const WRITE_PATH_FILE_INPUTS =
        config.fileInputsPath + request.body.id;
    await fs.mkdir(WRITE_PATH_FILE_INPUTS, { recursive: true });

    try {
      // add the job to the host server queue
      await fetch(`http://${request.body.config.hostAddress}/register/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(request.body, null, 2),
      });

      const formData = new FormData();

      // attach the binary
      const BINARY_PATH = config.servicesPath +
          request.body.config.binaryName;
      const binaryFile = await readFile(BINARY_PATH);
      const binaryFileBlob =
          new Blob([binaryFile], { type: lookup(BINARY_PATH) });
      formData.append('files', binaryFileBlob, request.body.config.binaryName);

      // attach the input files
      const allFileName =
          await fs.readdir(config.fileInputsPath + request.body.id);
      for (const fileName of allFileName) {
        const FILE_PATH =
            config.fileInputsPath + request.body.id + '/' + `${fileName}`;
        const FILE_CONTENT = readFileSync(FILE_PATH);
        const blob = new Blob([FILE_CONTENT], {type: lookup(FILE_PATH)});
        formData.append('files', blob, fileName);
      }

      // attach the aditional zip if applicable
      if (request.body.config.hasAditionalZIP === 'true') {
        const FILENAME = `${request.body.config.binaryName.split('.')[0]}.zip`;
        const ZIP_PATH = `services/${FILENAME}`;
        const FILE_CONTENT = await readFile(ZIP_PATH);
        const blob = new Blob([FILE_CONTENT], { type: lookup(ZIP_PATH) });
        formData.append('files', blob, FILENAME);
      }

      const response2 = await fetch('http://' + request.body.config.hostAddress +
          '/pushinputfiles/', {
        method: 'POST',
        headers: {
          'X-Service-ID': request.body.id,
          'Has-ZIP': request.body.config.hasAditionalZIP,
          'ZIP-Name': `${request.body.config.binaryName.split('.')[0]}.zip`
        },
        body: formData
      });
    } catch (error) {
      console.error('Error when sending execution request for ' +
        request.body.config.name + '(' + request.body.id + ').' +
        'Marking it\'s ids as execution failed. Error: ', error);

      // push update to updates file
      const updatesFile =
          await readFile(config.requestUpdatesPath + request.body.id + '.json',
              'utf8');
      const updatesFileJSON = JSON.parse(updatesFile);
      updatesFileJSON.updates.push({
        executionState: 'execution failed',
      });
      await writeFile(config.requestUpdatesPath + request.body.id + '.json',
          JSON.stringify(updatesFileJSON, null, 2));
    }
  });

  application.get('/services', async (request, response) => {
    console.log('/services called');
    const serviceLoader = new ServicesLoader();
    const allServiceConfig = await serviceLoader.load()
    const serviceValidator = new ServicesValidator();
    const allValidServiceConfig = await serviceValidator.validate(allServiceConfig);
    response.json(allValidServiceConfig);
  });

  application.get('/getnewservicerequestid', async (request, response) => {
    console.log('/getnewservicerequestid called');
    try {
      const outputJSON = {};

      // create new unique service id and update the file with the latest id
      const fileWithAmount =
          await readFile('src/services/requestAmount.json', 'utf-8');
      const jsonWithAmount = JSON.parse(fileWithAmount);
      outputJSON.newId = jsonWithAmount.totalAmountOfServiceRequests + 1;
      ++jsonWithAmount.totalAmountOfServiceRequests;
      await writeFile('src/services/requestAmount.json',
          JSON.stringify(jsonWithAmount, null, 2));
  
      response.json(outputJSON)
    } catch (error) {
      console.log('Failed to read or write the requestAmount.json file. ' +
          'Unable to generate new service request id.' + error);
    }
  });

  application.get('/getruns', async (request, response) => {
    console.log('/getruns called');
    const fileWithRuns =
        await readFile('src/services/requestLaunchs.json', 'utf-8');
    const jsonWithRuns = JSON.parse(fileWithRuns);

    response.json(jsonWithRuns);
  });

  application.get('/getupdates', async (request, response) => {
    console.log('/getupdates called');

    const executionUpdates = {};
    const potentiallyDeadIds = [];

    const fileWithRuns =
        await readFile('src/services/requestLaunchs.json', 'utf-8');
    const jsonWithRuns = JSON.parse(fileWithRuns);

    for (const run of Object.values(jsonWithRuns.launchs)) {
      executionUpdates[run.id] ??= {}

      const updatesFile = await readFile(config.requestUpdatesPath +
          run.id + '.json');
      const updatesFileJSON = JSON.parse(updatesFile);
      for (const update of updatesFileJSON.updates) {
        if (update.executionState) {
          executionUpdates[run.id].executionState = update.executionState;
        }
        if (update.hasDownloadedOutputFiles) {
          executionUpdates[run.id].hasDownloadedOutputFiles =
              update.hasDownloadedOutputFiles;
        }
        if (update.stdout) { // just get the latest stdout
          executionUpdates[run.id].stdout = update.stdout;
        }
        if (update.maxCpuLoad) {
          executionUpdates[run.id].maxCpuLoad = update.maxCpuLoad ?? 'unknown';
        }
        if (update.avgCpuLoad) {
          executionUpdates[run.id].avgCpuLoad = update.avgCpuLoad ?? 'unknown';
        }
        if (update.execTime) {
          executionUpdates[run.id].execTime = update.execTime ?? 'unknown';
        }
      }

      if (executionUpdates[run.id].executionState === 'Job created, execution pending' ||
          executionUpdates[run.id].executionState === 'Executing') {
        potentiallyDeadIds.push(run.id) 
      }
    }

    // associate origin address to its id runs for reducing the fetch amount
    const hostAddressToRunId = {}
    for (const potentialyDeadId of potentiallyDeadIds) {
      const HOST_ADDRESS_OF_ID =
          jsonWithRuns.launchs[potentialyDeadId].config.hostAddress;
      hostAddressToRunId[HOST_ADDRESS_OF_ID] ??= [];
      hostAddressToRunId[HOST_ADDRESS_OF_ID].push(potentialyDeadId);
    }

    let idsThatAreNotAlive = [];
    for (const hostAddress of Object.getOwnPropertyNames(hostAddressToRunId)) {
      try {
        const response2 = await fetch(`http://${hostAddress}/alivestatecheck`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ ids: hostAddressToRunId[hostAddress] })
        });
        const json = await response2.json();
        const idsNotAliveOnTheHost = json.allDeadId;
        idsThatAreNotAlive =
            idsThatAreNotAlive.concat(idsNotAliveOnTheHost);
      } catch (error) {
        console.error('Could not connect to host ' + hostAddress + ' to check ' +
          ' id aliveness. Assumming it\'s ids are dead.');
          idsThatAreNotAlive =
            idsThatAreNotAlive.concat(hostAddressToRunId[hostAddress]);
      }
    }

    for (const idNotAlive of idsThatAreNotAlive) {

      // add new update to its updates file
      const UPDATE_FILE = await readFile(`jobUpdates/${idNotAlive}.json`);
      const updateFile = JSON.parse(UPDATE_FILE);
      updateFile.updates.push({ executionState: 'execution failed' });

      // change the latest update found earlier
      executionUpdates[idNotAlive].executionState = 'execution failed';
    }

    if (Object.getOwnPropertyNames(executionUpdates).length > 0) {
      response.json(executionUpdates);
    } else {
      response.json({});
    }
  });

  // meant for the server to push here when something changes in the
  // execution of the job.
  application.post('/pushupdate', async (request, response) => {
    console.log('/pushupdate called');
    const update = request.body;

    console.log('Received /pushupdate for ' + update.id);

    const UPDATE_PATH = `${config.requestUpdatesPath}/${update.id}.json`;
    const updateFile = await readFile(UPDATE_PATH, 'utf8');
    const updateFileJSON = JSON.parse(updateFile);
    updateFileJSON.updates.push({
      executionState: update.executionState,
      stdout: update.stdout,
      maxCpuLoad: update.maxCpuLoad,
      avgCpuLoad: update.avgCpuLoad,
      execTime: update.execTime,
    });
    await writeFile(UPDATE_PATH, JSON.stringify(updateFileJSON, null, 2));
    response.send('OK');
  });

  application.post('/getavailablefiles', async (request, response) => {
    console.log('/getavailablefiles called');
    const ID = request.body.id;
    let hasDownloadedOutputFiles = false;
    let hasFinishedExecutionSucessfully = false;
    const PATH = config.requestUpdatesPath + ID + '.json';
    const allUpdate = await readFile(PATH, 'utf8');
    const allUpdateJSON = JSON.parse(allUpdate);
    for (let i = 0; i < allUpdateJSON.updates.length; i++) {
      if (allUpdateJSON.updates[i].hasDownloadedOutputFiles) {
        hasDownloadedOutputFiles = true;
      }
      const SUCESS_STRING = "Finished execution successfully";
      if (allUpdateJSON.updates[i].executionState === SUCESS_STRING) {
        hasFinishedExecutionSucessfully = true;
      }
      if (hasDownloadedOutputFiles && hasFinishedExecutionSucessfully) {
        break;
      }
    }
    if (hasFinishedExecutionSucessfully) {
      if (hasDownloadedOutputFiles) {
        response.json({ filesAvailable: 'false' });
      } else {
        response.json({ filesAvailable: 'true' });
      }
    } else {
      response.json({ filesAvailable: 'false' });
    }
  });

  application.post('/download', async (request, response) => {
    console.log('/download called');

    try {

      // tell host through server that it can delete the files now.
      const runsFile = await readFile('src/services/requestLaunchs.json');
      const runsFileJSON = JSON.parse(runsFile);
      const runInfo = runsFileJSON.launchs[request.body.id];

      const response2 =
      await fetch(`http://${runInfo.config.hostAddress}/downloadoutput/`, {
        method: 'GET',
        headers: {
          'X-Service-ID': request.body.id,
        },
      });
      const files = await response2.blob();

      const HOST_ADDRESS = `http://${runInfo.config.hostAddress}/deletefiles/`;
      const response3 = await fetch(HOST_ADDRESS, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(runInfo, null, 2)
      });

      if (response3.ok) {

        // push update to updates file
        const UPDATES_PATH = config.requestUpdatesPath + runInfo.id + '.json';
        const allUpdate = await readFile(UPDATES_PATH, 'utf8');
        const allUpdateJSON = JSON.parse(allUpdate);
        allUpdateJSON.updates.push({ hasDownloadedOutputFiles: true });
        await writeFile(UPDATES_PATH,
            JSON.stringify(allUpdateJSON, null, 2));
      } else {
        console.log('Failed to delete the files on host. Files will remain');
        throw new Error('/download request answered with: ' + response3.text());
      }

      // Required for transfering the same blob to the client
      response.type(files.type);
      const buf = await files.arrayBuffer();
      response.send(Buffer.from(buf));
    } catch (error) {
      console.error('Error when downloading files from host for ' +
          request.body.id + ': ' + error);
    }
  });

  // called at the same time as /execute
  // id comes in a separate header
  application.post('/pushinputfiles', upload.array('files', 20), async (request, response) => {
    console.log('/pushinputfiles called');
      if (!request.files || request.files.length === 0) {
        return response.status(400).send('No files uploaded.');
      }
      response.send(`${request.files.length} file(s) uploaded successfully!`);
  });

  application.post('/terminaterun', async (request, response) => {
    console.log('/terminaterun called');

    const ID = request.body.id;

    const fileWithRuns =
        await readFile('src/services/requestLaunchs.json', 'utf-8');
    const jsonWithRuns = JSON.parse(fileWithRuns);
    const HOST_ADDRESS = jsonWithRuns.launchs[ID].config.hostAddress;

    try {
      const response2 = await fetch(`http://${HOST_ADDRESS}/terminaterun`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id: ID })
      });
    } catch (error) {
      console.error('Attempt at killing ' + ID + 'failed: ' + error);
    }
  });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  execute();
}
