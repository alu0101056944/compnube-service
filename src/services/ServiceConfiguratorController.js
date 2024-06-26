/**
 * Universidad de La Laguna
 * Computación en la nube
 * @author Marcos Barrios
 * @since 10_04_2024
 *
 */

'use strict';

import ServiceConfiguratorView from "./ServiceConfiguratorView.js";

export default class ServiceConfiguratorController {
  /** @private */
  #selectedButton = undefined;

  /**
   * 
   * @param {object} allValidConfig an array with the config objects of all
   *    the services that are valid and thus displayed for selection.
   */
  constructor(allValidConfig) {
    this.#selectedButton = null;

    const allSelectButton = [];

    const SELECTED_COLOR = 'lightgrey';
    const NOT_SELECTED_COLOR = 'grey';

    const divSelector = document.querySelector('#divSelector');

    for (const config of allValidConfig) {
      const SERVICE_NAME_SPACELESS = config.name.replace(/\s/g, '');
      const buttonId = `#select${SERVICE_NAME_SPACELESS}`;
      const selectButton = document.querySelector(buttonId);
      selectButton.addEventListener('click', () => {
        if (this.#selectedButton && !selectedButton.isSameNode(selectButton)) {
          selectedButton.style.backgroundColor = NOT_SELECTED_COLOR;
          this.#selectedButton = selectButton;
          selectedButton.style.backgroundColor = SELECTED_COLOR;
        }
        divSelector.innerHTML = new ServiceConfiguratorView(config).toString();
      });
      allSelectButton.push(selectButton);
    }
  }

  getSelectedButton() {
    return this.#selectedButton;
  }

}
