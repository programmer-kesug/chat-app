const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(__dirname));

const users = {};

io.on('connection', (socket) => {
  socket.on('join', (name) => {
    socket.username = name;
    users[socket.id] = name;
    io.emit('msg', { user: 'System', text: name + ' เข้าร่วมแล้ว' });
    io.emit('users', Object.values(users));
  });
  socket.on('msg', (data) => {
    io.emit('msg', data);
  });
  socket.on('disconnect', () => {
    if (socket.username) {
      delete users[socket.id];
      io.emit('msg', { user: 'System', text: socket.username + ' ออกไปแล้ว' });
      io.emit('users', Object.values(users));
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log('Server running on port ' + PORT);
});
