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

import { config } from './config.js';

export default class ServicesValidator {
  /** @constant */
  #allConfigObject = undefined;

  constructor() {
    this.#allConfigObject = [];
  }

  /**
   * Get all valid services
   * @param {object} an array of config objects. Obtained by a ServiceLoader
   *    instance.
   * @return {object} array of service config objects
   */
  async validate(allConfigObject) {

    return allServiceConfig;
  }

}
