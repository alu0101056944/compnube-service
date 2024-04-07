/**
 * University of La Laguna
 * High School of Engineering and Technology
 * Degree in Computer Science
 * Computación en la Nube
 *
 * @author Marcos Barrios
 * @since 07_04_2024
 * @desc Handle the file that the user has put in the service
 *
 */

'use strict';

// Meant to be called on page load at index.html
function main() {
  const fileInput = document.querySelector('#fileInput');

  const buttonFileSend = document.querySelector('#fileSendButton');
  buttonFileSend.addEventListener('click', _ => {
    const file = fileInput.files[0];
    const formData = new FormData();
    formData.append('file', file);

    buttonFileSend.disabled = true;
    console.log('File sent for execution. Waiting for the server response...');
    fetch('http://localhost:8080/compute', {
      method: 'POST',
      body: formData
    })
    .then(response => {
      buttonFileSend.disabled = false;
      if (response.ok) {
        return response.json();
      } else {
        const ERROR_TEXT =
            'File upload failed: ' + response.status + ' ' + response.statusText;
        throw new Error(ERROR_TEXT);
      }
    })
    .then(data => {
      // I expect to receieve a json with an answer key
      alert('Execution result: ' + data.answer);
      console.log('Execution result: ', data.answer);
    })
    .catch(error => {
      console.log(error);
      alert(error);
    })
  });
}

main();
