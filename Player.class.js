class Player {
	life;
	pipePassed;
	deplace;
	entity;
	socket;
	party;
	pseudo;

	constructor(socket) {
		this.life = 5;
		this.pipePassed = 0;
		this.setSocket(socket);
		this.deplace = false;
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
