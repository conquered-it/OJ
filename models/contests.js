var mongoose=require('mongoose');
var contestSchema = new mongoose.Schema({
    id:String
})
module.exports=mongoose.model('contests',contestSchema);