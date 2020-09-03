const { createCanvas } = require('canvas');

class Party {
	players;
	canvas;
	firstStart;

	constructor() {
		this.players = [];
		this.canvas = createCanvas(config.width, config.height);
		this.firstStart = true;
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

}
