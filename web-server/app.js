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
      cb(null, config.fileInputsPath + request.body.id + '/');
    },
    filename: (request, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
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
    jsonWithRuns.launchs.push(request.body);
    await writeFile('src/services/requestLaunchs.json',
        JSON.stringify(jsonWithRuns, null, 2));

    // create updates file for the request
    const WRITE_PATH = config.requestUpdatesPath + request.body.id + '.json';
    await writeFile(WRITE_PATH, JSON.stringify({ updates: [] }));

    // create downloads folder for the request
    const WRITE_PATH_DOWNLOADS =
        config.fileOutputsPath + request.body.id;
    await fs.mkdir(WRITE_PATH_DOWNLOADS, { recursive: true });

    try {
      // add the job to the host server queue
      await fetch(`http://${request.body.hostIP}:8080/register/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: request.body,
      });
    } catch (error) {
      console.error('Execution failure: could not connect with the host. ' +
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
    }

    // send the input files and the binary
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

    for (const run of jsonWithRuns.launchs) {
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

  application.post('deletefiles/', async (request, response) => {
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
          const filePath = `./jobDownloads/${ID_TO_DELETE}/${file}`;
          fs.unlink(filePath, (unlinkError) => {
            if (unlinkError) {
              console.error(`Error occurred while deleting ${filePath}:`,
                  unlinkError);
            } else {
              console.log(`${filePath} deleted successfully!`);
            }
          });
        });
      }
    });
  });

  application.get('download/', async (request, response) => {
    const PATH = `jobDownloads/${request.body.id}/`;

    const files = await fs.readdir(PATH);
    if (files.length === 0) {
      console.log('There are no files');
    }

    const zip = new JSZip();
    for (const file of files) {
      const filePath = path.join(PATH, file);
      const fileContent = await fs.readFile(filePath);
      zip.file(file, fileContent);
    }

    const zipContent = await zip.generateAsync({ type: 'nodebuffer' });
    response.set('Content-Type', 'application/zip');
    response.set('Content-Disposition', `attachment; filename=job_${request.body.id}_files.zip`);
    response.send(zipContent);
  });

  application.post('pushinputfiles/', upload.array('files', 10), async (request, response) => {
    if (!request.files || request.files.length === 0) {
      return response.status(400).send('No files uploaded.');
    }
    response.send(`${request.files.length} file(s) uploaded successfully!`);
  });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  execute();
}
