export class InputHandler {
    constructor() {
        this.keyRight = false;
        this.keyLeft = false;
        this.keyUp = false;
        this.keyDown = false;

        
        document.addEventListener("keydown", keyPush);
        document.addEventListener("keyup", keyReleased);
    }

    keyPush(event) {
        if (event.repeat)
            return;
        switch(event.key) {
            case "ArrowRight":
            case "d":
                this.keyRight = true;
                break;
            case "ArrowLeft":
            case "a":
                this.keyLeft = true;
                break;
            case "ArrowUp":
            case "w":
                this.keyUp = true;
                break;
            case "ArrowDown":
            case "s":
                this.keyDown = true;
                break;
        }
    }

    keyReleased(event) {
        if (event.repeat)
            return
        switch(event.key) {
            case "ArrowRight":
            case "d":
                this.keyRight = false;
                break;
            case "ArrowLeft":
            case "a":
                this.keyLeft = false;
                break;
            case "ArrowUp":
            case "w":
                this.keyUp = false;
                break;
            case "ArrowDown":
            case "s":
                this.keyDown = false;
                break;
        }
    }

    getArrowKey(keyName) {
        switch(keyName) {
            case "right":
                return this.keyRight;
            case "left":
                return this.keyLeft;        
            case "up":
                return this.keyUp;
            case "down":
                return this.keyDown;
        }
    }
}