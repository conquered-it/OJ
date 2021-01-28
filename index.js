var express = require("express"),
app = express(),
bodyParser = require("body-parser"),
request = require('request'),
fetch = require("node-fetch"),
mongoose = require("mongoose"),
port = process.env.PORT || 3000;
mongoose.set('useNewUrlParser', true);
mongoose.connect("mongodb://localhost/oj",{ useUnifiedTopology: true });
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.set("view engine","ejs");
app.use(express.static('views'));
var jsdom = require('jsdom');
const { JSDOM } = jsdom;
const { window } = new JSDOM();
const { document } = (new JSDOM('')).window;
global.document = document;
var $ = jQuery = require('jquery')(window);
var problemSchema = new mongoose.Schema({
    title:String,statement:String,checker:String,lang:String,
    io:[{input:String,output:String}],
    submissions:[{id:String,verdict:String}]
})

var submissionSchema = new mongoose.Schema({
    problem_id:String,problem_name:String,content:String,verdict:String
})

var problems = mongoose.model('problems',problemSchema);
var submissions = mongoose.model('submissions',submissionSchema);

app.get('/',function(req,res){
    res.render('home');
})

app.get('/ide',function(req,res){
    res.render('show');
})

app.get('/problems',function(req,res){
    problems.find({},function(err,problems){
        if(err) console.log(err),res.send({});
        else res.render('problems',{problems:problems})
    })
})

app.get('/problems/new',function(req,res){
    res.render('new_problems');
})

app.get('/submissions',function(req,res){
    submissions.find({},function(err,submissions){
        res.render('submissions',{submissions:submissions});
    })
})

app.get('/submissions/:id',function(req,res){
    submissions.findById(req.params.id,function(err,ret){
        res.render('this_submission',{sub:ret});
    })
})

app.post('/problems',function(req,res){
    problems.create(req.body.problems,function(err,ret){
        if(err) console.log('err');
        else res.redirect('/problems/'+ret._id+'/edit');
    })
})

app.post('/problems/:id/checker',function(req,res){
    problems.findById(req.params.id,function(err,ret){
        ret.checker=req.body.checker;
        ret.lang=req.body.lang;
        ret.save();
    })
    res.redirect('/problems/'+req.params.id+'/edit');
})

app.get('/problems/:id',function(req,res){
    problems.findById(req.params.id,function(err,ret){
        res.render('submit',{problem:ret});
    })
})

app.get('/problems/:id/submissions',function(req,res){
    problems.findById(req.params.id,function(err,ret){
        res.render('problem_submissions',{problem:ret});
    })
})

app.post('/problems/:id',function(req,res){
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

app.get('/problems/:id/edit',function(req,res){
    problems.findById(req.params.id,function(err,ret){
        if(err) console.log('err'),res.send({});
        else res.render('details',{arr:ret});
    })
})

app.post('/problems/:id/tests',function(req,res){
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

app.post('/problems/:id/tests2',function(req,res){
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

app.listen(port,function(){
    console.log('ok');
})