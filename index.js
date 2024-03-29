//warning this need test, I only did this because .... I was bored ?

//in short, how to set this baby up is simple : if you have a domaine name, put "CNAME" redirection on the server running it and create a folder with your domain name in the path you provided
// ...
// this is all, you can even redirect sub-domain on the same serveur and create sub domain with one machine, and using node js for each of your domain, the 'localhost' contain a simple nodejs file for you to test.
//Oh and you can also use multiple domain !


//check if it can boot
const cluster = require("cluster");
if (cluster.isWorker) {
	console.error("Does not work in cluster, sorry.");
	process.exit(0);
}
const fs = require("fs");
let log;
if (!fs.existsSync("./function/log.js")){
	log = console;
} else{
	log = require("./function/log.js");
}

if (!fs.existsSync("./function/")){
	log.error("You installed it wrong, the \"function\" folder is missing.\n\n");
	process.exit(1);
} 

//starting the boot sequence
let config;
fs.existsSync("./function/bootup.js") ? config = require("./function/bootup").run() : () => {
	log.error("You installed it wrong, the \"bootup\" file is missing.\n\n");
	process.exit(1);
};
//simple check to verify the config has been passed
config.path ? log.log("The config was parsed, and verified with success !") : () => {
	log.error("Config wasn't able to be loaded !");
	process.exit(1);
};


let ready = false;

function setCluster(path){
	cluster.setupPrimary({
		exec: path,
	});
}
/**
 * @param {http.IncomingMessage} req The request
 * @param {http.ServerResponse} res The response
 * The handler for http and https requests
 */
async function handler(req, res) {
	if (!ready) return res.end();
	req.log = function (text, bool){
		if (req.tmpLog === undefined)
			req.tmpLog = text;
		else
			req.tmpLog += "\r\n" + text;
		if (bool === true) log.log(req.tmpLog);
		if (bool === true) delete req.tmpLog;
	};
	req.log_handler = log;

	req.log(`\r\nIncoming http${req.https ? "s" : ""} request from "${req.connection.remoteAddress}"\r\n\tChecking "before process" modules.`);

	for (const key in modules.http.before) {
		if (Object.hasOwnProperty.call(modules.http.before, key)) {
			const modTMP = modules.http.before[key];
			if (modTMP.http.constructor.name === "AsyncFunction"){
				req, res = await modTMP.http(req, res);
			}else{
				req, res = modTMP.http(req, res);
			}
			if(!req) return req.log(`\tModule "${key}" stopped the request by not returning the request.`, true);
			if(!res) return req.log(`\tModule "${key}" stopped the request by not returning the response.`, true);
			if(res.destroyed === true || res.writableFinished === true || res.stop === true) return req.log(`\tModule "${key}" stopped the request.`, true);
		}
	}

	if(res.destroyed === true || res.writableFinished === true || res.stop === true) return req.log("\tAn unknown module stopped the request.", true);
	req.log("\tFinished passing the request to \"before process\" modules.");

	//ckecking the headers
	if (!req.headers.host) {
		res.writeHead(400, "No host header.", {
			"X-Frame-Options": "DENY",
			"content-type": "text/html;charset=utf-8",
			"Cache-Control": "max-age=31536000"
		});
		res.write(fs.readFileSync("./Default web page/bad host.html"));
		res.end();
		return;

	}

	//forgetting the port
	req.domain = `${req.headers.host}`.split(":")[0];

	//first check (with www.)
	if(site.http[req.domain] !== undefined) {
		req.log("\tChecking \"after process\" modules.");
		for (const key in modules.http.after) {
			if (Object.hasOwnProperty.call(modules.http.after, key)) {
				const modTMP = modules.http.after[key];
				req, res = modTMP.http(req, res);
				if(!req) return req.log(`\tModule "${key}" stopped the request by not returning the request.`, true);
				if(!res) return req.log(`\tModule "${key}" stopped the request by not returning the response.`, true);
				if(res.destroyed === true || res.writableFinished === true || res.stop === true) return req.log(`\tModule "${key}" stopped the request.`, true);
			}
		}
		if(res.destroyed === true || res.writableFinished === true || res.stop === true) return req.log("\tAn unknown module stopped the request.", true);
		req.log("\tFinished passing the request to \"after process\" modules.");
		setCluster(`${config.path}${req.domain}/index.js`);
		return site.http[req.domain](req, res, config, req.domain /*for legacy compatibility*/);
	}

	if(config.replace_www && req.domain.startsWith("www.")) {
		req.domain = req.domain.replace("www.", "");
		//second check (without www.)
		if(site.http[req.domain] !== undefined) {

			req.log("\tChecking \"after process\" modules.");
			for (const key in modules.http.after) {
				if (Object.hasOwnProperty.call(modules.http.after, key)) {
					const modTMP = modules.http.after[key];
					req, res = modTMP.http(req, res);
					if(!req) return req.log(`\tModule "${key}" stopped the request by not returning the request.`, true);
					if(!res) return req.log(`\tModule "${key}" stopped the request by not returning the response.`, true);
					if(res.destroyed === true || res.writableFinished === true || res.stop === true) return req.log(`\tModule "${key}" stopped the request.`, true);
				}
			}
			if(res.destroyed === true || res.writableFinished === true || res.stop === true) return req.log("\tAn unknown module stopped the request.", true);
			req.log("\tFinished passing the request to \"after process\" modules.");
			setCluster(`${config.path}${req.domain}/index.js`);
			return site.http[req.domain](req, res, config, req.domain /*for legacy compatibility*/);
		}
	}

	req.log("\tChecking \"after process\" modules.");
	for (const key in modules.http.after) {
		if (Object.hasOwnProperty.call(modules.http.after, key)) {
			const modTMP = modules.http.after[key];
			req, res = modTMP.http(req, res);
			if(!req) return req.log(`\tModule "${key}" stopped the request by not returning the request.`, true);
			if(!res) return req.log(`\tModule "${key}" stopped the request by not returning the response.`, true);
			if(res.destroyed === true || res.writableFinished === true || res.stop === true) return req.log(`\tModule "${key}" stopped the request.`, true);
		}
	}
	if(res.destroyed === true || res.writableFinished === true || res.stop === true) return req.log("\tAn unknown module stopped the request.", true);
	req.log("\tFinished passing the request to \"after process\" modules.");

	//checking if domain is registered
	res.writeHead(500, "Domain not found", {
		"X-Frame-Options": "DENY",
		"content-type": "text/html;charset=utf-8",
		"Cache-Control": "max-age=31536000"
	});
	res.write(fs.readFileSync("./Default web page/domain not found.html"));
	res.end();
	return;

}

//Creating the http server
const http = require("http").createServer(async (req, res) => {
	const buffers = [];
	for await (const chunk of req) {
		buffers.push(chunk);
	}
	req.body = Buffer.concat(buffers).toString();
	req.https = false;
	
	return handler(req, res);
});
http.listen(config.http_port);

//creating the https server only if https is true
let https;
if (config.https === true) https = require("https").createServer({
	key: fs.readFileSync(config.path_to_ssl_cert + "privkey.pem"),
	cert: fs.readFileSync(config.path_to_ssl_cert + "cert.pem"),

}, async (req, res) => {
	const buffers = [];

	for await (const chunk of req) {
		buffers.push(chunk);
	}
	req.body = Buffer.concat(buffers).toString();
	req.https = true;
	return handler(req, res);
});
if (config.https === true) https.listen(config.https_port);


//declare
global.io;
//make socket use http or https if https is true
if (config.socketio === true) io = require("socket.io")(config.https === true ? https : http);

//activate socket
if (config.socketio === true) io.on("connection", socket => {
	socket.log = function (text, bool){
		if (socket.tmpLog === undefined)
			socket.tmpLog = text;
		else
			socket.tmpLog += "\r\n" + text;
		if (bool === true) log.log(socket.tmpLog);
	};
	socket.log_handler = log;

	socket.log(`\r\nIncoming socket request from "${socket.handshake.address}"\r\n\tChecking "before process" modules.`);
	for (const key in modules.socket.before) {
		if (Object.hasOwnProperty.call(modules.socket.before, key)) {
			const modTMP = modules.socket.before[key];
			socket = modTMP.socket(socket);
			if(!socket) return socket.log(`\tModule "${key}" stopped the request by not returning the socket.`, true);
			if(socket.disconnected === true) return socket.log(`\tModule "${key}" stopped the request.`, true);
		}
	}
	if(socket.disconnected === true) return socket.log("\tAn unknown module stopped the request.", true);
	socket.log("\tFinished passing the request to \"before process\" modules.");

	//checking for host header
	if (!socket.handshake.headers.host) return socket.emit("fault", "Error 400, no host headers.");

	//forgetting the port
	socket.domain = `${socket.handshake.headers.host}`.split(":")[0];

	//first check (with www.)
	if(site.socket[socket.domain] !== undefined){

		socket.log(`\r\nIncoming socket request from "${socket.handshake.address}"\r\n\tChecking "after process" modules.`);
		for (const key in modules.socket.after) {
			if (Object.hasOwnProperty.call(modules.socket.after, key)) {
				const modTMP = modules.socket.after[key];
				socket = modTMP.socket(socket);
				if(!socket) return socket.log(`\tModule "${key}" stopped the request by not returning the socket.`, true);
				if(socket.disconnected === true) return socket.log(`\tModule "${key}" stopped the request.`, true);
			}
		}
		if(socket.disconnected === true) return socket.log("\tAn unknown module stopped the request.", true);
		socket.log("\tFinished passing the request to \"after process\" modules.");

		return site.socket[socket.domain](socket);
	}


	if(config.replace_www && socket.domain.startsWith("www.")){ socket.domain = socket.domain.replace("www.", "");

		//second check (without www.)
		if(site.socket[socket.domain] !== undefined){

			socket.log(`\r\nIncoming socket request from "${socket.handshake.address}"\r\n\tChecking "after process" modules.`);
			for (const key in modules.socket.after) {
				if (Object.hasOwnProperty.call(modules.socket.after, key)) {
					const modTMP = modules.socket.after[key];
					socket = modTMP.socket(socket);
					if(!socket) return socket.log(`\tModule "${key}" stopped the request by not returning the socket.`, true);
					if(socket.disconnected === true) return socket.log(`\tModule "${key}" stopped the request.`, true);
				}
			}
			if(socket.disconnected === true) return socket.log("\tAn unknown module stopped the request.", true);
			socket.log("\tFinished passing the request to \"after process\" modules.");
			return site.socket[socket.domain](socket);
		}
	}

	return socket.emit("fault", "Error 500, domain not found.");

});

let modules = {};
modules.http = {};
modules.http.before = {};
modules.http.after = {};

modules.socket = {};
modules.socket.before = {};
modules.socket.after = {};

log.log("\r\nLoading modules.");

let ModulesNB = [];
ModulesNB["http"] =0;
ModulesNB["socket"] =0;

let PMod =fs.readdirSync("./jg_module/");
for (const file of PMod) {
	if (!fs.statSync(`./jg_module/${file}`).isDirectory()){
		if(file.endsWith(".js")){
			const modTMP = require(`./jg_module/${file}`);
			if (modTMP.options !== undefined){
				let t = false;
				if (modTMP.options.work_on.http !== undefined){
					if(modTMP.http !== undefined){
						if(modTMP.options.work_on.http === true){
							modules.http.before[file] = modTMP;
							log.log(`\tModule "${file}" has hooked in http before the request is processed.`);
							ModulesNB["http"]++;
							t = true;
						}else{
							modules.http.after[file] = modTMP;
							log.log(`\tModule "${file}" has hooked in http after the request is processed.`);
							ModulesNB["http"]++;
							t = true;
						}
					}else log.warn(`\tModule "${file}" specified wanting to hook in http but didn't have a function, not using it.`);
				}
				if (modTMP.options.work_on.socket !== undefined){
					if(modTMP.socket !== undefined){
						if(modTMP.options.work_on.socket === true){
							modules.socket.before[file] = modTMP;
							log.log(`\tModule "${file}" has hooked in socket before the request is processed.`);
							ModulesNB["socket"]++;
							t = true;
						}else{
							modules.socket.after[file] = modTMP;
							log.log(`\tModule "${file}" has hooked in socket after the request is processed.`);
							ModulesNB["socket"]++;
							t = true;
						}
					}else log.warn(`\tModule "${file}" specified wanting to hook in socket.io but didn't have a function, not using it.`);
				}
				if(t === false) log.warn(`\tModule "${file}" isn't doing anything.`);
			}else log.warn(`\tModule "${file}" didn't have options.`);
		}
	}
}
log.log(`\tFinished loading ${ModulesNB["http"]} http & ${ModulesNB["socket"]} socket modules.`);

log.log("\r\nLoading sites.");

let site = {};
site.http = {};
site.socket = {};

let siteNB = [];
siteNB["http"] =0;
siteNB["socket"] =0;

const PWeb =fs.readdirSync(config.path);
for (const dir of PWeb) {
	if(fs.statSync(`${config.path}${dir}`).isDirectory()){
		if (fs.existsSync (`${config.path}${dir}/index.js`)){
			if(!fs.statSync(`${config.path}${dir}/index.js`).isDirectory()){
				const modTMP = require(`${config.path}${dir}/index.js`);
				if(modTMP.http !== undefined){
					site.http[dir] = modTMP.http;
					log.log(`\tsite "${dir}" loaded in http.`);
					siteNB["http"]++;
				}else log.warn(`\tsite "${dir}" didn't have a http function, not using it then.`);
				if(modTMP.socket !== undefined){
					site.socket[dir] = modTMP.socket;
					log.log(`\tsite "${dir}" loaded in socket.`);
					siteNB["socket"]++;
				}else log.warn(`\tsite "${dir}" didn't have a socket function, not using it then.`);
			}else log.warn(`\tFound directory ${dir} but "index.js" is a directory, ignoring.`);
		}else log.warn(`\tFound directory ${dir} but didn't find "index.js" in it, ignoring.`);
	}
}
log.log(`\tFinished loading ${siteNB["http"]} http & ${siteNB["socket"]} socket modules.`);
ready = true;

process.on("SIGINT", () => {
	log.log("Stopping.");
	io.close();
	http.close(()=>{});
	https.close(()=>{});
	process.exit(0);
});