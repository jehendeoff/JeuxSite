const options = {
    //jeuxsite
    work_on: {
        //http: true, // true mean that it will run before the request is processed by jeuxsite
        //socket: true, // true mean that it will run before the request is processed by jeuxsite
    },

    //module
    redirect: { //should it redirect if cloudflare isn't detected (I don't recommend it cuz' people could then know what's the ip of your domain and ddos you)
        enabled: false,
        where: "https://jehende.fr"
    },
    stop_the_request : false, //should it destroy the request so that the request isn't processed any further ? (highly recommended)
    cache_the_response: true, //should it send a time in the cache control header
    cloudlfare_ip: {
        do_actualise: true, //should it get cloudflare's ip everytime ? (i don't recommend, cuz' if your machine (or network for that matter) is poisoned then it could let an entry here maybe by using some king of mitm attack) 
        ip_list: {
            v4: ["103.21.244.0/22", "103.22.200.0/22", "103.31.4.0/22", "104.16.0.0/13", "104.24.0.0/14", "108.162.192.0/18", "131.0.72.0/22", "141.101.64.0/18", "162.158.0.0/15", "172.64.0.0/13", "173.245.48.0/20", "188.114.96.0/20", "190.93.240.0/20", "197.234.240.0/22", "198.41.128.0/17"],
            v6: ["2400:cb00::/32", "2405:8100::/32", "2405:b500::/32", "2606:4700::/32", "2803:f800::/32", "2a06:98c0::/29", "2c0f:f248::/32", ]
        }
    }
}
var ranges = options.cloudlfare_ip.ip_list;
if (options.cloudlfare_ip.do_actualise) {

    const request = require('request-promise-native')
    const CLOUDFLAREIPV4 = "https://www.cloudflare.com/ips-v4"
    const CLOUDFLAREIPV6 = "https://www.cloudflare.com/ips-v6"
    request.get(CLOUDFLAREIPV4).then(body => {
        var newv4 = body.split(/\n/gi).sort()
        newv4 = newv4.filter(v6 => {
            return v6 !== undefined && v6 !== ""
        })
        if (ranges.v4.toLocaleString() !== newv4.toLocaleString()) {
            console.warn("Cloudflare'ipv4 aren't the same as the one embeded in the file !")
            ranges.v4 = newv4
        }
    })
    request.get(CLOUDFLAREIPV6).then(body => {
        var newv6 = body.split(/\n/gi).sort()
        newv6 = newv6.filter(v6 => {
            return v6 !== undefined && v6 !== ""
        })
        if (ranges.v6.toLocaleString() !== newv6.toLocaleString()) {
            console.warn("Cloudflare'ipv6 aren't the same as the one embeded in the file !")
            ranges.v6 = newv6
        }
    })
}

const Http = require('http')
/**
 * 
 * @param {Http.IncomingMessage} req 
 * @param {Http.ServerResponse} res 
 * @returns [{Http.IncomingMessage}, {Http.ServerResponse}]
 */
function http(req, res) {

    if(checkCloudflare(req) === true){
        req.socket.remoteAddress = req.headers['cf-connecting-ip']
        req.log(`\t\tCheck OK new ip : ${req.socket.remoteAddress}`)
    }else{
        req.log(`\t\tCheck failed\r\n\t\t\tUser-Agent : ${req.headers['user-agent']}\r\n\t\t\tLocation : http${req.https ? "s" : ""}://${req.headers.host}${req.url}`)
        if (options.redirect.enabled === true){
            res.writeHead(301, "Cloudflare isn't detected.", {
                'X-Frame-Options': 'DENY',
                'Cache-Control': `max-age=${options.cache_the_response ?"31536000" : "0"}`,
                'location': options.redirect.where
            });
        }else{
            res.writeHead(400, "Cloudflare isn't detected.", {
                'X-Frame-Options': 'DENY',
                'Cache-Control': `max-age=${options.cache_the_response ?"31536000" : "0"}`,
            });
        }
        if (options.stop_the_request === true) {
            req.log(`\t\tHard-stopping the request`)
            res.write("Cloudflare isn't detected")
            res.end()
            res.destroy()
            res.destroyed = true
            res.stop = true
        } else {
            res.writeHead = (a, b, c) => {}
        }
    }
    return req, res
}
function socket(socket) {
    socket.handshake.log = socket.log
    if(checkCloudflare(socket.handshake) === true){
        socket.handshake.adresss = socket.handshake.headers['cf-connecting-ip']
        socket.handshake.log(`\t\tCheck OK new ip : ${socket.handshake.address}`)
    }else{
        socket.handshake.log(`\t\tCheck failed\r\n\t\t\tUser-Agent : ${socket.handshake.headers['user-agent']}\r\n\t\t\tLocation : ws${socket.handshake.ssl ? "s" : ""}://${socket.handshake.headers.host}${socket.handshake.url}`)
        socket.emit("fault", "cloudflare not detected")
        if (options.stop_the_request === true) socket.disconnect()
        if (options.stop_the_request === true) socket.handshake.log(`\t\tHard-stopping the socket`)
        if (options.stop_the_request === true) socket.disconnected = true
    }
    delete socket.handshake.log
    return socket
}

const range_check = require('range_check');
/**
 * 
 * @param {Http.IncomingMessage} req 
 */
function checkCloudflare (req){
    var ip_address = (req.socket ? req.socket.remoteAddress : req.address).replace(/\:\:ffff\:/g, '');
    req.log(`\tCheck cloudflare for "${ip_address}" portocol : ${req.socket !== undefined ? "http" + (req.https ? "s" : "") : "socket"}`)
    if (req.headers['cf-connecting-ip'] === undefined){
        req.log(`\t\tNo cloudflare header in request`)
        return false;
    }
    if (range_check.isIP(ip_address)){
        var ip_ver = range_check.version(ip_address);
        
        if (ip_ver === 4){
            var checkR = range_check.inRange(ip_address, ranges.v4)
            req.log(`\t\tip is in ipv4 range : ${checkR}`)
            return checkR;
        }
        else if (ip_ver === 6){
            var checkR = range_check.inRange(ip_address, ranges.v6)
            req.log(`\t\tip is in ipv6 range : ${checkR}`)
            return checkR;
        }else{
            req.log(`\t\tip is in not in a cloudlfare range`)
            return false
        }
    }else{
            req.log(`\t\tip is in not in a good type ?!`)
        return false
    }
}

module.exports = {
    options,
    http,
    socket
}