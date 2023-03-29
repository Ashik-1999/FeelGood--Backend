const jwt = require('jsonwebtoken')
require('dotenv').config()

const verifyJWT = (req, res, next) =>{
    
    const authHeader = req.headers.authorization || req.headers.Authorization
    if(!authHeader?.startsWith('Bearer')) {
        console.log(authHeader,"headerrrrrrr")
        console.log("not bearer")
        return res.sendStatus(401).json({ message: 'Unauthorized' });
    }
    const token = authHeader.split(' ')[1]
    jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET,
        (err,decoded) => {
            if(err) return res.sendStatus(403).json({message:"forbidden"})
            req.user = decoded.user.fullname
            next()
        }
    )
}
 
module.exports = verifyJWT