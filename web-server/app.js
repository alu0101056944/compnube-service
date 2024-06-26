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

import formidable, { errors as formidableErrors } from 'formidable';

import ServicesLoader from '../src/services/ServicesLoader.js';
import ServicesValidator from '../src/services/ServicesValidator.js';

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

  application.post('/compute', async (request, response) => {
    const form = formidable({});
    try {
        const files = await form.parse(request);
        const FILE_CONTENT = await readFile(files[1].file[0].filepath, 'utf-8');
        const HAS_ENTRY_POINT = /function main()/.test(FILE_CONTENT);
        const CALLS_ENTRY_POINT = /(?<!.*function\s+)main\((.+,?)*\);?/.test(FILE_CONTENT);
        if (HAS_ENTRY_POINT && !CALLS_ENTRY_POINT) {
          const FINAL_CONTENT = FILE_CONTENT.replace(/function main\(\)/g, 'main = () =>');
          let main = () => {}
          eval(FINAL_CONTENT);
          const RESULT = main(); // should be a function defined in FILE_CONTENT, which should be a .js
          response.json({ answer: RESULT });
        } else {
          throw new Error('File lacks a function main definition or ' +
              ' is defined but calls it directly. Please only define it, ' +
              ' don\'t execute it.');
        }
    } catch (err) {
        console.error(err);
        response.writeHead(err.httpCode || 400, { 'Content-Type': 'text/plain' });
        response.end(String(err));
        return;
    }
  });

  application.post('/execute', async (request, response) => {
    console.log('Request obtained');
    console.log(JSON.stringify(request.body, null, 2));
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

      debugger;
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
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  execute();
}
