const express = require('express');
const app = express();
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const helmet = require('helmet');
const morgan = require('morgan');
const cors = require('cors')
const userRoute = require('./routes/users')
const authRoute = require('./routes/auth')
const postRoute = require('./routes/posts')
const adminRoute = require('./routes/admin')
const counselorRoute = require('./routes/counselor')
const messageRoute = require('./routes/messages')
const conversationRoute = require('./routes/conversations')
const { Server } = require('socket.io')
const { createServer } = require('http')


// Socket.io configuration
const httpServer = createServer(app)

const io = new Server(httpServer,{
    cors:{
        origin:"https://main.d1u4ylaq20kul3.amplifyapp.com/"
    }
});

let users = [];

const addUser = (userId,socketId) =>{
    !users.some(user =>user.userId === userId) && 
    users.push({userId,socketId})
}

const removeUser = (socketId) =>{
    users = users.filter((user)=>user.socketId !== socketId)
}

const getUser = (userId) =>{
    return users.find((user=>user.userId === userId))
}

io.on("connection",(socket)=>{
    // when connect
    console.log("a user connected")  

    //take userid and socketid from user
    socket.on("addUser",id =>{
        addUser(id,socket.id)
        io.emit("getUsers",users)  
    })

    //send and get message
    socket.on("sendMessage",({senderId,receiverId,text}) =>{
        console.log(senderId,receiverId,text)

        const user = getUser(receiverId);

        io.to(user?.socketId).emit("getMessage",{ 
            senderId,text
        })
    })

    //when disconnect
    socket.on("disconnect",()=> {
        console.log("a user disconnected")
        removeUser(socket.id)
    })
})

// socket io configuration ends


dotenv.config()
mongoose.connect(process.env.MONGODB_URL,()=>{
    console.log("Connected to MongoDB")
});


app.use(cors())
app.use(express.json());
app.use(helmet());
app.use(morgan("common"));

app.use('/specImage',express.static('Spec-Image'))
app.use('/api/users',userRoute)
app.use('/api/auth',authRoute)
app.use('/api/posts',postRoute)
app.use('/api/admin',adminRoute)
app.use('/api/counselor',counselorRoute)
app.use('/api/conversations',conversationRoute)
app.use('/api/messages',messageRoute)


app.get('/',(req,res)=>{
    res.send("<h1>welcome to homepage</h1 >")
})

httpServer.listen(8080,() => {
    console.log("server is running on port 8080")
})