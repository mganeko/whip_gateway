const express = require('express');
const bodyParser = require('body-parser')
const fetch = require('node-fetch');

const PORT = 3000;


const app = express();
app.use(bodyParser.text({type:"*/*"}));

app.use(express.static('public'));
// app.use(express.static('public', {
//   setHeaders: function (res, path, stat) {
//     res.set('Cross-Origin-Opener-Policy', 'same-origin');
//     res.set('Cross-Origin-Embedder-Policy', 'require-corp');
//   }
// }));


// how to sett cors headers for express
// https://stackoverflow.com/questions/23751914/how-can-i-set-response-header-on-express-js-assets
// https://expressjs.com/en/resources/middleware/cors.html
// -- not effective --
// app.use(function(req, res, next) {
//   res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
// });

// --- root --
app.get('/', (req, res) => {
  res.send('Hello WHIP trial!');
});

// --- dump whip ----
app.post('/whipdump', (req, res) => {
  console.log('---- headers ----');
  console.log(req.headers);
  console.log('---- headers end ----');

  console.log('---- body ----');
  console.log(req.body);
  console.log('---- end ----');

  res.send('Hello WHIP dump');
});


// -- whip gateway --
app.post('/whipgw', async (req, res) => {
  console.log('---- whip-gatway headers ----');
  console.log(req.headers);
  console.log('---- headers end ----');
  const contentType = req.headers['content-type'];
  const authorization = req.headers['authorization'];
  const endpoint = req.headers['x-whip-endpoint'];

  console.log('---- whip-gateway body ----');
  console.log(req.body);
  console.log('---- body end ----');
  const sdpOffer = req.body;

  const { sdp, location } = await postSDP(endpoint, sdpOffer, authorization).catch(err => {
    console.log(err);
    res.status(500).send('Server Error');
  });

  res.setHeader('Content-Type', contentType);
  res.setHeader('Location', location);
  res.status(201).send(sdp); // 201 Created
});

// -- whip delete gateway --
app.delete('/whipdelete', async (req, res) => {
  const authorization = req.headers['authorization'];
  const resource = req.headers['x-whip-resource'];
  console.log('---- delete whip resource ----');
  console.log('resource:', resource);
  console.log('authorization:', authorization);
  
  // リソースを削除する処理をここに書く
  await requestDeleteResource(resource, authorization).catch(err => {
    console.log(err);
    res.status(500).send('Server Error');
  });

  res.status(204).send(); // 204 No Content - リソースが削除されたことを示す
});

// -- post SPD --
async function postSDP(endpoint, sdp, authorization) {
  console.log('endpoint:', endpoint, 'authorization:', authorization);
  const url = endpoint;
  const headers = {
    'Content-Type': 'application/sdp',
    'Authorization': authorization
  };
  const body = sdp;
  const options = {
    method: 'POST',
    headers: headers,
    body: body
  };

  const res = await fetch(url, options);
  const answerSDP = await res.text();
  const resHeaders = res.headers;
  const location = resHeaders.get('location');

  console.log('answerSDP:', answerSDP);
  console.log('location:', location);
  return { sdp: answerSDP, location: location };
}

// -- delete resource --
async function requestDeleteResource(resource, authorization) {
  const url = resource;
  const headers = {
    'Authorization': authorization
  };
  const options = {
    method: 'DELETE',
    headers: headers,
  };
  const res = await fetch(url, options);
  const status = res.status;
  console.log('delete status:', status);
}


// --- start ---
app.listen(PORT);
console.log(`App running on http://localhost:${PORT}`);



