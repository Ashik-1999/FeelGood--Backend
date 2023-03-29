const router = require("express").Router();
const { S3Client, PutObjectCommand,GetObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const crypto = require('crypto')
const dotenv = require('dotenv');
const verifyJWT = require("../Middlewares/verifyJWT");
const { getSpecs, getAllCounselors, getCounselorLists, getCounselorData, confirmAppointment, verifyPayment, bookSession,
        getCounselorForChat, getUserForChat, onlineCounselors, viewSession, cancelSession, searchCounselor } = require("../controllers/userController");
dotenv.config()


const s3 = new S3Client({
    credentials : {
        accessKeyId: process.env.BUCKET_ACCESS_KEY,
        secretAccessKey: process.env.BUCKET_SECRET_ACCESS_KEY 
    },    
    region: process.env.BUCKET_REGION,
})
const randomImageName = (bytes = 32) => crypto.randomBytes(bytes).toString('hex')




router.get('/getSpecs',getSpecs)


router.get('/get-counselors',getAllCounselors)


router.get('/counselor-list',getCounselorLists)


router.get('/get-counselor-details/:id',getCounselorData)


router.post('/confirm-appointment',confirmAppointment)


router.post('/verify-payment',verifyPayment)


router.post('/book-session',bookSession)


router.get('/getCounselor/:id',getCounselorForChat)


router.get('/getUser/:id',getUserForChat)


router.get('/online-counselors/:id',onlineCounselors)


router.get('/view-sessions/:id', verifyJWT , viewSession)


router.delete('/cancel-session/:id',cancelSession)


router.get('/searchCounselor',searchCounselor)




module.exports = router 