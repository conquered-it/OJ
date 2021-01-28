var express = require("express"),
app = express(),
bodyParser = require("body-parser"),
mongoose = require("mongoose"),
port = process.env.PORT || 3000;
mongoose.set('useNewUrlParser', true);
mongoose.connect("mongodb://localhost/oj",{ useUnifiedTopology: true });
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.set("view engine","ejs");
app.use(express.static(__dirname + '/public'))
app.use(express.static('views'));
var homeRoute = require('./routes/home');
var problemRoute = require('./routes/problems');
var submissionRoute = require('./routes/submissions');
app.use(homeRoute);
app.use(problemRoute);
app.use(submissionRoute);
app.listen(port,function(){
    console.log('ok');
})