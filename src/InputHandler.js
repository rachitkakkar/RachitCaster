/**
 * @class InputHandler representing a utility class that wraps/handles receiving user input.
 */
export class InputHandler {
    /**
     * Creates an instance of InputHandler.
     */
    constructor() {
        /**
         * @property {boolean} keyRight Whether or not the right arrow key is pressed.
         */
        this.keyRight = false;
        /**
         * @property {boolean} keyLeft Whether or not the left arrow key is pressed.
         */
        this.keyLeft = false;
        /**
         * @property {boolean} keyUp Whether or not the up arrow key is pressed.
         */
        this.keyUp = false;
        /**
         * @property {boolean} keyDown Whether or not the down arrow key is pressed.
         */
        this.keyDown = false;

        /**
         * @property {array} onClickActions Functions the program should run when a click occurs.
         */
        this.onClickActions = [];
        /**
         * @property {array} onPointerLockMoveActions Functions the program should run when the pointer moves if the user has their pointer locked to the canvas.
         */
        this.onPointerLockMoveActions = [];
    }

    /**
     * Sets up event listeners in order to grab input.
     * 
     * @param {HTMLCanvasElement} canvas The canvas to bind click and pointer events to.
     */
    bind(canvas) {
        document.addEventListener("keydown", this.keyPush.bind(this));
        document.addEventListener("keyup", this.keyReleased.bind(this));

        canvas.addEventListener("click", this.onClick.bind(this));
        document.addEventListener("pointerlockchange", this.onPointerLockMove.bind(this, canvas), false);
    }

    /**
     * Add a function that runs when a click action occurs.
     * 
     * @param {Function} action The specific function that is called.
     */
    bindOnClickAction(action) {
        this.onClickActions.push(action);
    }
    
    /**
     * Add a function that runs when a click action occurs.
     * 
     * @param {Function} action The specific function that is called.
     */
    bindOnPointerLockMoveAction(action) {
        this.onPointerLockMoveActions.push(action)
    }

    /**
     * Internal function that sets the state of the arrow keys after a key push.
     * 
     * @param {Event} event The keydown event.
     */
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

    /**
     * Internal function that sets the state of the arrow keys after a key is released.
     * 
     * @param {Event} event The keyup event.
     */
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

    /**
     * Internal function that runs after a click.
     */
    async onClick() {
        if (!document.pointerLockElement) {
            await canvas.requestPointerLock({
                unadjustedMovement: true,
            });
        }
        
        this.onClickActions.map((action) => { // Run every action that is slated to be run after a click
            action.call();
        });
    }

    /**
     * Internal function that runs if the mouse is moved (and does actions if the pointer is locked to the canvas).
     * 
     * @param {HTMLCanvasElement} canvas To check if the pointer is locked to the canvas.
     */
    onPointerLockMove(canvas) {
        if (document.pointerLockElement === canvas) { // Check if the pointer is locked to the canvas
            // console.log("The pointer lock status is now locked");

            this.onPointerLockMoveActions.map((action) => { // Set functions to be run when the pointer is locked
                document.addEventListener("mousemove", action, false);
            });
        } else {
            // console.log("The pointer lock status is now unlocked");

            this.onPointerLockMoveActions.map((action) => { // Remove the functions that would be run since the pointer is no longer locked
                document.removeEventListener("mousemove", action, false);
            });
        }
    }

    /**
     * Returns the state of a specified arrow key (basically whether or not it is pressed).
     * 
     * @param {string} keyName The name of the arrow key to get the state of (equal to "right", "left", "up", or "down").
     */
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