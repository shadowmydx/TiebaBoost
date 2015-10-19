//var bindList = ["我实名发帖", "孟勇的诗园", "毅杯菊花茶"];
var bindList = Array();
var port = chrome.runtime.connect({name: 'filter'});

function processInsidePostItem(item) {
    var dataField = item.attributes["data-field"];
    if (!dataField) {
        return;
    }
    var userName = dataField.value;
    userName = userName.replace(/'([^']*)'/g, '"$1"');
    userName = JSON.parse(userName);
    userName = userName.user_name;
    for (var i = 0; i < bindList.length; i ++) {
        if (userName === bindList[i]) {
            item.parentNode.removeChild(item);
        }
    }    
}

function killRubbishesOnInsidePage(item) {
    if (!item || !item.className) {
        return;
    }
    if (item.className.indexOf('lzl_single_post') !== -1) {
        processInsidePostItem(item);
        return;
    }
    var listItems = item.getElementsByClassName('lzl_single_post');
    for (var i = 0; i < listItems.length; i ++) {
        processInsidePostItem(listItems[i]);
    }
}

function cleanBindUserAtBeginning() {
    var allPost = document.getElementsByClassName("core_reply");
    for (var i = 0; i < allPost.length; i ++) {
        allPost[i].addEventListener('DOMSubtreeModified', function (e) {killRubbishesOnInsidePage(e.target);}, false);
    }
}

cleanBindUserAtBeginning();
port.postMessage({signin: 'in'});
port.onMessage.addListener(function (msg) {
    if (msg.value === "") {
        bindList = msg.list;
        killRubbishesOnInsidePage();
    } else {
        bindList.push(msg.value);
        killRubbishesOnInsidePage();
    }
});




