const express = require('express')
const multer = require('multer')
const User = require('../models/user')
const auth = require('../middleware/auth')
const sharp = require('sharp')
const router = new express.Router()

router.post('/users' , async (req,res) => {
  const user = new User(req.body)

  try {
    await user.save()
    const token = await user.generateAuthToken()
    res.status(201).send({user, token})
  }
  catch (e) {
    res.status(400).send(e)
  }
})

router.get('/users/me', auth, async (req,res) =>{
  res.send(req.user)
})

router.post('/users/login', async (req,res) => {
  try {
    const user = await User.findByCredentials(req.body.email, req.body.password)
    
    const token = await user.generateAuthToken()
    
    res.send({ user: user, token })

  } catch (e) {
    res.status(400).send()
  }
})


router.post('/users/logout', auth, async (req,res) => {
  try {
    req.user.tokens = req.user.tokens.filter((token) => {
      return token.token !== req.token
    })
    await req.user.save()

    res.send()
  } catch (e) {
    res.status(500).send()
  }
})

router.post('/users/logoutAll', auth, async (req,res) => {
  try {
    req.user.tokens = []
    await req.user.save()
    res.send()

  } catch (e) {
    res.status(500).send()
  }
})

router.delete('/users/me', auth, async (req, res) => {
  try {
      await req.user.remove()
      res.send(req.user)
  } catch (e) {
      res.status(500).send()
  }
})

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


router.post('/users/me/avatar', auth, upload.single('avatar'), async (req,res) => {
  
  const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250}).png().toBuffer()
 
  var vals = (new Buffer(buffer)).toString('base64')
  req.user.avatar = vals
  await req.user.save()
  res.send(vals);
}, (error, req, res, next) => {
  res.status(400).send({error: error.message})
})


router.post('/users/about', auth, async(req,res) => {
  try{
    req.user.about = req.body.about
    await req.user.save()
    res.send('ok').status(200)
  }
  catch(e){
    res.send(e).status(400)
  }
})

router.put('/users/follow', auth, async (req,res) => {
  try{
    await User.findByIdAndUpdate(req.user._id, {$push: {following: req.body.followId}})
    res.send('updated').status(200)
  }

  catch(e) {
    res.status(400).send(e)
  }
})

router.put('/users/unfollow', auth, async (req,res) => {
  try{
    await User.findByIdAndUpdate(req.user._id, {$pull: {following: req.body.unfollowId}})
    res.send('Unfollowed').status(200)
  }
  catch(e){
    res.send(e).status(400)
  }
})

router.get('/users/:Id',auth, async (req,res) => {
  try {
    const result = await User.findById(req.params.Id).populate('following', '_id name').exec()
    res.send(result).status(200)
  }
  catch(e) {
    res.send(e).status(400)
  }
})


router.put('/users/addfollower', auth, async (req,res) => {
  try {
    const result = await User.findByIdAndUpdate(req.body.followId, {$push: {followers: req.user._id}}, {new: true})
    res.send(result).status(200)
  }
  catch (e) {
    res.send(e).status(e)
  }
})

router.put('/users/removefollower', auth, async (req,res) => {
  try {
    const result = await User.findByIdAndUpdate(req.body.unfollowId, {$pull: {followers: req.user._id}}, {new: true})
    res.send(result).status(200)
  }
  catch (e) {
    res.send(e).status(e)
  }
})

router.delete('/users/me', auth, async (req, res) => {
  try {
      await req.user.remove()
      res.send('removed').status(200)
  } catch (e) {
      res.status(500).send()
  }
})

router.get('/users', auth, async (req,res) => {
  try {
    const result = await User.find()
    res.send(result).status(200)
  }
  catch(e) {
    res.send(e).status(500)
  }
})

module.exports = router
