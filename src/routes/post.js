const express = require('express')
const User = require('../models/user');
const multer = require('multer');
const auth = require('../middleware/auth');
const Post = require('../models/post');
const sharp = require('sharp');
const router = new express.Router()


const upload = multer({
  limits: {
    fileSize: 1000000
  },
  fileFilter(req,file,cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new Error('Please upload a image'))
    }
    cb(undefined,true)
  }
})
router.post('/post',auth, upload.single('photo'), async (req,res) => {
  try {
    const post = new Post();
    post.text = req.body.text;
    post.postedBy = req.user._id;
    if(req.file !== undefined){
      const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250}).png().toBuffer()
      var vals = (new Buffer(buffer)).toString('base64')
      post.photo = vals
    }
    await post.save()
    res.send(post).status(201)
  }
  catch(e) {
    res.send(e).status(400)
  }
})



router.get('/post/:Id', auth, async (req,res) => {
  try{
    const result = await Post.find({postedBy: req.params.Id})
        .populate('comments', 'text created')
        .populate('comments.postedBy', '_id name')
        .populate('postedBy', '_id name')
        .sort('-created')
        .exec()

    req.send(result).status(200);
  }
  catch(e) {
    res.send(e).status(500)
  }
})

router.get('/posts', auth, async (req,res) => {
  try{
    let following = req.user.following
    following.push(req.user._id)
    const result =  await Post.find({postedBy: { $in : following } })
    .populate('comments', 'text created')
    .populate('comments.postedBy', '_id name')
    .populate('postedBy', '_id name')
    .sort('-created')
    .exec()

    res.send(result).status(200)
  }
  catch(e){
    res.send(e).status(400)
  }

})

router.delete('/post/:Id', auth, async (req, res) => {
  try{
    let post = Post.findById(req.params.Id)
    await post.remove()
    res.status(202).send('deleted')
  }
  catch (e) {
    res.send(e).status(400)
  }
})

router.post('/post/:Id/like', auth, async (req,res) => {
  try{
  await Post.findByIdAndUpdate(req.params.Id, {$push: {likes: req.user._id}}, {new: true}).exec()
  res.send('Liked').status(200)
  }
  catch(e){
    res.send(e).status(400)
  }
})

router.post('/post:Id/unlike', auth, async (req,res) => {
  try{
    await Post.findByIdAndUpdate(req.params.Id, {$pull: {likes: req.user._id}}, {new: true}).exec()
    res.send('Unliked').status(200)
  }
  catch(e) {
    res.send(e).status(400)
  }
})

router.post('/post:Id/comment', auth, async (req,res) => {
  try {
    let comment = req.body.comment
    comment.postedBy = req.user._id
    const result = await Post.findByIdAndUpdate(req.params.Id, {$push: {comments: comment}}, {new: true})
    .populate('comments.postedBy', '_id name')
    .populate('postedBy', '_id name')
    .exec()
    res.send(result).status(200)
  }
  catch(e) {
    res.send(e).status(400)
  }
})

router.post('/post:Id/uncomment', auth, async (req,res) => {
  try {
    let comment = req.body.comment
    const result = await Post.findByIdAndUpdate(req.params.Id, {$pull: {comments: comment}}, {new: true})
    .populate('comments.postedBy', '_id name')
    .populate('postedBy', '_id name')
    .exec()
    res.send(result).status(200)
  }
  catch(e) {
    res.send(e).status(400)
  }
})

module.exports = router;