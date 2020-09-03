let life = 5,
	pipePassed = 0,
	deplace = false,
	timeoutPutTuyaux,
	timeoutAfterPause,
	isMobile = false,
	canPlay = true,
	paused = false,
	firstStart = true;

document.getElementById("life").innerText = life;
document.getElementById("pipePassed").innerText = pipePassed;

document.onkeydown = function (){
	switch (event.keyCode) {
		case 32: // espace
			flyBird();
	}
};

document.onkeyup = function (){
	switch (event.keyCode) {
		case 32: // espace
			releaseBird();
	}
};

window.addEventListener('touchstart', function() {
	isMobile = true;
	flyBird();
});
window.addEventListener('touchend', function() {
	releaseBird();
});
window.oncontextmenu = function(event) {
	if (isMobile) event.preventDefault();
};

spawnEntitie(widthCanvas/5,heightCanvas/2,"player",1);
writeBorder();

function flyBird() {
	if (canPlay && !deplace) {
		deplace = true;
		stopEntitie(1);
		entities[1].toDisplay = "toUp";
		moveEntitieTo(1, entities[1].x,0,15*diffAire);
		if (paused || firstStart) {
			document.getElementById("msg").innerText = "";
			document.getElementById("pauseButton").style.display = "block";
		}
		if (firstStart) {
			pipePassed = 0;
			document.getElementById("pipePassed").innerText = pipePassed;
			firstStart = false;
			putPipes();
		} else if (paused) {
			for (let id in entities) {
				if (entities[id].type === "pipeUpsideDown" || entities[id].type === "pipe") {
					moveEntitieTo(id, 0, entities[id].y, 20 * diffAire);
				}
			}
			clearTimeout(timeoutAfterPause);
			timeoutAfterPause = setTimeout(() => {
				putPipes();
			}, 2000);
			paused = false;
		}
	}
}
function releaseBird() {
	if (canPlay && deplace) {
		deplace = false;
		stopEntitie(1);
		entities[1].toDisplay = "default";
		moveEntitieTo(1,entities[1].x,heightCanvas, 45 *diffAire, {to: 15*diffAire, before: 20});
	}
}

function putPipes() {
	const yPos = rand(heightCanvas/10+spaceBetweenTwoPipe,heightCanvas*0.9);
	const idTuyauxA = spawnEntitie(widthCanvas-30,yPos,"pipe",null,{h: heightCanvas-yPos});
	const idTuyauxB = spawnEntitie(widthCanvas-30,2,"pipeUpsideDown",null,{h: yPos-spaceBetweenTwoPipe});
	const idPipeDetector = spawnEntitie(widthCanvas-30,yPos-spaceBetweenTwoPipe+4,"pipeDetector");
	moveEntitieTo(idTuyauxA,0,entities[idTuyauxA].y,20*diffAire);
	moveEntitieTo(idTuyauxB,0,entities[idTuyauxB].y,20*diffAire);
	moveEntitieTo(idPipeDetector,0,entities[idPipeDetector].y,20*diffAire);
	timeoutPutTuyaux = setTimeout(() => {
		putPipes();
	},2000);
}

function lostPV() {
	entities[1].toDisplay = "default";
	canPlay = false;
	life -= 1;
	document.getElementById("life").innerText = life;
	if (life > 0) {
		document.getElementById("msg").innerText = "Vous avez perdu une vie";
		teleportEntitieTo(1,widthCanvas/5,heightCanvas/2);
	} else {
		document.getElementById("msg").innerText = "Vous êtes mort";
	}
	document.getElementById("msg").style.color = "red";
	teleportEntitieTo(1,widthCanvas/5,heightCanvas/2);
	clearInterval(timeoutPutTuyaux);
	timeoutPutTuyaux = null;
	deleteAllPipes();
	writeBorder();
	document.getElementById("pauseButton").style.display = "none";
	if (life > 0) {
		setTimeout(() => {
			canPlay = true;
			firstStart = true;
		}, 500);
	}
	return {action: "stopAnime"};
}

function deleteAllPipes() {
	for (let id in entities) {
		if (entities[id].type === "pipe" || entities[id].type === "pipeUpsideDown" || entities[id].type === "pipeDetector") {
			removeEntitie(id);
		}
	}
}

function rand(a,b) {
	return Math.round(a+Math.random()*(b-a));
}

function writeBorder(pos = null) {
	let canvas  = document.querySelector('#canvas');
	let context = canvas.getContext('2d');
	context.strokeStyle = "black";
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
}

function pause() {
	paused = true;
	if (timeoutPutTuyaux != null)  {
		clearTimeout(timeoutPutTuyaux);
		timeoutPutTuyaux = null;
		clearTimeout(timeoutAfterPause);
		timeoutAfterPause = null
	}
	for (let id in entities) {
		stopEntitie(id);
	}
	document.getElementById("msg").style.color = "black";
	document.getElementById("msg").innerText = "Appuyez sur espace ou sur votre écran pour reprendre";
	document.getElementById("pauseButton").style.display = "none"
}
