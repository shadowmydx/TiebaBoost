String.prototype.trim = function(){return this.replace(/^\s+|\s+$/g, '');}; // 设置trim方法
//var bindList = ["我实名发帖", "孟勇的诗园", "毅杯菊花茶"];
var bindList = Array();
var port = chrome.runtime.connect({name: 'filter'});

function processReplymeMessage(item){
    var userName = item.getElementsByClassName('replyme_user')[0].innerText;
    var colIndex = userName.indexOf(':') === -1 ? userName.indexOf('：') : userName.indxOf(':'); // 处理中文字符的冒号
    userName = userName.substr(0, colIndex).trim();
    for (var i = 0; i < bindList.length; i ++) {
        if (userName === bindList[i]) {
            item.parentNode.removeChild(item);
        }
    }
}

function killRubbishesOnReplymePage() {
    var replymeMessage = document.getElementsByClassName('feed_item');
    var deleteArray = new Array();
    for (var i = 0; i < replymeMessage.length; i ++) {
        deleteArray.push(replymeMessage[i]);
    }
    for (var i = 0; i < deleteArray.length; i ++) {
        processReplymeMessage(deleteArray[i]);
    }
}

killRubbishesOnReplymePage();
port.postMessage({signin: 'in'});
port.onMessage.addListener(function (msg) {
    if (msg.value === "") {
        bindList = msg.list;
        killRubbishesOnReplymePage();
    } else {
        bindList.push(msg.value);
        killRubbishesOnReplymePage();
    }
});