class Player {
	life;
	pipePassed;
	entity;
	socket;

	constructor(entity) {
		this.life = 0;
		this.pipePassed = 0;
		this.setEntity(entity);
	}

	setEntity(entity) {
		this.entity = entity;
	}

	setSocket(socket) {
		this.socket = socket;
	}

}
