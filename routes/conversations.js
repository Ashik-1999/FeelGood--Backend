const router = require("express").Router();
const Conversations = require('../Models/User Scema/Conversations')

router.post('/', async(req,res)=>{
        console.log(req.body,"bodyyyy")
    const newConversation = new Conversations({
        members:[req.body.userId,req.body.counselorId]
    })

    try{
        const savedConversation = await newConversation.save()
        res.status(200).json(savedConversation)
    }catch(err){
        console.log(err)
        res.status(500).json(err)
    }
})

router.get('/:userId',async(req,res)=>{
    console.log(req.params.userId,"issss")
    try{
        const conversation = await Conversations.find({
            members:{$in : [req.params.userId]}
        })
        res.status(200).json(conversation)

    }catch(err){
        res.status(500).json(err)
    }
})


 

module.exports = router