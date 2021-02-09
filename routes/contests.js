var express=require('express');
var router=express.Router();
// var Users = require('../models/user');
var problems = require('../models/problems');
var contests = require('../models/contests');
// var {contests,problems} = require('../models/problems');
router.get('/contests',function(req,res){
    contests.find({},function(err,ret){
        res.render('contests',{contests:ret});
    })
})

router.get('/contests/new',function(req,res){
    res.render('new_contest');
})

router.get('/contests/:id',function(req,res){
    contests.findById(req.params.id,function(err,ret){
        res.render('contests_problems',{id:req.params.id,problems:ret.problems});
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
    problems.create({title:title,statement:statement},function(err,ret){
        ret.access_list.push(req.user.id);
        ret.save(function(err,ret){
            contests.findById(req.params.id,function(err,contest){
                contest.problems.push(ret);
                contest.save();
            })
            res.redirect('/problems/'+ret._id+'/edit');
        });
    });
})

module.exports=router;