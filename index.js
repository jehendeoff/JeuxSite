//warning this need test, I only did this because .... I was bored ?

//in short, how to set this baby up is simple : if you have a domaine name, put "a" redirection on the server running it and create a folder with your domain name in the path you provided
// ...
// this is all, you can even redirect sub-domain on the same serveur and create sub domain with one machine, and using node js for each of your domain, the 'localhost' contain a simple nodejs file for you to test.
//Oh and you can also use multiple domain !

//check if it can boot
const fs = require("fs")
if (!fs.existsSync("./function/")) return console.error("You installed it wrong, the \"function\" folder is missing.\n\n")

//starting the boot sequence
let config
fs.existsSync("./function/bootup.js") ? config = require("./function/bootup").run() : () => {
    console.error("You installed it wrong, the \"bootup\" file is missing.\n\n");
    process.exit(1)
}
//simple check to verifie the config has been passed
config.path ? console.log('config, verified & loaded') : () => {
    throw new Error("Config wasn't able to be loaded")
}

var limit = {}
//the rate limiter
setInterval(_ => {
    for (var key in limit) {
        if (limit.hasOwnProperty(key))
            if (limit[key].count > 0) {
                limit[key] = {
                    count: limit[key].count - parseInt(limit[key].count - 5 > 0 ? 5 : limit[key].count)
                }
            }
    }
}, 5 * 1000)

//Creating the http server
const http = require("http").createServer((req, res) => {
    handler(req, res)
})
/**
 * @param {http.IncomingMessage} req The request
 * @param {http.ServerResponse} res The response
 * The handler for http and https requests
 */
function handler(req, res) {

    //checking if rate limit is on
    if (config.rate_limit === true) {
        if (limit[`${req.connection.remoteAddress}${config.rate_limite_separate? " - " + req.headers.host:""}`]) {
            //checkinf it's above or not
            if (parseInt(limit[`${req.connection.remoteAddress}${config.rate_limite_separate? " - " + req.headers.host:""}`].count) >= config.rate_limit_number) {
                //checking if it should increase it anyway (rate_limite_continue)
                if (config.rate_limit_continue === true) {
                    limit[`${req.connection.remoteAddress}${config.rate_limite_separate? " - " + req.headers.host:""}`] = {
                        count: limit[`${req.connection.remoteAddress}${config.rate_limite_separate? " - " + req.headers.host:""}`].count + config.rate_limit_continue_rate
                    }
                }
                res.writeHead(429, {
                    'X-Frame-Options': 'DENY',
                    'content-type': 'text/html;charset=utf-8',
                    'Cache-Control': 'max-age=10',
                    'Retry-After': '10',
                });
                res.write(fs.readFileSync("./Default web page/too many request.html"));
                res.end();
                return
            } else {
                limit[`${req.connection.remoteAddress}${config.rate_limite_separate? " - " + req.headers.host:""}`] = {
                    count: limit[`${req.connection.remoteAddress}${config.rate_limite_separate? " - " + req.headers.host:""}`].count + 1
                }
            }

        } else {
            limit[`${req.connection.remoteAddress}${config.rate_limite_separate? " - " + req.headers.host:""}`] = {
                count: 1
            }
        }
    }
    //ckecking the headers
    if (!req.headers.host) {

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
    if (!fs.existsSync(config.path + domain) && !fs.existsSync(config.path + domain + "/index.js")) {
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

http.listen(config.http_port)

//creating the https server only if https is true
let https
if (config.https === true) https = require("https").createServer({
    key: fs.readFileSync(config.path_to_ssl_cert + "privkey.pem"),
    cert: fs.readFileSync(config.path_to_ssl_cert + "cert.pem")
}, (req, res) => {
    handler(req, res)
})
if (config.https === true) https.listen(config.https_port)

//declare
let io
//make socket use http or https if https is true
if (config.socketio === true) io = require("socket.io")(config.https === true ? https : http)

//activate socket
if (config.socketio === true) io.on('connection', socket => {

    //checking if rate limit is on
    if (config.rate_limit === true) {
        if (limit[`${socket.handshake.remoteAddress}${config.rate_limite_separate? " - " + socket.handshake.headers.host:""} - socket.io`]) {
            //checkinf it's above or not
            if (parseInt(limit[`${socket.handshake.remoteAddress}${config.rate_limite_separate? " - " + socket.handshake.headers.host:""} - socket.io`].count) >= config.rate_limit_number) {
                //checking if it should increase it anyway (rate_limite_continue)
                if (config.rate_limit_continue === true) {
                    limit[`${socket.handshake.remoteAddress}${config.rate_limite_separate? " - " + socket.handshake.headers.host:""} - socket.io`] = {
                        count: limit[`${socket.handshake.remoteAddress}${config.rate_limite_separate? " - " + socket.handshake.headers.host:""} - socket.io`].count + config.rate_limit_continue_rate
                    }
                }
                socket.emit("fault", "Error 429 : too many request.")
                return
            } else {
                limit[`${socket.handshake.remoteAddress}${config.rate_limite_separate? " - " + socket.handshake.headers.host:""} - socket.io`] = {
                    count: limit[`${socket.handshake.remoteAddress}${config.rate_limite_separate? " - " + socket.handshake.headers.host:""} - socket.io`].count + 1
                }
            }

        } else {
            limit[`${socket.handshake.remoteAddress}${config.rate_limite_separate? " - " + socket.handshake.headers.host:""} - socket.io`] = {
                count: 1
            }
        }
    }

    //checking for host header
    if (!socket.handshake.headers.host) return socket.emit("fault", "Error 400, no host headers.")

    //forgetting the port
    var domain = `${socket.handshake.headers.host}`.split(":")[0]

    //checking if domain is registered
    if (!fs.existsSync(config.path + domain) && !fs.existsSync(config.path + domain + "/index.js")) {
        return socket.emit("fault", "Error 500, domain not found.")
    }

    //passing the info
    require(config.path + domain + '/index.js').socket(socket, config, domain)
})