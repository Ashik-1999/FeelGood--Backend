const router = require("express").Router();
const Counselor = require('../Models/Counselor/Signup')
const Specs = require('../Models/Admin Scema/AddSpecs')
const bcrypt = require('bcrypt')
const { upload2 } = require('../Multer/Multer');
const { findOne } = require("../Models/Counselor/Signup");
const maxAge = 3 * 24 * 60 * 60;
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose');
const { S3Client, PutObjectCommand,GetObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const crypto = require('crypto')
const sharp = require('sharp');



const s3 = new S3Client({
    credentials : {
        accessKeyId: process.env.BUCKET_ACCESS_KEY,
        secretAccessKey: process.env.BUCKET_SECRET_ACCESS_KEY 
    },    
    region: process.env.BUCKET_REGION,
})
const randomImageName = (bytes = 32) => crypto.randomBytes(bytes).toString('hex')


const createToken = (userData) => {
    return jwt.sign({ user:userData},process.env.ACCESS_TOKEN_SECRET , {
        expiresIn: maxAge
    })
}

router.post('/register',async(req,res)=>{
    
    const counselorData = await Counselor.findOne({email:req.body.email})
    if(counselorData){
        res.json({counselorExist:true})
    }else{
        try{
        const salt = await bcrypt.genSalt(10);
        console.log(salt)
    const hashedPassword = await bcrypt.hash(req.body.password,salt);

    const newCounselor = new Counselor({
        fullname : req.body.fullname,
        email : req.body.email,
        password : hashedPassword,
        number:req.body.number,
        qualification:req.body.qualification,
        experience:req.body.experience,
        regNumber:req.body.regNumber,
        Specialization:req.body.Specialization,
        status:"pending",
        qualificationCert:req.body.qualificationCert,
        experienceCert:req.body. experienceCert,
        about:req.body.about

     }) 

     console.log(newCounselor,"haiiiiiiii")


    const counselor =await newCounselor.save();
    

    res.status(200).json(counselor)
    } catch(err){
        console.log(err.message)
    res.status(500).json(err)
    }  
    }
})

router.post('/login',async(req,res)=>{
    const data =await Counselor.findOne({email:req.body.email})
    if(!data){
        return res.json({notFound:true})
     }
    
     const validPassword = await bcrypt.compare(req.body.password,data.password);
     if(!validPassword){
        return  res.json({passwordNotFound:true}); 

     }

     if(data.status == "pending" || data.status =="rejected"){
        return res.json({notApproved:true,details:data})
     }

     const {password,...others} = data._doc
     const token = createToken(others);
     res.cookie("jwt", token, { httpOnly: false, maxAge: maxAge * 1000 });   
     res.status(200).json({counselorJwt:token})
})


router.delete('/delete-request/:id',async(req,res)=>{
    const {id} = req.params
    try{
        const deleted = await Counselor.findByIdAndDelete(id) 
        res.status(200).json({deleted:true})
    }catch(err){
        console.log(err)
        res.status(500).json(err)
    }   
})



router.post('/add-slots',async(req,res)=>{
    
    const id = req.body[1].id
    
    try{    
       const find = await Counselor.findByIdAndUpdate(id,{
        $addToSet:{
            slots:{$each:req.body[0]}
        }
       })
       res.status(200).json({status:true})
    }catch(err){
        console.log(err)
        res.status(500).json(err)
    }
})


router.post('/add-image/:id',upload2.single('image'),async(req,res)=>{
    const {id} = req.params
    const imageName = randomImageName()
    
    const params = {
        Bucket : process.env.BUCKET_NAME,
        Key : imageName,
        Body : req.file.buffer,
        ContentType : req.file.mimetype
    }
    const command = new PutObjectCommand(params)
    await s3.send(command)
   
   try{
     const update =await Counselor.findByIdAndUpdate(id,{
        $set:{image:imageName}
     })
     res.status(200).json(update)
    }catch(err){
        console.log(err)
        res.status(500).json(err)
    }
})

router.delete('/delete-image/:id',async(req,res)=>{
    const {id} = req.params
     const counselor = await Counselor.findById(id)
     const params = {
        Bucket: process.env.BUCKET_NAME,
        Key: counselor.image
     }
     const command = new DeleteObjectCommand(params)
     try {
        await s3.send(command)
        await Counselor.findByIdAndUpdate(id,{
        $unset:{image:counselor.image}
        })
     res.status(200).json(counselor)
     } catch (error) { 
        res.status(500).json(error)
     }
     
})

router.get('/get-counselor/:id',async(req,res)=>{
    const {id} = req.params
    try{
        let counselor = await Counselor.findById(id)
        let specs = await Specs.findById(counselor?.Specialization)   
        if(counselor?.image){
            const getObjectParams ={
                Bucket : process.env.BUCKET_NAME,
                Key : counselor.image
            }
        
            const command = new GetObjectCommand(getObjectParams);
            const url = await getSignedUrl(s3, command, { expiresIn: 3600 });
            counselor.imageUrl = url
        } 
       let specName = specs?.Specialization
        counselor.Specialization = specName
        res.status(200).json(counselor)
    }catch(err){
        console.log(err)
        res.status(500).json(err)
    }
})

router.post('/add-leave',async(req,res)=>{
    const id = req.body[1].id
    console.log(id)
    try{    
        await Counselor.findByIdAndUpdate(id,{
         $addToSet:{
             leaveDate:req.body[0]
         }
        })
        res.status(200).json({status:true})
     }catch(err){
         console.log(err)
         res.status(500).json(err)
     }
})

router.patch('/delete-slots', async(req, res) => {
    const {time,id} = req.body
    try {
        await Counselor.findByIdAndUpdate(id,
        {
            $pull: {slots: {time:time}}
        })

    res.status(200).json({status: true})
    } catch (error) {
        console.log(error)
        res.status(500).json(error)
    }
})


module.exports = router; 