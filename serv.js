let http = require('http'),
	url = require('url'),
	fs = require('fs');

const graphismes = require("./graphismes.js"),
	config = require("./config");

const entities = require("./entities"),
	spawnEntitie = entities.spawnEntitie,
	stopEntitie = entities.stopEntitie,
	teleportEntitieTo = entities.teleportEntitieTo,
	moveEntitieTo = entities.moveEntitieTo,
	removeAllEntities = entities.removeAllEntities,
	removeEntitie = entities.removeEntitie;

const server = http.createServer(function(req, res) { // --------------------------> LE SERVEUR HTTP <------------------------------------------------------
	let page = url.parse(req.url).pathname;
	const param = url.parse(req.url).query;
	if (page == "/") {
		page = "/index.html"
	} else if (page == "/socket.io/") {
		page = "/socket.io/socket.io.js"
	}
	page = __dirname + page;
	const ext = page.split(".")[page.split(".").length-1]
	if (ext == "png" | ext == "jpg" | ext == "gif" | ext == "jpeg" | ext == "bmp" | ext == "tif" | ext == "tiff" | ext == "ico") {
		fs.readFile(page, function(error, content) {
			if(error){
				res.writeHead(404, {"Content-Type": "text/plain"});
				res.end("ERROR 404 : Page not found");
			} else {
				res.writeHead(200, {"Content-Type": "image/" + ext});
				res.end(content);
			}
		});
	} else {
		fs.readFile(page, 'utf-8', function(error, content) {
			if(error){
				res.writeHead(404, {"Content-Type": "text/plain"});
				res.end("ERROR 404 : Page not found");
			} else {
				if (page == "./serv.js") {
					res.writeHead(404, {"Content-Type": "text/plain"});
					res.end("ERROR 404 : Page not found");
				} else {
					res.writeHead(200, {"Content-Type": "text/html"});
					res.end(content);
				}
			}
		});
	}
});

const io = require('socket.io').listen(server);

io.sockets.on('connection', function (socket) {
	graphismes.socket.socket = socket;

	spawnEntitie(config.width/5,config.height/2,"player",1);
});

server.listen(3005);
