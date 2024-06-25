/**
 * Universidad de La Laguna
 * Computación en la nube
 * @author Marcos Barrios
 * @since 10_04_2024
 *
 */

'use strict';

export default class ServiceConfiguratorView {

  /** @constant @private */
  #config = undefined;

  /**
   * 
   * @param {object} allParamDescription array of strings
   */
  constructor(config) {
    this.#config = config;
  }

  toString() {
    const allParamInputs = this.#config.params.map((param, i) => {
      return `<span>${param.name} : ${param.type} -> ${param.description}</span>` +
          `<input type="text" id="param${i}"></input>`;
    });
    return `
      <div style=display: flex; flex-direction: column; background-color: grey;>
        <h1>Arguments:</h1>
        ${allParamInputs.join('<br>')}
        <br>
        <button id='sendService'>Send to queue</button>
      <div>
    `;
  }
}
