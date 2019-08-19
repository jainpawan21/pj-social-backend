const express = require('express');
const app = express();
const userRouter = require('./routes/user')
const postRouter = require('./routes/post')

require('./db/mongoose')

app.use(require('../utils/cors'));

app.use(express.json())
app.use(userRouter)
app.use(postRouter)
app.get('/push', (req,res) => {
  res.send('Hello')
})




app.listen(3001, () => {
  console.log('server is running on port 3001')
})

// const multer = require('multer')
// const upload = multer({
//   dest: 'images',
//   limits: {
//     fileSize: 1000000
//   },
//   fileFilter(req,file,cb) {
//     if (!file.originalname.match(/\.(doc|docx)$/)) {
//       return cb(new Error('Please upload a word document'))
//     }
//     // cb(new Error('File must be a PDF'))
//     cb(undefined,true)
//     // cb(undefined,false)
//   }
// })

// app.post('/upload', upload.single('upload'), (req,res)=>{
//   res.send()
// }, (error, req, res, next) => {
//   res.status(400).send({error: error.message})
// })