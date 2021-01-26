var express = require("express"),
app = express(),
bodyParser = require("body-parser"),
request = require('request'),
// mongoose = require("mongoose"),
port = process.env.PORT || 3000;
// mongoose.set('useNewUrlParser', true);
// mongoose.connect("mongodb://localhost/oj",{ useUnifiedTopology: true });
app.use(bodyParser.urlencoded({extended:true}));
app.set("view engine","ejs");


app.get('/',function(req,res){
    res.render('show');
})
app.get('https://rextester.com/rundotnet/api',function(req,res){
    res.send('here');
})
app.get('/result',function(req,res){
    res.send('hi');
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