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
app.use(homeRoute);
app.use(problemRoute);
app.use(submissionRoute);
app.use(function(req,res,next){
    res.locals.currentUser = req.user;
    next();
})

app.get("/auth",IsLoggedIn,function(req,res){
	res.render('auth');
})

app.get("/register",function(req,res){
	res.render("register");
})

app.post("/register",function(req,res){
    var username=req.body.username,role=req.body.role,key=username+"__$$__"+role,handle=req.body.handle;
	User.register(new User({username:username,role:role,key:key,handle:handle}),req.body.password, function(err,user){
		if(err) res.render('register');
		passport.authenticate("local")(req,res,function(){
			res.redirect('/auth');
		})
	})
})

app.get("/login",function(req,res){
	res.render("login");
})

app.post("/login",IsUser,passport.authenticate("local",{
	successRedirect:"/auth",
	failureRedirect:"/login"
}),function(req,res){});

app.get("/logout",function(req,res){
	req.logout();
	res.redirect("/");
})

app.get('/tmp/user',IsLoggedIn,is_user,function(req,res){
    res.send('hi user');
})

app.get('/tmp/author',IsLoggedIn,is_author,function(req,res){
    res.send('hi author');
})

app.get('/tmp/admin',IsLoggedIn,is_admin,function(req,res){
    res.send('hi admin');
})

function IsLoggedIn(req,res,next){
	if(req.isAuthenticated()) return next();
	res.redirect("/login");
}

function IsUser(req,res,next){
    var key=req.body.username+"__$$__"+req.body.role;
    User.findOne({key:key},function(err,ret){
        if(ret) return next();
        res.redirect('/login');
    })
}

function is_user(req,res,next){
    if(req.user.role==='user') return next();
    res.send('you are not allowed to view this page');
}

function is_author(req,res,next){
    if(req.user.role==='author') return next();
    else res.send('you are not allowed to view this page');
}

function is_admin(req,res,next){
    if(req.user.role==='admin') return next();
    else res.send('you are not allowed to view this page');
}

app.listen(port,function(){
    console.log('ok');
})