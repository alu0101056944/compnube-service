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
          <div style="width: 35%">
            <b>${this.#config.name}(${this.#id}): </b>
            <span id="executionState${this.#id}">\<no info\></span>
          </div>
          <div id='terminateProcessDiv${this.#id}' style="width: 15%;">
            <button id='terminateButton${this.#id}' disabled="true">
              Stop process.
            </button>
            <button id='showTerminalButton${this.#id}'>
              Show terminal.
            </button>
          </div>
          <div id='downloadContainer${this.#id}' style="width: 25%">
            <button id="downloadButton${this.#id}" disabled="true">
                Download output files
            </button>
            <span id="hasBeenDownloaded${this.#id}"></span>
          </div>
          <div id="filePickerDiv${this.#id}" style="width: 25%">
            ${STREAM_INPUT_FILES_SELECTOR}
          </div>
          <div style='width: 100%;'>
            <bold>Parameters:</bold>
            <span>
              ${
                this.#config.params.length > 0 ?
                    this.#config.params
                    .map(param => `${param.name} : ${param.type}`)
                    .join(', ')
                    :
                    '<i>none</i>'
              }
            </span>
          </div>
          <div style='width: 100%;'>
            <bold>CLI Parameters:</bold>
            <span>
              ${
                Object.getOwnPropertyNames(this.#config.cliParams).length > 0 ?
                    Object.getOwnPropertyNames(this.#config.cliParams).join(', ')
                    :
                    '<i>none</i>'
              }
            </span>
          </div>
          <div style='width: 100%;'>
            <bold>Execution time (seconds): </bold>
            <span id='execTime${this.#id}'></span>
            <br>
            <bold>avg CPU load: </bold>
            <span id='avgCPULoad${this.#id}'></span>
            <br>
            <bold>max CPU load: </bold>
            <span id='maxCPULoad${this.#id}'></span>
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
