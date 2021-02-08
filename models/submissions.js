var mongoose=require('mongoose');
var submissionSchema = new mongoose.Schema({
    problem_id:String,problem_name:String,content:String,verdict:String,user:String
})
module.exports=mongoose.model('submissions',submissionSchema);
