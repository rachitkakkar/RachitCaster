/**
 * @class Timer representing a class used to provide timing functionality.
 */
export class Timer {
    /**
     * Creates an instance of Timer.
     */
    constructor() {
        this.now;
        this.deltaTime;
        this.lastUpdate;
    }

    /**
     * Calculates the delta time (elapsed time since the game last updated).
     */
    calculateDeltaTime() {
        this.now = Date.now();
        this.deltaTime = (this.now - this.lastUpdate) / 1000;
        this.lastUpdate = this.now;
    }

    /**
     * Allows access to the deltaTime variable, representing the delta time.
     */
    getDeltaTime() {
        return this.deltaTime;
    }
}