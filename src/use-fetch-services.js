/**
 * University of La Laguna
 * High School of Engineering and Technology
 * Degree in Computer Science
 * Computación en la Nube
 *
 * @author Marcos Barrios
 * @since 10_04_2024
 * @desc Fetch the service configuration information from the server.
 *
 */

'use strict';

import ServiceView from './services/ServiceView.js';
import ServiceConfiguratorView from './services/ServiceConfiguratorView.js';

import { config } from './config.js';

async function main() {
  try {
    const response = await fetch((config.serverBaseURL ?? 'http://localhost:8080/') +
    config.servicesPath ?? 'services/');
    const allServiceConfig = await response.json();
    const divServiceList = document.querySelector('#divServiceList');
    for (const config of allServiceConfig) {
      divServiceList.innerHTML += new ServiceView(config).toString();
    }
    const divSelector = document.querySelector('#divSelector');
    divSelector.innerHTML += new ServiceConfiguratorView(allServiceConfig[0]);
  } catch (error) {
    console.error('Error while fetching services. ' + error);
  }
}

main();
