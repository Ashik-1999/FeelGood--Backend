const router = require("express").Router();
const User = require('../Models/User Scema/User')
const bcrypt = require('bcrypt')
const Specs = require('../Models/Admin Scema/AddSpecs')
const Sessions = require('../Models/User Scema/Session')
const Counselor = require('../Models/Counselor/Signup')
const Conversations = require('../Models/User Scema/Conversations')
const Razorpay = require('razorpay');
const { S3Client, PutObjectCommand,GetObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const crypto = require('crypto')
const sharp = require('sharp')
const dotenv = require('dotenv');
const moment = require('moment');
const verifyJWT = require("../Middlewares/verifyJWT");
dotenv.config()


const s3 = new S3Client({
    credentials : {
        accessKeyId: process.env.BUCKET_ACCESS_KEY,
        secretAccessKey: process.env.BUCKET_SECRET_ACCESS_KEY 
    },    
    region: process.env.BUCKET_REGION,
})
const randomImageName = (bytes = 32) => crypto.randomBytes(bytes).toString('hex')


const getSpecs = async(req,res)=>{
    try{
        let specs = await Specs.find({})
        console.log(specs)
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
}



const getAllCounselors = async(req,res)=>{
    try{
        let counselor = await Counselor.find().limit(5)
        for(const datas of counselor){
            let specs = await Specs.findById(datas.Specialization)
            datas.Specialization = specs.Specialization
            if(datas.image){
                const getObjectParams ={
                    Bucket : process.env.BUCKET_NAME,
                    Key : datas.image
                }
            
            const command = new GetObjectCommand(getObjectParams);
            const url = await getSignedUrl(s3, command, { expiresIn: 3600 });
            datas.imageUrl = url
           
            }       
        }   
      
        res.status(200).json({counselor})
    }catch(err){
        console.log(err)
        res.status(500).json(err)
    }
}

const getCounselorLists = async(req,res)=>{
 
    try{
        let counselor = await Counselor.find()
        for(const datas of counselor){
            let specs = await Specs.findById(datas.Specialization)
            datas.Specialization = specs.Specialization
            if(datas.image){
                const getObjectParams ={
                    Bucket : process.env.BUCKET_NAME,
                    Key : datas.image
                }
            
            const command = new GetObjectCommand(getObjectParams);
            const url = await getSignedUrl(s3, command, { expiresIn: 3600 });
            datas.imageUrl = url
           
            }       
    }   

        res.status(200).json({counselor})
    }catch(err){
        console.log(err)
        res.status(500).json(err)
    }
}

const getCounselorData = async(req,res)=>{
    const id = req.params.id
   
    try{
        let details = await Counselor.findById(id)
        
        if(details.image){
            console.log("if enters")
            const getObjectParams ={
                Bucket : process.env.BUCKET_NAME,
                Key : details.image
            }
        const command = new GetObjectCommand(getObjectParams);
        const url = await getSignedUrl(s3, command, { expiresIn: 3600 });

        details.imageUrl = url     
        }    
        let spec = await Specs.findById(details.Specialization)
        
      
        res.json({details,spec:spec.Specialization})
    }catch(err){
        
        res.status(500).json(err)

    }
}

const confirmAppointment = (req,res)=>{
  
    try{
        console.log(process.env.RAZORPAY_KEYID,process.env.RAZORPAY_KEY_SECRET)
        var instance = new Razorpay({
            key_id: process.env.RAZORPAY_KEYID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
          });
          
    
          var options = {
            amount: '10000',  // amount in the smallest currency unit
            currency: "INR",
            receipt: crypto.randomBytes(10).toString('hex')
          };

          console.log(options,'instanceee')
    
          instance.orders.create(options, (err, order) =>    {
            if(err){
                console.log(err,"errrororrrr")
              return  res.status(500).json(err)
            }
            console.log("no erroorrrr")
            res.status(200).json(order)

           
          }); 
    }catch(err){
        console.log(err)
        res.json(err)
    } 


}

const verifyPayment = (req,res)=>{
    console.log(req.body)
    try{
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        } = req.body
        const sign = razorpay_order_id + "|" + razorpay_payment_id
        const expectedSign = crypto
        .createHmac('sha256',process.env.RAZORPAY_KEY_SECRET)
        .update(sign.toString())
        .digest('hex');

        console.log(razorpay_signature,  expectedSign)
        if(razorpay_signature === expectedSign){
            return res.status(200).json({message:"transaction success"})
        }else{
            console.log("payment failed")
            return res.status(400).json({message:"invalid signaure"})
        }
    }catch(err){
        console.log(err)
    }
}

const bookSession = async(req,res)=>{

    const newSession = new Sessions({
        userId : req.body.user._id,
        counselorId : req.body.counselor._id,
        time : req.body.time,
        date : req.body.date,
        plan : req.body.plan.name,
        patientName : req.body.patientDetails.patientName,
        patientMobile : req.body.patientDetails.patientMobile
    })

    const counselorObj = {
        counselorId :newSession.counselorId,
        sessionConducted:false
    }

    const slotData = {
        date: newSession.date,
        time: newSession.time
    }

    const counselor = await Counselor.findByIdAndUpdate(newSession.counselorId,{
        $addToSet:{bookedSlots:slotData}
    })
    
    const update = await User.findByIdAndUpdate(req.body.user._id,{
      
            $addToSet:{counselor:counselorObj}
 
    })
    

    const session = await newSession.save()
    res.status(200).json(session)

}

const getCounselorForChat = async(req,res)=>{
    const {id} = req.params
    
    try{
        const data = await Counselor.findById(id)
        res.status(200).json(data)
    }catch(err){
        console.log(err)
        res.status(500).json(err)
    }
    
}

const getUserForChat = async(req,res)=>{
    const {id} = req.params
    
    try{
        const data = await User.findById(id)
        res.status(200).json(data)
    }catch(err){
        console.log(err)
        res.status(500).json(err)
    }
    
}

const onlineCounselors = async(req,res)=>{
    try{
        const {id} = req.params
        const user = await User.findById(id);
        const counselors = await Promise.all(
            user.counselor.map((counselor)=>{
                return Counselor.findById(counselor.counselorId)
            })
        )
    
        let counselorList = [];
        counselors.map((counselor)=>{
            const {_id,fullname} = counselor;
            counselorList.push({_id,fullname})
        })
        res.status(200).json(counselorList)
    }catch(err){
        res.status(500).json(err)
    }
}

const viewSession = async(req,res)=>{
    try{
        const {id} = req.params
        const sessions = await Sessions.find({userId:id})
        
      
           const mySessions = await Promise.all(
            sessions.map(async(element)=>{
                const data = await Counselor.findById(element.counselorId)
                
                const {_doc:newElement} = element
                const today = new Date()
                const bookedDate = new Date(newElement.date)
                 newElement.counselorName=data?.fullname
              
                 if(today > bookedDate){
                   
                    await Sessions.findByIdAndUpdate(newElement._id,{
                        $set:{status:"not attended"}
                    })
                 }
                 return newElement
             })
           ) 
            
            res.status(200).json(mySessions)
    }catch(err){
       console.log(err)
       res.status(500).json(err)
    }   
}

const cancelSession = async(req,res)=>{
    const {id} = req.params
    
    try {
        await Sessions.findByIdAndUpdate(id,{
            $set:{status:"cancelled"}
        })
        res.status(200).json({updated:true})
    } catch (error) {
        res.status(500).json(error)
    }
}

const searchCounselor = async(req,res)=>{
    const searchedValues = JSON.parse(req.headers['searchedfilters'])
    const {counselorSearch,dateSearch} = searchedValues
    if(counselorSearch){
        if(dateSearch){
            const counselor = await Counselor.find({fullname:counselorSearch})
       
            const counselorData = await Counselor.find({fullname:counselorSearch,
                leaveDate: { $not: { $elemMatch: { leaveDate: dateSearch } } }
              });
              if(counselorData.length == 0) return res.json({status:"No slots available"})
              
              res.status(200).json(counselorData)
        }else{
            const counselorData = await Counselor.find({fullname:counselorSearch})
            res.status(200).json(counselorData)
        }
    }else{
        const counselorData = await Counselor.find({
            leaveDate: { $not: { $elemMatch: { leaveDate: dateSearch } } }
          });
          console.log(counselorData)
        res.status(200).json(counselorData)
    }
    
}

module.exports = {
    getSpecs, getAllCounselors, getCounselorLists, getCounselorData, confirmAppointment, verifyPayment, bookSession, getCounselorForChat, 
    getUserForChat, onlineCounselors, viewSession, cancelSession, searchCounselor
}