/**
 * Universidad de La Laguna
 * Computación en la nube
 * @author Marcos Barrios
 * @since 09_04_2024
 *
 */

'use strict';

export default class Service {

  /** @constant @private */
  #argAmount = undefined;
  #name = undefined;
  #description = undefined;

  constructor(name, description, argAmount) {
    this.#argAmount = argAmount;
    this.#name = name;
    this.#description = description;
  }

  toString() {
    return `Service ${this.#name} accepts ${this.#argAmount} arguments.\n` +
        `Description:\n${this.#description}`;
  }
}
