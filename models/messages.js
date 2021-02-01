var mongoose=require('mongoose');
var messageSchema = new mongoose.Schema({
    sender:String,
    receiver_id:String,
    text:String,
})
module.exports=mongoose.model('messages',messageSchema);