const http = require('https');

const getContent = function(url) {
  // return new pending promise
  return new Promise((resolve, reject) => {
    // select http or https module, depending on reqested url
    const request = http.get(url, (response) => {
      // handle http errors
      if (response.statusCode < 200 || response.statusCode > 299) {
         reject(new Error('Failed to load page, status code: ' + response.statusCode));
       }
      // temporary data holder
      const body = [];
      // on every content chunk, push it to the data array
      response.on('data', (chunk) => body.push(chunk));
      // we are done, resolve promise with those joined chunks
      response.on('end', () => resolve(body.join('')));
    });
    // handle connection errors of the request
    request.on('error', (err) => reject(err))
    })
};

const parseCsv = function(text) {
    const lines = text.split(/\r?\n/).map(line => line.split(';'));
    const headers = lines[0];
    return lines.slice(1);
}


module.exports = (req, res) => {
    getContent('https://www.salzburg.gv.at/ogd/bad388c1-e13f-484d-ba51-331a79537f5f/meteorologie-aktuell.csv')
    .then(parseCsv)
    .then(JSON.stringify)
    .then(data => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(data);
    });
};