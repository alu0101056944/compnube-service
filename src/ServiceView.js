/**
 * Universidad de La Laguna
 * Computación en la nube
 * @author Marcos Barrios
 * @since 10_04_2024
 *
 */

'use strict';

export default class ServiceView {

  /** @constant @private */
  #argAmount = undefined;
  #name = undefined;
  #description = undefined;

  /**
   * 
   * @param {object} config info about the service like name, description, etc.
   */
  constructor(config) {
    this.#name = config.name;
    this.#description = config.description;
    this.#argAmount = config.argAmount;
  }

  toString() {
    return `
      <div style=display: flex; flex-direction: column; background-color: grey;>
        <h1>${this.#name}</h1>
        <p>Argument amount: ${this.#argAmount}</p>
        <p>${this.#description}</p>
      <div>
    `;
  }
}
