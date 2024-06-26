/**
 * Universidad de La Laguna
 * Computación en la nube
 * @author Marcos Barrios
 * @since 26_06_2024
 *
 */

'use strict';

export default class LaunchedServicesView {
  /** @private */
  #allResult = undefined;

  /**
   * 
   * @param {object} allResult array of ResultView
   */
  constructor(allResult) {
    this.#allResult = allResult;
  }
  
  toString() {
    return `
      <div style="display: flex; flex-direction: column; background-color: brown;
          padding-left: 8px; padding-bottom: 5px;">
        <h1>State of launched services (old and new)</h1>
        ${this.#allResult.map(result => result.toString()).join('<br>')}
      </div>
    `;
  }
}
