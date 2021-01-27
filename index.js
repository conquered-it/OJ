var express = require("express"),
app = express(),
bodyParser = require("body-parser"),
request = require('request'),
mongoose = require("mongoose"),
port = process.env.PORT || 3000;
mongoose.set('useNewUrlParser', true);
mongoose.connect("mongodb://localhost/oj",{ useUnifiedTopology: true });
app.use(bodyParser.urlencoded({extended:true}));
app.set("view engine","ejs");
app.use(express.static('views'));

var problemSchema = new mongoose.Schema({
    title:String,
    statement:String,
    tests:[String]
})

var problems = mongoose.model('problems',problemSchema);

app.get('/',function(req,res){
    res.render('show');
})

app.get('/problems',function(req,res){
    res.render('problems');
})

app.get('/problems/new',function(req,res){
    res.render('new_problems');
})

app.post('/problems',function(req,res){
    problems.create(req.body.prob,function(err,ret){
        if(err) console.log('err');
        else console.log(ret);
    })
})

app.post('/result',function(req,res){
    // console.log(req.body);
    res.send({});
})
/*
#include<iostream>
int main(){
  std::cout<<"hlo";
}
*/

app.listen(port,function(){
    console.log('ok');
})