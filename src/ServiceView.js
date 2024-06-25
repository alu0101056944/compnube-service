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
  #config = undefined;

  /**
   * 
   * @param {object} config info about the service like name, description, etc.
   */
  constructor(config) {
    this.#config = config;
  }

  toString() {
    const paramsStyle = this.#config.params.map((param) => {
      return `<p>${param.name}: ${param.type} -> ${param.description}</p>`
    });
    return `
      <div style=display: flex; flex-direction: column; background-color: grey;>
        <h1>${this.#config.name}</h1>
        <p>${this.#config.description}</p>
        <h2>Parameters:</h2>
        ${paramsStyle.join('<br>')}
      <div>
    `;
  }
}
