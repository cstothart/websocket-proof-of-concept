const express = require('express');
const app = express();

const port = 8000;

app.use(express.static('public'));

const server = app.listen(port);
const io = require('socket.io')(server);

io.on('connect', socket => {

  console.log('A client connected.');
  socket.broadcast.emit('alert', 'Someone joined');

  socket.on('disconnect', () => {
    console.log('A client disconnected.');
    socket.broadcast.emit('alert', 'Someone left');
  });

});