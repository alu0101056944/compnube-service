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
import { readFile } from 'fs/promises';

import formidable, { errors as formidableErrors } from 'formidable';

import ServicesLoader from '../src/ServicesLoader.js';

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

  application.get('/services', async (request, response) => {
    debugger;
    const serviceLoader = new ServicesLoader();
    const allServiceConfig = await serviceLoader.load()
    response.json(allServiceConfig);
  });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  execute();
}
