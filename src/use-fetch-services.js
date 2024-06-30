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
import ServiceConfiguratorController from './services/ServiceConfiguratorController.js';
import LaunchedServicesView from './runs/LaunchedServicesView.js';
import LaunchedServicesController from './runs/LaunchedServicesController.js';
import ResultView from './runs/ResultView.js';

async function main() {
  try {
    const response = await fetch('http://10.6.128.106:8080/services');
    const allServiceConfig = await response.json();
    const divServiceList = document.querySelector('#divServiceList');
    for (const config of allServiceConfig) {
      divServiceList.innerHTML += new ServiceView(config).toString();
    }
    const serviceConfiguratorController =
        new ServiceConfiguratorController(allServiceConfig);
  } catch (error) {
    console.error('Error while fetching services. ' + error);
  }

  try {
    const RUNS_URL = `http://10.6.128.106:8080/getruns/`;
    const response2 = await fetch(RUNS_URL);
    const allRun = await response2.json();
    const allResultView = (Object.values(allRun.launchs))
        .map(run => new ResultView(run.config, run.id));
    const launchedServicesView = new LaunchedServicesView(allResultView);
    const divLaunchedServices = document.querySelector('#launchedServices');
    divLaunchedServices.innerHTML = launchedServicesView.toString();
    const launchedServicesController = new LaunchedServicesController(allRun);
    await launchedServicesController.getUpdates();
  } catch (error) {
    console.error('Error while fetching runs: ' + error);
  }
}

main();
