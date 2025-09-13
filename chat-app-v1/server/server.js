import express from "express";

import http from "http";

import { Server } from "socket.io";

const app = express();

const server = http.createServer(app);


const io = new Server(server, {
    cors: {
        origin: "",
        Credential: true,
    }
});

// handle websocket connections here
io.on("connection", (socket) => {
    console.log("A new user has connected", socket.id);

    //listen for incoming messages from clients
    socket.on("message", (message) => {
        //Broasdcast the message to all connected clients
        io.emit("message", message);
    });

    // handle disconnections
    socket.on("disconnect", () => {
        console.log(socket.id, "disconnect");
    })


})

//listen the server here
server.listen(5000, () => {
    console.log('server is running on port 5000');
})