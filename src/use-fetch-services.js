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

import ServiceView from './ServiceView.js';

import { config } from './config.js';

async function main() {
  const divServiceList = document.querySelector('#divServiceList');
  try {
    const response = await fetch((config.serverBaseURL ?? 'http://localhost:8080/') +
      config.servicesPath ?? 'services/');
    const allServiceConfig = await response.json();
    for (const config of allServiceConfig) {
      divServiceList.innerHTML += new ServiceView(config).toString();
    }
  } catch (error) {
    console.error('Error while fetching services. ' + error);
  }
}

main();
