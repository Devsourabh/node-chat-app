const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')
const { generateMessage , generateLocationMessage } = require('./utils/messages')
const { addUser, removeUser, getUser, getUsersInRoom, getAvilableRoom } = require('./utils/users')

const app = express()
const server = http.createServer(app)
const io = socketio(server)


const port = process.env.PORT || 3000

const publicDirPath = path.join(__dirname,'../public')
app.use(express.static(publicDirPath))


io.on('connection',(socket)=>{
    console.log('New Websocket Connection')

    socket.on('join',(option,callback)=>{

        const {error, user} = addUser({ id:socket.id, ...option })

        if(error){
            return callback(error)
        }

        socket.join(user.room)
        socket.emit('message', generateMessage("Admin",'Welcome!'))
        socket.broadcast.to(user.room).emit('message', generateMessage("Admin",`${user.username} has joined!`))

        io.to(user.room).emit('roomdata',{
            room:user.room,
            users:getUsersInRoom(user.room)
        })
        callback()
    })


    socket.on('sendMessage',(message,callback)=>{
        filter = new Filter()
        const user = getUser(socket.id)

        if(filter.isProfane(message)){
            return callback('Profanity is not allowed')
        }
        io.to(user.room).emit('message', generateMessage(user.username,message))
        callback()
    })
   

    socket.on('sendLocation', (location, callback) => {
        const user = getUser(socket.id)
        io.to(user.room).emit('locationMessage', generateLocationMessage(user.username,location))
        callback()
    })


    socket.emit('sendRoomData', getAvilableRoom())

    socket.on('disconnect',()=>{
        const user = removeUser(socket.id)
        if(user){
            io.to(user.room).emit('message', generateMessage("Admin",`${user.username} has left!`))
            socket.to(user.room).emit('roomdata', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }     
    })
    
})


server.listen(port,()=>{
    console.log(`Server is runing on Port: ${port}`)
})