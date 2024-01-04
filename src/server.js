require('dotenv').config();
const express = require('express')
const path = require('path')
const http = require('http')
const socketio = require('socket.io')
const {addUser,revomeUser,getUser,getRoomUser} = require('./util/users')
const { generateMessage } =require('./util/message')

//Port from Environment Variable
const port = process.env.PORT || 80

//Port not found
if(!port){
    return console.log("PORT not found from Environment, Server turn off.");
}

// Server Setup
const app = express()
const server = http.createServer(app)
const io = socketio(server)

// Public Folder Path
const publicDir = path.join(__dirname,'../public')
    
// Enable the Pages from public Folder
app.use(express.static(publicDir))

//Start Socket Connection
io.on('connection',(socket)=>{
    console.log("New Connection Found");


    //New Join to Room
    socket.on('join',(userData,callback)=>{

        //Add User
        const { error, user } = addUser({id:socket.id,...userData})

        //Check for error
        if(error){
            return callback(error)
        }

        socket.join(user.room)

        //Welcome Message
        socket.emit('serverMessage',generateMessage(user.name,"Welcome!"))

        //Let all know someone has join
        socket.broadcast.to(user.room).emit('SomeOneJoin',generateMessage("Server",`${user.name} has joined!`))

        //Send Room Data
        io.to(user.room).emit('roomData',{
            room:user.room,
            users:getRoomUser(user.room)
        })
        callback()
    })

    //SomeOne left the chat
    socket.on('disconnect',()=>{

        //Remove User
        const user = revomeUser(socket.id)

        //UserLeft Message
        if(user){
            io.to(user.room).emit('SomeOneLeft',generateMessage("Server",`${user.name} has left!`))
        }
    })

    //Message from client
    socket.on('sendMessage',(message,callback)=>{
        const user = getUser(socket.id)
        io.to(user.room).emit('message',generateMessage(user.name,message))
        callback('delivered')
    })

})


//Server Started
server.listen(port,()=>{
    console.log("Server Started on",port);
})  