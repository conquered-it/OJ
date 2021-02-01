var express=require('express');
var router=express.Router();
// var Users = require('../models/user');
var problems = require('../models/problems');
var contests = require('../models/contests');

router.get('/contests',function(req,res){
    contests.find({},function(err,ret){
        res.render('contests',{contests:ret});
    })
})

router.get('/contests/new',function(req,res){
    res.render('new_contest');
})

router.get('/contests/:id',function(req,res){
    problems.find({contest_id:req.params.id},function(err,ret){
        res.render('contests_problems',{problems:ret,id:req.params.id});
    })
})


router.post('/contests',function(req,res){
    contests.create({id:req.body.id},function(err,ret){
        console.log(ret);
        res.redirect('/contests/'+ret._id);
    })
})

router.get('/contests/:id/add',function(req,res){
    res.render('contest_add',{id:req.params.id});
})

router.post('/contests/:id',function(req,res){
    var title=req.body.title,statement=req.body.statement,id=req.params.id;
    problems.create({title:title,statement:statement,contest_id:id},function(err,ret){
        console.log(ret);
        res.redirect('/problems/'+ret._id+'/edit');
    });
})

module.exports=router;