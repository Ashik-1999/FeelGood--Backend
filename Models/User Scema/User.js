const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
    fullname:{
        type:String,
        required:true,
        min:3,
        max:20,
     
    },
    number:{
        type:String,
        required:true,
        min:10,
        unique:true
    },
    email:{
        type:String,
        required:true,
       
        unique:true
    },
    password:{
        type:String,
        required:true,
        min:5
    },
    profilePicture:{
        type:String,
        default:""
    },
    hname:{
        type:String,
        max:50,
        default:""
    },
    city:{
        type:String,
        max:50,
        default:""
    },
    state:{
        type:String,
        max:20,
        default:""
    },
    counselor:{
       type:Array
    },
    status:{
        type:String
    }
    
},
{timestamps:true}
);

module.exports = mongoose.model("User",UserSchema)