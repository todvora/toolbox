const http = require('http');

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

const getImage = function (text) {
    const regex = /<img src="\/(.*);" usemap="#LawineStart">/gm;
    const res = regex.exec(text);
    return `http://www.lawine.salzburg.at/${res[1]}`;
};

const getHeading = function (text) {
    const regex = /<span class="title">(.*)<\/span>/gm;
    const res = regex.exec(text);
    return res[1];
};

const getText = function (text) {
    const regex = /<span class="content">(.*)<\/span>/gm;
    const res = regex.exec(text);
    return res[1];
};

const getUrl = function (text) {
    const regex = /<a href="(.*)">mehr ...<\/a>/gm;
    const res = regex.exec(text);
    return `http://www.lawine.salzburg.at${res[1]}`;
};

const parseImage = function (text) {
    return {
        image: getImage(text),
        heading: getHeading(text),
        text: getText(text),
        url: getUrl(text)
    };
};


module.exports = (req, res) => {
    getContent('http://www.lawine.salzburg.at/start.html')
        .then(parseImage)
        .then()
        .then(JSON.stringify)
        .then(data => {
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
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
};
