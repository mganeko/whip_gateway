//
// ui_helper.js
//

// -- enable UI element --
function enableElementById(id) {
  const element = document.getElementById(id);
  element.disabled = false;
}

// -- disable UI element --
function disableElementById(id) {
  const element = document.getElementById(id);
  element.disabled = true;
}

// --- get param from query string ---
function getParamFromQueryString(key) {
  const search = window.location.search;
  const re = new RegExp(`${key}=([^&=]+)`);
  const results = re.exec(search);
  let token = '';
  if (results) {
    token = results[1];
  }
  return token;
}
