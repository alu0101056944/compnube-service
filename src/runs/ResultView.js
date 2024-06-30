/**
 * Universidad de La Laguna
 * Computación en la nube
 * @author Marcos Barrios
 * @since 26_06_2024
 *
 */

'use strict';

export default class ResultView {
  /** @private @constant **/
  #config = undefined;
  #id = undefined;

  /** @private */
  #executionStatus = undefined;
  #resultFilesDownloaded = undefined;

  constructor(config, id) {
    this.#executionStatus = 'pendingStart';
    this.#id = id;
    this.#config = config;
    this.#resultFilesDownloaded = false;
  }

  setExecutionState(state) {
    this.#executionStatus = state;
    document.querySelector(`#executionState${this.#id}`).textContent = state;
  }

  markFilesAsDownloaded() {
    this.#resultFilesDownloaded = true;
    document.querySelector(`#downloadButton${this.#id}`).disabled = true;
    document.querySelector(`#hasBeenDownloaded${this.#id}`)
        .textContent = 'Sucessfuly downloaded.';
  }

  allowDownload() {
    document.querySelector(`#downloadButton${this.#id}`).disabled = false;
    document.querySelector(`#hasBeenDownloaded${this.#id}`)
    .textContent = 'Ready for download.';
  }

  toString() {
    return `
        <div style="background-color: orange; margin-bottom: 5px;
              display: flex; flex-direction: row; flex-wrap: wrap;">
          <div style="background-color: yellow; width: 50%">
            <b>${this.#config.name}(${this.#id}): </b>
            <span id="executionState${this.#id}">pending start</span>
          </div>
          <div id='terminateProcessDiv${this.#id}' style="width: 20%; background-color: red;">
            <button id='terminateButton${this.#id}' disabled="true">
              Stop process.
            </button>
          </div>
          <div style="background-color: blue; width: 30%">
            <button id="downloadButton${this.#id}" disabled="true">
                Download output files
            </button>
            <span id="hasBeenDownloaded${this.#id}"></span>
          </div>
        </div>
      `;
  }
}
