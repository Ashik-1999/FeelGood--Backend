const User = require('../Models/User Scema/User')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const maxAge = 3 * 24 * 60 * 60;
require('dotenv').config()

const createToken = (userData) => {
    return jwt.sign({ user:userData},process.env.ACCESS_TOKEN_SECRET , {
        expiresIn: maxAge
    })
}



const userRegister = async(req,res)=>{
   

    console.log(req.body)
    const userData = await User.findOne({email:req.body.email})
    if(userData){
        res.json({userExist:true})
    }else{
        try{
        const salt = await bcrypt.genSalt(10);
        console.log(salt)
    const hashedPassword = await bcrypt.hash(req.body.password,salt);

    const newUser = new User({
        fullname : req.body.fullname,
        email : req.body.email,
        password : hashedPassword,
        number:req.body.number
     }) 

     console.log(newUser,"haiiiiiiii")


    const user =await newUser.save();
    

    res.status(200).json(user)
    } catch(err){
        console.log(err.message)
    res.status(500).json(err)
    }  
    }
    

}

const userLogin = async(req,res)=>{

    try{
        
        const user = await User.findOne({email:req.body.email})
       
        if(!user){
           return res.json({notFound:true})
        }
       
        const validPassword = await bcrypt.compare(req.body.password,user.password);
        if(!validPassword){
           return  res.json({passwordNotFound:true}); 

        }

        if(user.status == "Blocked"){
            return res.json({blocked:true})
        }

        const {password,...others} = user._doc
     
        const token = createToken(others);
        res.cookie("jwt", token, { httpOnly: false, maxAge: maxAge * 1000 });   
        res.status(200).json({jwt:token})

    } catch(err){
        console.log(err.message)
        res.status(500).json(err)
         
    } 
}

module.exports = {
    userRegister,userLogin
}