var express = require("express"),
app = express(),
bodyParser = require("body-parser"),
mongoose = require("mongoose"),
passport = require("passport"),
passportLocal = require("passport-local"),
passportLocalMongoose = require("passport-local-mongoose"),
User = require("./models/user"),
port = process.env.PORT || 3000;
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.connect("mongodb://localhost/oj",{ useUnifiedTopology: true });
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.set("view engine","ejs");
app.use(express.static(__dirname + '/public'))
app.use(express.static('views'));
app.use(require("express-session")({
	secret: "c0nQuEr0r",
	resave: false,
	saveUninitialized: false 
}));
app.use(passport.initialize());
app.use(passport.session());

passport.use(new passportLocal(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
var homeRoute = require('./routes/home');
var problemRoute = require('./routes/problems');
var submissionRoute = require('./routes/submissions');
var authorizationRoute = require('./routes/authorization');
app.use(homeRoute);
app.use(problemRoute);
app.use(submissionRoute);
app.use(function(req,res,next){
    res.locals.currentUser = req.user;
    next();
})
app.use(authorizationRoute);

app.listen(port,function(){
    console.log('ok');
})