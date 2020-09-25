class Helpers {
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
}

module.exports = Helpers;
