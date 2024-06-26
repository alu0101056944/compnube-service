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

import ServicesLoader from '../src/services/ServicesLoader.js';
import ServicesValidator from '../src/services/ServicesValidator.js';

import { config } from '../src/config.js';

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

    // create updates folder for the request
    const WRITE_PATH = config.requestUpdatesPath + request.body.id + '.json';
    await writeFile(WRITE_PATH, JSON.stringify({ updates: [] }));
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
    for (const run of jsonWithRuns.launchs) {
      const updatesFile = await readFile(config.requestUpdatesPath +
          run.config.name + '_' + run.id + '.json');
      const updatesFileJSON = JSON.parse(updatesFile);
      const latestUpdate =
          updatesFileJSON.updates[updatesFileJSON.updates.length - 1];
      executionUpdates[run.id].executionState = latestUpdate.executionState;
    }
    response.json(JSON.parse(executionUpdates));
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

  app.get('download/', async (request, response) => {
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
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  execute();
}
