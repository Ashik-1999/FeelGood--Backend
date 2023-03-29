const router = require("express").Router();
const Specs = require('../Models/Admin Scema/AddSpecs')
const { upload2 } = require('../Multer/Multer')
const Counselor = require('../Models/Counselor/Signup')

const mongoose = require('mongoose');
const { S3Client, PutObjectCommand,GetObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const crypto = require('crypto')
const sharp = require('sharp');
const User = require("../Models/User Scema/User");


const s3 = new S3Client({
    credentials : {
        accessKeyId: process.env.BUCKET_ACCESS_KEY,
        secretAccessKey: process.env.BUCKET_SECRET_ACCESS_KEY 
    },    
    region: process.env.BUCKET_REGION,
})

const randomImageName = (bytes = 32) => crypto.randomBytes(bytes).toString('hex')

router.post('/add-spec',upload2.single('image'),async(req,res)=>{
//    const buffer = await sharp(req.file.buffer).resize({height : 1920, width : 1080, fit : 'contain'}).toBuffer()
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

    const newSpec = new Specs({
        Specialization: req.body.spec,
        image : imageName,    
     }) 
     const spec =await newSpec.save();
     res.status(200).json(spec)
    }catch(err){
        console.log(err)
        res.status(500).json(err)
    }
     
 })

router.get('/get-specs',async(req,res)=>{
    
   
    try{
        let specs = await Specs.find({})
        for(const spec of specs){
            const getObjectParams ={
                Bucket : process.env.BUCKET_NAME,
                Key : spec.image
            }
        
        const command = new GetObjectCommand(getObjectParams);
        const url = await getSignedUrl(s3, command, { expiresIn: 3600 });
        spec.imageUrl = url
    }    
        res.status(200).json({specs})
    }catch(err){
        console.log(err)
        res.status(500).json(err)
    }
}) 

router.get('/get-requests',async(req,res)=>{
    try{
        let counselors = await Counselor.find({})
        res.json(counselors)
    }catch(err){
        res.status(500).json(err)
    }
})

router.get('/request-details/:counselorId',async(req,res)=>{
    const {counselorId} = req.params
    const id = counselorId.slice(1)
   
    try{
        let counselor = await Counselor.findById(id)
        let specs = mongoose.Types.ObjectId(counselor.Specialization)
             
        
        console.log(specs,"specsssssss")
        let specialization = await Specs.find({_id : { $in : specs}})
        console.log(specialization)
        res.status(200).json({counselor:counselor,specs:specialization})
    }catch(err){
        res.status(500).json(err)
        console.log(err)
    }
})

router.put('/approve-request/:counselorId',async(req,res)=>{
    const {counselorId} = req.params
    const id = counselorId.slice(1)
    try{
        const data = await Counselor.findByIdAndUpdate(id,
            {$set:{
                status:"approved"
            }})
            res.status(200).json("Request approved")
    }catch(err){
        return res.status(500).json(err)
    }
})

router.put('/reject-request/:counselorId',async(req,res)=>{
    console.log("entered")
    console.log(req.body)
    const {counselorId} = req.params
    const id = counselorId.slice(1)
    
    try{
        const data = await Counselor.findByIdAndUpdate(id,
            {$set:{
                status:"rejected",
                rejectedReason:req.body.message
            }})
            res.status(200).json("Request rejected")
    }catch(err){
        return res.status(500).json(err)
    }
})


router.get('/get-users',async(req,res) =>{
    try{
        const users = await User.find({})
        console.log(users)
        res.status(200).json(users)
    }catch(err){
        console.log(err)
        res.status(500).json(err)
    }
})

router.put('/block-user/:userId',async(req,res)=>{
   const {userId} = req.params
   try{
    const update = await User.findByIdAndUpdate(userId,{
        $set:{
            status: "Blocked"
        }
    })
    res.status(200).json(update)
   }catch(err){
    console.log(err)
    res.status(500).json(err)
   }
})

router.put('/unblock-user/:userId',async(req,res)=>{
    const {userId} = req.params
    try{
     const update = await User.findByIdAndUpdate(userId,{
         $set:{
             status: "Active"
         }
     })
     res.status(200).json(update)
    }catch(err){
     console.log(err)
     res.status(500).json(err)
    }
 })

module.exports = router;
