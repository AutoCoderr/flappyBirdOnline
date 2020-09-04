const { createCanvas } = require('canvas');
const collisions = require("./collisions");
const Graphismes = require("./Graphismes.class");
const Animations = require("./Animations.class");
const config = require("./config"),
	diffAire = config.diffAire,
	spaceBetweenTwoPipe = config.spaceBetweenTwoPipe,
	widthCanvas = config.width,
	heightCanvas = config.height;

const paramsEntities = {
	player: {
		w: 7/diffAire,
		h: 7/diffAire,
		radius: 3/diffAire
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

	constructor() {
		this.players = [];
		this.setCanvas(createCanvas(config.width, config.height));
		this.firstStart = true;
		this.entities = {};
		this.graphismes = new Graphismes(this);
		this.animations = new Animations(this);
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
			if (typeof(collisions[entity.type]) != "undefined") {
				if (typeof(collisions[entity.type].bord) != "undefined") {
					const collision = collisions[entity.type].bord(entity,{pos: (entity.x <= 0 ? "gauche" : "droite")});
					if (collision != null && collision !== false) return collision;
				} else {
					return {action: "stopEntity"};
				}
			} else {
				return {action: "stopEntity"};
			}
		} else if (entity.y <= 0 | entity.y+entity.h >= heightCanvas) {
			if (typeof(collisions[entity.type]) != "undefined") {
				if (typeof(collisions[entity.type].bord) != "undefined") {
					const collision = collisions[entity.type].bord(entity,{pos: (entity.y <= 0 ? "haut" : "bas")});
					if (collision != null && collision !== false) return collision;
				} else {
					return {action: "stopEntity"};
				}
			} else {
				return {action: "stopEntity"};
			}
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
					if (typeof(collisions[entity.type]) != "undefined") {
						if (typeof(collisions[entity.type][otherEntity.type]) != "undefined") {
							return collisions[entity.type][otherEntity.type](entity,otherEntity);
						} else {
							return true;
						}
					} else {
						return true;
					}
				}
			}
		}
		return false;
	}

	sendCanvasToAllPlayers() {
		for (let i=0;i<this.players.length;i++) {
			this.players[i].socket.emit("updateLevel", this.canvas.toDataURL());
		}
	}

}

module.exports = Party;
