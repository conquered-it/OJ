var express=require('express');
var router=express.Router();
var Users = require('../models/user');
var messages = require('../models/messages');

router.get('/messages',IsLoggedIn,function(req,res){
    Users.find({_id:{$ne:req.user._id}},function(err,ret){
        res.render('messages_home',{users:ret});
    })
})

router.get('/messages/:id',IsLoggedIn,function(req,res){
    if(req.user._id==req.params.id){
        messages.find({receiver_id:req.params.id},function(err,ret){
            res.render('user_messages',{msgs:ret,currentUser:req.user});
        })
    }
    else res.redirect('/messages/'+req.user._id);
})

router.get('/messages/:id/send',IsLoggedIn,function(req,res){
    res.render('send',{id:req.params.id,sender:req.user.handle});
})

router.post('/messages/:id',IsLoggedIn,function(req,res){
    var text=req.body.text,receiver_id=req.params.id,sender=req.user.handle;
    if(receiver_id===req.user._id) res.redirect('/messages');
    else{
        messages.create({text:text,receiver_id:receiver_id,sender:sender},function(err,ret){
            res.redirect('/messages');
        })
    }
})

function IsLoggedIn(req,res,next){
	if(req.isAuthenticated()) return next();
	res.redirect("/login");
}

module.exports=router;