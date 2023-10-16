//
// whipwhep_helper.js
//

//
// exchange Offer SDP / Answer SDP with WHIP/WHEP server over HTTP POST
//
async function exchangeSDP(sdp, endpoint, token, resourceCallback) {
  const headers = new Headers();
  const opt = {};
  headers.set("Content-Type", "application/sdp");
  if (token && token.length > 0) {
    headers.set("Authorization", 'Bearer ' + token);
  }

  opt.method = 'POST';
  opt.headers = headers;
  opt.body = sdp;
  opt.keepalive = true;

  const res = await fetch(endpoint, opt)
    .catch(e => {
      console.error(e);
      return null;
    });
  //console.log('response:', res);

  if (res.status === 201) {
    resourceURL = res.headers.get("Location");
    console.log('resource:', resourceURL);
    if (resourceCallback) {
      // set WHIP/WHEP resource
      resourceCallback(resourceURL);
    }
    const sdp = await res.text();
    return sdp;
  }
  if (res.status === 200) {
    console.warn('200 OK, but not expected.');
    return null;
  }

  // --- other error ---
  if (res.status === 400) {
    const s = res.headers.get("WWW-Authenticate");
    console.error("400", s);
  }
  if (res.status === 401) {
    const s = res.headers.get("WWW-Authenticate");
    console.error("401", s);
  }
  return null;
}

//
// request delete WHIP/WHEP resouce over HTTP DELETE
//
async function requestDeleteResouce(resource, endpoint, token) {
  const url = buildResouceFullURL(resource, endpoint);
  const headers = new Headers();
  if (token && token.length > 0) {
    headers.set("Authorization", 'Bearer ' + token);
  }
  const res = await fetch(url, {
    method: 'DELETE',
    headers: headers,
  });
}


// build resouce full URL, if resource is not full URL
function buildResouceFullURL(resource, endpoint) {
  if (hasHttpProtocol(resource)) {
    return resource;
  }

  const urlObject = new URL(endpoint);
  const protocol = urlObject.protocol;
  const host = urlObject.host;
  const path = urlObject.pathname;
  const port = urlObject.port;
  const fullResource = protocol + '//' + host + resource;
  return fullResource;
}

// check if str has HTTP/HTTPS
function hasHttpProtocol(str) {
  const re = new RegExp('https?://');
  const results = re.exec(str);
  if (results) {
    return true;
  }
  else {
    return false;
  }
}

