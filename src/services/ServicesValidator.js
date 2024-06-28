/**
 * Universidad de La Laguna
 * Computación en la nube
 * @author Marcos Barrios
 * @since 12_04_2024
 *
 * Keep the config objects with this structure:
 * {
 *   "name": "Another service",
 *   "description": "Compute the sum of two numbers.",
 *   "params": [
 *     {
 *       "name": "foo",
 *       "description": "An arbitrary number",
 *       "type": "integer"
 *     }
 *   ]
 * }
 * 
 */

'use strict';

export default class ServicesValidator {
  /** @constant */
  #allValidConfigObject = undefined;

  constructor() {
    this.#allValidConfigObject = [];
  }

  /**
   * Get all valid services
   * @param {object} allConfigObject an array of config objects. Obtained by
   *    a ServiceLoader instance.
   * @return {object} array of service config objects with valid format.
   */
  async validate(allConfigObject) {
    this.#allValidConfigObject = allConfigObject.filter((configObject) => {
      const HAS_ALL_FIELDS = 
          ['name', 'description', 'params', 'cli',
            'cliParams', 'acceptInputFiles', 'hostAddress', 'binaryName',
            'originAddress']
          .every(param => Object.getOwnPropertyNames(configObject).includes(param));
      if (!HAS_ALL_FIELDS) {
        return false;
      }

      const PARAM_ARRAY_IS_CORRECT = Array.isArray(configObject.params) &&
          configObject.params.every((paramConfig) => {
            return typeof paramConfig === 'object' && paramConfig.name &&
                paramConfig.description && paramConfig.type;
          })
      if (!PARAM_ARRAY_IS_CORRECT) {
        return false;
      }

      const ALL_CLI_PARAM = [...(configObject.cli.matchAll(/<.+?>/g))]
          .map(match => match[0].replace(/</g, '').replace(/>/g, ''));
      const INCLUDED_CLI_PARAMS =
          Object.getOwnPropertyNames(configObject.cliParams);
      const ALL_CLI_PARAMS_PRESENT =
          ALL_CLI_PARAM.every((param) => INCLUDED_CLI_PARAMS.includes(param));
      if (!ALL_CLI_PARAMS_PRESENT) {
        return false;
      }

      return true;
    });

    return this.#allValidConfigObject;
  }

}
