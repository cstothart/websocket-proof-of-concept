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
const validationMessage = document.querySelector('#validationMessage');
const chatMessages = document.querySelector('#chatMessages');
const chatInput = document.querySelector('#chatInput');
const chatButton = document.querySelector('#chatButton');
const chatModal = document.querySelector('#chatModal');

let nameMaxCharacters = 0;
let nameCharactersUsed = 0;

const clientState = {
  chatOpen: false
}

const handleName = () => {
  const nameInput = nameField.value;
  socket.emit('received name', nameInput);
  socket.on('validation response', validation => {
    if(validation.result) {
      nameScreen.style.display = 'none';
      gameScreen.style.display = 'flex';
    } else {
      validationMessage.style.opacity = '1';
      validationMessage.textContent = validation.resultReason;
      window.setTimeout(() => {
        validationMessage.style.opacity = '0';
      }, 1010);
    }
  });
}

const handleChatInput = () => {
  const message = chatInput.value;
  socket.emit('received chat message', message);
  chatInput.value = '';
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

const toggleChat = () => {
  if(!clientState.chatOpen) {
    chatModal.style.bottom = '0px';
    clientState.chatOpen = true;
  } else {
    chatModal.style.bottom = '-330px';
    clientState.chatOpen = false;
  }
}

nameField.addEventListener('keyup', event => {
  if(event.keyCode === 13) {
    nameButton.click();
  }
});

chatInput.addEventListener('keyup', event => {
  if(event.keyCode === 13) {
    chatButton.click();
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

socket.on('players', players => {
  playerList.textContent = '';
  players.forEach(player => {
    const playerDiv = document.createElement('div');
    playerDiv.classList.add('playerDiv');
    const nameDiv = document.createElement('div');
    nameDiv.classList.add('nameDiv');
    const scoreDiv = document.createElement('div');
    scoreDiv.classList.add('scoreDiv');
    const nameText = document.createTextNode(player.name);
    const scoreText = document.createTextNode(player.score);
    nameDiv.appendChild(nameText);
    scoreDiv.appendChild(scoreText);
    playerDiv.appendChild(nameDiv);
    playerDiv.appendChild(scoreDiv);
    playerList.appendChild(playerDiv);
  });
});

socket.on('update resources', resources => {
  deleteAllResources();
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

socket.on('chat messages', messages => {
  chatMessages.textContent = '';
  messages.forEach(message => {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('messageDiv');
    const messageContentDiv = document.createElement('div');
    messageContentDiv.classList.add('messageContentDiv');
    const messageSenderDiv = document.createElement('div');
    messageSenderDiv.classList.add('messageSenderDiv');
    const messageContentText = document.createTextNode(message.message);
    const messageSenderText = document.createTextNode(`${message.sender}:`);
    messageContentDiv.appendChild(messageContentText);
    messageSenderDiv.appendChild(messageSenderText);
    messageDiv.appendChild(messageSenderDiv);
    messageDiv.appendChild(messageContentDiv);
    chatMessages.appendChild(messageDiv);    
  });
});