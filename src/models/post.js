const mongoose = require('../db/mongoose')


const PostSchema = new mongoose.Schema({
  text: {
    type: String,
    required: 'Name is required'
  },
  photo: {
    type: String,
  },
  likes: [{type: mongoose.Schema.ObjectId, ref: 'User'}],
  comments: [{
    text: String,
    created: {type: Date, default: Date.now},
    postedBy: { type: mongoose.Schema.ObjectId, ref: 'User'}
  }],
  postedBy: {type: mongoose.Schema.ObjectId, ref: 'User'},
  created: {
    type: Date,
    default: Date.now
  }
})

const Post = mongoose.model('Post', PostSchema)

module.exports = Post