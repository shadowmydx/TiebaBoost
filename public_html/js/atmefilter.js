String.prototype.trim = function(){return this.replace(/^\s+|\s+$/g, '');}; // 设置trim方法
//var bindList = ["我实名发帖", "孟勇的诗园", "毅杯菊花茶"];
var bindList = Array();
var port = chrome.runtime.connect({name: 'filter'});

function processAtmeMessage(item){
    var userName = item.getElementsByClassName('atme_user')[0].innerText;
    var colIndex = userName.indexOf(':') === -1 ? userName.indexOf('：') : userName.indxOf(':'); // 处理中文字符的冒号
    userName = userName.substr(0, colIndex).trim();
    for (var i = 0; i < bindList.length; i ++) {
        if (userName === bindList[i]) {
            item.parentNode.removeChild(item);
        }
    }
}

function killRubbishesOnAtmePage() {
    var atmeMessage = document.getElementsByClassName('feed_item');
    var deleteArray = new Array();
    for (var i = 0; i < atmeMessage.length; i ++) {
        deleteArray.push(atmeMessage[i]);
    }
    for (var i = 0; i < deleteArray.length; i ++) {
        processAtmeMessage(deleteArray[i]);
    }
}

killRubbishesOnAtmePage();
port.postMessage({signin: 'in'});
port.onMessage.addListener(function (msg) {
    if (msg.value === "") {
        bindList = msg.list;
        killRubbishesOnAtmePage();
    } else {
        bindList.push(msg.value);
        killRubbishesOnAtmePage();
    }
});


