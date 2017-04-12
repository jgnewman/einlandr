const replacer = /function reloadBody\(\) \{|\}$/g

function reloadBody() {
  var interval;
  var needsReload = false;

  function manageInterval(fn, time) {
    interval && clearInterval(interval);
    interval = setInterval(fn, time);
  }

  function ajax(to, onload) {
    var xhr = new XMLHttpRequest();
    xhr.addEventListener('load', onload);
    xhr.open('GET', to);
    xhr.send();
  }

  function askAboutReload(onsuccess, onfail) {
    ajax(
      location.protocol + '//' + location.host + '/einlandr-reload',
      function () {
        if (this.status === 200) {
          onsuccess(this);
        } else {
          onfail(this);
        }
      }
    );
  }

  function checkForLiveServer(onsuccess, onfail) {
    ajax(
      location.href,
      function () {
        if (this.status === 200) {
          onsuccess(this);
        } else {
          onfail(this);
        }
      }
    );
  }

  function onLiveServerResponse(xhr) {
    needsReload = false;
    clearInterval(interval);
    location.reload();
  }

  function onLiveServerFail() {
    needsReload = true;
    manageInterval(cycleAjax, 500);
  }

  function onReloadResponse(xhr) {
    if (needsReload || JSON.parse(xhr.responseText).needsReload) {
      needsReload = true;
      checkForLiveServer(onLiveServerResponse, onLiveServerFail);
    }
  }

  function onReloadResponseFail() {
    needsReload = true;
  }

  function cycleAjax() {
    askAboutReload(onReloadResponse, onReloadResponseFail);
  }

  manageInterval(cycleAjax, 3000);
}


export default function getReloadTemplate() {
  return `
    <script>
      (function () {
        ${reloadBody.toString().replace(replacer, '')}
      }())
    </script>
  `;
}
