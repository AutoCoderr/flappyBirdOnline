class Player {
	life;
	pipePassed;
	entity;
	socket;
	party;
	pseudo;

	constructor(socket) {
		this.life = 0;
		this.pipePassed = 0;
		this.setSocket(socket);
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
