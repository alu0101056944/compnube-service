/**
 * Universidad de La Laguna
 * Computación en la nube
 * @author Marcos Barrios
 * @since 09_04_2024
 *
 */

'use strict';

import { readDir, readFile, access, constants } from 'fs/promises';
import { basename, extname } from 'path';

import config from './config.json' assert { type: 'json' }

async function readServicesFolder(callback) {
  try {
    const allFilename = await readDir(config.servicesPath);
    for (const filename of allFilename) {
      await callback(filename, allFilename);
    }
  } catch (error) {
    console.error('Error while readServicesFolder: ' + error);
  }
}

async function getAllJSONObject() {
  const allJSONObject = [];
  await readServicesFolder(async (filename) => {
    if (extname(filename) === '.json') {
      const FILE_CONTENT = await readFile(`${config.servicesPath}${filename}`, 'utf-8');
      try {
        const serviceConfiguration = JSON.parse(FILE_CONTENT);
        allJSONObject.push(serviceConfiguration);
      } catch (error) {
        console.error('There was an error while parsing the service' +
            ' configuration .json: ' + error);
      }
    }
  });
}

export async function checkBinaries() {
  await readServicesFolder(async (filename, allFilename) => {
    for (const filenameSecondCheck of allFilename) {
      if (basename(filenameSecondCheck) === filename &&
          extname(filenameSecondCheck) !== '.json') {
        try {

          // This will do nothing if it is an executable
          await access(`${config.servicesPath}${filenameSecondCheck}`,
              constants.X_OK);
        } catch (error) {
          console.error(`Permission error or the service ${basename(filename)}` +
            ' doesn\'t have a binary in the services folder. Error: ' + error);
        }
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
