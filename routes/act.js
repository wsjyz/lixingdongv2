/**
 * Created by dam on 2014/9/3.
 */

var express = require('express');
var DataModel = require('../lib/dataModel');
var multiparty  = require('multiparty');
var path = require('path');
var fs = require('fs');

var router = express.Router();

router.get('/to-list', function(req, res) {
    res.render('actlist');
});

router.get('/to-add', function(req, res) {
    res.render('manage/addact');
});

router.post('/add', function(req, res, next) {

    var form = new multiparty.Form({uploadDir:'./upload'});

    form.parse(req,function(err, fields, files){
        if(err) return next(err);

        var actModel = {};
        actModel.actName = fields.actName[0];
        actModel.actSimpleName = fields.actSimpleName[0];
        actModel.area = fields.area[0];
        actModel.startTime = fields.startTime[0];
        actModel.finishTime = fields.finishTime[0];
        actModel.description = fields.description[0];
        actModel.followUser = fields.followUser[0];
        actModel.createTime = new Date().getTime();
        actModel.type = "act";
        var model = new DataModel(actModel);
        model.save(function(err,act){

            if(err) return next(err);

            fs.rename(files.actUrlFile[0].path, './public/upload/act/'+act.id+'.png', function(err) {
                if (err) next(err);
                // 删除临时文件夹文件,
                fs.unlink(files.actUrlFile[0].path, function() {
                    if (err) throw err;
                    actModel.optTip="保存成功";
                    res.send(actModel);
                });
            });


        });
    });
});

router.get('/find-act-list', function(req, res,next) {
    DataModel.list('act',function(err,orgs){

        if(err) return next(err);

        res.send(orgs);
    });

});

router.get('/to-view/:id', function(req, res) {
    var id = req.param('id');
    res.render('viewact');
});

router.get('/find-act-by-id/:id',function(req, res,next){
    DataModel.findDataById(req.param('id'),function(err,act){
        if(err) return next(err);

        res.send({act:act});
    });
});
module.exports = router;