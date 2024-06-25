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
      const HAS_ALL_FIELDS = configObject.name && configObject.description && 
        configObject.params;
      const ARRAY_IS_CORRECT = Array.isArray(configObject.params) &&
          configObject.params.every((paramConfig) => {
            return typeof paramConfig === 'object' && paramConfig.name &&
                paramConfig.description && paramConfig.type;
          })
      return HAS_ALL_FIELDS && ARRAY_IS_CORRECT;
    })
    return this.#allValidConfigObject;
  }

}
