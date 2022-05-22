const fs = require("fs");
const http = require("http");
const SocketIO = require("socket.io");
/**
 * @param {http.IncomingMessage} req The request
 * @param {http.ServerResponse} res The response
 * @param {String} config The parsed config
 * @param {String} domain The parsed config
 */
exports.http = async (req, res, config, domain) => {
	res.writeHead(200, {
		"X-Frame-Options": "DENY",
		"X-Coded-By": "Jehende",
		"content-type": "text/html;charset=utf-8",
		"Cache-Control": "max-age=31536000"
	});
	res.write(fs.readFileSync(__dirname + "\\web\\index.html"));
	res.end();
	return;
};
/**
 * @param {SocketIO.Socket} socket The socket
 * @param {String} config The parsed config
 * @param {String} domain The parsed config
 */
exports.socket = async (socket, config, domain) => {
	socket.emit("success", "Socketio connected");
};