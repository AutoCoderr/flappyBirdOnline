let canvas  = document.querySelector('#canvas');
let context = canvas.getContext('2d');

const colorByMessageType = {"info": "green", "warning": "orange", "error": "red"};

const socket = io.connect('http://' + location.hostname + ':' + location.port);



// Listen on websocket

socket.on("update_level", function (instructions) {
	for (let i=0;i<instructions.length;i++) {
		if (typeof(instructions[i].func) == "string" && typeof(instructions[i].args) == "object" && instructions[i].args instanceof Array) {
			context[instructions[i].func](...instructions[i].args);
		} else if (typeof(instructions[i].key) == "string" && typeof(instructions[i].val) == "string") {
			context[instructions[i].key] = instructions[i].val;
		}
	}
});

socket.on("start_party", function () {
	hide("go_to_menu_button");
	hide("choose_party_type");
	hide("prepare_party");
	display("display_party");
	context.clearRect(0, 0, canvas.width, canvas.height);
});

socket.on("login_successfull", function (config) {
	hide("login");
	display("choose_party_type");
	canvas.width = config.width;
	canvas.height = config.height;
});

socket.on("stop_party", function () {
	hide("display_party");
	hide("prepare_party");
	display("list_parties");
	display("go_to_menu_button");
});

socket.on("display_msgs", function (data) {
	if (typeof(data.msgs) == "string") {
		setHtml("msgs", "<span style='color: "+colorByMessageType[data.type]+"'>"+data.msgs+"</span>");
	} else if (typeof(data.msgs) == "object" && data.msgs instanceof Array) {
		let str = "<ul>";
		for (let i = 0; i < data.msgs.length; i++) {
			str += "<li style='color: "+colorByMessageType[data.type]+"'>" + data.msgs[i] + "</li>";
		}
		str += "</ul>";
		setHtml("msgs", str);
	}
});

socket.on("remove_msgs", function () {
	setHtml("msgs", "");
});

socket.on("display_pipes_passed", function (nb) {
	setText("pipes_passed", nb)
});

socket.on("display_life", function (pv) {
	setText("life", pv)
});

socket.on("display_party_players", function (data) {
	setText("admin_party", "Admin de cette partie : "+data.admin);
	let liste = "";
	if (data.players.length > 0) {
		for (let i = 0; i < data.players.length; i++) {
			liste += "<li>" + data.players[i] + "</li>";
		}
	} else {
		liste = "<span style='color: orange'>Aucun joueur dans cette partie</span>";
	}
	setHtml('list_players_party', liste);
});

socket.on("display_parties", function(parties) {
	let ul = document.querySelector("#list_parties ul");
	let liste = "";
	if (parties.length > 0) {
		for (let i = 0; i < parties.length; i++) {
			liste += "<li>Partie de " + parties[i].admin + " (" + parties[i].nbPlayers + " joueur(s)) "+
				"<input type='button' value='Rejoindre' onclick='join_party(`"+parties[i].admin+"`)' /></li>";
		}
	} else {
		liste = "<span style='color: orange;'>Il n'y a aucune partie</span>";
	}
	ul.innerHTML = liste;
});

socket.on("party_joined", function () {
	hide("list_parties");
	hide("go_to_menu_button");
	hide("start_party_button");
	display("prepare_party");
});

function join_party(admin_of_party) {
	socket.emit("join_party", admin_of_party);
}





// On click buttons

onclick("login_button", function () {
	if (document.getElementById("pseudo_input").value === "") {
		setText("error_login", "Vous n'avez rien rentré");
		return;
	}
	socket.emit("login", document.getElementById("pseudo_input").value);
});

onclick("single_party_button", function () {
	socket.emit("single_party");
});

onclick("create_party_button", function () {
	display("prepare_party");
	hide("choose_party_type");
	display("start_party_button");
	socket.emit("create_party");
});

onclick("list_party_button", function () {
	display("go_to_menu_button");
	display("list_parties");
	hide("choose_party_type");
	socket.emit("get_parties");
});

onclick("go_to_menu_button", function () {
	hide("go_to_menu_button");
	hide("list_parties");
	display("choose_party_type");
});

onclick("start_party_button", function () {
	socket.emit("start_party");
});

onclick("quit_party_button", function () {
	if (confirm("Voulez vous quitter cette partie?")) {
		hide("prepare_party");
		display("list_parties");
		socket.emit("quit_party");
		socket.emit("get_parties");
	}
});





// Detect space push

document.onkeydown = function (){
	switch (event.keyCode) {
		case 32: // espace
			socket.emit("fly_bird");
	}
};

document.onkeyup = function (){
	switch (event.keyCode) {
		case 32: // espace
			socket.emit("release_bird");
	}
};





// Declare functions to control the dom

function display(id) {
	document.getElementById(id).style.display = "block";
}

function hide(id) {
	document.getElementById(id).style.display = "none";
}

function onclick(id, callback) {
	document.getElementById(id).onclick = callback;
}

function setText(id,text) {
	document.getElementById(id).innerText = text;
}

function setHtml(id,html) {
	document.getElementById(id).innerHTML = html;
}
