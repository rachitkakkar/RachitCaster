import { RenderBuffer } from "./src/RenderBuffer.js";
import { InputHandler } from "./src/InputHandler.js";
import { Prompt } from "./src/Prompt.js";
import { Timer } from "./src/Timer.js";

import * as Utils from "./src/Utils.js";

// Screen dimensions (scaled to 70% of window with 16/10 aspect ratio)
const aspectRatio = 16.0 / 10.0;
const screenWidth = Utils.castToInt(window.innerWidth * 0.7);
const screenHeight = Utils.castToInt(screenWidth / aspectRatio);

// Handle options
const texturesBox = document.getElementById('textures');
const fogBox = document.getElementById('fog');

// Dealing with canvas (setting dimensions, creating context)
canvas.width = screenWidth;
canvas.height = screenHeight;

var ctx = canvas.getContext("2d");
var renderer = new RenderBuffer(screenWidth, screenHeight, ctx);

// Instruction prompt animation, includes everything needed to render the animated prompt at the beginning (calculated based on screen dimensions)
var instructionPrompt = new Prompt("CLICK TO LOCK MOUSE CURSOR. ARROW KEYS OR WASD TO MOVE.", screenWidth);

// Variables needed for delta time calculation
var timer = new Timer();

// Structures
function Sprite(x, y, texture) {
    this.x = x;
    this.y = y;
    this.texture = texture;
}

function Door(position, offset, state, side) {
    this.position = position;
    this.offset = offset;
    this.state = state;
    this.side = side;
    this.trigger = false;
}

// World representation
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
            doors.push(new Door(new Utils.Vector2(potentialX, potentialY), 0.0, 'closed', 1))
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
            doors.push(new Door(new Utils.Vector2(potentialX, potentialY), 0.0, 'closed', 0))
            attempts = 0;
        }

        if (attempts >= 150)
            giveUp = true;
        attempts++;
    }

    return doors;
}

const mapWidth = 25;
const mapHeight = 25;
const map = generateMaze(mapWidth, mapHeight); // 25 x 25 procedural maze
var doors = generateDoors(map, mapWidth, mapHeight);

// Minimap and crosshair values (calculated based on screen dimensions)
var blockSize = Utils.castToInt(screenWidth / 110);
var crosshairSizeShort = Utils.castToInt(blockSize / 6);
var padding = Utils.castToInt(blockSize / 2);
var playerSize = Utils.castToInt(padding * 4/5);

// Player
const MOVE_SPEED = 3.7;
// const ROTATION_SPEED = 1.25;

var position = new Utils.Vector2(1.5, 1.5);
var direction = new Utils.Vector2(1, 0);
var plane = new Utils.Vector2(0, 0.66);
var walkTime = 0.0;
var pitch = 0.0;

// Input and key handling
var inputHandler = new InputHandler();
inputHandler.bind();

canvas.addEventListener("click", async () => {
    if(!document.pointerLockElement) {
      await canvas.requestPointerLock({
        unadjustedMovement: true,
      });
    }

    instructionPrompt.hide();
});
document.addEventListener("pointerlockchange", lockChangeAlert, false);

function lockChangeAlert() {
    if (document.pointerLockElement === canvas) {
        console.log("The pointer lock status is now locked");
        document.addEventListener("mousemove", rotatePlayer, false);
    } else {
        console.log("The pointer lock status is now unlocked");
        document.removeEventListener("mousemove", rotatePlayer, false);
    }
}  

function canMove(newPosition) {
    let canMove = false;
    if (map[Utils.castToInt(newPosition.x)][Utils.castToInt(newPosition.y)] === 0) {
        canMove = true;

        for (const door of doors) {
            if (door.trigger && door.state !== 'open') // Player has triggered door and door is not open
                canMove = false;
        }
    }

    return canMove;
}

// Movement
function movePlayer(moveSpeed) {
    let moved = false;

    if (inputHandler.getArrowKey("right")) {
        var newPosition = new Utils.Vector2(position.x + (plane.x * moveSpeed), position.y + (plane.y * moveSpeed));
        if (canMove(new Utils.Vector2(newPosition.x, position.y)))
            position.x = newPosition.x;
        if (canMove(new Utils.Vector2(position.x, newPosition.y)))
            position.y = newPosition.y;

        moved = true;
    }

    if (inputHandler.getArrowKey("left")) {
        var newPosition = new Utils.Vector2(position.x - (plane.x * moveSpeed), position.y - (plane.y * moveSpeed));
        if (canMove(new Utils.Vector2(newPosition.x, position.y)))
            position.x = newPosition.x;
        if (canMove(new Utils.Vector2(position.x, newPosition.y)))
            position.y = newPosition.y;

        moved = true;
    }

    if (inputHandler.getArrowKey("up")) {
        var newPosition = new Utils.Vector2(position.x + (direction.x * moveSpeed), position.y + (direction.y * moveSpeed));
        if (canMove(new Utils.Vector2(newPosition.x, position.y)))
            position.x = newPosition.x;
        if (canMove(new Utils.Vector2(position.x, newPosition.y)))
            position.y = newPosition.y;

        moved = true;
    }

    if (inputHandler.getArrowKey("down")) {
        var newPosition = new Utils.Vector2(position.x - (direction.x * moveSpeed), position.y - (direction.y * moveSpeed));
        if (canMove(new Utils.Vector2(newPosition.x, position.y)))
            position.x = newPosition.x;
        if (canMove(new Utils.Vector2(position.x, newPosition.y)))
            position.y = newPosition.y;
        
        moved = true;
    }

    if (moved) {
        walkTime += timer.getDeltaTime();
        pitch += (Math.cos(10 * walkTime) / 2 * 8);
    }
}

function rotatePlayer(event) {
    let differenceX = event.movementX / screenWidth;
    let differenceY = event.movementY / screenHeight;
    let rotationSpeedX = (differenceX * 60) * timer.getDeltaTime();
    let rotationSpeedY = -(differenceY * 12000) * timer.getDeltaTime();

    var newDirection = new Utils.Vector2();
    newDirection.x = direction.x * Math.cos(rotationSpeedX) - direction.y * Math.sin(rotationSpeedX);
    newDirection.y = direction.x * Math.sin(rotationSpeedX) + direction.y * Math.cos(rotationSpeedX);
    direction = newDirection;

    var newPlane = new Utils.Vector2();
    newPlane.x = plane.x * Math.cos(rotationSpeedX) - plane.y * Math.sin(rotationSpeedX);
    newPlane.y = plane.x * Math.sin(rotationSpeedX) + plane.y * Math.cos(rotationSpeedX);
    plane = newPlane;

    pitch += rotationSpeedY;
}

// Main loop
function main() {
    // Render textures or not
    let showTextures = texturesBox.checked;

    // Calculate delta time
    timer.calculateDeltaTime();

    // Use delta time to calculate a smooth movement speed based on framerate
    let moveSpeed = MOVE_SPEED * timer.getDeltaTime();
    // let rotationSpeed = ROTATION_SPEED * timer.getDeltaTime();
    movePlayer(moveSpeed);
    
    let clipPitch = 230;
    if (screenHeight / 2 < clipPitch) 
        clipPitch = screenHeight / 2;
    if (pitch < -clipPitch)
        pitch = -clipPitch;
    if (pitch > clipPitch)
        pitch = clipPitch;

    // Update doors
    for (const door of doors) {
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
    
    let raysOnMap = [];
    for (let x = 0; x < screenWidth; x++) {
        let cameraX = 2 * x / screenWidth - 1;
        let rayDirection = new Utils.Vector2(direction.x + plane.x * cameraX, direction.y + plane.y * cameraX);
        
        let mapCoords = new Utils.Vector2(Utils.castToInt(position.x), Utils.castToInt(position.y));
        let sideDistance = new Utils.Vector2();
        let deltaDistance = new Utils.Vector2(
            // (rayDirection.x === 0) ? 1e+30 : Math.abs(1 / rayDirection.x),
            // (rayDirection.y === 0) ? 1e+30 : Math.abs(1 / rayDirection.y)
            Math.abs(1 / rayDirection.x),
            Math.abs(1 / rayDirection.y)
        );

        var step = new Utils.Vector2();
        let hit = false;
        let hitDoor = false;
        let doorOffset;
        let doorState;
        let side;

        if (rayDirection.x < 0) {
          step.x = -1;
          sideDistance.x = (position.x - mapCoords.x) * deltaDistance.x;
        }
        else {
          step.x = 1;
          sideDistance.x = (mapCoords.x + 1 - position.x) * deltaDistance.x;
        }
        if (rayDirection.y < 0) {
          step.y = -1;
          sideDistance.y = (position.y - mapCoords.y) * deltaDistance.y;
        }
        else {
          step.y = 1;
          sideDistance.y = (mapCoords.y + 1 - position.y) * deltaDistance.y;
        }

        // DDA raycasting loop
        while (!hit) {
            if (sideDistance.x < sideDistance.y) {
                sideDistance.x += deltaDistance.x;
                mapCoords.x += step.x;
                side = 0;
            }

            else {
                sideDistance.y += deltaDistance.y;
                mapCoords.y += step.y;
                side = 1;
            }

            // Collision with normal wall
            if (map[mapCoords.x][mapCoords.y] > 0) {
                hit = true;
            }

            // Collision with door
            for (const door of doors) {
                if (door.side === 0) { // Horizontal
                    if (position.x < door.position.x+1.15 && position.x > door.position.x-0.15 && Utils.castToInt(position.y) === door.position.y) // X value close to door, same row
                        door.trigger = true;
                }

                else { // Vertical
                    if (position.y < door.position.y+1.15 && position.y > door.position.y-0.15 && Utils.castToInt(position.x) === door.position.x)  // Y value close to door, same column
                        door.trigger = true;
                }

                if (door.position.x === mapCoords.x && door.position.y === mapCoords.y && !hitDoor) {
                    hit = true;
                    hitDoor = true;
                    let doorDistance;

                    if (side === 0) {
                        doorDistance = sideDistance.x + deltaDistance.x / 2 - deltaDistance.x;
                        let hitX = position.y +  doorDistance * rayDirection.y;
                        hitX -= Math.floor(hitX);

                        if (!(sideDistance.x - (deltaDistance.x/2) < sideDistance.y) || 1.0 - hitX <= door.offset) {
                            hit = false;
                            hitDoor = false;
                        }
                    }
                    
                    if (side === 1) {
                        doorDistance = sideDistance.y + deltaDistance.y / 2 - deltaDistance.y;
                        let hitX = position.x + doorDistance * rayDirection.x;
                        hitX -= Math.floor(hitX);

                        if (!(sideDistance.y - (deltaDistance.y/2) < sideDistance.x) || 1.0 - hitX < door.offset) {
                            hit = false;
                            hitDoor = false;
                        }
                    }

                    if (hitDoor) {
                        doorOffset = door.offset;
                        doorState = door.state;
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
        }

        let perpendicularWallDistance;
        if (side === 0) {
            if (hitDoor) {
                mapCoords.x += step.x / 2;
                sideDistance.x += deltaDistance.x / 2;
            }
            perpendicularWallDistance = (sideDistance.x - deltaDistance.x);
        }

        else {
            if (hitDoor) {
                mapCoords.y += step.y / 2;
                sideDistance.y += deltaDistance.y / 2;
            }
            perpendicularWallDistance = (sideDistance.y - deltaDistance.y);
        }

        let rayOnMap = new Utils.Vector2(((position.x + (rayDirection.x * perpendicularWallDistance)) * blockSize) + (screenWidth - mapWidth * blockSize - padding),
                                    (position.y + (rayDirection.y * perpendicularWallDistance)) * blockSize + padding);        
        raysOnMap.push(rayOnMap);
        
        let lineHeight = Utils.castToInt(screenHeight / perpendicularWallDistance);
        let drawStart = screenHeight / 2 - lineHeight / 2 + pitch;
        if (drawStart < 0)
            drawStart = 0;
        let drawEnd = screenHeight / 2 + lineHeight / 2 + pitch;
        if (drawEnd >= screenHeight)
            drawEnd = screenHeight - 1;

        let wallX;
        if (side === 0)
            wallX = position.y + perpendicularWallDistance * rayDirection.y;
        else
            wallX = position.x + perpendicularWallDistance * rayDirection.x;
        wallX -= Math.floor(wallX);

        let textureCoords = new Utils.Vector2();
        let offsetedWallX = wallX;
        if (hitDoor && doorState !== 'closed')
            offsetedWallX += doorOffset;
        textureCoords.x = Utils.castToInt(offsetedWallX * textureWidth);
        if (side === 0 && rayDirection.x > 0)
            textureCoords.x = textureWidth - textureCoords.x - 1;
        if (side === 1 && rayDirection.y < 0)
            textureCoords.x = textureWidth - textureCoords.x - 1;

        var step = 1.0 * textureHeight / lineHeight;
        let texturePosition = (drawStart - pitch - screenHeight / 2 + lineHeight / 2) * step;
        for (let y = Utils.castToInt(drawStart)+1; y < Utils.castToInt(drawEnd)+1; y++) {
            textureCoords.y = Utils.castToInt(texturePosition) & (textureHeight - 1);
            texturePosition += step;
            
            let dimFactor = 0.8 + (0.2 * perpendicularWallDistance);
            let fogPercentage = (fogBox.checked) ? 0.08 * perpendicularWallDistance : 0;

            let selectedTexture;
            if (hitDoor)
                selectedTexture = doorTexture;
            else
                selectedTexture = wallTexture;

            // Divide the actual pixel values of the texture by this "dimmess factor" to make it dimmer or brighter
            // Set default wall to dark gray if wall, or lighter gray if door
            let red = 40;
            let green = 40;
            let blue = 40;
            
            if (hitDoor) {
                red = 50;
                green = 50;
                blue = 50;
            }
            red /=  dimFactor;
            red = red * (1 - fogPercentage) + fogPercentage * 0.1;
            green /= dimFactor;
            green = green * (1 - fogPercentage) + fogPercentage * 0.1;
            blue /= dimFactor;
            blue = blue * (1 - fogPercentage) + fogPercentage * 0.1;

            if (showTextures) { // Calculate wall texture values instead if box is selected
                let pixelindex = (textureCoords.y * textureWidth + textureCoords.x) * 4;
                red = selectedTexture.data[pixelindex] / dimFactor;
                red = red * (1 - fogPercentage) + fogPercentage * 0.1;
                green = selectedTexture.data[pixelindex+1] / dimFactor;
                green = green * (1 - fogPercentage) + fogPercentage * 0.1;
                blue = selectedTexture.data[pixelindex+2] / dimFactor;
                blue = blue * (1 - fogPercentage) + fogPercentage * 0.1;
            }

            renderer.drawPixel(x, y, red, green, blue);
        }

        // Draw Wall and Ceiling (Vertically)
        let floorCeilingWallPos = new Utils.Vector2();
        if (side == 0 && rayDirection.x > 0) {
            floorCeilingWallPos.x = mapCoords.x;
            floorCeilingWallPos.y = mapCoords.y + wallX;
        }
        else if (side == 0 && rayDirection.x < 0) {
            floorCeilingWallPos.x = mapCoords.x + 1.0;
            floorCeilingWallPos.y = mapCoords.y + wallX;
        }
        else if (side == 1 && rayDirection.y > 0) {
            floorCeilingWallPos.x = mapCoords.x + wallX;
            floorCeilingWallPos.y = mapCoords.y;
        }
        else {
            floorCeilingWallPos.x = mapCoords.x + wallX;
            floorCeilingWallPos.y = mapCoords.y + 1.0;
        }

        let currentDistance = 0.0;

        if (drawEnd < 0) 
            drawEnd = screenHeight;

        for (let y = 0; y < Utils.castToInt(drawStart)+2; y++) {
            let red = 0; // Set default ceiling texture to black
            let blue = 0;
            let green = 0;
            
            if (showTextures) { // Calculate ceiling texture values instead if box is selected
                currentDistance = screenHeight / (screenHeight - 2.0 * (y - pitch));

                let weight = currentDistance / perpendicularWallDistance;
                
                let currentCeiling = new Utils.Vector2(weight * floorCeilingWallPos.x + (1.0 - weight) * position.x,
                                            weight * floorCeilingWallPos.y + (1.0 - weight) * position.y)
        
                let ceilingTex = new Utils.Vector2(Utils.castToInt(currentCeiling.x * textureWidth) % textureWidth,
                                        Utils.castToInt(currentCeiling.y * textureHeight) % textureHeight);

                let dimFactor = 0.9 + (0.2 * (currentDistance));
                let fogPercentage = (fogBox.checked) ? 0.08 * currentDistance : 0;

                let pixelindex = (ceilingTex.y * textureWidth + ceilingTex.x) * 4;
                red = ceilingTexture.data[pixelindex] / dimFactor;
                red = red * (1 - fogPercentage) + fogPercentage * 0.1;
                green = ceilingTexture.data[pixelindex+1] / dimFactor;
                green = green * (1 - fogPercentage) + fogPercentage * 0.1;
                blue = ceilingTexture.data[pixelindex+2] / dimFactor;
                blue = blue * (1 - fogPercentage) + fogPercentage * 0.1;
            }
            
            renderer.drawPixel(x, y, red, green, blue);
        }

        for (let y = Utils.castToInt(drawEnd)-2; y < screenHeight; y++) {
            let red = 0; // Set default floor texture to black
            let blue = 0;
            let green = 0;
            
            if (showTextures) { // Calculate floor texture values instead if box is selected
                currentDistance = screenHeight / (2.0 * (y - pitch) - screenHeight);
        
                let weight = currentDistance / perpendicularWallDistance;
                
                let currentFloor = new Utils.Vector2(weight * floorCeilingWallPos.x + (1.0 - weight) * position.x,
                                            weight * floorCeilingWallPos.y + (1.0 - weight) * position.y)
        
                let floorTex = new Utils.Vector2(Utils.castToInt(currentFloor.x * textureWidth) % textureWidth,
                                        Utils.castToInt(currentFloor.y * textureHeight) % textureHeight);

                let dimFactor = 0.9 + (0.2 * (currentDistance));
                let fogPercentage = (fogBox.checked) ? 0.08 * currentDistance : 0;

                let pixelindex = (floorTex.y * textureWidth + floorTex.x) * 4;
                red = groundTexture.data[pixelindex] / dimFactor;
                red = red * (1 - fogPercentage) + fogPercentage * 0.1;
                green = groundTexture.data[pixelindex+1] / dimFactor;
                green = green * (1 - fogPercentage) + fogPercentage * 0.1;
                blue = groundTexture.data[pixelindex+2] / dimFactor;
                blue = blue * (1 - fogPercentage) + fogPercentage * 0.1;
            }

            renderer.drawPixel(x, y, red, green, blue);
        }
    }

    // Render minimap
    renderer.drawRectangle((screenWidth - mapWidth * blockSize - padding), padding, mapWidth * blockSize, mapHeight * blockSize, 66, 66, 66);
    let adjustedPosition = new Utils.Vector2((position.x * blockSize) + (screenWidth - mapWidth * blockSize - padding),
                                       position.y * blockSize + padding); 
    renderer.drawFilledCircle(adjustedPosition.x, adjustedPosition.y, playerSize, 255, 92, 92);
    raysOnMap.forEach(rayOnMap =>
        renderer.drawLine(adjustedPosition, rayOnMap, 255, 92, 92)
    );
    renderer.drawCircle(adjustedPosition.x, adjustedPosition.y, playerSize, 255, 255, 255);
    
    for (const door of doors) {
        if (door.side === 0) {
            let doorBlockLength = (blockSize - 1) * (1.0 - door.offset);
            let doorBlockWidth = Utils.castToInt(blockSize / 2.5);

            let adjustedDoorX = ((door.position.x + 0.5) * blockSize + (screenWidth - mapWidth * blockSize - padding)) - doorBlockWidth / 1.5;
            let adjustedDoorY = (door.position.y * blockSize + padding);
            renderer.drawRectangle(adjustedDoorX, adjustedDoorY, doorBlockWidth, doorBlockLength, 200, 200, 200);
        }

        if (door.side === 1) {
            let doorBlockLength = Utils.castToInt(blockSize / 2.5);
            let doorBlockWidth = (blockSize - 1) * (1.0 - door.offset);

            let adjustedDoorX = (door.position.x * blockSize + (screenWidth - mapWidth * blockSize - padding));
            let adjustedDoorY = ((door.position.y + 0.5) * blockSize + padding) - doorBlockLength / 1.5;
            renderer.drawRectangle(adjustedDoorX, adjustedDoorY, doorBlockWidth, doorBlockLength, 200, 200, 200);
        }
    }

    for (let x = 0; x < mapWidth; x++) {
        for (let y = 0; y < mapHeight; y++) {
            if (map[x][y] > 0)
                renderer.drawRectangle((x * blockSize) + (screenWidth - mapWidth * blockSize - padding), y * blockSize + padding, blockSize - 1, blockSize - 1, 255, 255, 255);
        }
    }

    // Render crosshair
    renderer.drawRectangle(screenWidth / 2, screenHeight / 2 - 9, 2, 20, 255, 255, 255);
    renderer.drawRectangle(screenWidth / 2 - 10 + 1, screenHeight / 2, 20, 2, 255, 255, 255);
    
    renderer.renderBuffer(ctx);

    instructionPrompt.update(timer.getDeltaTime());
    instructionPrompt.render(ctx);

    renderer.drawWhiteText("18px Helvetica", `${(1 / timer.getDeltaTime()).toFixed(3)} FPS`, 5, 25, ctx);

    requestAnimationFrame(main);
}

// Textures
const textureWidth = 64;
const textureHeight = 64;
const textureUrls = ['textures/bricks.png', 'textures/tiles.png', 'textures/tiles.png', 'textures/door.png'];

var wallTexture;
var groundTexture;
var ceilingTexture;
var doorTexture;

Utils.loadImages(textureUrls).then(textures => {
    ctx.drawImage(textures[0], 0, 0);
    wallTexture = ctx.getImageData(0, 0, textureWidth, textureHeight);

    ctx.drawImage(textures[1], 0, 0);
    groundTexture = ctx.getImageData(0, 0, textureWidth, textureHeight);

    ctx.drawImage(textures[2], 0, 0);
    ceilingTexture = ctx.getImageData(0, 0, textureWidth, textureHeight);

    ctx.drawImage(textures[3], 0, 0);
    doorTexture = ctx.getImageData(0, 0, textureWidth, textureHeight);
    
    requestAnimationFrame(main);
});