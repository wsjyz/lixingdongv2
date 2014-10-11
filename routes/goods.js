/**
 * Created by dam on 2014/8/21.
 */
/**
 * Created by dam on 2014/8/13.
 */
var express = require('express');
var DataModel = require('../lib/dataModel');
var multiparty  = require('multiparty');
var path = require('path');
var fs = require('fs');

var router = express.Router();

/* GET org listing. */
router.get('/', function(req, res) {
    res.render('index', { title: 'Express' });
});
router.get('/to-add', function(req, res) {
    var titleValue = '添加竞拍品';
    var goodsId = req.param('goodsId');
    if(!goodsId){
       goodsId = null;
    }
    res.render('manage/addgoods', { goodsId: goodsId});
});

router.post('/add',function(req, res,next) {
    var form = new multiparty.Form({uploadDir:'./upload'});
    form.parse(req,function(err, fields, files){
        if(err) return next(err);

        var goodsModel = {};
        goodsModel.goodsName = fields.goodsName[0];
        goodsModel.goodsSimpleName = fields.goodsSimpleName[0];
        goodsModel.area = fields.area[0];
        goodsModel.mode = fields.mode[0];
        goodsModel.lowestPrice = fields.lowestPrice[0];
        goodsModel.reservePrice = fields.reservePrice[0];
        goodsModel.marketPrice = fields.marketPrice[0];
        goodsModel.finishTime = fields.finishTime[0];
        goodsModel.description = fields.description[0];
        goodsModel.orgName = fields.orgName[0];
        goodsModel.showOrder = 0;
        goodsModel.followUser = 0;
        goodsModel.createTime = new Date().getTime();
        goodsModel.type = "goods";
        goodsModel.id = fields.goodsId[0];
        var model = new DataModel(goodsModel);
        model.save(function(err,goods){

            if(err) return next(err);

            fs.rename(files.goodsUrlFile[0].path, './public/upload/goods/'+goods.id+'.png', function(err) {
                if (err) next(err);
                // 删除临时文件夹文件,
                fs.unlink(files.goodsUrlFile[0].path, function() {
                    if (err) throw err;
                    goodsModel.optTip="保存成功";
                    res.send(goodsModel);
                });
            });


        });
    });

});

router.get('/to-list', function(req, res) {
    res.render('listgoods', { title: '公益拍卖' });
});

router.get('/manage/to-list', function(req, res) {
    res.render('manage/goodslist');
});
router.get('/manage/find-goods-list/:type', function(req, res,next) {

    DataModel.list(req.param('type'),function(err,orgs){

        if(err) return next(err);
        DataModel.totalCount(req.param('type'),function(err,count){
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
router.get('/delete/:id/:type', function(req, res) {
    var orgTypeValue = req.param('type');
    var id = req.param('id')
    DataModel.removeFromSSetAndStr(id,orgTypeValue,function(err){
        res.send('SUCCESS');
    });

});
router.get('/find-goods-list/:type', function(req, res,next) {
    DataModel.list(req.param('type'),function(err,orgs){

        if(err) return next(err);

        res.send(orgs);
    });

});

router.get('/totalCount/:type',function(req, res,next){
    DataModel.totalCount(req.param('type'),function(err,count){
        if(err) return next(err);
        res.send({ totalCount: count });
    })
});

router.get('/to-view/:id', function(req, res) {
    var id = req.param('id');
    res.render('viewgoods', { title: '公益拍卖',id: id });
});

router.get('/find-goods-by-id/:id',function(req, res,next){
    DataModel.findDataById(req.param('id'),function(err,goods){
        if(err) return next(err);

        res.send({goods:goods});
    });
});

router.get('/find-highest-price', function(req, res,next) {
    DataModel.findHighestPrice(req.param('id'),function(err,price){
        if(err) return next(err);

        res.send({highestPrice:price});
    });
});
router.get('/manage/to-price-list/:id', function(req, res) {
    var id = req.param('id');
    res.render('manage/pricelist', { id: id });
});
router.get('/manage/get-price-list/:id',function(req, res,next){
    DataModel.findAllZSetData(req.param('id'),function(err,goodsList){
        if(err) return next(err);

        res.send({goods:goodsList});
    });
});
router.get('/manage/delete-price/:goodsId/:mobile',function(req,res,next){
    var goodsId = req.param('goodsId');
    var mobile = req.param('mobile');

    DataModel.removeFromSSet(goodsId,mobile,function(err){
        if(err) return next(err);
        res.send("SUCCESS");
    });
    res.send("SUCCESS");
});
module.exports = router;