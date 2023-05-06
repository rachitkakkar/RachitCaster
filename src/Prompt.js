class Prompt {
    constructor(screenWidth, promptText) {
        this.promptX = screenWidth / 2 - 5 * promptText.length;
        this.promptY = -20;
        this.speed = 75;
        this.rectX = promptX - 2.5;
        this.rectY = promptY - 20;
        this.rectWidth = 10.5 * promptText.length;
        this.rectHeight = 25;
        this.maxHeight = 35;
        this.isVisible = true;
    }

    get isVisible() {
        return this.isVisible();
    }

    update(deltaTime) {
        if (promptY < maxHeight) {
            promptY += int(speed * deltaTime);
            rectY += int(speed * deltaTime);
        }
    }

    render() {
        ctx.font = "17px Helvetica";
        ctx.fillStyle = "white";
        ctx.fillRect(this.rectX, this.rectY, this.rectWidth, this.rectHeight);
        ctx.fillStyle = "black";
        ctx.fillText(this.promptText, this.promptX, this.promptY);
    }
}