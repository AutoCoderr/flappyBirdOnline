let config = {
	width: 600,
	height: 300,
	lifePerPlayer: 5,
	heightPerPlayer: 20
};

config.maxPlayerByParty = Math.floor((config.height/config.heightPerPlayer)/2);

config.diffAire = ((300+150)/2)/((config.width+config.height)/2);

config.spaceBetweenTwoPipe = 40/config.diffAire;

module.exports = config;
