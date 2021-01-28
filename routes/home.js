var express=require('express');
var router=express.Router();

router.get('/',function(req,res){
    res.render('home');
})
router.get('/ide',function(req,res){
    res.render('show');
})
module.exports=router;