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

const handleName = () => {
  const nameInput = document.querySelector('#nameField').value;
  socket.emit('received name', nameInput);
  socket.on('validation response', response => {
    if(response) {
      document.querySelector('#nameModal').style.display = 'none';
    }
  });
}