var port = chrome.runtime.connect({name: "popup"});
port.onMessage.addListener(function (res) {
    if (res.result === 'sign_success') {
        var notify = document.getElementById('signupRes');
        notify.innerHTML = '签到成功';
    } else if (res.result === 'bind_success') {
        var userName = document.getElementById('user_id').value;
        var res = document.getElementById('bindRes');
        res.innerHTML = 'successed.';
    }
});
function signAllTiebaInList() {
    port.postMessage({action: "signup"});
}

function notifyFrontToBindUser() {
    var userName = document.getElementById('user_id').value;
    port.postMessage({action: "bind", user: userName});
}

document.getElementById("signup").addEventListener("click", signAllTiebaInList);
document.getElementById("bind").addEventListener("click", notifyFrontToBindUser);