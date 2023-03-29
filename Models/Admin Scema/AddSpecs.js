const mongoose = require('mongoose')

const specsSchema = new mongoose.Schema(
    {
      Specialization :{
        type:String,
        required:true
      },
      image:{
        type:String,
      },
      imageUrl:{
        type:String
      }
},
   {timestamps:true}
);

module.exports = mongoose.model("specialization",specsSchema)