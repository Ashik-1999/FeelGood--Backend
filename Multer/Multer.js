const multer = require('multer')


// handle storage using multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './Spec-Image')
    },
    filename: (req, file, cb) => {
        cb(null,  Date.now() + '-' + file.originalname  )
    }
});
 const upload = multer({ storage: storage });


 const storage2 = multer.memoryStorage();
 const upload2 = multer({ storage: storage2 });

 module.exports= {
    upload,
    upload2 
};