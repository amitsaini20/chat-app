const http = require('http');
const express = require('express')
const cors = require('cors')
const socketIO = require('socket.io')
require('dotenv').config()

const app = express()
const port = process.env.PORT;
app.use(cors());

const users = [{}];

app.get('/', (req, resp) => {
    resp.send('Server listen on 4500')
})

const server = http.createServer(app)

const io = socketIO(server);

io.on("connection", (socket) => {
    console.log("New Connection");

    socket.on('joined', ({ user }) => {
        users[socket.id] = user;
        console.log(`${user} has joined `);
        socket.broadcast.emit('userJoined', { user: "Admin", message: ` ${users[socket.id]} has joined` });
        socket.emit('welcome', { user: "Admin", message: `Welcome to the chat,${users[socket.id]} ` })
    })

    socket.on('message', ({ message, id }) => {
        io.emit('sendMessage', { user: users[id], message, id });
    })

    socket.on('disconnect', () => {
        const disconnectedUser = users[socket.id];
        delete users[socket.id];
        if (disconnectedUser) {
            io.emit('leave', { user: "Admin", message: `${disconnectedUser} has left` });
            console.log(`${disconnectedUser} has left`);
        }
        //     socket.broadcast.emit('leave',{user:"Admin",message:`${users[socket.id]}  has left`});
        //   console.log(`user left`);
    })
})




server.listen(port, () => {
    console.log(`server is working on http://localhost:${port}`);
})