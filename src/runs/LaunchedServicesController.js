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
    const buttonUpdate = document.querySelector('#updateLaunched');

    

    const substituteLaunchedServicesList = async () => {
      try {
        const response2 = await fetch(config.serverBaseURL + 'getruns/');
        const allRun = await response2.json();
        const allResultView = Object.values(allRun.launchs)
            .map(run => new ResultView(run.config, run.id));
        const launchedServicesView = new LaunchedServicesView(allResultView);
        const divLaunchedServices = document.querySelector('#launchedServices');
        divLaunchedServices.innerHTML = launchedServicesView.toString();
        const buttonUpdate = document.querySelector('#updateLaunched');
        buttonUpdate.addEventListener('click', substituteLaunchedServicesList);

        buttonUpdate.disabled = true;
        setTimeout(() => {
          buttonUpdate.disabled = false
        }, 2000);

        await this.getUpdates();
      } catch (error) {
        console.error('Error while fetching runs: ' + error);
      }
    };

    buttonUpdate.addEventListener('click', substituteLaunchedServicesList);
  }

  async getUpdates() {
    try {
      const response = await fetch(config.serverBaseURL + 'getupdates/');
      const idToObject = await response.json();
      for (const id of Object.getOwnPropertyNames(idToObject)) {
        const spanOfExecutionState =
            document.querySelector(`#executionState${id}`);
        spanOfExecutionState.textContent = idToObject[id].executionState;

        if (idToObject[id].executionState === 'Finished execution sucessfully') {
          const response2 = await fetch(config.serverBaseURL +
              'getavailablefiles/',
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ id }),
            }
          );
          const info = await response2.json();
          if (response2.ok && info.filesAvailable === 'true') {
            const downloadButton =
                document.querySelector(`#downloadButton${id}`);
            downloadButton.disabled = false;
            downloadButton.addEventListener('click', async () => {

              // download the zip file.
              try {
                const response3 = await fetch(config.serverBaseURL + 'download/', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({ id: id })
                });
                const blob = await response3.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.style.display = 'none';
                a.href = url;
                a.download = `job_${id}_files.zip`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);

                const response4 = await fetch(config.serverBaseURL +
                    'getavailablefiles/', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({ id: id })
                });
                const json = await response4.json();
                if (json.filesAvailable === 'false') {
                  downloadButton.disabled = true;
                }
              } catch (error) {
                console.error('Download failed:', error);
              }
            });
          }
        }
      }
    } catch (error) {
      console.error('Error while fetching runs: ' + error);
    }
  };
}
