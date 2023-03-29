const mongoose = require('mongoose')

const CounselorSchema = new mongoose.Schema({
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
    qualification:{
        type:String,
        required:true
    },
    experience:{
        type:String,
        required:true
    },                          
    regNumber:{
        type:String,
        default:""
    } ,
    Specialization:{
        type:String,
        required:true
    },
    about:{
        type:String
    },
    status:{
        type:String
    },
    rejectedReason:{
        type:String
    },
    slots:{
        type:Array
    },
    image:{
        type:String
    },
    imageUrl:{
        type:String
    },
    leaveDate:{
       type:Array
    },
    bookedSlots:{
        type:Array
     }

},
{timestamps:true}
);

module.exports = mongoose.model("counselors",CounselorSchema)