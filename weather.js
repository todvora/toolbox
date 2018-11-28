const http = require('https');
const iconv = require('iconv-lite');

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
            response.on('data', (chunk) => body.push(iconv.decode(chunk, "ISO-8859-1")));
            // we are done, resolve promise with those joined chunks
            response.on('end', () => resolve(body.join('')));
        });
        // handle connection errors of the request
        request.on('error', (err) => reject(err))
    })
};

const parseCsv = function (text) {
    const lines = text.split(/\r?\n/)
        .map(line => line.split(';'));
    const headers = lines[0];
    return lines.slice(1).reduce((acc, line) => {
        if(line.length < 4) {
            return acc;
        }
        // Messort	Parameter	Zeitpunkt	HMW
        const place = line[0].replace(/\s\s+/g, ' ').trim();
        const param = line[1];
        const time = line[2];
        const value = line[3].trim();
        if (place !== '' && value !== '?' && value !== '-' && value !== 'Dfue' & value !== 'F') { // ignore unknown values
            if (acc[place] == null) {
                acc[place] = {}
            }

            if (acc[place][param] == null) {
                acc[place][param] = {};
            }

            acc[place][param][time] = value;
        }
        return acc;
    }, {});
};


module.exports = (req, res) => {
    getContent('https://www.salzburg.gv.at/ogd/bad388c1-e13f-484d-ba51-331a79537f5f/meteorologie-aktuell.csv')
        .then(parseCsv)
        .then(JSON.stringify)
        .then(data => {
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE'); // If needed
            res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type'); // If needed
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.end(data);
        })
        .catch(err => {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'text/plain');
            res.end(err.toString());
        });
};
