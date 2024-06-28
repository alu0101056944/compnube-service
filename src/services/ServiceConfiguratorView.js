/**
 * Universidad de La Laguna
 * Computación en la nube
 * @author Marcos Barrios
 * @since 10_04_2024
 *
 */

'use strict';

export default class ServiceConfiguratorView {

  /** @private */
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
          `<input type="text" id="argTextfield${i}"></input>`;
    });
    const allCLIParamInputs = Object.getOwnPropertyNames(this.#config.cliParams)
        .map((param, i) => {
            return `<span>${param}</span>` +
                `<input type="text" id="cliArgTextfield${i}"></input>`;
        });
    const INPUT_FILES_SELECTOR = `
          <h2>Input files:</h1>
          <form>
            <input type="file" id="inputFilesSelector" multiple>
          </form>`;
    return `
      <div style=display: flex; flex-direction: column; background-color: grey;
          padding-bottom: 10px;>
        <h1>Service launch configuration for <span style="color:orange;">${this.#config.name}</span>:</h1>
        ${allCLIParamInputs.length > 0 ? '<h2>CLI Arguments:</h2>' : ''}
        ${allCLIParamInputs.join('<br>')}
        ${allCLIParamInputs.length > 0 ? '<br>' : ''}
        <h2>Binary Arguments:</h2>
        ${allParamInputs.join('<br>')}
        <br>
        ${this.#config.acceptInputFiles === 'true' ? INPUT_FILES_SELECTOR : ''}
        ${this.#config.acceptInputFiles === 'true' ? '<br>' : ''}
        <button id='sendService'>Send to queue</button>
      </div>
    `;
  }
}
