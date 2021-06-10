var express=require('express');
var router=express.Router();
var moment = require('moment');
// var Users = require('../models/user');
var problems = require('../models/problems');
var contests = require('../models/contests');
// var {contests,problems} = require('../models/problems');
router.get('/contests',function(req,res){
    contests.find({},function(err,ret){
        res.render('contests',{contests:ret,TIME:moment().format("Do MMMM YYYY, h:mm:ss")});
    })
})

router.get('/contests/new',function(req,res){
    res.render('new_contest');
})

router.get('/contests/:id',function(req,res){
    contests.findById(req.params.id,function(err,ret){
        res.render('contests_problems',{id:req.params.id,contest:ret,user:req.user,TIME:moment().format("Do MMMM YYYY, h:mm:ss")});
    })
})


router.post('/contests',is_author,function(req,res){
    contests.create({id:req.body.id,owner:req.user.username},function(err,ret){
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

router.post('/contests/:id/id',function(req,res){
    problems.findById(req.body.id,function(err,ret){
        contests.findById(req.params.id,function(err,contest){
            contest.problems.push(ret);
            contest.save((err,nw)=>{res.redirect('/contests/'+req.params.id);});
        })
    })
})

router.post('/contests/:id/time',function(req,res){
    var start=moment(req.body.start).diff(moment()),end=moment(req.body.end).diff(moment());   // <- tells time in milliseconds from now
    contests.findById(req.params.id,function(err,ret){
        ret.start=moment(req.body.start).format("Do MMMM YYYY, h:mm:ss");
        ret.end=moment(req.body.end).format("Do MMMM YYYY, h:mm:ss");
        ret.save();
    })
    setTimeout(()=>{
        contests.findById(req.params.id,function(err,ret){
            ret.access="all_users";
            ret.save((err,ret)=>{
                ret.problems.forEach(x => {
                    problems.findById(x,function(err,prob){
                        if(prob){
                            prob.access="all_users";
                            prob.save();
                        }
                    })
                });
            })
        })
    },start);
    setTimeout(()=>{},end);
    res.send({});
})

function is_author(req,res,next){
    if(req.user && req.user.role==='author') return next();
    else res.send('Login as Author to create contest');
}

module.exports=router;