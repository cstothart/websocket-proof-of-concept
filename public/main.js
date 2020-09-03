const socket = io();

const alertModal = document.querySelector('#alertModal');
const nameScreen = document.querySelector('#nameScreen');
const gameScreen = document.querySelector('#gameScreen');
const playerModal = document.querySelector('#playerModal');
const playerList = document.querySelector('#playerList');

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
      nameScreen.style.display = 'none';
      gameScreen.style.display = 'flex';
    }
  });
}

socket.on('player list', players => {
  playerList.textContent = '';
  players.forEach(player => {
    const para = document.createElement('li');
    const text = document.createTextNode(player);
    para.appendChild(text);
    playerList.appendChild(para);
  });
});

const handleResourceClick = rsrcId => {
  socket.emit('resource click', rsrcId);
}

socket.on('add resources', resources => {
  console.log(resources);
  resources.forEach(rsrc => {
    const rsrcX = (window.innerWidth/2) + 
      rsrc.pos.xFromCenter - 
      (rsrc.size.width/2) - 
      rsrc.borderWidth;
    const rsrcY = (window.innerHeight/2) + 
      rsrc.pos.yFromCenter - 
      (rsrc.size.height/2) - 
      rsrc.borderWidth;
    const resource = document.createElement('div');
    resource.classList.add('resource');
    resource.setAttribute('id', rsrc.id);
    resource.style.height = `${rsrc.size.width}px`;
    resource.style.width = `${rsrc.size.height}px`;
    resource.style.borderWidth = `${rsrc.borderWidth}px`;
    resource.style.left = `${rsrcX}px`;
    resource.style.top = `${rsrcY}px`;
    gameScreen.appendChild(resource);
    resource.addEventListener('click', () => { 
      handleResourceClick(rsrc.id);
    });
  })
});

socket.on('delete resources', resourceId => {
  const resourceDiv = document.querySelector(`#${resourceId}`);
  resourceDiv.remove();

});