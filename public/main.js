const socket = io();

const alertModal = document.querySelector('#alertModal');
const nameScreen = document.querySelector('#nameScreen');
const gameScreen = document.querySelector('#gameScreen');
const playerModal = document.querySelector('#playerModal');
const playerList = document.querySelector('#playerList');
const charactersRemaining = document.querySelector('#charactersRemaining');
const nameField = document.querySelector('#nameField');
const nameDiv = document.querySelector('#name');
const nameButton = document.querySelector('#nameButton');

let nameMaxCharacters = 0;
let nameCharactersUsed = 0;

const handleName = () => {
  const nameInput = nameField.value;
  socket.emit('received name', nameInput);
  socket.on('validation response', response => {
    if(response) {
      nameScreen.style.display = 'none';
      gameScreen.style.display = 'flex';
    }
  });
}

const handleInput = () => {
  const nameCharactersUsed = nameField.value.length;
  const nameCharactersRemaining = nameMaxCharacters - nameCharactersUsed;
  if(nameCharactersRemaining < 0) {
    charactersRemaining.style.color = 'rgba(243, 76, 90, 0.6)';
  } else {
    charactersRemaining.style.color = 'rgba(0, 174, 255, 0.6)';
  }
  charactersRemaining.textContent = `${nameCharactersRemaining}`;  
}

const deleteAllResources = () => {
  const resourceDivs = document.querySelectorAll(`.resource`);
  resourceDivs.forEach(resourceDiv => {
    document.querySelector(`#${resourceDiv.id}`).remove();
  });
}

const highlightNameDiv = () => {
  nameDiv.style.border = '2px solid rgba(0, 174, 255, 0.7)';
}

const unHighlightNameDiv = () => {
  const nameDivIsFocused = (document.activeElement === nameField);
  if(nameDivIsFocused) {
    nameDiv.style.border = '2px solid rgba(0, 174, 255, 0.7)';  
  } else {
    nameDiv.style.border = '2px solid rgba(0, 174, 255, 0.5)'; 
  }
}

nameField.addEventListener('keyup', event => {
  if(event.keyCode === 13) {
    nameButton.click();
  }
});

socket.on('connect', () => {
  highlightNameDiv();
});

socket.on('name max characters', max => {
  nameMaxCharacters = max;
  const nameCharactersRemaining = nameMaxCharacters - nameCharactersUsed;
  charactersRemaining.textContent = `${nameCharactersRemaining}`;  
});

socket.on('alert', alertMsg => {
    console.log(alertMsg);
    alertModal.style.opacity = '1';
    alertModal.textContent = alertMsg;
    window.setTimeout(() => {
      alertModal.style.opacity = '0';
    }, 1010);
});

socket.on('player list', players => {
  playerList.textContent = '';
  players.forEach(player => {
    const para = document.createElement('li');
    const text = document.createTextNode(player);
    para.appendChild(text);
    playerList.appendChild(para);
  });
});

socket.on('update resources', resources => {
  console.log('Deleting all resources.');
  deleteAllResources();
  console.log('Pulling all resources from server.');
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
      socket.emit('resource click', rsrc.id);
    });
  })
});