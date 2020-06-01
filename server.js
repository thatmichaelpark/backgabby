
const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);
// const bodyParser = require('body-parser');
// const fs = require('fs');

app.use(express.static("public"));

app.get("/", function(request, response) {
  response.sendFile(__dirname + "/app/index.html");
});

// app.post("/log", bodyParser.json(), function(request, response) {
//   fs.appendFileSync('.data/log.txt', request.body + '\n');
//   response.sendStatus(200);
// });

http.listen(process.env.PORT, function() {
  console.log("Your app is listening on port " + http.address().port);
});

const knownUsers = [
  { username: "Michael", password: "1234" },
  { username: "Ioana", password: "1253" },
  { username: "Gabby", password: "0" },
  { username: "Adrian", password: "1234" },
  { username: "GDM", password: "1234" },
];
 
let users = [];
let socketDict = {};

function findUserByUsername(username) {
  return users.find(u => u.username === username);
}

function findUserByUserId(userId) {
  return users.find(u => u.userId === userId);
}

function findUserBySocketId(socketId) {
  return users.find(u => u.socketId === socketId);
}

function printUsers() {
  users.forEach(user => {
    console.log(`${user.username}\t${user.userId || '---\t\t'}\t${user.socketId}`);
  });
  console.log('=============================');
}

io.on("connection", function(socket) {
  socketDict[socket.id] = true;
  users.push({
    username: '',
    userId: null,
    id: socket.id,
    socketId: socket.id
  });
  console.log(`new socket: ${socket.id}`);
  printUsers();;;

  socket.on("log in", ({ username, password }) => {
    const user = findUserByUsername(username);
    if (user) {
      user.username = '';
      user.userId = null;
      console.log(`${username} logged out in anticipation of relogging in`);
    }
    
    if (
      knownUsers.find(
        user => user.username === username && user.password === password
      )
    ) {
      const user = findUserBySocketId(socket.id);
      user.username = username;
      user.userId = user.socketId;
      console.log(`${username} logged in`);
      printUsers();
      socket.emit("login succeeded", user);
      emitUsers();
    } else {
      socket.emit("login failed");
    }
  });
  
  function emitUsers() {
    io.emit('users', users.filter(user => user.username));
  }

  socket.on('invite', ({inviter, invitee}) => {
    socket.to(invitee.id).emit('invitation', inviter);
  });
  
  socket.on('cancel invitation', ({inviter, invitee}) => {
    socket.to(invitee.id).emit('invitation canceled');
  });

  socket.on('accept invitation', ({inviter, invitee}) => {
    socket.to(inviter.id).emit('invitation accepted');
  });
  
  socket.on('chat message', ({message, sender, inviter, invitee}) => {
    socket.to(inviter.id).emit('chat message in', {message, sender});
    socket.to(invitee.id).emit('chat message in', {message, sender});
  });

  socket.on('game event', ({event, inviter, invitee}) => {
    // console.log('game event', event, inviter, invitee);
    socket.to(inviter.id).emit('game event', event);
    socket.to(invitee.id).emit('game event', event);
  });
  
  socket.on('end game', ({inviter, invitee}) => {
    console.log('END GAME');;;
    socket.to(inviter.id).emit('game ended');
    socket.to(invitee.id).emit('game ended');
  });
  
  socket.on("log out", () => {
    socket.emit('logout succeeded');
    console.log(`${findUserBySocketId(socket.id)} logged out`);
    removeUser(socket.id);
    printUsers();
  });

  socket.on("disconnect", function() {
    const i = users.findIndex(u => u.socketId === socket.id);
    if (i >= 0) {
      if (users[i].userId) {
        users[i].socketId = null;
      } else {
        // Remove empty user slot:
        users.splice(i, 1);
      }
    }
    
    delete socketDict[socket.id];
    emitUsers();
    console.log(`${socket.id} disconnected; ${Object.keys(socketDict).length}`);
    printUsers();
  });

  function removeUser(socketId) {
    const user = findUserBySocketId(socketId);
    user.username = '';
    user.userId = null;
    emitUsers();
  }
});

