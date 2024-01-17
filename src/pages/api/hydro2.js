const http = require('https');

export default function handler(req, res) {
    http.get('https://info.ktn.gv.at/asp/hydro/daten/json/station/2002176.json', (hydroResponse) => {
             res.writeHead(200, {
             'Access-Control-Allow-Origin': '*',
             'Access-Control-Allow-Headers':'X-Requested-With,content-type',
             'Content-Type': 'application/json; charset=utf-8'
             });
                  hydroResponse.pipe(res);
            });
}
