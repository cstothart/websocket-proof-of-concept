const socket = io();

const alertModal = document.querySelector('#alertModal');

socket.on('alert', alertMsg => {

  console.log(alertMsg);

  alertModal.style.opacity = '1';
  alertModal.textContent = alertMsg;

  window.setTimeout(() => {
    alertModal.style.opacity = '0';
  }, 1010);

});

