//var bindList = ["我实名发帖", "孟勇的诗园", "毅杯菊花茶"];
var bindList = Array();
var port = chrome.runtime.connect({name: 'filter'});
// delete item if satisfy one rule
function parseAllRules(item) {
	return false;
}
function bindingAdvAndUserRule(item) {
	var dataField;
	try {
		dataField = item.attributes["data-field"];
	} catch (err) {
		return true;
	}
	if (!dataField) {
		return true;  // 如果没有data-field，说明是广告
	}
	var userName = JSON.parse(dataField.value);
	userName = userName.author.user_name;
	for (var i = 0; i < bindList.length; i ++) {
		if (userName == bindList[i]) {
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
	actionRegisterRule(bindingAdvAndUserRule);
}

function mergeArray(arr1, arr2) {
	var res = new Array();
	for (var i = 0; i < arr2.length; i ++) {
		res.push(arr2[i]);
	}
	for (var i = 0; i < arr1.length; i ++) {
		res.push(arr1[i]);
	}
	return res;
}

function killRubbishesOnPostPage() {
	var allPost = document.getElementById("j_p_postlist");
	// var userPost = allPost.getElementsByClassName("l_post");
	// var adv = allPost.getElementsByClassName("l_post_bright");
	// allPost = mergeArray(userPost, adv);
	var deleteList = new Array();
	var headNode = allPost.firstChild;
	while (headNode != null) {
		if (parseAllRules(headNode) == true) {
			deleteList.push(headNode);
		}
		headNode = headNode.nextSibling;
	}
	// for (var i = 0; i < allPost.length; i ++) {
	// 	if (parseAllRules(allPost[i]) == true) {
	// 		deleteList.push(allPost[i]);
	// 	}
	// }
	for (var i = 0; i < deleteList.length; i ++) {
            if (deleteList[i] && deleteList[i].parentNode) {
		deleteList[i].parentNode.removeChild(deleteList[i]);
            }
	}
}

registerAllRules();
killRubbishesOnPostPage();
port.postMessage({signin: 'in'});
port.onMessage.addListener(function (msg) {
    if (msg.value === "") {
        bindList = msg.list;
        killRubbishesOnPostPage();
    } else {
        bindList.push(msg.value);
        killRubbishesOnPostPage();
    }
});
