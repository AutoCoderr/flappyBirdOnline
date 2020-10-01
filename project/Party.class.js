const { createCanvas } = require('canvas'),
	Player = require("./Player.class"),
	Graphismes = require("./Graphismes.class"),
	Animations = require("./Animations.class"),
	Collisons = require("./Collisions.class"),
	GenerateCanvasInstructions = require("./GenerateCanvasInstructions.class"),
	Helpers = require("./Helpers.class");

const config = require("./config"),
	diffAire = config.diffAire,
	spaceBetweenTwoPipe = config.spaceBetweenTwoPipe,
	widthCanvas = config.width,
	heightCanvas = config.height;

const paramsEntities = {
	player: {
		w: 5/diffAire,
		h: 6/diffAire,
		radius: 2.5/diffAire,
		color: config.baseColorOfPlayer
	},
	pipe: {
		w: 25/diffAire,
		h: 50/diffAire
	},
	pipeUpsideDown: {
		w: 25/diffAire,
		h: 50/diffAire
	},
	pipeDetector: {
		w: 25/diffAire,
		h: spaceBetweenTwoPipe-8,
		alreadyCounted: false
	}
};

class Party {
	players;
	canvas;
	firstStart;
	entities;
	graphismes;
	animations;
	collisions;
	canPlay;
	timeoutPutTuyaux;
	intervalNewParty;
	timeoutNewParty;
	intervalCountDown;
	started;
	finished;
	admin;

	constructor(admin) {
		this.players = [];
		this.setCanvas(createCanvas(config.width, config.height));
		this.setAdmin(admin);
		this.firstStart = true;
		this.entities = {};
		this.canPlay = false;
		this.started = false;
		this.finished = false;
		this.graphismes = new Graphismes(this);
		this.animations = new Animations(this);
		this.collisions = new Collisons(this);
		this.intervalNewParty = null;
		this.timeoutNewParty = null;
		this.timeoutPutTuyaux = null;
		this.intervalCountDown = null;
	}

	setAdmin(admin) {
		this.admin = admin;
	}

	setCanvas(canvas) {
		this.canvas = canvas;
	}

	setPlayers(players) {
		this.players = players;
	}

	addPlayer(player) {
		this.players.push(player);
	}

	removePlayer(player) {
		for (let i=0;i<this.players.length;i++) {
			if (this.players[i].pseudo === player.pseudo) {
				if (player.entity != null) {
					this.removeEntitie(this.players[i].entity.id);
				}
				player.party = null;
				player.entity = null;
				player.deplace = false;
				player.pipePassed = 0;
				player.life = config.lifePerPlayer;
				this.broadcastMsgs(this.players[i].pseudo+" a quitté la partie", "warning", this.players[i]);
				this.players.splice(i,1);
				return true;
			}

		}
		return false;
	}


	spawnEntitie(x,y,type,id = null,specificsParams = null) {
		if (id != null && typeof(this.entities[id]) != "undefined") {
			console.log("Entity already exist");
			return;
		} else {
			id = 1;
			while (typeof(this.entities[id]) != "undefined") {
				id += 1;
			}
		}
		this.entities[id] = {
			id: id,
			x: x,
			y: y,
			w: 0,
			h: 0,
			coefX: 0,
			coefY: 0,
			type: type,
			exist: true,
			timeout: null,
			deplacing: false,
			toDisplay: "default"
		};
		if (typeof(paramsEntities[type]) != "undefined") {
			for (let key in paramsEntities[type]) {
				this.entities[id][key] = paramsEntities[type][key];
			}
		}
		if (specificsParams != null) {
			for (let key in specificsParams) {
				this.entities[id][key] = specificsParams[key];
			}
		}
		let collisions = this.checkCollisions(this.entities[id]);
		x = this.entities[id].x;
		y = this.entities[id].y;
		while (collisions !== false && (typeof(collisions.reaction) == "undefined" || collisions.reaction) && typeof(this.entities[id]) != "undefined") {
			if (x <= 0 | x+this.entities[id].w >= widthCanvas | y <= 0 | y+this.entities[id].h >= heightCanvas) {
				if (x+this.entities[id].w >= widthCanvas) {
					x -= 5;
				} else if (x <= 0) {
					x += 5;
				}
				if (y <= 0) {
					y += 5;
				} else if (y+this.entities[id].h >= heightCanvas) {
					y -= 5;
				}
			} else {
				y += 5;
				x -= 5;
			}
			this.entities[id].x = x;
			this.entities[id].y = y;
			collisions = this.checkCollisions(this.entities[id]);
		}
		if (typeof(this.entities[id]) != "undefined") {
			this.graphismes.display(this.entities[id]);
		}
		return id;
	}

	removeEntitie(id) {
		if (typeof(this.entities[id]) == "undefined") {
			console.log("Entity not found");
			return;
		}
		this.entities[id].exist = false;
		if (this.entities[id].timeout != null) clearTimeout(this.entities[id].timeout);
		this.graphismes.hide(this.entities[id]);
		if (typeof(this.entities[id].player) != "undefined") {
			this.entities[id].player.entity = null;
		}
		delete this.entities[id];
	}

	removeAllEntities() {
		for (let id in this.entities) {
			this.removeEntitie(id);
		}
	}

	moveEntitieTo(id,xB,yB,ms,alterSpeed) {
		if (typeof(this.entities[id]) == "undefined") {
			console.log("Entity not found : "+id);
			console.log(this.entities[id]);
			return;
		}
		this.animations.moveFromTo(this.entities[id],xB,yB,ms,alterSpeed);
	}

	stopEntitie(id) {
		if (typeof(this.entities[id]) == "undefined") {
			console.log("Entity not found");
			return;
		}
		let entity = this.entities[id];
		if (entity.timeout != null) clearTimeout(entity.timeout);
		entity.coefX = 0;
		entity.coefY = 0;
		entity.deplacing = false;
	}

	stopAllEntities() {
		for (let id in this.entities) {
			this.stopEntitie(id);
		}
	}

	teleportEntitieTo(id,x,y) {
		if (typeof(this.entities[id]) == "undefined") {
			console.log("Entity not found");
			return;
		}
		this.stopEntitie(id);
		let entity = this.entities[id];
		this.graphismes.hide(entity);
		entity.x = x;
		entity.y = y;
		this.graphismes.display(entity);
	}

	checkCollisions(entity) {
		if (entity.x <= 0 | entity.x+entity.w >= widthCanvas) {
			const collision = this.collisions.exec(entity,{type: "bord", pos: (entity.x <= 0 ? "gauche" : "droite")});
			if (collision != null && collision !== false) return collision;
		} else if (entity.y <= 0 | entity.y+entity.h >= heightCanvas) {
			const collision = this.collisions.exec(entity,{type: "bord", pos: (entity.y <= 0 ? "haut" : "bas")});
			if (collision != null && collision !== false) return collision;
		}

		let otherEntity;
		for (let id in this.entities) {
			if (id != entity.id) {
				otherEntity = this.entities[id];

				if ((((entity.x <= otherEntity.x & otherEntity.x <= entity.x+entity.w) |
					(entity.x <= otherEntity.x+otherEntity.w & otherEntity.x+otherEntity.w <= entity.x+entity.w))
					&
					((entity.y <= otherEntity.y & otherEntity.y <= entity.y+entity.h) |
						(entity.y <= otherEntity.y+otherEntity.h & otherEntity.y+otherEntity.h <= entity.y+entity.h)))

					|

					(((entity.x < otherEntity.x & otherEntity.x+otherEntity.w < entity.x+entity.w) |
						(otherEntity.x < entity.x & entity.x+entity.w < otherEntity.x+otherEntity.w))
						&
						((entity.y < otherEntity.y & otherEntity.y+otherEntity.h < entity.y+entity.h) |
							(otherEntity.y < entity.y & entity.y+entity.h < otherEntity.y+otherEntity.h)))

					|

					(((entity.x < otherEntity.x & otherEntity.x+otherEntity.w < entity.x+entity.w) |
						(otherEntity.x < entity.x & entity.x+entity.w < otherEntity.x+otherEntity.w))
						&
						((entity.y <= otherEntity.y & otherEntity.y <= entity.y+entity.h) |
							(entity.y <= otherEntity.y+otherEntity.h & otherEntity.y+otherEntity.h <= entity.y+entity.h)))

					|

					(((entity.x <= otherEntity.x & otherEntity.x <= entity.x+entity.w) |
						(entity.x <= otherEntity.x+otherEntity.w & otherEntity.x+otherEntity.w <= entity.x+entity.w))
						&
						((entity.y < otherEntity.y & otherEntity.y+otherEntity.h < entity.y+entity.h) |
							(otherEntity.y < entity.y & entity.y+entity.h < otherEntity.y+otherEntity.h)))
				) {
					return this.collisions.exec(entity,otherEntity);
				}
			}
		}
		return false;
	}

	flyBird(player) {
		if (player.entity == null) {
			return;
		}
		if (this.canPlay && this.started) {
			player.deplace = "flying";
			const entity = player.entity;
			this.stopEntitie(entity.id);
			entity.toDisplay = "toUp";
			this.moveEntitieTo(entity.id, entity.x, Math.max(entity.y-40, 0),15*diffAire);
			if (this.firstStart) {
				this.broadcastRemoveMsgs();
				player.pipePassed = 0;
				player.socket.emit("display_pipes_passed", player.pipePassed);
				this.broadcastSomethings((aPlayer) => {
					this.releaseBird(aPlayer)
				}, player);
				this.firstStart = false;
				this.putPipes();
			}
		}
	}

	releaseBird(player) {
		if (player.entity == null) {
			return;
		}
		if (this.canPlay && player.state !== "falling" && this.started) {
			player.deplace = "falling";
			const entity = player.entity;
			this.stopEntitie(entity.id);
			entity.toDisplay = "default";
			this.moveEntitieTo(entity.id,entity.x,heightCanvas, 45 *diffAire, {to: 15*diffAire, before: 20});
		}
	}

	putPipes() {
		const yPos = Helpers.rand(heightCanvas/10+spaceBetweenTwoPipe,heightCanvas*0.9);
		const idTuyauxA = this.spawnEntitie(widthCanvas-30,yPos,"pipe",null,{h: heightCanvas-yPos});
		const idTuyauxB = this.spawnEntitie(widthCanvas-30,2,"pipeUpsideDown",null,{h: yPos-spaceBetweenTwoPipe});
		const idPipeDetector = this.spawnEntitie(widthCanvas-30,yPos-spaceBetweenTwoPipe+4,"pipeDetector");
		this.moveEntitieTo(idTuyauxA,0,this.entities[idTuyauxA].y,20*diffAire);
		this.moveEntitieTo(idTuyauxB,0,this.entities[idTuyauxB].y,20*diffAire);
		this.moveEntitieTo(idPipeDetector,0,this.entities[idPipeDetector].y,20*diffAire);
		this.timeoutPutTuyaux = setTimeout(() => {
			this.putPipes();
		},2000);
	}

	broadcastCanvas(instructions) {
		this.broadcastSomethings((player) => {
			player.socket.emit("update_level", instructions);
		});
	}

	broadcastMsgs(msgs, type, exceptPlayers) {
		this.broadcastSomethings((player) => {
			player.socket.emit("display_msgs", {type, msgs});
		}, exceptPlayers);
	}

	broadcastRemoveMsgs(exceptPlayers) {
		this.broadcastSomethings((player) => {
			player.socket.emit("remove_msgs");
		}, exceptPlayers)
	}

	broadcastSomethings(callback, exceptPlayers = null, atFinish = null) {
		for(let i=0;i<this.players.length;i++) {
			let excepted = false;
			if (exceptPlayers instanceof Array) {
				for (let j = 0; j < exceptPlayers.length; j++) {
					if (exceptPlayers[j].pseudo === this.players[i].pseudo) {
						excepted = true;
						break;
					}
				}
			} else if (exceptPlayers instanceof Player && exceptPlayers.pseudo === this.players[i].pseudo) {
				excepted = true;
			}
			if (!excepted) {
				callback(this.players[i]);
			}
		}
		let excepted = false;
		if (exceptPlayers instanceof Array) {
			for (let j = 0; j < exceptPlayers.length; j++) {
				if (exceptPlayers[j].pseudo === this.admin.pseudo) {
					excepted = true;
					break;
				}
			}
		} else if (exceptPlayers instanceof Player && exceptPlayers.pseudo === this.admin.pseudo) {
			excepted = true
		}
		if (!excepted) {
			callback(this.admin);
		}
		if (typeof(atFinish) == "function") {
			atFinish();
		}
	}

	stopParty(player) {
		if (player.pseudo === this.admin.pseudo) {
			if (this.started) {
				this.removeAllEntities();
			}
			if (this.intervalNewParty != null) {
				clearInterval(this.intervalNewParty);
			}
			if (this.timeoutNewParty != null) {
				clearInterval(this.timeoutNewParty);
			}
			if (this.intervalCountDown != null) {
				clearInterval(this.intervalCountDown);
			}
			this.broadcastSomethings((aPlayer) => {
				aPlayer.socket.emit("stop_party");
				aPlayer.socket.emit("remove_msgs");
				aPlayer.party = null;
				aPlayer.entity = null;
				aPlayer.deplace = false;
				aPlayer.pipePassed = 0;
				aPlayer.life = config.lifePerPlayer;
			});
		} else {
			this.removePlayer(player);
			let party_players = this.getPseudoList();
			this.broadcastSomethings((player) => {
				player.socket.emit("display_party_players", {admin: this.admin.pseudo, players: party_players});
			});
		}
	}

	writeBorder(pos = null) {
		let context = new GenerateCanvasInstructions();
		context.setStrokeStyle("black");
		context.beginPath();
		if (pos == null || pos === "haut") {
			context.clearRect(-1,-1,widthCanvas+2,4);
			context.moveTo(0,0);
			context.lineTo(widthCanvas,0);
		}
		if (pos == null || pos === "bas") {
			context.clearRect(-1,heightCanvas-1,widthCanvas+2,4);
			context.moveTo(0,heightCanvas);
			context.lineTo(widthCanvas,heightCanvas);
		}
		if (pos == null || pos === "gauche") {
			context.clearRect(-1,-1,4,heightCanvas+2);
			context.moveTo(0,0);
			context.lineTo(0,heightCanvas);
		}
		if (pos == null || pos === "droite") {
			context.clearRect(widthCanvas-1,-1,4,heightCanvas+2);
			context.moveTo(widthCanvas,0);
			context.lineTo(widthCanvas,heightCanvas);
		}
		context.stroke();
		this.broadcastCanvas(context.instructions);
	}

	lostPV(player) {
		this.broadcastSomethings((player) => {
			player.entity.toDisplay = "default";
		});
		this.canPlay = false;
		player.life -= 1;
		player.socket.emit("display_life", player.life);
		clearInterval(this.timeoutPutTuyaux);
		this.timeoutPutTuyaux = null;
		this.stopAllEntities();
		if (player.life > 0) {
			player.socket.emit("display_msgs", {type: "warning", msgs: "Vous avez perdu une vie"});
			this.broadcastMsgs(player.pseudo+" a perdu une vie", "warning", player);
			this.countDown();
		} else {
			this.finished = true;
			this.players.sort((a,b) => b.life - a.life);
			let nb = 1;
			this.broadcastSomethings((aPlayer) => {
				aPlayer.socket.emit("display_msgs", {msgs: "Partie terminée, vous êtes numéro "+nb, type: "warning"});
				nb += 1;
			});
			this.newParty();
		}
		return {action: "stopAnime"};
	}

	newParty() {
		this.broadcastSomethings((player) => {
			player.pipePassed = 0;
			player.life = config.lifePerPlayer;
		});
		this.broadcastSomethings((player) => {
			player.socket.emit("choose_restart_party");
			player.wantToRestart = false;
		}, this.admin);

		let sec = 10;
		this.timeoutNewParty = setTimeout(() => {
			this.timeoutNewParty = null;
			this.intervalNewParty = setInterval(() => {
				if (sec <= 0) {
					this.writeBorder();
					this.removeAllEntities();

					clearInterval(this.intervalNewParty);
					this.intervalNewParty = null;
					let playersToRemove = [];
					for (let i=0;i<this.players.length;i++) {
						if (!this.players[i].wantToRestart) {
							playersToRemove.push(this.players[i]);
						}
					}
					for (let i=0;i<playersToRemove.length;i++) {
						playersToRemove[i].socket.emit("stop_party");
						playersToRemove[i].socket.emit("remove_msgs");
						this.removePlayer(playersToRemove[i]);
					}
					this.startParty();
				} else {
					this.broadcastMsgs("Recommencement de la partie dans " + sec + " secondes", "info");
					sec -= 1;
				}
			}, 1000);

		}, 2000);
	}

	startParty() {
		this.finished = false;
		this.started = true;
		let nb = 0;
		this.broadcastSomethings((player) => {
			player.socket.emit("start_party");
			player.socket.emit("display_life", player.life);
			player.socket.emit("display_msgs", {msgs: "Appuyez sur espace pour commencer", type: "warning"});
		}, null, () => {
			this.writeBorder();
			this.broadcastSomethings((player) => {
				const id = this.spawnEntitie(config.width/5,(config.height/2) + config.heightPerPlayer*(this.players.length+1)/2 - nb*config.heightPerPlayer,
					"player", null,
					{
						player: player,
						color: (player.pseudo !== player.party.admin.pseudo) ? Helpers.generateVariantColorFromBase(config.baseColorOfPlayer) : "#ffff00",
						toExecuteWhenStopped: (entity) => {
							this.releaseBird(entity.player)
						}
					});
				let entity = this.entities[id];
				player.setEntity(entity);
				nb += 1;
			},
				null, () => {
					this.canPlay = true;
					this.firstStart = true;
			});
		});
	}

	countDown(sec = 3) {
		this.intervalCountDown = setInterval(() => {
			if (sec > 0) {
				this.broadcastMsgs("Recommencement dans "+sec+" secondes", "warning");
			} else {
				this.deleteAllPipes();
				this.writeBorder();
				let nb = 0;
				this.broadcastSomethings((aPlayer) => {
					this.teleportEntitieTo(aPlayer.entity.id, widthCanvas / 5, (heightCanvas/2) + config.heightPerPlayer*(this.players.length+1)/2 - nb*config.heightPerPlayer);
					aPlayer.state = "motionless";
					nb += 1;
				});
				this.broadcastMsgs("C'est partit!!", "warning");
				this.broadcastMsgs("Appuyez sur espace pour commencer", "warning")
				this.canPlay = true;
				this.firstStart = true;

				clearInterval(this.intervalCountDown);
				this.intervalCountDown = null;
				setTimeout(() => {
					this.broadcastRemoveMsgs();
				}, 1000);
			}
			sec -= 1;
		}, 1000);
	}

	deleteAllPipes() {
		for (let id in this.entities) {
			if (this.entities[id].type === "pipe" || this.entities[id].type === "pipeUpsideDown" || this.entities[id].type === "pipeDetector") {
				this.removeEntitie(id);
			}
		}
	}

	getPseudoList() {
		let pseudos = [];
		for (let i=0;i<this.players.length;i++) {
			pseudos.push(this.players[i].pseudo);
		}
		return pseudos;
	}
}

module.exports = Party;
