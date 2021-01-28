var mongoose=require('mongoose');
var problemSchema = new mongoose.Schema({
    title:String,statement:String,checker:String,lang:String,
    io:[{input:String,output:String}],
    submissions:[{id:String,verdict:String}]
})
module.exports=mongoose.model('problems',problemSchema);