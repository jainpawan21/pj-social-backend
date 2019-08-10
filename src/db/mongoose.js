const mongoose =  require('mongoose');

mongoose.connect('mongodb://127.0.0.1:27017/pj-social',{useNewUrlParser: true, useCreateIndex: true }, (error, result) => {
   if(!error){
     console.log('Connected to mongodb')
   }
   else {
     console.log('error' + error)
   }
})

module.exports = mongoose;