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

import { config } from '../config.js';

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
      selectButton.addEventListener('click', () => {
        if (this.#selectedButton && !this.#selectedButton.isSameNode(selectButton)) {
          this.#selectedButton.style.backgroundColor = NOT_SELECTED_COLOR;
          this.#selectedButton = selectButton;
          this.#selectedButton.style.backgroundColor = SELECTED_COLOR;
        } else if (!this.#selectedButton) {
          this.#selectedButton = selectButton;
          this.#selectedButton.style.backgroundColor = SELECTED_COLOR;
        }

        divSelector.innerHTML = new ServiceConfiguratorView(config).toString();

        this.#activeConfig = config;
        this.#sendArguments();
      });
      allSelectButton.push(selectButton);
    }
  }

  #sendArguments() {
    const buttonSend = document.querySelector('#sendService');
    buttonSend.addEventListener('click', async () => {
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
        const argsToSend = {};
        for (let i = 0; i < ARG_AMOUNT; ++i) {
          argsToSend[this.#activeConfig.params[i].name] = allArgValue[i];
        }
        argsToSend.config = this.#activeConfig;

        // get new service request id
        const request = await fetch(config.serverBaseURL + 'getnewservicerequestid/');
        const json = await request.json();
        argsToSend.id = json.newId;

        await fetch(config.serverBaseURL + 'execute/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(argsToSend, null, 2),
        });
      } else {
        alert('Invalid arguments, please check the formatting. ' +
            'These are valid: ' +
            argsValidator.getValidArgs().map((arg) => arg.name).join(' ') +
            '. ' + 'These are invalid: ' +
            argsValidator.getInvalidArgs().map((arg) => arg.name).join(' ')
        );
      }
    });
  }

  getSelectedButton() {
    return this.#selectedButton;
  }

}
