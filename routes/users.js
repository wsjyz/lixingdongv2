var express = require('express');
var DataModel = require('../lib/dataModel')
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res) {
  res.send('respond with a resource');
});

router.post('/add-price', function(req, res,next) {
    var userPrice = new DataModel(req.body.userPrice);
    userPrice.savePrice(function(err,userPrice){
        if(err) return next(err);

        DataModel.findDataById(userPrice.goodsId,function(err,goods){
            if(err) return next(err);

            if(goods.mode == 'immediately'){//如果是即时出价，判断是否比保留价高
                if(parseInt(goods.reservePrice) <= parseInt(userPrice.price)){
                    userPrice.optTip = '恭喜您，您成功拍得此件拍品';
                }else{
                    userPrice.optTip = '竞拍成功';
                }
            }else{
                userPrice.optTip = '竞拍成功';
            }
            res.send(userPrice);
        });


    });
});
router.get('/to-history', function(req, res,next) {
    res.render('history',{title:"拍卖纪录"});

});
router.get('/find-history-price', function(req, res,next) {
    DataModel.findUserPriceHistory(req.param('mobile'),function(err,items){
        if(err) return next(err);
        res.send(items);

    });

});
module.exports = router;
