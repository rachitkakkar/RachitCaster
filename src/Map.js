import { castToInt, Vector2 } from "./Utils.js";

/**
 * Internal function that generates a maze as a 2D array: 1 = WALL and 0 = SPACE
 * 
 * @param {number} mazeWidth The width of the maze/array.
 * @param {number} mazeHeight The height of the maze/array.
 */
function generateMaze(mazeWidth, mazeHeight) {
    if (mazeWidth !== mazeHeight || mazeHeight % 2 !== 1) // Constraints to make the algorithm simple
        return "Error: Size must be odd and square!"

    // Generate maze as a 2D array: 1 = WALL and 0 = SPACE
    // The maze starts as a solid block filled with ones.
    let maze = [];
    for (let x = 0; x < mazeWidth; x++) {
        let row = [];
        for (let y = 0; y < mazeHeight; y++) {
            row.push(1);
        }
        maze.push(row);
    }

    // Use the binary tree maze generation algorithm to carve out spaces in the block generated earlier
    // The algorithm runs on everything except the two columns on the right and rows on the bottom
    for (let x = 1; x < mazeWidth-2; x += 2) { // Increment by 2 to modify every other value
                                               // This is done to allow "walls" to exist in-between cells
        for (let y = 1; y < mazeHeight-2; y += 2) {
            maze[x][y] = 0; // Carve out this value by setting it to 0
            
            let direction; // Choose a direction to carve out another wall and create a pathway
            if (x === 1 && y === 1) // If this is the top left cell where the player is, set the direction to the right so the player is not facing a wall
                direction = 0;
            else
                direction = Math.floor(Math.random() * 2); // Otherwise, choose a random direction
            if (direction === 0) // Carve out the right wall
                maze[x+1][y] = 0;
            if (direction === 1) // Carve out the bottom wall
                maze[x][y+1] = 0;
        }
    }

    // Empty out every cell in the right-most and bottom-most corrider in order to make sure every area of the maze is accesible. 
    // The width and height are subtracted by 1 in order to create a boundary around the outside of the maze.
    for (let y = 1; y < mazeHeight-1; y++)
        maze[mazeWidth-2][y] = 0; 
    for (let x = 1; x < mazeWidth-1; x++)
        maze[x][mazeHeight-2] = 0; 

    /*
    VISUAL DEMONSTRATION
    --------------------------
    1. Solid Square 2D Array of Blocks
    #########
    #########
    #########
    #########
    #########
    #########
    #########
    #########
    #########
    
    2. Carve Out Every Other Block (Except The Two Right Columns and Two Bottom Rows)
    #########
    # # # ###
    #########
    # # # ###
    #########
    # # # ###
    #########
    #########
    #########

    3. At The Same Time, Choose A Random Direction (Right Or Down) To Carve Out A Pathway For Each Of These Blocks 
    #########                         #########
    # ^ # ^##                         #   #  ##
    ###^#####                         ### #####
    # ^ # ###                         #   # ###
    ###^#^### ----------------------> ### # ###
    # ^ # ###                         #   # ###
    ###^#^###                         ### # ###
    #########                         #########
    #########                         #########
    ^ = Chosen cells to carve out

    4. Carve Out The Right-most Column And Bottom-most Row
    #########
    #   #   #
    ### ### #
    #   # # #
    ### # # #
    #   # # #
    ### # # #
    #       #
    #########

    And Bam! We have a maze!
    */

    return maze;
}

/**
 * Function that is used to represent a door.
 * 
 * @param {Vector2} position The position of the door in the map.
 * @param {number} offset How open the door is from 0-1 (0 means the door is completely closed; 1 means the door is open).
 * @param {string} state The state of the door (either "open", "closed", "opening", or "closing").
 */
function Door(position, offset, state, side) {
    this.position = position;
    this.offset = offset;
    this.state = state;
    this.side = side;
    this.trigger = false;
}

/**
 * Function that generates a list of unique door positions randomly based on the generated map.
 * 
 * @param {Vector2} position The position of the door in the map.
 * @param {number} offset How open the door is from 0-1 (0 means the door is completely closed; 1 means the door is open).
 * @param {string} state The state of the door (either "open", "closed", "opening", or "closing").
 */
function generateDoors(map, mapWidth, mapHeight) {
    let doors = [];

    let attempts = 0;
    let giveUp = false;
    while (doors.length < 5 && !giveUp) { // Vertical
        let potentialX = Math.floor(Math.random() * (mapWidth-3)) + 1;
        let potentialY = Math.max(Math.floor(Math.random() * (mapHeight-2)), 5);

        let viable = true;

        for (let i = 0; i < 5; i++) {
            if (map[potentialX][potentialY - i] !== 0 || map[potentialX+1][potentialY] !== 1 || map[potentialX-1][potentialY] !== 1)
                viable = false;
        }

        for (const door of doors) {
            if (door.position.x === potentialX)
                viable = false;
        }

        if (viable) {
            doors.push(new Door(new Vector2(potentialX, potentialY), 0.0, "closed", 1))
            attempts = 0;
        }

        if (attempts >= 150)
            giveUp = true;
        attempts++;
    }

    
    attempts = 0;
    giveUp = false;
    while (doors.length < 10 && !giveUp) { // Vertical
        let potentialX = Math.max(Math.floor(Math.random() * (mapWidth-2)), 5);
        let potentialY = Math.floor(Math.random() * (mapHeight-3)) + 1;

        let viable = true;

        for (let i = 0; i < 5; i++) {
            if (map[potentialX - i][potentialY] !== 0 || map[potentialX][potentialY+1] !== 1 || map[potentialX][potentialY-1] !== 1)
                viable = false;
        }

        for (const door of doors) {
            if (door.position.y === potentialY)
                viable = false;
        }

        if (viable) {
            doors.push(new Door(new Vector2(potentialX, potentialY), 0.0, "closed", 0))
            attempts = 0;
        }

        if (attempts >= 150)
            giveUp = true;
        attempts++;
    }

    return doors;
}

export class Map {
    constructor(width, height) {
        this.width = width;
        this.height = height;

        this.map = generateMaze(this.width, this.height);
        this.doors = generateDoors(this.map, this.width, this.height);
    }

    resetDoors(timer) {
        // Update doors
        for (const door of this.doors) {
            if (door.trigger) {
                door.trigger = false;
            }
            else {
                if (door.state === 'open' || door.state === 'opening')
                    door.state = 'closing';

                if (door.offset > 0 && door.state === 'closing')
                    door.offset -= timer.getDeltaTime();
                if (door.offset <= 0) {
                    door.state = 'closed';
                    door.offset = 0;
                }
            }
        }
    }

    checkCollisionWithDoor(position, side, sideDistance, deltaDistance, rayDirection, mapCoords, timer) {
        let selectedDoor = null;
        let doorHit = false;

        for (const door of this.doors) {
            if (door.side === 0) { // Horizontal
                if (position.x < door.position.x+1.15 && position.x > door.position.x-0.15 && castToInt(position.y) === door.position.y) // X value close to door, same row
                    door.trigger = true;
            }

            else { // Vertical
                if (position.y < door.position.y+1.15 && position.y > door.position.y-0.15 && castToInt(position.x) === door.position.x)  // Y value close to door, same column
                    door.trigger = true;
            }

            if (door.position.x === mapCoords.x && door.position.y === mapCoords.y && !doorHit) {
                doorHit = true;
                let doorDistance;

                if (side === 0) {
                    doorDistance = sideDistance.x + deltaDistance.x / 2 - deltaDistance.x;
                    let hitX = position.y +  doorDistance * rayDirection.y;
                    hitX -= Math.floor(hitX);

                    if (!(sideDistance.x - (deltaDistance.x/2) < sideDistance.y) || 1.0 - hitX <= door.offset) {
                        doorHit = false;
                    }
                }
                
                if (side === 1) {
                    doorDistance = sideDistance.y + deltaDistance.y / 2 - deltaDistance.y;
                    let hitX = position.x + doorDistance * rayDirection.x;
                    hitX -= Math.floor(hitX);

                    if (!(sideDistance.y - (deltaDistance.y/2) < sideDistance.x) || 1.0 - hitX < door.offset) {
                        doorHit = false;
                    }
                }

                if (doorHit) {
                    selectedDoor = door;
                }
            }

            if (door.trigger) {
                if (door.state !== 'open')
                    door.state = 'opening';

                if (door.offset >= 0.95)
                    door.state = 'open';
            }

            if (door.offset < 0.95 && door.state === 'opening')
                door.offset += (timer.getDeltaTime() * 0.0015);
        }

        return selectedDoor;
    }

    playerCanPassThroughAllDoors() {
        let canPass = true;

        for (const door of this.doors) {
            if (door.trigger && door.state !== 'open') // Player has triggered door and door is not open
                canPass = false;
        }

        return canPass;
    }

    getMapValue(x, y) {
        return this.map[castToInt(x)][castToInt(y)];
    }

    getDoors() {
        return this.doors;
    }

    getWidth() {
        return this.width;
    }

    getHeight() {
        return this.height;
    }
}