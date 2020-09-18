let http = require('http'),
	url = require('url'),
	fs = require('fs');

const Party = require("./Party.class"),
	Player = require("./Player.class");

let players = {};
let parties = [];

const extension_per_mime = {
	"text/css": ["css"],
	"text/html": ["html","htm"],
	"text/javascript": ["js"],
	"image/{ext}": ["png", "jpg", "gif", "jpeg", "bmp", "tif", "tiff", "ico"]
};

let mime_per_extension = {};

for (let mime in extension_per_mime) {
	const extensions = extension_per_mime[mime];
	for (let i=0;i<extensions.length;i++) {
		mime_per_extension[extensions[i]] = mime.replace("{ext}", extensions[i]);
	}
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
					"Content-Type": typeof (mime_per_extension[ext]) != "undefined" ? mime_per_extension[ext] : "text/plain"
				});
				res.end(content);
			}
		});
	} else {
		res.writeHead(403, {"Content-Type": "text/plain"});
		res.end("ERROR 403 : Access Forbidden");
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
		players[pseudo+nb] = player;
		socket.player = player;
		socket.emit("login_successfull", config);
	});

	socket.on('disconnect',function(){
		if (typeof(socket.player) != "undefined" && socket.player.party != null) {
			quitParty(socket);
			delete players[socket.player.pseudo];
		}
	});

	socket.on("quit_party", function () {
		if (typeof(socket.player) != "undefined" && socket.player.party != null) {
			quitParty(socket);
		}
	});

	socket.on("create_party", function () {
		if (typeof(socket.player) == "undefined" || socket.player.party != null) {
			return;
		}
		let party = new Party(socket.player);
		parties.push(party);
		socket.player.party = party;
		socket.emit("display_party_players", {admin: socket.player.pseudo, players: []});
		displayAllParties(socket.broadcast);
	});

	socket.on("get_parties", function () {
		if (typeof(socket.player) == "undefined" || socket.player.party != null) {
			return;
		}
		displayAllParties(socket);
	});

	socket.on("join_party", function (adminPseudo) {
		if (typeof(socket.player) == "undefined" || socket.player.party != null) {
			return;
		}
		if (typeof(players[adminPseudo]) == "undefined") {
			return;
		}
		if (players[adminPseudo].party == null) {
			return;
		}
		if (players[adminPseudo].party.started) {
			return;
		}
		let party = players[adminPseudo].party;
		party.addPlayer(socket.player);
		let party_players = party.getPseudoList();
		socket.player.party = party;
		party.broadcastSomethings((player) => {
			player.socket.emit("display_party_players", {admin: party.admin.pseudo, players: party_players});
		});
	});

	socket.on("start_party", function () {
		if (typeof(socket.player) != "undefined" && socket.player.party != null) {
			let party = socket.player.party;
			if (party.admin.pseudo !== socket.player.pseudo) {
				socket.emit("display_msgs", {type: "error", msgs: "Vous n'êtes pas l'admin de cette partie"});
				return;
			}
			if (party.started) {
				socket.emit("display_msgs", {type: "error", msgs: "Votre partie est déjà en cours"});
				return;
			}
			if (party.players.length === 0) {
				socket.emit("display_msgs", {type: "error", msgs: "Vous êtes encore seul dans cette partie"});
				return;
			}
			party.started = true;
			const heightPerPlayer = 20;
			let nb = 0;
			party.broadcastSomethings((player) => {
				player.socket.emit("start_party");
				player.socket.emit("display_life", player.life);
			}, null, () => {
				party.broadcastSomethings((player) => {
					const id = party.spawnEntitie(config.width/5,(config.height/2) + heightPerPlayer*(party.players.length+1)/2 - nb*heightPerPlayer, "player");
					let entity = party.entities[id];
					player.setEntity(entity);
					entity.player = player;
					nb += 1;
				});
			});
		}
	});

	socket.on("single_party", function () {
		if (typeof(socket.player) == "undefined" || socket.player.party != null) {
			return;
		}
		socket.emit("start_party");
		let party = new Party(socket.player);
		party.started = true;
		parties.push(party);
		socket.player.setParty(party);
		socket.emit("display_life", socket.player.life);
		party.spawnEntitie(config.width/5,config.height/2,"player",1);
		party.writeBorder();
		socket.player.setEntity(party.entities[1]);
		party.entities[1].player = socket.player;
	});

	socket.on("fly_bird", function () {
		if (typeof(socket.player) == "undefined") {
			return;
		}
		socket.player.party.flyBird(socket.player);
	});

	socket.on("release_bird", function () {
		if (typeof(socket.player) == "undefined") {
			return;
		}
		socket.player.party.releaseBird(socket.player);
	});
});

function removeParty(party) {
	for (let i=0;i<parties.length;i++) {
		if (party.admin.pseudo === parties[i].admin.pseudo) {
			parties.splice(i,1);
			return true;
		}
	}
	return false;
}

function displayAllParties(socket) {
	let partyList = [];
	for (let i=0;i<parties.length;i++) {
		if (!parties[i].started) {
			partyList.push({admin: parties[i].admin.pseudo, nbPlayers: parties[i].players.length+1});
		}
	}
	socket.emit("display_parties", partyList);
}

function quitParty(socket) {
	if (socket.player.pseudo === socket.player.party.admin.pseudo) {
		removeParty(socket.player.party);
		displayAllParties(socket.broadcast);
	}
	socket.player.party.stopParty(socket.player);
}

server.listen(3005);
