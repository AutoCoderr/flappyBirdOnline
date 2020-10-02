class Helpers {
	static players = {};
	static parties = [];

	static generateVariantColorFromBase(base) {
		const valueToChange = 150;

		let R = parseInt(base.substring(1,3), 16);
		let G = parseInt(base.substring(3,5), 16);
		let B = parseInt(base.substring(5,7), 16);

		R = Helpers.rand(Math.max(0,R-valueToChange),Math.min(255,R+valueToChange));
		G = Helpers.rand(Math.max(0,G-valueToChange),Math.min(255,G+valueToChange));
		B = Helpers.rand(Math.max(0,B-valueToChange),Math.min(255,B+valueToChange));

		return '#'+Helpers.addMissingZero(R.toString(16)) + Helpers.addMissingZero(G.toString(16)) + Helpers.addMissingZero(B.toString(16));
	}

	static rand(a,b) {
		return a+Math.floor(Math.random()*(b+1-a));
	}

	static addMissingZero(num,n = 2) {
		num = num.toString();
		while (num.length < n) {
			num = '0'+num;
		}
		return num;
	}

	static removeParty(party) {
		for (let i=0;i<Helpers.parties.length;i++) {
			if (party.admin.pseudo === Helpers.parties[i].admin.pseudo) {
				Helpers.parties.splice(i,1);
				return true;
			}
		}
		return false;
	}

	static displayAllParties(socket) {
		let partyList = [];
		for (let i=0;i<Helpers.parties.length;i++) {
			if (!Helpers.parties[i].started) {
				partyList.push({admin: Helpers.parties[i].admin.pseudo, nbPlayers: Helpers.parties[i].players.length+1});
			}
		}
		socket.emit("display_parties", partyList);
	}

	static quitParty(socket) {
		if (socket.player.pseudo === socket.player.party.admin.pseudo) {
			Helpers.removeParty(socket.player.party);
		}
		socket.player.party.stopParty(socket.player);

		Helpers.displayAllParties(socket.broadcast);
	}
}

module.exports = Helpers;
