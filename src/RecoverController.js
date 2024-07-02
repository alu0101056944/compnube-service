/**
 * Universidad de La Laguna
 * Computación en la nube
 * @author Marcos Barrios
 * @since 02_07_2024
 *
 */

'use strict';

export default class RecoverController {

  constructor() {
    // const recoverDiv = document.querySelector('#recoverDiv');
    const recoverText = document.querySelector('#recoverInputText');
    const recoverText2 = document.querySelector('#recoverInputText2');
    const recoverButton = document.querySelector('#recoverButton');

    const recover = async () => {
      try {
        const HOST_ADDRESS = `http://${recoverText.value}:8081/recoverfiles`;
        const ID = recoverText2.value;

        console.log('Sending recover petition.');

        const response = await fetch(HOST_ADDRESS, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ id: ID })
        });

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `recover_${ID}_files.zip`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);

        recoverButton.disabled = true;
        setTimeout(() => {
          recoverButton.disabled = false
        }, 2000);
  
      } catch (error) {
        console.log('Error while trying to recover files: ' + error);
      }
    }

    recoverButton.addEventListener('click', recover);
  }

}
