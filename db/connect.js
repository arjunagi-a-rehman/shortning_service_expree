const mongoose=require('mongoose');
function connectDb(url) {
  return mongoose.connect(url);
}
module.exports=connectDb;