class GenerateCanvasInstructions {
    instructions;

    constructor() {
        this.instructions = [];
    }

    beginPath() {
        this.instructions.push({func: "beginPath", args: []});
    }

    arc(x,y,radius,startAngle,endAngle) {
        this.instructions.push({func: "arc", args: [x,y,radius,startAngle,endAngle]});
    }

    setFillStyle(color) {
        this.instructions.push({key: "fillStyle", val: color});
    }

    setStrokeStyle(color) {
        this.instructions.push({key: "strokeStyle", val: color});
    }

    setLineWidth(width) {
        this.instructions.push({key: "lineWidth", val: width});
    }

    fill() {
        this.instructions.push({func: "fill", args: []});
    }

    stroke() {
        this.instructions.push({func: "stroke", args: []});
    }

    moveTo(x,y) {
        this.instructions.push({func: "moveTo", args: [x,y]});
    }

    lineTo(x,y) {
        this.instructions.push({func: "lineTo", args: [x,y]});
    }

    rect(x,y,w,h) {
        this.instructions.push({func: "rect", args: [x,y,w,h]});
    }

    clearRect(x,y,w,h) {
        this.instructions.push({func: "clearRect", args: [x,y,w,h]});
    }
}

module.exports = GenerateCanvasInstructions;