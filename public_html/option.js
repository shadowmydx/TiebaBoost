(function() {
  String.prototype.trim = function(){return this.replace(/^\s+|\s+$/g, '');};
  var port = chrome.runtime.connect({name: 'option'});
  var tiebaList = [];
  var bindList = [];
  var drawItem = function(ulList, array, deleteAction) {
    for (var i = 0; i < array.length; i ++) {
      var liItem = document.createElement('li');
      var delBtn = document.createElement('button');
      var content = document.createElement('span');
      delBtn.innerHTML = '删除';
      delBtn.addEventListener("click", deleteAction);
      content.innerHTML = array[i];
      liItem.appendChild(content);
      liItem.appendChild(delBtn);
      ulList.appendChild(liItem);
    }

  }
  port.onMessage.addListener(function (msg) {
    if (msg.content == 'bind') {
      bindList = msg.result;
      document.getElementById('bind_list').innerHTML = '';
      drawItem(document.getElementById('bind_list'), bindList, function (event) {
        port.postMessage({
          action: 'update_bind',
          add: false,
          item: event.target.parentNode.getElementsByTagName('span')[0].innerHTML
        });
        event.target.parentNode.parentNode.removeChild(event.target.parentNode);
      });
    } else if (msg.content == 'tieba') {
      tiebaList = msg.result;
      document.getElementById('tieba_list').innerHTML = '';
      drawItem(document.getElementById('tieba_list'), tiebaList, function (event) {
        port.postMessage({
          action: 'update_tieba',
          add: false,
          item: event.target.parentNode.getElementsByTagName('span')[0].innerHTML
        });
        event.target.parentNode.parentNode.removeChild(event.target.parentNode);
      });
    }
  });
  port.postMessage({action: 'request_tieba'});
  port.postMessage({action: 'request_bind'});

  document.getElementById('new_tieba_btn').addEventListener('click', function (event) {
    var content = document.getElementById('new_tieba').value;
    content = content.trim();
    if (content) {
      port.postMessage({
        action: 'update_tieba',
        add: true,
        item: content
      });
      port.postMessage({action: 'request_tieba'});
    }
  });

  document.getElementById('new_bind_btn').addEventListener('click', function (event) {
    var content = document.getElementById('new_bind').value;
    content = content.trim();
    if (content) {
      port.postMessage({
        action: 'update_bind',
        add: true,
        item: content
      });
      port.postMessage({action: 'request_bind'});
    }
  });
})();
