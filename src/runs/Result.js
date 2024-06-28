/**
 * Universidad de La Laguna
 * Computación en la nube
 * @author Marcos Barrios
 * @since 26_06_2024
 *
 */

'use strict';

export default class Result {
  /** @private **/
  #executionStatus = undefined;
  #serviceRequestId = undefined;
  #resultFilesDownloaded = undefined;

  constructor() {
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
  
}
