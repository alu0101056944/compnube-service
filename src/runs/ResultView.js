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
    const STREAM_INPUT_FILES_SELECTOR = `
        <form id='formStreamInputFilesSelector${this.#id}'
          style='${this.#config.hasInputFileStreaming === 'true' ?
              'display: block;' : 'display: none;'
        }'>
          <input type="file" id="streamInputFilesSelector${this.#id}"
              disabled="true" multiple>
          <button type="button" id="sendStream${this.#id}" style="width: 100%"
                disabled="true">
              Send
          </button>
        </form>`;
    return `
        <div style="background-color: orange; margin-bottom: 5px;
              padding: 7px 0px 7px 0px; display: flex; flex-direction: row; flex-wrap: wrap;">
          <div style="background-color: yellow; width: 35%">
            <b>${this.#config.name}(${this.#id}): </b>
            <span id="executionState${this.#id}">\<no info\></span>
          </div>
          <div id='terminateProcessDiv${this.#id}' style="width: 15%; background-color: red;">
            <button id='terminateButton${this.#id}' disabled="true">
              Stop process.
            </button>
            <button id='showTerminalButton${this.#id}'>
              Show terminal.
            </button>
          </div>
          <div style="background-color: blue; width: 25%">
            <button id="downloadButton${this.#id}" disabled="true">
                Download output files
            </button>
            <span id="hasBeenDownloaded${this.#id}"></span>
          </div>
          <div style="background-color: magenta; width: 25%">
            ${STREAM_INPUT_FILES_SELECTOR}
          </div>
          <div id='terminal${this.#id}' style='display: none; background-color: black;
              width: 100%; height: 300px;'>
            <pre id='terminalContent${this.#id}' style='color: white;
                overflow: scroll;'>
            </pre >
          </div>
        </div>
      `;
  }
}
