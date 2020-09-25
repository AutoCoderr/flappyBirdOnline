const config = require("./config");

class Player {
	life;
	pipePassed;
	state;
	entity;
	socket;
	party;
	pseudo;
	wantToRestart;

	constructor(socket) {
		this.life = config.lifePerPlayer;
		this.pipePassed = 0;
		this.wantToRestart = false;
		this.setSocket(socket);
		this.state = "motionless";
	}

	setPseudo(pseudo) {
		this.pseudo = pseudo;
	}

	setParty(party) {
		this.party = party;
	}

	setEntity(entity) {
		this.entity = entity;
	}

	setSocket(socket) {
		this.socket = socket;
	}

}

module.exports = Player;
