//var bindList = ["我实名发帖", "孟勇的诗园", "毅杯菊花茶"];
var bindList = Array();
var port = chrome.runtime.connect({name: 'filter'});

// delete item if satisfy one rule
function parseAllRules(item) {
	return false;
}

function popularizeRule(item) {
	var description = item.className;
	if (description.indexOf('thread') == -1) {
		return true;
	}
	return false;
}

function authorRule(item) {
	var authorSpan = item.getElementsByClassName("tb_icon_author ")[0];
	if (!authorSpan) {
		return false;
	}
	var author = authorSpan.title;
	for (var i = 0; i < bindList.length; i ++) {
		if (author.indexOf(bindList[i]) != -1) {
			return true;
		}
	}
	return false;
}

function actionRegisterRule(ruleFunc) {
	var tmpFunc = parseAllRules;
	parseAllRules = function (item) {
		return tmpFunc(item) || ruleFunc(item);
	};
}

function registerAllRules() {
	actionRegisterRule(popularizeRule);
	actionRegisterRule(authorRule);
}

function killRubbishesOnFrontPage() {
	var allPost = document.getElementById("thread_list");
	var liItems = allPost.getElementsByTagName("li");
	var deleteList = new Array();
	for (var i = 0; i < liItems.length; i ++) {
		if (parseAllRules(liItems[i]) == true) {
			deleteList.push(liItems[i]);
		}
	}
	for (var i = 0; i < deleteList.length; i ++) {
		deleteList[i].parentNode.removeChild(deleteList[i]);
	}
}

(function () {
	registerAllRules();
	if (document.getElementById('thread_list') == null) {
		var detectJob = setTimeout(function () {
			if (document.getElementById('thread_list') == null) {
				return;
			} else {
				clearTimeout(detectJob);
				killRubbishesOnFrontPage();
				document.getElementById('thread_list').addEventListener('DOMSubtreeModified', function (e) {killRubbishesOnFrontPage();}, false);
			}
		}, 5000);
	} else {
		killRubbishesOnFrontPage();
	}
	port.postMessage({signin: 'in'});
	port.onMessage.addListener(function (msg) {
			console.log("debug message.");
	    if (msg.value === "") {
	        bindList = msg.list;
	        killRubbishesOnFrontPage();
	    } else {
	        bindList.push(msg.value);
	        killRubbishesOnFrontPage();
	    }
	});
})();
