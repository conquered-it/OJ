var express=require('express');
var router=express.Router();
var problems = require('../models/problems');
var submissions = require('../models/submissions');
var jsdom = require('jsdom');
const { JSDOM } = jsdom;
const { window } = new JSDOM();
const { document } = (new JSDOM('')).window;
global.document = document;
var $ = jQuery = require('jquery')(window);
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
        else res.redirect('/problems/'+ret._id+'/edit');
    })
})

router.post('/problems/:id/checker',IsLoggedIn,is_author,function(req,res){
    problems.findById(req.params.id,function(err,ret){
        ret.checker=req.body.checker;
        ret.lang=req.body.lang;
        ret.save();
    })
    res.redirect('/problems/'+req.params.id+'/edit');
})

router.get('/problems/:id',function(req,res){
    problems.findById(req.params.id,function(err,ret){
        res.render('submit',{problem:ret});
    })
})

router.get('/problems/:id/submissions',function(req,res){
    problems.findById(req.params.id,function(err,ret){
        res.render('problem_submissions',{problem:ret});
    })
})

router.post('/problems/:id',IsLoggedIn,is_user,function(req,res){
    problems.findById(req.params.id,function(err,ret){
        var ok=true,counter=0;
        function callback(ok,ret){
            submissions.create({
                problem_id:ret._id,
                problem_name:ret.title,
                content:req.body.code,
                verdict:(ok?"accepted":"wrong answer")
            },function(err,sub){
                ret.submissions.push({id:sub._id,verdict:sub.verdict});
                ret.save();
                res.redirect('/submissions/'+sub._id);
            })
        }
        ret.io.forEach(function(x,index){
            setTimeout(function(){
                var to_compile = {
                    "LanguageChoice": req.body.lang,
                    "Program": req.body.code,
                    "Input": x.input,
                    "CompilerArgs" : "-o a.out source_file.cpp"
                };
                $.ajax ({
                    url: "https://rextester.com/rundotnet/api",
                    type: "POST",
                    data: to_compile
                }).done(function(data) {
                    if(x.output===data.Result);
                    else ok=false;
                    ++counter;
                    if(counter==ret.io.length) callback(ok,ret);
                });
            },1500*index);
        })
    })
});

router.get('/problems/:id/edit',IsLoggedIn,is_author,function(req,res){
    problems.findById(req.params.id,function(err,ret){
        if(err) console.log('err'),res.send({});
        else res.render('details',{arr:ret});
    })
})

router.post('/problems/:id/tests',IsLoggedIn,is_author,function(req,res){
    problems.findById(req.params.id,function(err,ret){
        var to_compile = {
            "LanguageChoice": ret.lang,
            "Program": ret.checker,
            "Input": req.body.input,
            "CompilerArgs" : "-o a.out source_file.cpp"
        };
        $.ajax ({
            url: "https://rextester.com/rundotnet/api",
            type: "POST",
            data: to_compile
        }).done(function(data) {
            ret.io.push({input:req.body.input,output:data.Result});
            ret.save(function(err,fin){
                if(err) console.log('err');
            })
        });
    })
    res.redirect('/problems/'+req.params.id+'/edit');
})

router.post('/problems/:id/tests2',IsLoggedIn,is_author,function(req,res){
    var to_compile = {
        "LanguageChoice": req.body.lang,
        "Program": req.body.code,
        "Input": req.body.input,
        "CompilerArgs" : "-o a.out source_file.cpp"
    };
    $.ajax ({
        url: "https://rextester.com/rundotnet/api",
        type: "POST",
        data: to_compile
    }).done(function(data){
        res.render('confirm',{data:data,id:req.params.id});
    });
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