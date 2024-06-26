/**
 * Universidad de La Laguna
 * Computación en la nube
 * @author Marcos Barrios
 * @since 26_06_2024
 *
 */

'use strict';

export default class ResultView {
  /** @private **/
  #executionStatus = undefined;
  #serviceRequestId = undefined;
  #resultFilesDownloaded = undefined;


  constructor(serviceRequestId) {
    this.#executionStatus = 'pendingStart';
    this.#serviceRequestId = serviceRequestId;
    this.#resultFilesDownloaded = false;
  }

  setExecutionState(state) {
    this.#executionStatus = state;
  }

  markFilesAsDownloaded() {
    this.#resultFilesDownloaded = true;
  }

  toString() {
    return `
        <div style="background-color: orange;">
          <b>${this.#serviceRequestId}</b>
          <span id="executionState${this.#serviceRequestId}">pending start</span>
          <button id="downloadButton${this.#serviceRequestId}">Download output files</button>
        </div>
      `;
  }
  
}
