
/**
 * 2014-08-22
 * @zhang zijuan
 */
"use strict";

var app = angular.module('lxd', ['ngSanitize']);

//赞助企业
app.controller('SupportEnterprisesCtrl',['$scope', '$http', function ($scope, $http) {

//    var type = $remote.

 	$scope.join = false;
 	$scope.date = (new Date()).toLocaleDateString().replace(/[^\d]/g,'.');

	//加载数据
 	$http.get('/org/find-org-list/sponsors').success(function(data){
 		$scope.items = data;	
 	});

    //入驻企业总数
    $http.get( "/org/totalCount/sponsors").success(function(data){
        $scope.num = data.totalCount;
    });

    $scope.joinChange = function(){
        if($scope.join){
 			$scope.join = false;
 		}else{
 			$scope.join = true;
            window.location.href = '/org/to-add/sponsors';
 		}	
    };
    		
 }]);

//赞助企业入驻(秘书处入驻)
app.controller('SupportEnterprisesJoinCtrl',['$scope', '$http', '$location', function ($scope, $http, $location) {
		//保存数据
		$scope.saveAndChangeBtn = function(item,type){
			$scope.submitClick = true;
            var data = angular.copy(item);

            var org={};
            org.name=data.name;
            org.tel=data.tel;
            org.type=type;
            org.address=data.address;
            org.description=data.description;
            $.post('/org/add',{org:org}, function(data){
                if(data) {
                    alert('添加成功')
                }
            })
		}

}]);

//秘书处
app.controller('SecretariatCtrl',['$scope', '$http', '$window', function ($scope, $http, $window) {
		
	//加载数据
 	$http.get("/org/find-org-list/secretariat").success(function(data){
 		$scope.items = data;	
 	});

    //加载数据
    $http.get("/org/totalCount/secretariat").success(function(data){
        $scope.province = 34;
        $scope.person = 297;
    })
    $scope.joinChange = function(){
        if($scope.join){
            $scope.join = false;
        }else{
            $scope.join = true;
            $window.location.href = '/org/to-add/secretariat';
        }
    };

}]);

//关于我们详情
app.controller('AboutOursCtrl',['$scope', '$http', '$location', function ($scope, $http, $location) {


}]);

function fmDate(timeStr){
    var finishTime = new Date(Date.parse(timeStr));
    return (finishTime.getMonth() + 1)+"."+finishTime.getDate();
}

//最新活动
app.controller('LatestActivityCtrl',['$scope', '$http', '$window', function ($scope, $http, $window) {

	//加载数据
 	$http.get('/act/find-act-list').success(function(data){
        var i;
        var list = [];
        var item;
        for(i in data){
            item = data[i];
            item.startTime = fmDate(data[i].startTime);
            list.push(item);
        }
        $scope.items = list;
 	});
    $scope.toView = function(id){
        $window.location.href = '/act/to-view/'+id
    }
}]);


//公益活动
app.controller('UsefulActivityCtrl',['$scope', '$http', '$window', function ($scope, $http, $window) {

	//加载数据
 	$http.get( "/goods/find-goods-list/goods").success(function(data){
        var i;
        var list = [];
        var item;
        for(i in data){
            item = data[i];
            item.finishTime = fmDate(data[i].finishTime);
            list.push(item);
        }
 		$scope.items = list;
 	});
    $scope.toView = function(id){
        $window.location.href = '/goods/to-view/'+id
    }
//    $scope.deliberatelyTrustDangerousSnippet = function() {
//        return $sce.trustAsHtml($scope.description);
//    };
}]);

//最新活动-详情
app.controller('LatestActivityDetailCtrl',['$scope', '$http', '$location','$sce', function ($scope, $http, $location,$sce) {
    var hrefStr = window.location.href;
    var id = hrefStr.substring(hrefStr.lastIndexOf('/')+1,hrefStr.length);
	//加载数据
 	$http.get("/act/find-act-by-id/"+id).success(function(data){
 		$scope.item = data.act;
        $scope.deliberatelyTrustDangerousSnippet = function() {
            return $sce.trustAsHtml($scope.item.description);
        };
 	})	
}]);


//公益活动详情-详情
app.controller('UsefulActivityAuctionCtrl',['$scope', '$http', '$location','$sce',
    function ($scope, $http, $location,$sce) {
        var hrefStr = window.location.href;
        var id = hrefStr.substring(hrefStr.lastIndexOf('/')+1,hrefStr.length);
    //   /goods/find-goods-by-id/e4e10100318511e4b7e7596f1b256072
    $http.get( "/goods/find-goods-by-id/"+id).success(function(data){
        $scope.goodsName = data.goods.goodsName;
        $scope.goodsSimpleName = data.goods.goodsSimpleName;
        $scope.followUser  = data.goods.followUser;
        if(data.goods.lowestPrice){
            $scope.lowestPrice  = data.goods.lowestPrice;
        }else{
            $scope.lowestPrice = 1;
        }
        $scope.description  = data.goods.description;
        $scope.deliberatelyTrustDangerousSnippet = function() {
            return $sce.trustAsHtml($scope.description);
        };
        $scope.btnDisable = false;
        //拍卖时间
        $scope.btnVisible = true;
        if(data.goods.finishTime && data.goods.finishTime != 'undefined'){
            var finishTimeStr = (data.goods.finishTime+'').replace(/-/g,"/");
            var finishTime = new Date(Date.parse(finishTimeStr));

            if(finishTime < new Date()){
                $scope.btnVisible = false;
                console.log($scope.btnVisible);
            }
        }
        //点击按钮
        var timeId;
        var currentGoodId;
        var currentMobile;
        $scope.addPrice = function(){
            if(typeof ($scope.price) == 'undefined') {
                return false;
            }

            bootbox.prompt("请输入手机号", function(result) {
                //给全局变量赋值，定时器要用，setInterval不接受参数
                currentGoodId = id;
                currentMobile = result;
                if (result === null || result == '') {
                    Example.show('手机号不能为空');
                } else {
                    var userPrice = {};
                    userPrice.mobile = result;
                    userPrice.price = $scope.price;
                    userPrice.goodsId = id;
                    $http.post( "/users/add-price",{userPrice:userPrice}).success(function(postData){
                        if(postData) {
                            var tip = postData.optTip;
                            if(tip == '恭喜您，您成功拍得此件拍品'|| tip == '当前您出价最高' ){
                                $scope.btnDisable = true;
                            }
                            if(tip == '当前您出价最高'){
                                timeId = setInterval(checkPrice, 3000);
                            }
                            Example.show(tip);
                        }
                    });
                }
            });
        }
        //定时刷新
        var checkPrice = function (){
            $http.get("/goods/find-highest-price?id="+currentGoodId).success(function(data){
                var msg = data.highestPrice;
                if(currentMobile != msg[0]){
                    bootbox.alert("已经有人出价比您高");
                    $scope.btnDisable = false;
                    clearInterval(timeId);
                }
            });
        }
    });
}]);

//拍卖纪录
app.controller('AuctionRecordCtrl',['$scope', '$http', '$location', function ($scope, $http, $location) {
    $scope.init = function(mobile)
    {
        //This function is sort of private constructor for controller
        $scope.mobile = mobile;
        $http.get( "/users/find-history-price?mobile="+$scope.mobile).success(function(data){
            $scope.items = data;
        });
    };


    //删除数据
    $scope.deleteItemData = function(record){
        var params = {};
        params.mobile = record.mobile;
        params.price = record.price;
        params.goodsId = record.goodsId;
        params.optTime = record.optTime;
        $http.post( "/users/delete-price",{record:params}).success(function(data){
            $http.get( "/users/find-history-price?mobile="+$scope.mobile).success(function(data){
                $scope.items = data;
            });
        });
    }
}]);
