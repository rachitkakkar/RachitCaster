function Door(position, offset, state, side) {
    this.position = position;
    this.offset = offset;
    this.state = state;
    this.side = side;
    this.trigger = false;
}

export class World {
    constructor() {
        this.mapWidth = 25;
        this.mapHeight = 25;
    }
}