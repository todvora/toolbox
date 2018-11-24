const http = require('http');
const fs = require('fs');
const path = require("path");

const hostname = '127.0.0.1';
const port = 3000;

const server = http.createServer((req, res) => {

    const handler = '..' + req.url;

    if (fs.existsSync(path.resolve(__dirname, handler))) {
      const route = require(handler);
      route(req, res);
    } else {
        res.statusCode = 404;
      res.setHeader('Content-Type', 'text/plain');
      res.end('File ' + handler + 'doesnt exist');
    }
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
