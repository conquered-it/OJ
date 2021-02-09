var mongoose=require('mongoose');
// var problems=require('../models/problems');
var contestSchema = new mongoose.Schema({
    id:String,
    problems:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"problems"
        }
    ]
})
module.exports=mongoose.model('contests',contestSchema);