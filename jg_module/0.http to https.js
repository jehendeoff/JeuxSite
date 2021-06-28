
const options = {
    //jeuxsite
    work_on : {
        "http" : true, // true mean that it will run before the request is processed by jeuxsite
    },
    
    //module
    hard_redirect : true, //it will redirect and not continue
    cache_the_response : true, //should it send a time in the cache control header
} 

const Http = require("http")
/**
 * 
 * @param {Http.IncomingMessage} req 
 * @param {Http.ServerResponse} res 
 * @returns [{Http.IncomingMessage}, {Http.ServerResponse}]
 */
function http (req, res) {
    if(req.https !== true){ // simple check against http/s
        res.writeHead(301, "http isn't supported", {
            'X-Frame-Options': 'DENY',
            'Cache-Control': `max-age=${options.cache_the_response ?"31536000" : "0"}` ,
            'location': `https://${req.headers.host}${req.url}`
        });
        if (options.hard_redirect === true){
            res.write("This site is only available through https")
            res.end()
            res.destroy()
            res.destroyed = true
            res.stop = true
        }else{
            res.writeHead = (a, b, c) => {} 
        }
    }
    return req, res
}

module.exports = {
    options, 
    http
}