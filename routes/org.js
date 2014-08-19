/**
 * Created by dam on 2014/8/13.
 */
var express = require('express');
var OrgModel = require('../lib/orgModel');

var router = express.Router();

/* GET org listing. */
router.get('/', function(req, res) {
    res.render('index', { title: 'Express' });
});
router.get('/to-add', function(req, res) {
    res.render('addorg', { title: '公司入驻' });
});

router.post('/add',function(req, res,next) {
    var orgModel = new OrgModel(req.body.org);
    orgModel.showOrder = 0;
    orgModel.followUser = 0;
    orgModel.save(function(err){

        if(err) return next(err);

        orgModel.optTip="保存成功";
        res.send(orgModel);
    });
});

router.get('/to-list', function(req, res) {
    res.render('orglist', { title: '赞助企业' });
});

router.get('/find-org-list', function(req, res) {
    OrgModel.list(function(err,orgs){

        if(err) return next(err);

        res.send(orgs);
    });

});

router.get('/totalCount',function(req, res){
    OrgModel.totalCount(function(err,count){
        if(err) return next(err);
        res.send({ totalCount: count });
    })
});

//赞助企业入驻
router.get('/to-orgSettled', function(req, res) {
    res.render('orgSettled', { title: '赞助企业入驻' });
});


module.exports = router;