/**
 * Universidad de La Laguna
 * Computación en la nube
 * @author Marcos Barrios
 * @since 12_04_2024
 *
 */

'use strict';

import { readdir, readFile, access, constants } from 'fs/promises';
import { basename, extname } from 'path';

import { config } from './config.js'

export default class ServicesLoader {
  #allConfigObject = undefined;

  constructor() {
    this.#allConfigObject = [];
  }

  /**
   * Get all valid services
   * @return {object} array of service config objects
   */
  async load() {
    const allFilename = await this.#getAllValidServiceFilename();
    const allServiceConfig = await this.#getAllServiceConfig(allFilename);
    this.#allConfigObject = allServiceConfig;
    return allServiceConfig;
  }

  /**
   *
   * @param {object} allValidServiceFilename array of filenames that describe a
   *    service that correctly includes a binary
   * @return {object} array of the configuration files.
   */
  async #getAllServiceConfig(allValidServiceFilename) {
    const allConfigObject = [];
    await this.#readServicesFolder(async (filename) => {
      if (extname(filename) === '.json' &&
          allValidServiceFilename.includes(filename)) {
        const FILE_CONTENT = await readFile(`${config.servicesPath ?? 'http://localhost:8080/'}` +
            `${filename}`, 'utf-8');
        try {
          const serviceConfiguration = JSON.parse(FILE_CONTENT);
          allConfigObject.push(serviceConfiguration);
        } catch (error) {
          console.error('There was an error while parsing the service' +
              ' configuration .json: ' + error);
        }
      }
    });
    return allConfigObject;
  }

  // I don't want to expose services that do not have a binary
  async #getAllValidServiceFilename() {
    const allValidServiceFilename = [];
    await this.#readServicesFolder(async (filename, allFilename) => {
      if (extname(filename) === '.json') {
        let HAS_FOUND_BINARY = false;
        const FILENAME_WITHOUT_EXTENSION =
            basename(filename, extname(filename));
        for (const filenameSecondCheck of allFilename) {
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
                ' cannot execute the binary. Error: ' + error);
            }
          }
        }
        if (!HAS_FOUND_BINARY) {
          console.log('The service described in ' + 
              `"${config.servicesPath}${filename}" ` +
              'does not have a valid binary. It was not found or there is ' +
              'insufficient permissions.');
        } else {
          allValidServiceFilename.push(filename);
        }
      }
    });
    return allValidServiceFilename;
  }

  // Auxiliary method
  async #readServicesFolder(callback) {
    try {
      const allFilename = await readdir(config.servicesPath ?? 'services/');
      for (const filename of allFilename) {
        await callback(filename, allFilename);
      }
    } catch (error) {
      console.error('ServicesLoader error when reading services folder: ' +
          error);
    }
  }
}
