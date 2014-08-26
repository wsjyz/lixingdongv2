/**
 * Created by dam on 2014/8/13.
 */
var redis = require('redis');
var uuid = require('node-uuid');
var settings = require('../settings');

var db = redis.createClient(settings.redis_config.redisPort,settings.redis_config.redisHost);


var ssetkeyPrefix = settings.redis_config.sskeyPrefix;
var stringkeyPrefix = settings.redis_config.skeyPrefix;

function DataModel(obj){
    for(var key in obj){
        this[key] = obj[key];
    }
}

DataModel.prototype.update = function(fn){
    var data = this;
    var id = data.id;
    //先存储在一个storedset中用于以后排序
    db.zadd(ssetkeyPrefix+data.type,new Date().getTime(),stringkeyPrefix+data.id,function(err){
        if(err) return fn(err);
        //再把详细信息存储在string中

        db.set(stringkeyPrefix+id,JSON.stringify(data),function(err){
;            if(err) return fn(err);

             fn(null,data);
        });
    });
}
DataModel.prototype.save = function(fn){
    if(this.id && this.id != ''){
        return this.update(fn);
    }else{
        var data = this;
        data.id = uuid.v1().replace(/-/g,'');
        return this.update(fn);
    }
}

DataModel.findDataById = function(id,fn){
    db.get(stringkeyPrefix+id,function(err,data){
        if (err) return fn(err);
        fn(null,JSON.parse(data));
    });
}

DataModel.prototype.remove = function(id,fn){
    db.del(id,function(err){
        if (err) return fn(err);
    });
}

DataModel.listId = function(type,fn){
    db.zrevrange(ssetkeyPrefix+type,0,-1,function(err,items){
        if (err) return fn(err);

        var dataIds = [];
        items.forEach(function(item){
            dataIds.push(item);
        });

        fn(null,dataIds);
    });
}

DataModel.list = function(type,fn){

    DataModel.listId(type,function(err,dataIds){
        //console.log(dataIds);
        db.mget(dataIds,function(err,items){
            if(err)return fn(err);
            var datas = [];
            items.forEach(function(item){
                datas.push(JSON.parse(item));
            });
            fn(null,datas);
        });
    });

}
DataModel.totalCount = function(type,fn){
    db.zcard(ssetkeyPrefix+type,function(err,count){
        if(err) return fn(err);

        fn(null,count);
    });
}

DataModel.prototype.savePrice = function(fn){
    var data = this;
    data.optTime = new Date().getTime();
    //先存储在一个storedset中用于以后排序
    db.zadd('lxd-goods-price-'+data.goodsId,data.price,data.mobile,function(err){
        if(err) return fn(err);
        //再把详细信息存储在string中

        db.lpush('lxd-user-price-'+data.mobile,JSON.stringify(data),function(err){
            if(err) return fn(err);

            fn(null,data);
        });
    });
}
DataModel.findHighestPrice = function(id,fn){
    db.zrevrange('lxd-goods-price-'+id,0,0,'withscores',function(err,item){
        if(err) return fn(err);

        console.log(item);
        fn(null,item);
    });
}
module.exports = DataModel;