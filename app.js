const express = require('express');
const app = express();
const validator = require('validator');

const port = process.env.PORT || 8000 ;

app.use(express.static('public'));

const server = app.listen(port);
const io = require('socket.io')(server);

const gameConfig = {
  resources: {
    spawnInterval: 1000,
    maxNumber: 100,
    // Max resource spawn distance from window center.
    maxXDist: 375,
    maxYDist: 150,
    width: 20,
    height: 20,
    borderWidth: 2,
  },
  names: {
    maxCharacters: 20
  }
};

const gameState = {
  players: [],
  resources: []
}

const deleteResource = resourceId => {
  gameState.resources.forEach((resource, index) => {
    if(resource.id === resourceId) {
      gameState.resources.splice(index, 1);
    }
  });
  io.emit('update resources', gameState.resources);
}

const createResource = () => {
  const resourceId = `r${Math.floor(Math.random()*1000000000).toString()}`;
  const positivityX = [1, -1][Math.floor(Math.random() * 2)];
  const positivityY = [1, -1][Math.floor(Math.random() * 2)];
  const newResource = {
    id: resourceId, 
    pos: {
      xFromCenter: Math.floor(Math.random()*gameConfig.resources.maxXDist)*positivityX,
      yFromCenter: Math.floor(Math.random()*gameConfig.resources.maxYDist)*positivityY
    },
    size: {
      width: gameConfig.resources.width,
      height: gameConfig.resources.height
    },
    borderWidth: gameConfig.resources.borderWidth
  }
  gameState.resources.push(newResource);
  io.emit('update resources', gameState.resources);
}

const validateName = name => {
  let validationResult = true;
  let resultReason = 'Name is valid!';
  const maxCharacters = gameConfig.names.maxCharacters;
  if(validator.isEmpty(name, { ignore_whitespace: true })) {
    validationResult = false;
    resultReason = 'Name cannot be blank!';
  }
  if(!validator.isLength(name, { min: 0, max: maxCharacters })) {
    validationResult = false;
    resultReason = `Name exceeds ${maxCharacters} characters!`;
  }
  gameState.players.forEach(player => {
    if(name === player.name) {
      validationResult = false;
      resultReason = 'Name already exists!'
    }
  });
  return({result: validationResult, resultReason: resultReason});
}

io.on('connection', socket => {

  let inGame = false;

  socket.join('name room');
  socket.emit('name max characters', gameConfig.names.maxCharacters);

  socket.on('received name', nameSubmitted => {
    let name = nameSubmitted;
    const validation = validateName(name);
    socket.emit('validation response', validation);
    if(validation.result) {
      socket.name = name;
      gameState.players.push({name: socket.name, score: 0});
      socket.join('game room', () => {
        inGame = true;
        socket.to('game room').emit('alert', `${socket.name} joined`);
        io.emit('players', gameState.players);
        io.emit('update resources', gameState.resources);
      });
    }
  });

  socket.on('resource click', resourceId => {
    deleteResource(resourceId);
    gameState.players.forEach((player, index) => {
      if(player.name === socket.name) {
        gameState.players[index].score += 1;
      }
    });
    io.emit('players', gameState.players);
  });

  socket.on('disconnect', () => {
    if(inGame) {
      gameState.players = gameState.players.filter((player) => {
        return player.name != socket.name;
      });
      socket.to('game room').emit('alert', `${socket.name} left`);
      io.emit('players', gameState.players);
      if(gameState.players.length === 0) {
        gameState.resources = [];
      };
    }
  });
});

setInterval(() => {
  if(gameState.players.length !== 0) {
    if(gameState.resources.length < gameConfig.resources.maxNumber) {
      createResource(); 
    }
  }
}, gameConfig.resources.spawnInterval);