// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

const http = require('https');

const getContent = function (url) {
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

export default function handler(req, res) {
   getContent('https://info.ktn.gv.at/asp/hydro/daten/json/station/2002176.json')
          .then(data => {
              res.setHeader('Access-Control-Allow-Origin', '*');
              res.setHeader('Access-Control-Allow-Methods', 'GET');
              res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json; charset=utf-8');
              res.end(data);
          })
          .catch(err => {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'text/plain');
              res.end(err.toString());
          });
}
