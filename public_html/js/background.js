function removeItem(array, item) {
	for (var i = 0; i < array.length; i ++) {
		if (array[i] === item) {
			array.splice(i, 1);
			return;
		}
	}
}

// 这个方法保证异步调用的方法能维持一个顺序
function series(jobArray) {
	// 任意时刻，该事件仅有一个监听者
	var customEvent = {
			listeners:[],
			on: function (listener) {
				listeners = this.listeners;
				listeners.push(listener);
			},
			emit: function (callback) {
				listeners = this.listeners;
				for (var i = 0; i < listeners.length; i ++) {
					(listeners[i])(callback);
				}
			},
			removeListener: function () {
				this.listeners.splice(0, 1);
			}
		};
	var startIndex = 0;
	var notifyFinishJob = function () {
		customEvent.removeListener();
		if (++ startIndex >= jobArray.length) {
			return;
		}
		customEvent.on(jobArray[startIndex]);
		customEvent.emit(notifyFinishJob);
	};
	if (jobArray.length <= 0) {
		return;
	}
	customEvent.on(jobArray[0]);
	customEvent.emit(notifyFinishJob);
}
// 后台一开始从数据源初始化bindList和tiebaList，然后在插件的生存周期内不再从数据源读取数据，而是直接
// 读取拥有的两个列表。对数据源的更新则分为更新两个列表和同步回数据源两个步骤。
(function() {
	var tiebaList = ["旧日本海军","c语言","法学","python", "中国政法大学"];
	var filterList = [];
	var bindList = Array();
	function signTieba(tieba) {
		var tbs = null;
		var requestTbs = new XMLHttpRequest();
		var tbsAddress = 'http://tieba.baidu.com/dc/common/tbs';
		var signAddress = 'http://tieba.baidu.com/sign/add';
		var postdata = 'ie=utf-8&kw=' + tieba + '&tbs=[tbs]';
		requestTbs.onreadystatechange = function () {
			if (requestTbs.readyState === 4) {
				tbs = JSON.parse(requestTbs.responseText)['tbs'];
				postdata = postdata.replace('[tbs]', tbs);
				var requestAdd = new XMLHttpRequest();
				requestAdd.open('POST', signAddress);
				requestAdd.setRequestHeader("Content-type","application/x-www-form-urlencoded");
				requestAdd.send(postdata);
			}
		};
		requestTbs.open('GET', tbsAddress);
		requestTbs.send();
	}

	function signAllTiebaInList() {
	    for (var i = 0; i < tiebaList.length; i ++) {
					signTieba(tiebaList[i]);
	    }
	}
	series([
		function (cb) {
			chrome.storage.local.get(["tiebaList"], function (data) {
					if (data["tiebaList"]) {
							tiebaList = data["tiebaList"];
					}
			});
			console.log("one finished.");
			cb();
		},
		function (cb) {
			chrome.storage.local.get(["bindList"], function (data) {
			    if (data["bindList"]) {
			        bindList = data["bindList"];
			    }
					var pushItem = function (item) {
							this.push(item);
							for (var i = 0; i < filterList.length; i ++) {
									try {
										filterList[i].postMessage({value: item});
									} catch (err) {
										console.log(err);
										filterList.splice(i, 1);
										i --;
									}
							}
					};
					bindList.pushItem = pushItem;
			});
			console.log("two finished.");
			cb();
		},
		function (cb) {
			chrome.runtime.onConnect.addListener(function (port) {
			    if (port.name === 'popup') {
			        port.onMessage.addListener(function (oper) {
			            if (oper.action === 'signup') {
			                signAllTiebaInList();
			                port.postMessage({result: "sign_success"});
			            } else if (oper.action === 'bind') {
			                // for (var i = 0; i < filterList.length; i ++) {
			                //     filterList[i].postMessage({value: oper.user});
			                // }
											console.log(filterList);
			                port.postMessage({result: "bind_success"});
			                bindList.pushItem(oper.user);
			                chrome.storage.local.set({"bindList": bindList}, function () {});
			            }
			        });
			    } else if (port.name === 'filter') {
			        filterList.push(port);
			        port.postMessage({list: bindList, value: ""});
			    } else if (port.name === 'option') {
							var functionMap = {
								'request_bind': function (msg) {
										port.postMessage({result: bindList, content:'bind'});
								},
								'request_tieba': function (msg) {
										port.postMessage({result: tiebaList, content:'tieba'});
								},
								'update_bind': function (msg) {
										if (msg.add == true) {
											 bindList.pushItem(msg.item);
										} else {
											 removeItem(bindList, msg.item);
										}
										chrome.storage.local.set({"bindList": bindList}, function () {});
								},
								'update_tieba': function (msg) {
										if (msg.add == true) {
												tiebaList.push(msg.item);
										} else {
												removeItem(tiebaList, msg.item);
										}
										chrome.storage.local.set({"tiebaList": tiebaList}, function () {});
								}
							};
							port.onMessage.addListener(function (oper) {
									functionMap[oper.action](oper);
							});
					}
			});
			console.log("three finished.");
			cb();
		}]);
})();
