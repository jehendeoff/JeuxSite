const fs= require('fs')
const yaml= require('yaml')

exports.run = () => {

    //checking the integrity of the files...
    if(!fs.existsSync("./config.yml")){
        throw new Error("Something's wrong, the \"config\" file is missing.\n\n")
    }
    if(!fs.existsSync("./Default web page")){
        throw new Error("Something's wrong, the \"default web page\" file is missing.\n\n")
    }
    if(!fs.existsSync("./Default web page/bad host.html")){
        throw new Error("Something's wrong, the \"bad host\" file is missing.\n\n")
    }
    if(!fs.existsSync("./Default web page/too many request.html")){
        throw new Error("Something's wrong, the \"too many request\" file is missing.\n\n")
    }

    var config = yaml.parse(fs.readFileSync("./config.yml", 'utf-8'))

    //checking the integrity of the config...
    if(!config.version || config.version !== "0.0.1") throw new Error("The config file version is not the same.\nPlease update.\n\n")
    if(!config.path) throw new Error("The config file is incorrect, please check (path is missing).\n\n")
    if(!config.http_port) throw new Error("The config file is incorrect, please check (http port is missing).\n\n")
    if(!config.https) throw new Error("The config file is incorrect, please check (https is missing).\n\n")
    if(config.https === 'true' && !config.https_port) throw new Error("The config file is incorrect, please check (https port is missing).\n\n")
    if(config.https === 'true' && !config.path_to_ssl_cert) throw new Error("The config file is incorrect, please check (path to ssl cert is missing).\n\n")
    if(!config.rate_limit) throw new Error("The config file is incorrect, please check (rate limit is missing).\n\n")
    if(config.rate_limit === 'true' && !config.rate_limit_number) throw new Error("The config file is incorrect, please check (rate limit number is missing).\n\n")
    if(config.rate_limit === 'true' && !config.rate_limit_continue) throw new Error("The config file is incorrect, please check (rate limit continue is missing).\n\n")
    if(config.rate_limit === 'true' && config.rate_limit_continue === 'true' && !config.rate_limit_continue_rate) throw new Error("The config file is incorrect, please check (rate limit continue rate is missing).\n\n")
    
    //creating the simple example...
    if(!fs.existsSync(config.path)){
        fs.mkdirSync(config.path)
        fs.mkdirSync(config.path + "localhost/")
        fs.mkdirSync(config.path + "localhost/web/")
        fs.writeFileSync(config.path + "localhost/index.js", `const fs = require('fs');\nconst http = require('http')\nconst https = require('https')\n/**\n * @param {http.IncomingMessage} req The request\n * @param {http.ServerResponse} res The response\n * @param {String} config The parsed config\n */\nexports.http = async (req, res, config) => {\n    res.writeHead(200, {\n        'X-Frame-Options': 'DENY',\n        'X-Coded-By': 'Jehende',\n        'content-type': 'text/html;charset=utf-8',\n        'Cache-Control': 'max-age=31536000'\n    });\n    res.write(fs.readFileSync(config.path + req.headers.host + "\\\\web\\\\index.html"));\n    res.end();\n    return;\n}\n/**\n * @param {https.IncomingMessage} req The request\n * @param {http.ServerResponse} res The response\n * @param {String} config The parsed config\n */\nexports.https = async (req, res, config) => {\n    res.writeHead(200, {\n        'X-Frame-Options': 'DENY',\n        'X-Coded-By': 'Jehende',\n        'content-type': 'text/html;charset=utf-8',\n        'Cache-Control': 'max-age=31536000'\n    });\n    res.write(fs.readFileSync(config.path + req.headers.host + "\\\\web\\\\index.html"));\n    res.end();\n    return;\n}\n`)
        fs.writeFileSync(config.path + "localhost/web/index.html", `<h1>Hello world</h1>`)
    }

    //passing the config...
    return config
}