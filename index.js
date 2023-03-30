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
// const httpServer = createServer(app)

// const io = new Server(httpServer,{
//     cors:{
//         origin:"https://main.d1u4ylaq20kul3.amplifyapp.com"
//     }
// });

// let users = [];

// const addUser = (userId,socketId) =>{
//     !users.some(user =>user.userId === userId) && 
//     users.push({userId,socketId})
// }

// const removeUser = (socketId) =>{
//     users = users.filter((user)=>user.socketId !== socketId)
// }

// const getUser = (userId) =>{
//     return users.find((user=>user.userId === userId))
// }

// io.on("connection",(socket)=>{
//     // when connect
//     console.log("a user connected")  

//     //take userid and socketid from user
//     socket.on("addUser",id =>{
//         addUser(id,socket.id)
//         io.emit("getUsers",users)  
//     })

//     //send and get message
//     socket.on("sendMessage",({senderId,receiverId,text}) =>{
//         console.log(senderId,receiverId,text)

//         const user = getUser(receiverId);

//         io.to(user?.socketId).emit("getMessage",{ 
//             senderId,text
//         })
//     })

//     //when disconnect
//     socket.on("disconnect",()=> {
//         console.log("a user disconnected")
//         removeUser(socket.id)
//     })
// })

// socket io configuration ends

app.use(cors({
    origin: 'https://main.d1u4ylaq20kul3.amplifyapp.com/',
    methods: ['GET', 'POST', 'PUT', 'DELETE','PATCH'],
    credentials: true,
    preflightContinue: true,
    optionsSuccessStatus: 204,
    allowedHeaders: ['Content-Type', 'Authorization']
  }))


dotenv.config()
mongoose.connect(process.env.MONGODB_URL,()=>{
    console.log("Connected to MongoDB")
});


app.use(cors({
    origin:"https://main.d1u4ylaq20kul3.amplifyapp.com"
  })
);
app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("common"));

app.use('/specImage',express.static('Spec-Image'))
app.use('/users',userRoute)
app.use('/auth',authRoute)
app.use('/posts',postRoute)
app.use('/admin',adminRoute)
app.use('/counselor',counselorRoute)
app.use('/conversations',conversationRoute)
app.use('/messages',messageRoute)


// app.get('/',(req,res)=>{
//     res.send("<h1>welcome to homepage</h1 >")
// })

app.listen(3000,() => {
    console.log("server is running on port 8080")
})