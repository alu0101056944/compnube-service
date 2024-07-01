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

export default class LaunchedServicesController {

  constructor() {
    this.#setupUpdateButton();
  }

  #setupUpdateButton() {
    const buttonUpdate = document.querySelector('#updateLaunched');
    buttonUpdate.addEventListener('click', async () => await this.getUpdates());
  }

  // Request updates from server and update stuff based on the updates
  async getUpdates() {
    try {
      const response2 = await fetch('http://10.6.128.106:8080/getruns/');
      const allRun = await response2.json();
      const allResultView = Object.values(allRun.launchs)
          .map(run => new ResultView(run.config, run.id));
      const launchedServicesView = new LaunchedServicesView(allResultView);
      const divLaunchedServices = document.querySelector('#launchedServices');
      divLaunchedServices.innerHTML = launchedServicesView.toString();

      // must be called after innerHTML substitution
      const buttonUpdate = document.querySelector('#updateLaunched');
      buttonUpdate.addEventListener('click', async () => await this.getUpdates());
      buttonUpdate.disabled = true;
      setTimeout(() => {
        buttonUpdate.disabled = false
      }, 2000);

      const response = await fetch('http://10.6.128.106:8080/getupdates/');
      const idToAccumulatedUpdates = await response.json();
      for (const id of Object.getOwnPropertyNames(idToAccumulatedUpdates)) {
        const spanOfExecutionState =
            document.querySelector(`#executionState${id}`);
        spanOfExecutionState.textContent =
            idToAccumulatedUpdates[id].executionState;

        await this.#updateDownloadButtonAndSpan(idToAccumulatedUpdates[id], id);
        await this.#updateTerminateButton(idToAccumulatedUpdates[id], id);
        await this.#updateTerminalContent(idToAccumulatedUpdates[id], id);
      }

      await this.#setupTerminalButtons(allRun);
    } catch (error) {
      console.error('Error while updating: ' + error);
    }
  };

  async #updateDownloadButtonAndSpan(update, id) {
    if (update.executionState === 'Finished execution successfully') {
      const response = await fetch('http://10.6.128.106:8080/getavailablefiles/',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ id }),
        }
      );
      const info = await response.json();

      const downloadStatusSpan =
            document.querySelector(`#hasBeenDownloaded${id}`);
      if (response.ok && info.filesAvailable === 'true') {
        downloadStatusSpan.textContent = 'Can download.';
        const downloadButton =
            document.querySelector(`#downloadButton${id}`);
        downloadButton.disabled = false;
        downloadButton.addEventListener('click', async () => {

          try {
            // download the zip file.
            const response3 = await fetch('http://10.6.128.106:8080/download/', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ id })
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

            downloadStatusSpan.textContent = 'Download started.';

            // update downloadButton disabled state
            const response4 = await fetch('http://10.6.128.106:8080/getavailablefiles/', {
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
      } else if (response.ok && info.filesAvailable === 'false') {
        downloadStatusSpan.textContent = 'Previously sucessfully downloaded.';
      }
    }
  }

  async #updateTerminateButton(update, id) {
    try {
      const terminateButton = document.querySelector(`#terminateButton${id}`);
      if (update.executionState === 'Finished execution successfully' ||
          update.executionState === 'execution failed' ||
          update.executionState === 'Terminated by user') {
        terminateButton.disabled = true;
      } else if (update.executionState === 'Executing') {
        terminateButton.disabled = false;
        const sendTerminateRequest = async () => {
          try {
            const response2 = await fetch('http://10.6.128.106:8080/terminaterun/', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ id })
            });
          } catch (error) {
            console.error('Attempt at sending a /terminaterun request from ' +
              id + '\'s terminate button failed: ', error);
          }
        }
        terminateButton.addEventListener('click', sendTerminateRequest);
      }
    } catch (error) {
      console.error('Error while getting updates for updating the terminate ' +
          ' button of the run ' + id + '. error' + error);
    }
  }

  async #setupTerminalButtons(allRun) {
    try {
      const allTerminalDOMInfo = Object.values(allRun.launchs)
          .map(run => ({
            buttonSelector: `#showTerminalButton${run.id}`,
            terminalSelector: `#terminal${run.id}`,
            terminalContentSelector: `#terminalContent${run.id}`,
          }));
  
      allTerminalDOMInfo.forEach(terminalDOMInfo => {
        const showTerminalButton =
            document.querySelector(terminalDOMInfo.buttonSelector);
        const toggleTerminalRendering = () => {
          const terminal =
            document.querySelector(terminalDOMInfo.terminalSelector);
          if (terminal.style.display === 'none') {
            terminal.style.display = 'block';
            showTerminalButton.textContent = 'Hide terminal.';
          } else  {
            terminal.style.display = 'none';
            showTerminalButton.textContent = 'Show terminal.';
          }
        }
  
        showTerminalButton.removeEventListener('click', toggleTerminalRendering);
        showTerminalButton.addEventListener('click', toggleTerminalRendering);
      });
    } catch (error) {
      console.error('Error while fetching runs to setup terminal buttons: ' +
          error);
    }
  }

  async #updateTerminalContent(update, id) {
    const terminalContent = document.querySelector(`#terminalContent${id}`);
    if (update.stdout) {
      terminalContent.textContent = update.stdout;
    } else {
      terminalContent.textContent = 'No console output received.';
    }
  }
}
