const config = require("./config"),
	diffAire = config.diffAire;

const GenerateCanvasInstruction = require("./GenerateCanvasInstructions.class");

const formes = {
	player: {
		display: {
			writeBody: function (context, entity) {
				context.beginPath();
				context.arc(entity.x + 4, entity.y + 4, entity.radius+0.5/diffAire, 0, Math.PI * 2);
				context.setFillStyle(entity.color);
				context.setStrokeStyle("black");
				context.setLineWidth("0.5");
				context.fill();
				context.stroke();
			},
			default: function (id = "canvas", entity, context) {

				//write body
				this.writeBody(context, entity);

				//write eye white
				context.beginPath();
				context.arc(entity.x + entity.w - 3.5 / diffAire, entity.y + 1 / diffAire, entity.radius / 2, 0, Math.PI * 2);
				context.setFillStyle("white");
				context.setLineWidth("0.5");
				context.fill();
				context.stroke();

				//write eye
				context.beginPath();
				context.arc(entity.x + entity.w - 3.5 / diffAire, entity.y + 1 / diffAire, entity.radius / 7, 0, Math.PI * 2);
				context.setFillStyle("black");
				context.fill();

				//write mouth
				context.beginPath();
				context.setStrokeStyle("red");
				context.setLineWidth("1");
				context.moveTo(entity.x + entity.w - 5, entity.y + entity.h - 7);
				context.lineTo(entity.x + entity.w - 10, entity.y + entity.h - 7);
				context.stroke();
			},
			toUp: function (id = "canvas", entity, context) {

				//write body
				this.writeBody(context, entity);

				//write eye white
				context.beginPath();
				context.arc(entity.x + entity.w - 5 / diffAire, entity.y + 1 / diffAire, entity.radius / 2, 0, Math.PI * 2);
				context.setFillStyle("white");
				context.setLineWidth("0.5");
				context.fill();
				context.stroke();

				//write eye
				context.beginPath();
				context.arc(entity.x + entity.w - 5 / diffAire, entity.y + 1 / diffAire, entity.radius / 7, 0, Math.PI * 2);
				context.setFillStyle("black");
				context.fill();

				//write mouth
				context.beginPath();
				context.setStrokeStyle("red");
				context.setLineWidth("1");
				context.moveTo(entity.x + entity.w - 2.5 / diffAire, entity.y + entity.h - 5.5 / diffAire);
				context.lineTo(entity.x + entity.w - 4 / diffAire, entity.y + entity.h - 3.5 / diffAire);
				context.stroke();
			},
			toDown: function (id = "canvas", entity, context) {

				//write body
				this.writeBody(context, entity);

				//write eye white
				context.beginPath();
				context.arc(entity.x + entity.w - 3.5 / diffAire, entity.y + 2 / diffAire, entity.radius / 2, 0, Math.PI * 2);
				context.setFillStyle("white");
				context.setLineWidth("0.5");
				context.fill();
				context.stroke();

				//write eye
				context.beginPath();
				context.arc(entity.x + entity.w - 3.5 / diffAire, entity.y + 2 / diffAire, entity.radius / 7, 0, Math.PI * 2);
				context.setFillStyle("black");
				context.fill();

				//write mouth
				context.beginPath();
				context.setStrokeStyle("red");
				context.setLineWidth("1");
				context.moveTo(entity.x + entity.w - 4.5 / diffAire, entity.y + entity.h - 2 / diffAire);
				context.lineTo(entity.x + entity.w - 5.75 / diffAire, entity.y + entity.h - 4 / diffAire);
				context.stroke();
			}
		}, remove: function (id = "canvas", entity, context) {
			context.clearRect(entity.x - 2 / diffAire, entity.y - 2 / diffAire, entity.w + 3.5 / diffAire, entity.h + 3.5 / diffAire);
		}
	},
	pipe: {
		display: {
			default: function (id = "canvas", entity, context) {

				context.beginPath();
				context.setStrokeStyle("black");
				context.setLineWidth("1");
				context.rect(entity.x, entity.y + 5, entity.w, entity.h - 5);
				context.setFillStyle("green");
				context.fill();
				context.stroke();

				context.rect(entity.x - 2, entity.y, entity.w + 4, 5);
				context.fill();
				context.stroke();
			}
		}, remove: function (id = "canvas", entity, context) {
			context.clearRect(entity.x - 3, entity.y - 1, entity.w + 8, entity.h + 2);
		}
	},
	pipeUpsideDown: {
		display: {
			default: function (id = "canvas", entity, context) {
				context.beginPath();
				context.setStrokeStyle("black");
				context.setLineWidth("1");
				context.rect(entity.x, entity.y, entity.w, entity.h - 5);
				context.setFillStyle("green");
				context.fill();
				context.stroke();

				context.rect(entity.x - 2, entity.y + entity.h - 5, entity.w + 4, 5);
				context.fill();
				context.stroke();
			}
		},
		remove: function (id = "canvas", entity, context) {
			context.clearRect(entity.x - 3, entity.y - 1, entity.w + 8, entity.h + 2);
		}
	},
	pipeDetector: {
		display: {
			default: function (id = "canvas", entity, context) {
				// Do nothing
				// This element is invisible
			}
		},
		remove: function (id = "canvas", entity, context) {
			// Do nothing
			// This element is invisible
		}
	}
};

class Graphismes {

	party;

	constructor(party) {
		this.setParty(party);
	}

	setParty(party) {
		this.party = party;
	}


	display(entity) {
		let generateCanvasInstructions = new GenerateCanvasInstruction();
		formes[entity.type].display[entity.toDisplay]("canvas", entity, generateCanvasInstructions);
		this.party.broadcastCanvas(generateCanvasInstructions.instructions);
	}

	hide(entity) {
		let generateCanvasInstructions = new GenerateCanvasInstruction();
		formes[entity.type].remove("canvas", entity, generateCanvasInstructions);
		this.party.broadcastCanvas(generateCanvasInstructions.instructions);
	}

	hideAndDisplay(entityBefore,entityAfter) {
		let generateCanvasInstructions = new GenerateCanvasInstruction();
		formes[entityBefore.type].remove("canvas", entityBefore, generateCanvasInstructions);
		formes[entityAfter.type].display[entityAfter.toDisplay]("canvas", entityAfter, generateCanvasInstructions);
		this.party.broadcastCanvas(generateCanvasInstructions.instructions);
	}

}

module.exports = Graphismes;
