var express=require('express');
var router=express.Router();
var submissions = require('../models/submissions');
router.get('/submissions',function(req,res){
    submissions.find({},function(err,submissions){
        res.render('submissions',{submissions:submissions});
    })
})

router.get('/submissions/:id',function(req,res){
    submissions.findById(req.params.id,function(err,ret){
        res.render('this_submission',{sub:ret});
    })
})
module.exports=router;