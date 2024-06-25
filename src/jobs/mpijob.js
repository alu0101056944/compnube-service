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

  constructor(nodeAmount, args) {
    this.#nodeAmount = nodeAmount;
    this.#args = args;
  }

}
