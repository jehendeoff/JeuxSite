
const options = {
	//jeuxsite
	work_on : {
		"http" : false, // false mean that it will run after the request is processed by jeuxsite 
	},
	
}; 

//const Http = require("http");
/**
 * 
 * @param {Http.IncomingMessage} req 
 * @param {Http.ServerResponse} res 
 * @returns [{Http.IncomingMessage}, {Http.ServerResponse}]
 */
function http (req, res) {
	let cookies = {};
	if(req.headers["cookie"] !== undefined){
		req.headers["cookie"].split(/; /gi).forEach(cookie => {
			const source = cookie.split("=")[0];
			const value = cookie.split("=")[1];
			cookies[source] = value;
		});
	}
	req.cookies = cookies;
	return req, res;
}

module.exports = {
	options, 
	http
};