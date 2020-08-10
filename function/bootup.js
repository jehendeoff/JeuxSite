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
    if(!fs.existsSync("./Default web page/example.js")){
        throw new Error("Something's wrong, the \"example\" file is missing.\n\n")
    }

    var config = yaml.parse(fs.readFileSync("./config.yml", 'utf-8'))

    //checking the integrity of the config...
    if(!config.version || config.version !== "0.0.1a") throw new Error("The config file version is not the same.\nPlease update.\n\n")
    if(!config.path) throw new Error("The config file is incorrect, please check (path is missing).\n\n")
    if(!config.http_port) throw new Error("The config file is incorrect, please check (http port is missing).\n\n")
    if(!config.https || (!config.https === false && !config.https === true)) throw new Error("The config file is incorrect, please check (https is missing).\n\n")
    if(config.https === true && !config.https_port) throw new Error("The config file is incorrect, please check (https port is missing).\n\n")
    if(config.https === true && !config.path_to_ssl_cert) throw new Error("The config file is incorrect, please check (path to ssl cert is missing).\n\n")
    if(!config.rate_limit || (!config.rate_limit === true && !config.rate_limit === false)) throw new Error("The config file is incorrect, please check (rate limit is missing).\n\n")
    if(config.rate_limit === true && !config.rate_limit_number) throw new Error("The config file is incorrect, please check (rate limit number is missing).\n\n")
    if(config.rate_limit === true && !config.rate_limit_continue === false && !config.rate_limit_continue === true) throw new Error("The config file is incorrect, please check (rate limit continue is missing).\n\n")
    if(config.rate_limit === true && config.rate_limit_continue === true && !config.rate_limit_continue_rate) throw new Error("The config file is incorrect, please check (rate limit continue rate is missing).\n\n")
    if(!config.socketio || (!config.socketio === true && !config.socketio === false)) throw new Error("The config file is incorrect, please check (socketio is missing).\n\n")
    //creating the simple example...
    if(!fs.existsSync(config.path)){
        fs.mkdirSync(config.path)
        fs.mkdirSync(config.path + "localhost/")
        fs.mkdirSync(config.path + "localhost/web/")
        fs.writeFileSync(config.path + "localhost/index.js", fs.readFileSync('./Default web page/example.js', 'utf-8').replace(/\$dir/gi, __dirname.toString().split('\\').filter(o => o !== "function").join("\\\\")))
        fs.writeFileSync(config.path + "localhost/web/index.html", fs.readFileSync('./Default web page/example.html'))
    }

    //passing the config...
    return config
}