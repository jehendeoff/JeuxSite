//warning this need test, I only did this because .... I was bored ?

//in short, how to set this baby up is simple : if you have a domaine name, put "a" redirection on the server running it and create a foler with you domain name in the path you provided
// ...
// this is all, you can even redirect sub-domain on the same serveur and create sub domain with one machine, and using node js for each of you domain, the 'localhost' contain a simple nodejs file for you to test.
//Oh and you can also use multiple domain !

//In future revision I plan on adding support for socket.io !

const fs = require("fs")
if(!fs.existsSync("./function/")) return console.error("You installed it wrong, the \"function\" folder is missing.\n\n")

let config
fs.existsSync("./function/bootup.js") ? config = require("./function/bootup").run() : () => {console.error("You installed it wrong, the \"bootup\" file is missing.\n\n"); process.exit(1)}
config.path ? console.log('config, verified & loaded') : () => {throw new Error("Config wasn't able to be loaded")}

var limit = {}

setInterval(_ =>{
    console.log(limit)
    for (var key in limit) {
        if (limit.hasOwnProperty(key))
            if(limit[key].count > 0){
                limit[key] = {
                    count: limit[key].count - 1
                }
            }
    }
}, 1 * 1000)

const http = require("http")

http.createServer((req, res) => {
    if(config.rate_limit === true){
        if(limit[req.connection.remoteAddress]){
            if (parseInt(limit[req.connection.remoteAddress].count)>= config.rate_limit_number){
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
    if(!req.headers.host || !fs.existsSync(config.path + req.headers.host)){
        
        res.writeHead(400, {
            'X-Frame-Options': 'DENY',
            'content-type': 'text/html;charset=utf-8',
            'Cache-Control': 'max-age=31536000'
        });
        res.write(fs.readFileSync("./Default web page/bad host.html"))
        res.end();
        return

    }
    else
    {
        require(config.path + req.headers.host + '/index.js').http(req, res, config)
    }
}).listen(config.http_port)

let https
let httpsoptions
if (config.https === true) https = require("https")
if (config.https === true) httpsoptions = {
    key: fs.readFileSync(config.path_to_ssl_cert + "privkey.pem"),
    cert: fs.readFileSync(config.path_to_ssl_cert + "cert.pem")
};
if (config.https === true) https.createServer(httpsoptions, (req, res) => {
    if(config.rate_limit === true){
        if(limit[req.connection.remoteAddress]){
            if (parseInt(limit[req.connection.remoteAddress].count)>= config.rate_limit_number){
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
    if(!req.headers.host || !fs.existsSync(config.path + req.headers.host)){
        
        res.writeHead(400, {
            'X-Frame-Options': 'DENY',
            'content-type': 'text/html;charset=utf-8',
            'Cache-Control': 'max-age=31536000'
        });
        res.write(fs.readFileSync("./Default web page/bad host.html"))
        res.end();
        return

    }
    else
    {
        require(config.path + req.headers.host + '/index.js').https(req, res, config)
    }
}).listen(config.https_port)