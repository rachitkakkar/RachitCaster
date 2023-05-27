export class InputHandler {
    constructor() {
        this.keyRight = false;
        this.keyLeft = false;
        this.keyUp = false;
        this.keyDown = false;

        this.onClickActions = [];
        this.onPointerLockMoveActions = [];
    }

    bind(canvas) {
        document.addEventListener("keydown", this.keyPush.bind(this));
        document.addEventListener("keyup", this.keyReleased.bind(this));

        canvas.addEventListener("click", this.onClick.bind(this));
        document.addEventListener("pointerlockchange", this.onPointerLockMove.bind(this, canvas), false);
    }

    bindOnClickAction(action) {
        this.onClickActions.push(action);
    }
    
    bindOnPointerLockMoveAction(action) {
        this.onPointerLockMoveActions.push(action)
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

    async onClick() {
        if (!document.pointerLockElement) {
            await canvas.requestPointerLock({
                unadjustedMovement: true,
            });
        }
        
        this.onClickActions.map((action) => {
            action.call();
        });
    }

    onPointerLockMove(canvas) {
        if (document.pointerLockElement === canvas) {
            // console.log("The pointer lock status is now locked");

            this.onPointerLockMoveActions.map((action) => {
                document.addEventListener("mousemove", action, false);
            });
        } else {
            // console.log("The pointer lock status is now unlocked");

            this.onPointerLockMoveActions.map((action) => {
                document.removeEventListener("mousemove", action, false);
            });
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