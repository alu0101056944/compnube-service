/**
 * Universidad de La Laguna
 * Computación en la nube
 * @author Marcos Barrios
 * @since 25_06_2024
 *
 */

'use strict';

export default class MPIJob {
  /** @constant @private **/ 
  #nodeAmount = undefined;
  #args = undefined;
  #config = undefined;

  constructor(nodeAmount, args, config) {
    this.#nodeAmount = nodeAmount;
    this.#args = args;
    this.#config = config;
  }

  execute() {

  }

}
