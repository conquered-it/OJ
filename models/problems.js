var mongoose=require('mongoose');
var problemSchema = new mongoose.Schema({
    title:String,statement:String,checker:String,lang:String,
    io:[{input:String,output:String}],
    submissions:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"submissions"
        }
    ],
    author:String,
    access:String,
    access_list:[String],
    difficulty:Number,
    tags:[String]
})
module.exports=mongoose.model('problems',problemSchema);