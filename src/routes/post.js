const express = require('express')
const User = require('../models/user');
const multer = require('multer');
const auth = require('../middleware/auth');
const Post = require('../models/post');
const sharp = require('sharp');
const router = new express.Router()
const path = require('path')



 var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'images/')
  },
  fileFilter(req,file,cb) {
    console.log("IMAGE-" + Date.now() + path.extname(file.originalname))
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new Error('Please upload a image'))
    }
    cb(undefined,true)
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname))
  }
})

var upload = multer({ storage: storage, limits:{fileSize: 1000000} })

router.post('/uploadphoto', auth, upload.single('photo'), (req,res) => {
  console.log(req)
  res.send(req.file.path).status(200)
 }, (error, req, res, next) => {
  res.status(400).send({error: error.message})
})

router.post('/post',auth, async (req,res) => {
  try {
    const post = new Post();
    post.text = req.body.text;
    post.postedBy = req.user._id;
    post.photo = req.body.photo;
    await post.save()
    res.send('Uploaded').status(201)
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