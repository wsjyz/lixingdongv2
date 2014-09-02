
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



//最新活动
app.controller('LatestActivityCtrl',['$scope', '$http', '$location', function ($scope, $http, $location) {

	//加载数据
 	$http.get('data/latestActivity.json').success(function(data){
 		$scope.items = data;

 	})	
}]);


//公益活动
app.controller('UsefulActivityCtrl',['$scope', '$http', '$window', function ($scope, $http, $window) {


    function fmDate(timeStr){
        var finishTime = new Date(Date.parse(timeStr));
        return (finishTime.getMonth() + 1)+"."+finishTime.getDate();
    }

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
        $window.location.href="/goods/to-view/"+id;
    }
//    $scope.deliberatelyTrustDangerousSnippet = function() {
//        return $sce.trustAsHtml($scope.description);
//    };
}]);

//最新活动-详情
app.controller('LatestActivityDetailCtrl',['$scope', '$http', '$location', function ($scope, $http, $location) {

	//加载数据
 	$http.get('data/latestActivityDetail.json').success(function(data){
 		$scope.item = data;
 	})	
}]);

//拍卖纪录
app.controller('AuctionRecordCtrl',['$scope', '$http', '$location', function ($scope, $http, $location) {

}]);
