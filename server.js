let express = require('express');
let app = express();
let server = require('http').createServer(app);
let io = require('socket.io').listen(server);
let users = [];
app.use('/', express.static(__dirname + '/www'));
server.listen(3000);

io.on('connection', (socket) => {
    socket.on('login', (nickname) => {
        if (users.indexOf(nickname) != -1) {
            socket.emit('nickNameExisted');
        } else {
            socket.userIndex = users.length;
            socket.nickname = nickname;
            users.push(nickname);
            socket.emit('loginSuccess');
            io.sockets.emit('system', nickname, users.length, 'login');
        }
    });

    socket.on('disconnect', () => {
        if (socket.nickname) {
            users.splice(socket.userIndex, 1);
            socket.broadcast.emit('system', socket.nickname, users.length, 'logout');
        }
    });

    socket.on('postMsg', (msg, color) => {
        socket.broadcast.emit('newMsg', socket.nickname, msg, color);
    });

    socket.on('img', (imgData) => {
        socket.broadcast.emit('newImg', socket.nickname, imgData);
    })
});

