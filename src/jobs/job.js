/**
 * Universidad de La Laguna
 * Computación en la nube
 * @author Marcos Barrios
 * @since 25_06_2024
 *
 */

'use strict';

export default class Job {
  /** @constant @private **/ 
  #launchConfig = undefined;

  /**
   * 
   * @param {object} launchConfig Contiene la configuración del servicio, la id y
   *    los argumentos.
   */
  constructor(launchConfig) {
    this.#launchConfig = launchConfig;
  }

  execute() {
    // hacer fetch al host para avisar del servicio a ejecutar (para que cree la carpeta, enviar
    // launch config)
    // enviar archivos al host
    // indicar que se ejecute el job
  }

}

/**
 * 
 * 
 * const Client = require('ssh2-sftp-client');

async function transferFiles() {
  const sftp = new Client();
  try {
    await sftp.connect({
      host: 'remote_host',
      port: '22',
      username: 'user',
      password: 'password' // Or use privateKey for key-based auth
    });
    await sftp.put('/path/to/local/binary', '/path/on/remote/binary');
    await sftp.put('/path/to/local/input_file', '/path/on/remote/input_file');
  } catch (err) {
    console.error(err);
  } finally {
    sftp.end();
  }
}

transferFiles();

Using FTP:
If FTP is available, you can use the ftp package:

javascript
 */