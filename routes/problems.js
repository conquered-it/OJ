var express=require('express');
var router=express.Router();
var problems = require('../models/problems');
var submissions = require('../models/submissions');
var User = require('../models/user');
var jsdom = require('jsdom');
const { JSDOM } = jsdom;
const { window } = new JSDOM();
const { document } = (new JSDOM('')).window;
global.document = document;
var $ = jQuery = require('jquery')(window);

var queue=[];

router.get('/problems',function(req,res){
    problems.find({},function(err,problems){
        if(err) console.log(err),res.send({});
        else res.render('problems',{problems:problems})
    })
})

router.get('/problems/new',IsLoggedIn,is_author,function(req,res){
    res.render('new_problems');
})

router.post('/problems',IsLoggedIn,is_author,function(req,res){
    problems.create(req.body.problems,function(err,ret){
        if(err) console.log('err');
        else{
            ret.access_list.push(req.user._id);
            ret.save();
            res.redirect('/problems/'+ret._id+'/edit');
        }
    })
})

router.post('/problems/:id/checker',IsLoggedIn,is_author,function(req,res){
    problems.findById(req.params.id,function(err,ret){
        if(!ret.access_list.includes(req.user._id)) res.send('not allowed');
        else{
            ret.checker=req.body.checker;
            ret.lang=req.body.lang;
            ret.save();
        }
    })
    res.redirect('/problems/'+req.params.id+'/edit');
})

router.get('/problems/:id',function(req,res){
    problems.findById(req.params.id,function(err,ret){
        res.render('submit',{User:req.user,problem:ret});
    })
})

router.get('/problems/:id/submissions',function(req,res){
    problems.findById(req.params.id,function(err,ret){
        res.render('problem_submissions',{submissions:ret.submissions});
    })
})

function dequeue(){
    return new Promise((resolve,reject)=>{
        setTimeout(()=>{
            var sub=queue.shift();
            problems.findById(sub.problem_id,function(err,ret){
                var ok=1,counter=0;
                function callback(ok,ret){
                    var verdict="";
                    if(ok==0) verdict="Wrong Answer";
                    else if(ok==1) verdict="Accepted";
                    else if(ok==2) verdict="Compilation Error";
                    else verdict="Time Limit Exceeded";
                    submissions.findByIdAndUpdate(sub._id,{verdict:verdict},function(err,nw){})   
                }
                ret.io.forEach(function(x,index){
                    var to_compile = {
                        "source_code": sub.content,
                        "language": sub.language,
                        "input": x.input,
                        "api_key" : "guest"
                    };
                    $.ajax ({
                        url: "http://api.paiza.io:80/runners/create",
                        type: "POST",
                        data: to_compile,
                    }).done(function(data){
                        function temp(){
                            $.ajax({
                                url:"http://api.paiza.io:80/runners/get_details?id="+data.id+"&api_key=guest",
                                type:"GET"
                            }).done(function(data){
                                if(data.result === "timeout" || data.status === "running") ok=3;
                                else if(data.build_stderr || data.stderr) ok=2;
                                else if(x.output===data.stdout);
                                else ok=0;
                                ++counter;
                                if(counter==ret.io.length) callback(ok,ret);
                            })
                        }
                        setTimeout(temp,2000);
                    });
                })
            })
            resolve();
        },2000)   
    })
}

async function enqueue(element){
    queue.push(element);
    if(queue.length>1) return;
    while(queue.length!=0){
        await dequeue();
    }
}

router.post('/problems/:id',IsLoggedIn,is_user,function(req,res){
    problems.findById(req.params.id,function(err,ret){
        submissions.create({
            problem_id:ret._id,
            problem_name:ret.title,
            content:req.body.code,
            language:req.body.lang,
            verdict:"Queued...(Reload the page to check updates)",
            user:req.user.handle
        },function(err,sub){
            ret.submissions.push(sub);
            ret.save();
            enqueue(sub);
            res.redirect('/submissions/'+sub._id);
        })
    })
});

router.get('/problems/:id/edit',IsLoggedIn,is_author,function(req,res){
    problems.findById(req.params.id,function(err,ret){
        if(!ret.access_list.includes(req.user._id)) res.send('not allowed');
        else res.render('details',{arr:ret});
    })
})

router.post('/problems/:id/edit',IsLoggedIn,is_author,function(req,res){
    problems.findById(req.params.id,function(err,ret){
        if(!ret.access_list.includes(req.user._id)) res.send('not allowed');
        else{
            User.findOne({handle_key:req.body.name+'__$$__author'},function(err,user){
                if(!user) res.send('No such author found');
                else{
                    ret.access_list.push(user._id);
                    ret.save();
                    res.redirect('/problems/'+req.params.id+'/edit');
                }
            })
        }
    })
})

router.post('/problems/:id/tests',IsLoggedIn,is_author,function(req,res){
    problems.findById(req.params.id,function(err,ret){
        var to_compile = {
            "source_code": ret.checker,
            "language": ret.lang,
            "input": req.body.input,
            "api_key" : "guest"
        };
        $.ajax ({
            url: "http://api.paiza.io:80/runners/create",
            type: "POST",
            data: to_compile,
        }).done(function(data) {
            function temp(){
                $.ajax({
                    url:"http://api.paiza.io:80/runners/get_details?id="+data.id+"&api_key=guest",
                    type:"GET"
                }).done(function(data){
                    ret.io.push({input:req.body.input,output:data.stdout});
                    ret.save(function(err,fin){
                        if(err) console.log('err');
                    })
                })
            }
            setTimeout(temp,2000);
        })
    })
    res.redirect('/problems/'+req.params.id+'/edit');
})

router.post('/problems/:id/tests2',IsLoggedIn,is_author,function(req,res){
    var to_compile = {
        "source_code": req.body.code,
        "language": req.body.lang,
        "input": req.body.input,
        "api_key" : "guest"
    };
    $.ajax ({
        url: "http://api.paiza.io:80/runners/create",
        type: "POST",
        data: to_compile,
    }).done(function(data){
        function temp(){
            $.ajax({
                url:"http://api.paiza.io:80/runners/get_details?id="+data.id+"&api_key=guest",
                type:"GET"
            }).done(function(data){ 
                res.render('confirm',{data:data,id:req.params.id});
            })
        }
        setTimeout(temp,2000);
    })
})

router.post('/problems/:id/difficulty',IsLoggedIn,is_author,function(req,res){
    problems.findById(req.params.id,function(err,ret){
        ret.difficulty=req.body.difficulty;
        ret.save();
    })
    res.redirect('/problems/'+req.params.id+'/edit');
})

router.post('/problems/:id/tags',IsLoggedIn,is_author,function(req,res){
    problems.findById(req.params.id,function(err,ret){
        ret.tags.push(req.body.tags);
        ret.save();
    })
    res.redirect('/problems/'+req.params.id+'/edit');
})

function IsLoggedIn(req,res,next){
	if(req.isAuthenticated()) return next();
	res.redirect("/login");
}

function is_user(req,res,next){
    if(req.user.role==='user') return next();
    res.send('you are not allowed to view this page');
}

function is_author(req,res,next){
    if(req.user.role==='author') return next();
    else res.send('you are not allowed to view this page');
}

module.exports=router;