const fs = require('fs');
const http = require('http')
const https = require('https')
/**
 * @param {http.IncomingMessage} req The request
 * @param {http.ServerResponse} res The response
 * @param {String} config The parsed config
 * @param {String} domain The parsed config
 */
exports.http = async (req, res, config, domain) => {
    res.writeHead(200, {
        'X-Frame-Options': 'DENY',
        'X-Coded-By': 'Jehende',
        'content-type': 'text/html;charset=utf-8',
        'Cache-Control': 'max-age=31536000'
    });
    res.write(fs.readFileSync(config.path + domain + "\\web\\index.html"));
    res.end();
    return;
}
/**
 * @param {https.IncomingMessage} req The request
 * @param {http.ServerResponse} res The response
 * @param {String} config The parsed config
 * @param {String} domain The parsed config
 */
exports.https = async (req, res, config, domain) => {
    res.writeHead(200, {
        'X-Frame-Options': 'DENY',
        'X-Coded-By': 'Jehende',
        'content-type': 'text/html;charset=utf-8',
        'Cache-Control': 'max-age=31536000'
    });
    res.write(fs.readFileSync(config.path + domain + "\\web\\index.html"));
    res.end();
    return;
}
