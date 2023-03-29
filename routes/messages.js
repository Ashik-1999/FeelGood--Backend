const router = require("express").Router();
const Messages = require('../Models/User Scema/Messages')

router.post('/',async(req,res)=>{
    const newMessage = new Messages(req.body)

    try{
        const savedMessage = await newMessage.save()
        res.status(200).json(savedMessage)
    }catch(err){
        console.log(err)
        res.status(500).json(err)
    }
})



router.get('/:conversationId',async(req,res)=>{
    const {conversationId} = req.params

    try{
        const messages = await Messages.find({
            conversationId:req.params.conversationId
        })
        console.log(messages)
        res.status(200).json(messages)

    }catch(err){
        console.log(err)
        res.status(500).json(err)
    }
})

module.exports = router  