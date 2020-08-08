//warning this need test, I only did this because .... I was bored ?

//in short, how to set this baby up is simple : if you have a domaine name, put "a" redirection on the server running it and create a foler with you domain name in the path you provided
// ...
// this is all, you can even redirect sub-domain on the same serveur and create sub domain with one machine, and using node js for each of you domain, the 'localhost' contain a simple nodejs file for you to test.
//Oh and you can also use multiple domain !

//In future revision I plan on adding support for socket.io !

//check if it can boot
const fs = require("fs")
if(!fs.existsSync("./function/")) return console.error("You installed it wrong, the \"function\" folder is missing.\n\n")

//starting the boot sequence
let config
fs.existsSync("./function/bootup.js") ? config = require("./function/bootup").run() : () => {console.error("You installed it wrong, the \"bootup\" file is missing.\n\n"); process.exit(1)}
//simple check to verifie the config has been passed
config.path ? console.log('config, verified & loaded') : () => {throw new Error("Config wasn't able to be loaded")}

var limit = {}
//the rate limiter
setInterval(_ =>{
    for (var key in limit) {
        if (limit.hasOwnProperty(key))
            if(limit[key].count > 0){
                limit[key] = {
                    count: limit[key].count - 5
                }
            }
    }
}, 5 * 1000)

/**
 * @param {https.IncomingMessage} req The request
 * @param {http.ServerResponse} res The response
 * The handler for http and https requests
 */
function handler (req, res){
    
    //checking if rate limit is on
    if(config.rate_limit === true){
        if(limit[req.connection.remoteAddress]){
            //checkinf it's above or not
            if (parseInt(limit[req.connection.remoteAddress].count)>= config.rate_limit_number){
                //checking if it should increase it anyway (rate_limite_continue)
                if(config.rate_limit_continue === true){
                    limit[req.connection.remoteAddress]= {
                        count: limit[req.connection.remoteAddress].count + config.rate_limit_continue_rate
                    }
                }
                res.writeHead(429, {
                    'X-Frame-Options': 'DENY',
                    'content-type': 'text/html;charset=utf-8',
                    'Cache-Control': 'max-age=10',
                    'Retry-After': '10',
                    'Tk': 'N'
                });
                res.write(fs.readFileSync("./Default web page/too many request.html"));
                res.end();
                return
            }else{
                limit[req.connection.remoteAddress]= {
                    count: limit[req.connection.remoteAddress].count + 1
                }
            }
    
        }else{
            limit[req.connection.remoteAddress]= {
                count: 1
            }
        }
    }

    //ckecking the headers
    if(!req.headers.host){
        
        res.writeHead(400, {
            'X-Frame-Options': 'DENY',
            'content-type': 'text/html;charset=utf-8',
            'Cache-Control': 'max-age=31536000'
        });
        res.write(fs.readFileSync("./Default web page/bad host.html"))
        res.end();
        return

    }

    //forgetting the port
    var domain = `${req.headers.host}`.split(":")[0]

    //checking if domain is registered
    if (!fs.existsSync(config.path + domain)){
        res.writeHead(500, {
            'X-Frame-Options': 'DENY',
            'content-type': 'text/html;charset=utf-8',
            'Cache-Control': 'max-age=31536000'
        });
        res.write(fs.readFileSync("./Default web page/domain not found.html"))
        res.end();
        return
    }

    //passing the info
    require(config.path + domain + '/index.js').http(req, res, config, domain)
}

//Creating the http server
const http = require("http")
http.createServer((req, res) => {
    handler(req, res)
}).listen(config.http_port)

//creating the https server only if https is true
let https
let httpsoptions
if (config.https === true) https = require("https")
if (config.https === true) httpsoptions = {
    key: fs.readFileSync(config.path_to_ssl_cert + "privkey.pem"),
    cert: fs.readFileSync(config.path_to_ssl_cert + "cert.pem")
};
if (config.https === true) https.createServer(httpsoptions, (req, res) => {
    handler(req, res)
}).listen(config.https_port)