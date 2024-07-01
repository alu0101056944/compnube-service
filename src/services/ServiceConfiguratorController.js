/**
 * Universidad de La Laguna
 * Computación en la nube
 * @author Marcos Barrios
 * @since 10_04_2024
 *
 */

'use strict';

import ServiceConfiguratorView from "./ServiceConfiguratorView.js";
import ServiceArgumentsValidator from './ServiceArgumentsValidator.js'

export default class ServiceConfiguratorController {
  /** @private */
  #selectedButton = undefined;
  #activeConfig = undefined;

  /**
   * 
   * @param {object} allValidConfig an array with the config objects of all
   *    the services that are valid and thus displayed for selection.
   */
  constructor(allValidConfig) {
    this.#selectedButton = null;
    this.#activeConfig = null;
    this.#addServiceSelectionLogic(allValidConfig);
  }

  #addServiceSelectionLogic(allValidConfig) {
    const allSelectButton = [];

    const SELECTED_COLOR = 'orange';
    const NOT_SELECTED_COLOR = 'white';

    const divSelector = document.querySelector('#divSelector');

    // select button color logic and update divSelector
    for (const config of allValidConfig) {
      const SERVICE_NAME_SPACELESS = config.name.replace(/\s/g, '');

      const buttonId = `#select${SERVICE_NAME_SPACELESS}`;
      const selectButton = document.querySelector(buttonId);
      selectButton.addEventListener('click', async () => {
        if (this.#selectedButton && !this.#selectedButton.isSameNode(selectButton)) {
          this.#selectedButton.style.backgroundColor = NOT_SELECTED_COLOR;
          this.#selectedButton = selectButton;
          this.#selectedButton.style.backgroundColor = SELECTED_COLOR;
        } else if (!this.#selectedButton) {
          this.#selectedButton = selectButton;
          this.#selectedButton.style.backgroundColor = SELECTED_COLOR;
        }

        divSelector.innerHTML = new ServiceConfiguratorView(config).toString();

        const buttonSend = document.querySelector('#sendService');
        buttonSend.addEventListener('click', async () => await this.#sendRequest());

        this.#activeConfig = config;
      });
      allSelectButton.push(selectButton);
    }
  }

  // event listener for the send button
  async #sendRequest() {

    // get textfield arg values
    const allArgValue = [];
    const ARG_AMOUNT = this.#activeConfig.params.length;
    for (let i = 0; i < ARG_AMOUNT; ++i) {
      const textField = document.querySelector(`#argTextfield${i}`);
      allArgValue.push(textField.value);
    }

    // validate args
    const argsValidator = new ServiceArgumentsValidator(allArgValue,
      this.#activeConfig);
    // if all valid send json to server
    if (argsValidator.getInvalidArgs().length === 0) {
      // get values for cli args
      const cliArgs = {};
      Object.getOwnPropertyNames(this.#activeConfig.cliParams)
          .forEach((cliParam, i) => {
            const textField = document.querySelector(`#cliArgTextfield${i}`);
            cliArgs[cliParam] = textField.value;    
          });

      const jsonToSend = { args: {}, cliArgs };
      for (let i = 0; i < ARG_AMOUNT; ++i) {
        jsonToSend.args[this.#activeConfig.params[i].name] = allArgValue[i];
      }
      jsonToSend.config = this.#activeConfig;

      const buttonSend = document.querySelector('#sendService');
      buttonSend.disabled = true;
      setTimeout(() => {
        buttonSend.disabled = false
      }, 2000);

      try {
        // get new service request id
        const ADDRESS = 'http://10.6.128.106:8080/getnewservicerequestid/';
        const request = await fetch(ADDRESS);
        const json = await request.json();
        jsonToSend.id = json.newId;

        if (this.#activeConfig.acceptInputFiles === 'true') {
          this.#sendInputFiles(jsonToSend.id);
        }

        const body = JSON.stringify(jsonToSend, null, 2)
        try {
          await fetch('http://10.6.128.106:8080/execute/', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body,
          });
        } catch (error) {
          console.error('Error while sending the service execution request: ' +
              error);
        }
      } catch (error) {
        console.error('Failed to get new service run id: ' + error);
      }
    } else {
      console.log('Invalid arguments, please check the formatting. ' +
          'These are valid: ' +
          argsValidator.getValidArgs().map((arg) => arg.name).join(' ') +
          '. ' + 'These are invalid: ' +
          argsValidator.getInvalidArgs().map((arg) => arg.name).join(' ')
      );
    }
  }

  async #sendInputFiles(id) {
    const fileInput = document.querySelector('#inputFilesSelector');
    const files = fileInput.files;
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i]);
    }

    await fetch('http://10.6.128.106:8080/pushinputfiles/', {
      method: 'POST',
      headers: {
        'X-Service-ID': id
      },
      body: formData
    });
  }

  getSelectedButton() {
    return this.#selectedButton;
  }

}
