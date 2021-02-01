var express=require('express'),
router=express.Router(),
User = require("../models/user"),
passport = require("passport");

router.get("/auth",IsLoggedIn,function(req,res){
	res.render('auth');
})

router.get("/register",function(req,res){
	res.render("register");
})

router.post("/register",function(req,res){
    var username=req.body.username,role=req.body.role,key=username+"__$$__"+role,handle=req.body.handle,handle_key=handle+"__$$__"+role;
    User.findOne({handle_key:handle_key},function(err,ret){
        if(ret) return res.redirect('/register');
        else{
            User.register(new User({username:username,role:role,key:key,handle:handle,handle_key:handle_key}),req.body.password, function(err,user){
                if(err) res.render('register');
                passport.authenticate("local")(req,res,function(){
                    res.redirect('/auth');
                })
            })
        }
    })
})

router.get("/login",function(req,res){
	res.render("login");
})

router.post("/login",IsUser,passport.authenticate("local",{
	successRedirect:"/auth",
	failureRedirect:"/login"
}),function(req,res){});

router.get("/logout",function(req,res){
	req.logout();
	res.redirect("/");
})

router.get('/tmp/user',IsLoggedIn,is_user,function(req,res){
    res.send('hi user');
})

router.get('/tmp/author',IsLoggedIn,is_author,function(req,res){
    res.send('hi author');
})

router.get('/tmp/admin',IsLoggedIn,is_admin,function(req,res){
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

module.exports=router;