/**
 * Created by dam on 2014/8/13.
 */
var express = require('express');
var multiparty  = require('multiparty');
var path = require('path');
var fs = require('fs');
var OrgModel = require('../lib/dataModel');

var router = express.Router();

/* GET org listing. */
router.get('/', function(req, res) {
    res.render('index', { title: 'Express' });
});
router.get('/to-add/:type', function(req, res) {
    var orgTypeValue = req.param('type');
    var titleValue = '姓名';
    var htmlTitle = '秘书处';
    if(orgTypeValue == 'sponsors') {
        titleValue = '单位';
        htmlTitle = '赞助企业';
    }
    res.render('addorg', { title: titleValue,orgType: orgTypeValue,htmlTitle:htmlTitle});
});

router.post('/add',function(req, res,next) {
    var orgModel = new OrgModel(req.body.org);
    orgModel.showOrder = 0;
    orgModel.followUser = 0;
    orgModel.createTime = new Date().getTime();
    orgModel.applyStatus = 'NONE';//未审批
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

        var datas = [];
        orgs.forEach(function(org){
            if(org.applyStatus == 'PASS')
            datas.push(org);
        });

        res.send(datas);
    });

});

router.get('/totalCount/:type',function(req, res,next){
    OrgModel.totalCount(req.param('type'),function(err,count){
        if(err) return next(err);
        res.send({ totalCount: count });
    })
});
router.get('/to-view/:id', function(req, res,next) {

    var id = req.param('id');


    res.render('manage/editorg',{id:id});
});
router.post('/manage/save', function(req, res, next) {

    var form = new multiparty.Form({uploadDir:'./upload'});

    form.parse(req,function(err, fields, files){
        if(err) return next(err);

        OrgModel.findDataById(fields.id[0],function(err,org){
            if(err) return next(err);

            var updateOrgModel = new OrgModel(org);
            updateOrgModel.name = fields.name[0];
            updateOrgModel.tel = fields.tel[0];
            updateOrgModel.address = fields.address[0];
            updateOrgModel.description = fields.description[0];
            updateOrgModel.applyStatus = fields.applyStatus[0];
            updateOrgModel.score = updateOrgModel.createTime;

            updateOrgModel.save(function(err,result){

                if(err) return next(err);

                fs.rename(files.orgFile[0].path, './public/upload/org/'+org.id+'.png', function(err) {
                    if (err) next(err);
                    // 删除临时文件夹文件,
                    fs.unlink(files.orgFile[0].path, function() {
                        if (err) throw err;
                        updateOrgModel.optTip="保存成功";
                        res.send(updateOrgModel);
                    });
                });

            });


        });








    });
});
router.get('/find-org-by-id/:id', function(req, res,next) {

    OrgModel.findDataById(req.param('id'),function(err,org){
        if(err) return next(err);

        res.send({org:org});
    });

});

router.get('/manage/to-list/:type', function(req, res) {
    var orgTypeValue = req.param('type');
    res.render('manage/manageOrg', { orgType: orgTypeValue });
});

router.get('/manage/find-org-list/:type', function(req, res,next) {

    OrgModel.list(req.param('type'),function(err,orgs){

        if(err) return next(err);
        OrgModel.totalCount(req.param('type'),function(err,count){
            if(err) return next(err);
            var pageModel = {};
            pageModel.sEcho = req.param('sEcho');
            pageModel.iTotalRecords = count;
            pageModel.iTotalDisplayRecords = count;
            pageModel.aaData = orgs;
            pageModel.iDisplayLength = count;
            pageModel.iDisplayStart = 0;
            res.send(pageModel);
        })

    });

});


module.exports = router;