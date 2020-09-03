const config = require("./config"),
	diffAire = config.diffAire;

const { createCanvas } = require('canvas');
const canvas = createCanvas(config.width, config.height);
let socket = {};

const formes = {
    player: { display:  {
    		writeBody: function (context,entity) {
				context.beginPath();
				context.arc(entity.x+4, entity.y+4, entity.radius, 0, Math.PI * 2);
				context.fillStyle = "yellow";
				context.strokeStyle = "black";
				context.lineWidth="0.5";
				context.fill();
				context.stroke();
			},
    		default: function (id = "canvas", entity) {
				let context = canvas.getContext('2d');

				// Write "Awesome!"
				/*context.font = '30px Impact';
				context.rotate(-0.1);
				context.fillText('Awesome!', 50, 100);

				// Draw line under text
				var text = context.measureText('Awesome!');
				context.strokeStyle = 'rgba(0,0,0,0.5)';
				context.beginPath();
				context.lineTo(50, 102);
				context.lineTo(50 + text.width, 102);
				context.stroke();

				return;*/

				//write body
				this.writeBody(context,entity);

				//write eye white
				context.beginPath();
				context.arc(entity.x+entity.w-3.5/diffAire, entity.y+1/diffAire, entity.radius/2, 0, Math.PI * 2);
				context.fillStyle = "white";
				context.lineWidth="0.5";
				context.fill();
				context.stroke();

				//write eye
				context.beginPath();
				context.arc(entity.x+entity.w-3.5/diffAire, entity.y+1/diffAire, entity.radius/7, 0, Math.PI * 2);
				context.fillStyle = "black";
				context.fill();

				//write mouth
				context.beginPath();
				context.strokeStyle = "red";
				context.lineWidth="1";
				context.moveTo(entity.x+entity.w-5,entity.y+entity.h-7);
				context.lineTo(entity.x+entity.w-10,entity.y+entity.h-7);
				context.stroke();
			},
			toUp: function (id = "canvas", entity) {
				let context = canvas.getContext('2d');

				//write body
				this.writeBody(context,entity);

				//write eye white
				context.beginPath();
				context.arc(entity.x+entity.w-5/diffAire, entity.y+1/diffAire, entity.radius/2, 0, Math.PI * 2);
				context.fillStyle = "white";
				context.lineWidth="0.5";
				context.fill();
				context.stroke();

				//write eye
				context.beginPath();
				context.arc(entity.x+entity.w-5/diffAire, entity.y+1/diffAire, entity.radius/7, 0, Math.PI * 2);
				context.fillStyle = "black";
				context.fill();

				//write mouth
				context.beginPath();
				context.strokeStyle = "red";
				context.lineWidth="1";
				context.moveTo(entity.x+entity.w-2.5/diffAire,entity.y+entity.h-5.5/diffAire);
				context.lineTo(entity.x+entity.w-4/diffAire,entity.y+entity.h-3.5/diffAire);
				context.stroke();
			},
			toDown: function (id = "canvas", entity) {
				let context = canvas.getContext('2d');

				//write body
				this.writeBody(context,entity);

				//write eye white
				context.beginPath();
				context.arc(entity.x+entity.w-3.5/diffAire, entity.y+2/diffAire, entity.radius/2, 0, Math.PI * 2);
				context.fillStyle = "white";
				context.lineWidth="0.5";
				context.fill();
				context.stroke();

				//write eye
				context.beginPath();
				context.arc(entity.x+entity.w-3.5/diffAire, entity.y+2/diffAire, entity.radius/7, 0, Math.PI * 2);
				context.fillStyle = "black";
				context.fill();

				//write mouth
				context.beginPath();
				context.strokeStyle = "red";
				context.lineWidth="1";
				context.moveTo(entity.x+entity.w-4.5/diffAire,entity.y+entity.h-2/diffAire);
				context.lineTo(entity.x+entity.w-5.75/diffAire,entity.y+entity.h-4/diffAire);
				context.stroke();
			}
		}, remove: function (id = "canvas", entity) {
            let context = canvas.getContext('2d');

            context.clearRect(entity.x-2/diffAire, entity.y-2/diffAire, entity.w+4/diffAire, entity.h+4/diffAire);
    	}
    },
    pipe: { display: {
			default: function (id = "canvas", entity) {
				let context = canvas.getContext('2d');

				context.beginPath();
				context.strokeStyle="black";
				context.lineWidth="1";
				context.rect(entity.x,entity.y+5,entity.w,entity.h-5);
				context.fillStyle="green";
				context.fill();
				context.stroke();

				context.rect(entity.x-2,entity.y,entity.w+4,5);
				context.fill();
				context.stroke();
			}
        }, remove: function (id = "canvas", entity) {
            let context = canvas.getContext('2d');

            context.clearRect(entity.x-3, entity.y-1, entity.w+6, entity.h+2);
        }
    },
    pipeUpsideDown: {
    	display: {
    		default: function (id = "canvas", entity) {
				let context = canvas.getContext('2d');

				context.beginPath();
				context.strokeStyle="black";
				context.lineWidth="1";
				context.rect(entity.x,entity.y,entity.w,entity.h-5);
				context.fillStyle="green";
				context.fill();
				context.stroke();

				context.rect(entity.x-2,entity.y+entity.h-5,entity.w+4,5);
				context.fill();
				context.stroke();
        	}
        },
        remove: function (id = "canvas", entity) {
            let context = canvas.getContext('2d');

            context.clearRect(entity.x-3, entity.y-1, entity.w+6, entity.h+2);
        }
    },
	pipeDetector: {
    	display: {
    		default: function (id = "canvas", entity) {
    			// Do nothing
				// Entity is not visible
			}
		},
		remove: function (id = "canvas", entity) {
			// Do nothing
			// Entity is not visible
		}
	}
};

const display = (entity) => {
    formes[entity.type].display[entity.toDisplay]("canvas", entity);
    setTimeout(() => {
		socket.socket.emit("updateLevel", canvas.toDataURL());
	}, 500);
}
const hide = (entity) => {
    formes[entity.type].remove("canvas", entity);
	socket.socket.emit("updateLevel", canvas.toDataURL());
}

module.exports = {display, hide, socket};
