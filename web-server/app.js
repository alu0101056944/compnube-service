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

import expressAppCreator from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import process from 'process';
import { readFile } from 'fs/promises';

import formidable, { errors as formidableErrors } from 'formidable';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * @summary Configure and run the webserver.
 */
function main() {
  const application = expressAppCreator();

  application.set('port', 8080);

  const PATH_TO_ROOT = path.join(__dirname, '../www');
  const PATH_TO_SRC = path.join(__dirname, '../src');
  application.use(expressAppCreator.static(PATH_TO_ROOT));
  application.use(expressAppCreator.static(PATH_TO_SRC));

  application.listen(application.get('port'), '0.0.0.0', function() {
    const DEFAULT_START_MESSAGE =
        'The server is running on http://<your machine IP addr>:';
    console.log(DEFAULT_START_MESSAGE + application.get('port'));
  });

  application.post('/compute', async (request, response) => {
    const form = formidable({});
    try {
        const files = await form.parse(request);
        const FILE_CONTENT = await readFile(files.file[0].filepath, 'utf-8');
        // ... validate js, check for main(), execute main(), receive result and send back

        response.writeHead(200, { 'Content-Type': 'text/plain' });
        response.end(String(FILE_CONTENT));
    } catch (err) {
        console.error(err);
        response.writeHead(err.httpCode || 400, { 'Content-Type': 'text/plain' });
        response.end(String(err));
        return;
    }
  });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main();
}
