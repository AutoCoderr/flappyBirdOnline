let http = require('http'),
	url = require('url'),
	fs = require('fs');

const Party = require("./Party.class"),
	Player = require("./Player.class");

let players = {};

const mime_per_extention = {
	"css": "text/css",
	"html": "text/html",
	"htm": "text/html",
	"js": "text/javascript"
}

const forbidden_path = ["node_modules"];

const forbidden_extentions = ["js","json","gitignore"];

const authorized_files = ["socket.io.js"];


const config = require("./config");

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
		let authorized = true;

		const ext = page.split(".")[page.split(".").length-1];
		const filename = page.split("/")[page.split("/").length-1];

		for (let i=0;i<forbidden_path.length;i++) {
			if (
				page.length >= forbidden_path[i].length &&
				page.substring(0,forbidden_path[i].length) === forbidden_path[i]
			) {
				authorized = false;
				break;
			}
		}

		if (authorized) {

			for (let i = 0; i < forbidden_extentions.length; i++) {
				if (ext === forbidden_extentions[i]) {
					authorized = false;
					break;
				}
			}
			if (!authorized) {
				for (let i = 0; i < authorized_files.length; i++) {
					if (filename === authorized_files[i]) {
						authorized = true;
						break;
					}
				}
			}
		}
		if (authorized) {
			fs.readFile(page, 'utf-8', function (error, content) {
				if (error) {
					res.writeHead(404, {"Content-Type": "text/plain"});
					res.end("ERROR 404 : Page not found");
				} else {
					res.writeHead(200, {
						"Content-Type": typeof (mime_per_extention[ext]) != "undefined" ? mime_per_extention[ext] : "text/plain"
					});
					res.end(content);
				}
			});
		} else {
			res.writeHead(403, {"Content-Type": "text/plain"});
			res.end("ERROR 403 : Access Forbidden");
		}
	}
});

const io = require('socket.io').listen(server);

io.sockets.on('connection', function (socket) {

	socket.on("login", function (pseudo) {
		if (typeof(socket.player) != "undefined") {
			return;
		}
		let nb = "";
		while (typeof(players[pseudo+nb]) != "undefined") {
			if (nb === "") {
				nb = 2;
			} else {
				nb += 1;
			}
		}
		let player = new Player(socket);
		player.setPseudo(pseudo+nb);
		players[pseudo+nb] = player
		socket.player = player;
		socket.emit("login_successfull");
	});

	socket.on('disconnect',function(){
		if (typeof(socket.player) != "undefined") {
			delete players[socket.player.pseudo];
		}
	});

	socket.on("single_party", function () {
		if (typeof(socket.player) == "undefined" || socket.player.party != null) {
			return;
		}
		socket.emit("start_party");
		let party = new Party();
		party.addPlayer(socket.player);
		socket.player.party = party;
		party.spawnEntitie(config.width/5,config.height/2,"player",1);
	});
});

server.listen(3005);
