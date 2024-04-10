/**
 * Universidad de La Laguna
 * Computación en la nube
 * @author Marcos Barrios
 * @since 09_04_2024
 *
 */

'use strict';

import { readdir, readFile, access, constants } from 'fs/promises';
import { basename, extname } from 'path';

import { config } from './config.js';

async function readServicesFolder(callback) {
  try {
    const allFilename = await readdir(config.servicesPath ?? 'http://localhost:8080/');
    for (const filename of allFilename) {
      await callback(filename, allFilename);
    }
  } catch (error) {
    console.error('Error at readServicesFolder: ' + error);
  }
}

async function getAllJSONObject() {
  const allJSONObject = [];
  await readServicesFolder(async (filename) => {
    if (extname(filename) === '.json') {
      const FILE_CONTENT = await readFile(`${config.servicesPath ?? 'http://localhost:8080/'}` +
          `${filename}`, 'utf-8');
      try {
        const serviceConfiguration = JSON.parse(FILE_CONTENT);
        allJSONObject.push(serviceConfiguration);
      } catch (error) {
        console.error('There was an error while parsing the service' +
            ' configuration .json: ' + error);
      }
    }
  });
  return allJSONObject;
}

export async function checkBinaries() {
  await readServicesFolder(async (filename, allFilename) => {
    if (extname(filename) === '.json') {
      let HAS_FOUND_BINARY = false;
      for (const filenameSecondCheck of allFilename) {
        const FILENAME_WITHOUT_EXTENSION =
            basename(filename, extname(filename));
        const FILENAME_SECOND_WITHOUT_EXTENSION =
            basename(filenameSecondCheck, extname(filenameSecondCheck));
        if (FILENAME_WITHOUT_EXTENSION === FILENAME_SECOND_WITHOUT_EXTENSION &&
            extname(filenameSecondCheck) !== '.json') {
          try {
  
            // This will do nothing if it is an executable
            await access(`${config.servicesPath}${filenameSecondCheck}`,
                constants.X_OK);
            HAS_FOUND_BINARY = true;
          } catch (error) {
            console.error(`Permission error for the service ${basename(filename)},` +
              ' cannot execute the binar. Error: ' + error);
          }
        }
      }
      if (!HAS_FOUND_BINARY) {
        throw new Error(`The service ${filename} does not have it\'s binary in` +
            ' the services/ folder.');
      }
    }
  });
}

/**
 * The web server should call this to validate the services folder and obtain
 * the configuration files.
 *
 * @return {object} array of the configuration files.
 */
export async function getAllServiceConfig() {
  return await getAllJSONObject();
}
