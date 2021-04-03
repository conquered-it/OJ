var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var UserSchema = new mongoose.Schema({
	username:String,
    password:String,
    phone:String,
    role:String,
    key:String,
    handle:String,
    handle_key:String
});

UserSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model("User",UserSchema);
