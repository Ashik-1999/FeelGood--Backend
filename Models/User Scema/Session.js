const mongoose = require('mongoose')

const SessionSchema = new mongoose.Schema(
    {
      userId :{
        type:String,
        required:true
      },
      counselorId:{
        type:String,
        required:true
      },
      time:{
        type:String,
        required:true
      },
      date:{
        type:String,
        required:true
      },
      plan:{
        type:String,
        required:true
      },
      patientName:{
        type:String,
        required:true
      },
      patientMobile:{
        type:String,
        required:true
      },
      status:{
        type:String
      }
},
   {timestamps:true}
);

module.exports = mongoose.model("Session",SessionSchema)