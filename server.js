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

function findUserById(id) {
  return users.find(u => u.id === id);
}

io.on("connection", function(socket) {
  socketDict[socket.id] = true;
  console.log(`new socket: ${socket.id}; ${Object.keys(socketDict).length}`);
  console.log(socketDict);
  console.log(`a user connected; ${users.length} users: ${users.map(u => u.username || '???')}.`);

  socket.on("log in", ({ username, password }) => {
    if (
      knownUsers.find(
        user => user.username === username && user.password === password
      ) &&
      !findUserByUsername(username)
    ) {
      users.push({username, id: socket.id});
      console.log(`${username} logged in; ${users.length} users: ${users.map(u => u.username || '???')}.`);
      socket.emit("login succeeded", { username, id: socket.id });
      emitUsers();
    } else {
      socket.emit("login failed");
    }
  });
  
  function emitUsers() {
    io.emit('users', users);
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
    console.log('game event', event, inviter, invitee);
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
    const username = removeUser(socket.id);
    console.log(`${username} logged out; ${users.length} remaining: ${users.map(u => u.username || '???')}.`);
  });

  socket.on("disconnect", function() {
    const username = removeUser(socket.id);
    delete socketDict[socket.id];
    emitUsers();
    console.log(`${socket.id} disconnected; ${Object.keys(socketDict).length}`);
  });

  function removeUser(id) {
    const user = findUserById(socket.id);
    const username = user ? user.username : '???';
    users = users.filter(u => u.id !== socket.id);
    emitUsers();
    return username;    
  }
});

