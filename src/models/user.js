const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')


const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    unique: 'Email Already Exists',
    required: true,
    match: [/.+\@.+\..+/, 'Please fill a valid email address'],
    trim: true,
    lowercase: true,
    validate(value){
      if(!validator.isEmail(value)){
        throw new Error('Email is invalid')
      }
    }
  },
  password: {
    type: String,
    required: true,
    minlength: 7,
    trim: true,
    validate(value) {
      if(value.toLowerCase().includes('password')) {
        throw new Error('Password can not be password')
      }
    }
  },
  age: {
    type: Number,
    default: 0,
    validate(value) {
      if(value<0) {
        throw new Error('Age must be positive number')
      }
    }
  },
  tokens: [{
    token: {
      type: String,
      required: true
    }
  }],
  avatar: {
    type: Buffer
  },
  updated: Date,
  created: {
    type: Date,
    default: Date.now
  },
  about: {
    type: String,
    trim: true
  },
  following: [{type: mongoose.Schema.ObjectId, ref: 'User'}],
  followers: [{type: mongoose.Schema.ObjectId, ref: 'User'}]

}, {
  timestamps: true
})

userSchema.methods.generateAuthToken = async function () {
  console.log('in generate authtoken')
  const user = this
  const secretkey = "pj-social"
  const token = jwt.sign({ _id: user._id.toString() },secretkey)
  user.tokens = user.tokens.concat({token})
  await user.save();
  return token
}

userSchema.statics.findByCredentials = async (email, password) => {
  const user = await User.findOne({email})

  if(!user) {
    throw new Error('Unable to login')
  }

  const isMatch = await bcrypt.compare(password, user.password)

  if(!isMatch) {
    throw new Error('Unable to login')
  }
  return user
}


userSchema.pre('save', async function(next) {
  const user = this

  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 8)
  }
  next()
})

const User = mongoose.model('User',userSchema)

module.exports = User