/**
 * Universidad de La Laguna
 * Computación en la nube
 * @author Marcos Barrios
 * @since 12_04_2024
 *
 * Checks the correct formatting for the arguments passed in the service
 *    configurator.
 */

'use strict';

export default class ServiceArgumentsValidator {
  /** @private @constant */
  #invalidArgs = undefined
  #validArgs = undefined

  /**
   * 
   * @param {object} args array of the actual values passed to the textfield
   * @param {object} config config object of the service
   */
  constructor(args, config) {
    this.#invalidArgs = [];
    this.#validArgs = [];

    args.forEach((arg, i) => {
      switch (config.params[i].type) {
        case 'integer':
          const number = parseInt(arg)
          if (!isNaN(number) && Number.isInteger(number)) {
            this.#validArgs.push({
              raw: arg,
              index: i,
              name: config.params[i].name,
            });
          } else {
            this.#invalidArgs.push({
              raw: arg,
              index: i,
              name: config.params[i].name,
            });
          }
          break;
        case 'bool':
          if (arg.toLowerCase() === 'true' || arg.toLowerCase() === 'false') {
            this.#validArgs.push({
              raw: arg,
              index: i,
              name: config.params[i].name,
            });
          } else {
            this.#invalidArgs.push({
              raw: arg,
              index: i,
              name: config.params[i].name,
            });
          }
          break;
        case 'float':
          const float = parseFloat(arg)
          if (!isNaN(float) && !Number.isInteger(float)) {
            this.#validArgs.push({
              raw: arg,
              index: i,
            });
          } else {
            this.#invalidArgs.push({
              raw: arg,
              index: i,
            });
          }
          break;
        case 'string':
          this.#validArgs.push({
            raw: arg,
            index: i,
          })
          break;
        default:
      }
    });
  }

  getInvalidArgs() {
    return this.#invalidArgs;
  }

  getValidArgs() {
    return this.#validArgs;
  }
}
