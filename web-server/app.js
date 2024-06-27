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
import { readFile, writeFile } from 'fs/promises'
import fs from 'fs/promises';
import { mkdirSync, readFile } from 'fs';

import JSZip from 'jszip';
import multer from 'multer';
import FormData from 'form-data';

import ServicesLoader from '../src/services/ServicesLoader.js';
import ServicesValidator from '../src/services/ServicesValidator.js';

import { config } from '../src/config.js';

import cors from 'cors';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * @summary Configure and run the webserver.
 */
function execute() {
  const application = express();

  application.set('port', 8080);

  const PATH_TO_ROOT = path.join(__dirname, '../www');
  const PATH_TO_SRC = path.join(__dirname, '../src');
  application.use(express.static(PATH_TO_ROOT));
  application.use(express.static(PATH_TO_SRC));
  application.use(express.json());
  application.use(cors());

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
    await writeFile(WRITE_PATH, JSON.stringify({ updates: [] }));

    // create downloads folder for the request
    const WRITE_PATH_DOWNLOADS =
        config.fileOutputsPath + request.body.id;
    await fs.mkdir(WRITE_PATH_DOWNLOADS, { recursive: true });

    // create file inputs folder for the request
    const WRITE_PATH_FILE_INPUTS =
        config.fileInputsPath + request.body.id;
    await fs.mkdir(WRITE_PATH_FILE_INPUTS, { recursive: true });

    try {
      // add the job to the host server queue
      await fetch(`http://${request.body.hostAddress}/register/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: request.body,
      });

      const formData = new FormData();

      // attach the binary
      const binaryFile = await readfile(config.servicesPath +
          request.body.config.binaryName);
      form.append('files', binaryFile, request.body.config.binaryName);

      // attach the input files
      fs.readdir(config.fileInputsPath + request.body.id, (error, files) => {
        if (error) {
          console.error('Cannot read input files. Error occurred while ' +
              'reading the folder:', error);
        } else {
          files.forEach(file => {
            const FILE_PATH =
                config.fileInputsPath + request.body.id + '/' + `${file}`;
            readFile(FILE_PATH, null, (err, data) => {
              if (err) {
                console.log('Could not read an input file of the service run: ' +
                    FILE_PATH);
                return;
              }
              form.append('files', data, file);
            });
          });
        }
      });

      const response = await fetch('http://' + request.body.hostAddress +
          '/pushinputfiles/', {
        method: 'POST',
        headers: {
          'X-Service-ID': request.body.id,
        },
        body: formData
      });

      if (response.ok) {
        const result = await response.text();
        alert(result);
      } else {
        alert('Upload to host failed.');
      }

    } catch (error) {
      console.error('Execution failure: could not connect with the host' +
        ' or could not upload the input files. Service run: ' +
        request.body.config.name + '(' + request.body.id + ') ');
      const updatesFile =
          await readFile(config.requestUpdatesPath + request.body.id + '.json',
              'utf8');
      const updatesFileJSON = JSON.parse(updatesFile);
      updatesFileJSON.updates.push({
        executionState: 'Failure: failed to connect to service host.',
      });
      await writeFile(config.requestUpdatesPath + request.body.id + '.json',
          JSON.stringify(updatesFileJSON, null, 2));
      
      response.send('Failed to send the service run to the Host. ' +
          'Unable to connect.');
    }

    
  });

  application.get('/services', async (request, response) => {
    const serviceLoader = new ServicesLoader();
    const allServiceConfig = await serviceLoader.load()
    const serviceValidator = new ServicesValidator();
    const allValidServiceConfig = await serviceValidator.validate(allServiceConfig);
    response.json(allValidServiceConfig);
  });

  application.get('/getnewservicerequestid', async (request, response) => {
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
    const fileWithRuns =
        await readFile('src/services/requestLaunchs.json', 'utf-8');
    const jsonWithRuns = JSON.parse(fileWithRuns);

    response.json(jsonWithRuns);
  });

  application.get('/getupdates', async (request, response) => {
    const executionUpdates = {};

    const fileWithRuns =
        await readFile('src/services/requestLaunchs.json', 'utf-8');
    const jsonWithRuns = JSON.parse(fileWithRuns);

    for (const run of Object.values(jsonWithRuns.launchs)) {
      const updatesFile = await readFile(config.requestUpdatesPath +
          run.id + '.json');
      const updatesFileJSON = JSON.parse(updatesFile);
      if (updatesFileJSON.updates.length > 0) {
        const latestUpdate =
            updatesFileJSON.updates[updatesFileJSON.updates.length - 1];
        executionUpdates[run.id] ??= {};
        executionUpdates[run.id].executionState = latestUpdate.executionState;
      }
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
    const update = request.body;
    
    const updateFile =
        await readFile(`${config.requestUpdatesPath}/${update.id}.json`, 'utf8');
    const updateFileJSON = JSON.parse(updateFile);
    updateFileJSON.updates.push({ executionState: update.executionState });
    response.send('OK');


  });

  application.get('/getavailablefiles', async (request, response) => {
    
    const idToFilesAvailable =
        await readFile('./src/runs/id_to_files_available.json', 'utf-8');
    response.json(JSON.parse(idToFilesAvailable));
  });

  application.post('/deletefiles', async (request, response) => {
    const ID_TO_DELETE = request.body.id;
    const idToFilesAvailable =
      await readFile('./src/runs/id_to_files_available.json', 'utf-8');
    const newIdToFilesAvailable = JSON.parse(idToFilesAvailable);
    newIdToFilesAvailable.runsWithAvailableFiles[ID_TO_DELETE] = 'false';
    await writeFile('./src/runs/id_to_files_available.json',
          newIdToFilesAvailable);

    fs.readdir(`./jobDownloads/${ID_TO_DELETE}/`, (error, files) => {
      if (error) {
        console.error('Cannot delete output files. Error occurred while ' +
            'reading the folder:', error);
      } else {
        files.forEach(file => {
          const FILE_PATH = `./jobDownloads/${ID_TO_DELETE}/${file}`;
          fs.unlink(FILE_PATH, (unlinkError) => {
            if (unlinkError) {
              console.error(`Error occurred while deleting ${FILE_PATH}:`,
                  unlinkError);
            } else {
              console.log(`${FILE_PATH} deleted successfully!`);
            }
          });
        });
      }
    });
  });

  application.get('/download', async (request, response) => {
    const PATH = `${config.fileOutputsPath}${request.body.id}/`;

    const runsFile = await readFile(config.servicesPath + 'requestLaunchs.json');
    const runsFileJSON = JSON.parse(runsFile);
    const runInfo = runsFileJSON.launchs[request.body.id];
    const response = await fetch(`http://${runInfo.hostAddress}/downloadoutput/`);
    const files = await response.blob();

    response.set('Content-Type', 'application/zip');
    response.set('Content-Disposition', `attachment; filename=job_${request.body.id}_files.zip`);
    response.send(files);
  });

  // called at the same time as /execute
  application.post('/pushinputfiles', upload.array('files', 20), async (request, response) => {
      if (!request.files || request.files.length === 0) {
        return response.status(400).send('No files uploaded.');
      }
      response.send(`${request.files.length} file(s) uploaded successfully!`);
  });

}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  execute();
}
