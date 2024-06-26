/**
 * Universidad de La Laguna
 * Computación en la nube
 * @author Marcos Barrios
 * @since 26_06_2024
 *
 */

'use strict';

import ResultView from './ResultView.js';
import LaunchedServicesView from './LaunchedServicesView.js';

import { config } from '../config.js';

export default class LaunchedServicesController {
  /** @private */
  #allResult = undefined;

  /**
   * 
   * @param {object} allResult array of ResultView
   */
  constructor(allResult) {
    this.#allResult = allResult;

    const substituteLaunchedServicesList = async () => {
      try {
        const response2 = await fetch(config.serverBaseURL + 'getruns/');
        const allRun = await response2.json();
        console.log('allRun.length: '  + allRun.launchs.length);
        const allResultView = allRun.launchs.map(run => new ResultView(run.config, run.id));
        const launchedServicesView = new LaunchedServicesView(allResultView);
        const divLaunchedServices = document.querySelector('#launchedServices');
        divLaunchedServices.innerHTML = launchedServicesView.toString();
        const buttonUpdate = document.querySelector('#updateLaunched');
        buttonUpdate.addEventListener('click', substituteLaunchedServicesList);
      } catch (error) {
        console.error('Error while fetching runs: ' + error);
      }
    };
    const buttonUpdate = document.querySelector('#updateLaunched');
    buttonUpdate.addEventListener('click', substituteLaunchedServicesList);
  }
}
