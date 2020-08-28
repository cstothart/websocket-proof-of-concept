const express = require('express');
const app = express();

const port = 8000;

app.use(express.static('public'));

const server = app.listen(port);
const io = require('socket.io')(server);

let players = [];

io.on('connection', socket => {

  let inGame = false;

  socket.join('name room');

  socket.on('received name', nameSubmitted => {
    if(nameSubmitted == '') {
      socket.emit('validation response', false);
    } else {
      socket.emit('validation response', true);
      socket.name = nameSubmitted;
      players.push(socket.name);
      console.log(players);
      socket.join('game room', () => {
        inGame = true;
        socket.to('game room').emit('alert', `${socket.name} joined`);
      });
    }
  });

  socket.on('disconnect', () => {
    if(inGame) {
      const index = players.indexOf(socket.name);
      players.splice(index, 1);
      socket.to('game room').emit('alert', `${socket.name} left`);
    }
  });  

});
