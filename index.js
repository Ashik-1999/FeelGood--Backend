const express = require('express');
const app = express();
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const helmet = require('helmet');
const morgan = require('morgan');
var cors = require('cors')
app.use(cors())
const userRoute = require('./routes/users')
const authRoute = require('./routes/auth')
const postRoute = require('./routes/posts')
const adminRoute = require('./routes/admin')
const counselorRoute = require('./routes/counselor')
const messageRoute = require('./routes/messages')
const conversationRoute = require('./routes/conversations')



app.use('/specImage',express.static('Spec-Image'))



dotenv.config()
mongoose.connect('mongodb://localhost:27017/feelgood',()=>{
    console.log("Connected to MongoDB")
});

app.use(express.json());
app.use(helmet());
app.use(morgan("common"));


  
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

app.listen(8080,()=>{
    console.log("server is running on port 8080")
})