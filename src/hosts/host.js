/**
 * Universidad de La Laguna
 * Computación en la nube
 * @author Marcos Barrios
 * @since 25_06_2024
 *
 */

'use strict';

export default class Host {
  /** @constant @private **/ 
  #name = undefined
  constructor(name) {
    this.#name = name;
  }
}
