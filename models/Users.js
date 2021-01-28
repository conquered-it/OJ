var mongoose=require('mongoose');
var UserSchema = new mongoose.Schema({
    email: {
     type: String,
     required: true,
     trim: true
    },
    password: {
     type: String,
     required: true
    },
    role: {
     type: String,
     default: 'user',
     enum: ["user", "author", "admin"]
    },
    accessToken: {
     type: String
    }
});
module.exports=mongoose.model('Users', UserSchema);