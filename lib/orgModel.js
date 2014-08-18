/**
 * Created by dam on 2014/8/13.
 */
var redis = require('redis');
var uuid = require('node-uuid');

//var db = redis.createClient(6379,'115.29.47.23')
var db = redis.createClient(6379,'192.168.0.229');


var zaddkey = 'lxd-org-sset';
var hkeyPrefix = 'lxd-org-hash-';

function OrgModel(obj){
    for(var key in obj){
        this[key] = obj[key];
    }
}

OrgModel.prototype.update = function(fn){
    var org = this;
    var id = org.id;
    //先存储在一个storedset中用于以后排序
    db.zadd(zaddkey,new Date().getTime(),hkeyPrefix+org.id,function(err){
        if(err) return fn(err);
        //再把详细信息存储在string中

        db.set(hkeyPrefix+id,JSON.stringify(org),function(err){
;            fn(err);
        });
    });
}
OrgModel.prototype.save = function(fn){
    if(this.id){
        this.update(fn);
    }else{
        var org = this;
        org.id = uuid.v1().replace('-','');
        this.update(fn);
    }
}

OrgModel.prototype.findOrgById = function(id,fn){
    db.get(id,function(err,org){
        if (err) return fn(err);
        fn(null,new OrgModel(org));
    });
}

OrgModel.prototype.remove = function(id,fn){
    db.del(id,function(err){
        if (err) return fn(err);
    });
}

OrgModel.listId = function(fn){
    db.zrevrange(zaddkey,0,-1,function(err,items){
        if (err) return fn(err);

        var orgIds = [];
        items.forEach(function(item){
            orgIds.push(item);
        });

        fn(null,orgIds);
    });
}

OrgModel.list = function(fn){

    OrgModel.listId(function(err,orgIds){
        //console.log(orgIds);
        db.mget(orgIds,function(err,items){
            if(err)return fn(err);
            var orgs = [];
            items.forEach(function(item){
                orgs.push(JSON.parse(item));
            });
            fn(null,orgs);
        });
    });

}
OrgModel.totalCount = function(fn){
    db.zcard(zaddkey,function(err,count){
        if(err) return fn(err);

        fn(null,count);
    });
}

module.exports = OrgModel;
//var lxdorg = new OrgModel({
//    name:'测试公司',
//    description:'测试公司描述',
//    auctionUser:10,
//    showOrder:1
//});
//lxdorg.save(function(err){
//    if(err)throw err;
//
//})

//lxdorg.findOrgById('lxd-org-hash-41977a3022ec-11e4-b29e-6fb78664d669',function(err,org){
//    if(err) throw err;
//    console.log(org);
//});
//
//lxdorg.remove('lxd-org-hash-41977a3022ec-11e4-b29e-6fb78664d669',function(err){
//    if(err) throw err;
//});

//lxdorg.list(function(err,orgs){
//    if(err) throw err;
//    orgs.forEach(function(org){
//        console.log(org.name);
//    });
//});
