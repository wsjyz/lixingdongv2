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
router.get('/to-add/:type', function(req, res) {
    var orgTypeValue = req.param('type');
    var titleValue = '姓名';
    if(orgTypeValue == 'sponsors') titleValue = '单位';
    res.render('addorg', { title: titleValue,orgType: orgTypeValue});
});

router.post('/add',function(req, res,next) {
    var orgModel = new OrgModel(req.body.org);
    orgModel.showOrder = 0;
    orgModel.followUser = 0;
    orgModel.createTime = new Date().getTime();
    orgModel.save(function(err){

        if(err) return next(err);

        orgModel.optTip="保存成功";
        res.send(orgModel);
    });
});

router.get('/to-list/:type', function(req, res) {
    var orgTypeValue = req.param('type');
    res.render(orgTypeValue+'list', { title: '赞助企业',orgType: orgTypeValue });
});

router.get('/find-org-list/:type', function(req, res,next) {
    OrgModel.list(req.param('type'),function(err,orgs){

        if(err) return next(err);

        res.send(orgs);
    });

});

router.get('/totalCount/:type',function(req, res,next){
    OrgModel.totalCount(req.param('type'),function(err,count){
        if(err) return next(err);
        res.send({ totalCount: count });
    })
});



module.exports = router;