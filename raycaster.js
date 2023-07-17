import { InputHandler } from "./src/InputHandler.js";
import { Map } from "./src/Map.js";
import { Prompt } from "./src/Prompt.js";
import { RenderBuffer } from "./src/RenderBuffer.js";
import { Timer } from "./src/Timer.js";
import { MiniMap } from "./src/MiniMap.js";
import { OptionsHandler } from "./src/OptionsHandler.js";

import * as Utils from "./src/Utils.js";

// Screen dimensions (scaled to 70% of window with 16/10 aspect ratio)
const aspectRatio = 16.0 / 10.0;
const screenWidth = Utils.castToInt(window.innerWidth * 0.7);
const screenHeight = Utils.castToInt(screenWidth / aspectRatio);

// Dealing with canvas (setting dimensions, creating context)
canvas.width = screenWidth;
canvas.height = screenHeight;
var ctx = canvas.getContext("2d");
var renderer = new RenderBuffer(screenWidth, screenHeight, ctx);

// Setup
var instructionPrompt = new Prompt("CLICK TO LOCK MOUSE CURSOR. ARROW KEYS OR WASD TO MOVE.", screenWidth); // Animated prompt at beginning
var timer = new Timer(); // For delta time
var map = new Map(25, 25); // 25 x 25 procedural maze

var optionsHandler = new OptionsHandler(); // Handle options
optionsHandler.addOption("textures");
optionsHandler.addOption("fog");
optionsHandler.addOption("map")
optionsHandler.bindOptions();

var inputHandler = new InputHandler(); // Input and key handling
inputHandler.bind(canvas);
inputHandler.bindOnClickAction(instructionPrompt.hide.bind(instructionPrompt));
inputHandler.bindOnPointerLockMoveAction(rotatePlayer)

var blockSize = Utils.castToInt(screenWidth / 110); // Minimap and crosshair values (calculated based on screen dimensions)
var padding = Utils.castToInt(blockSize / 2);
var playerSize = Utils.castToInt(padding * 4/5);

var miniMap = new MiniMap(blockSize, playerSize, padding);

// Player
const MOVE_SPEED = 3.7;
// const ROTATION_SPEED = 1.25;

var position = new Utils.Vector2(1.5, 1.5);
var direction = new Utils.Vector2(1, 0);
var plane = new Utils.Vector2(0, 0.66);
var walkTime = 0.0;
var pitch = 0.0;

function canMove(newPosition) {
    let canMove = false;
    if (map.getMapValue(newPosition.x, newPosition.y) === 0) {
        canMove = map.playerCanPassThroughAllDoors();
    }

    return canMove;
}

function movePlayer(moveSpeed) { // Movement
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

function rotatePlayer(event) { // Rotation
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
    map.resetDoors(timer);
    
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
        let selectedDoor;
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
            if (map.getMapValue(mapCoords.x, mapCoords.y) > 0) {
                hit = true;
            }

            // Collision with door
            selectedDoor = map.checkCollisionWithDoor(position, side, sideDistance, deltaDistance, rayDirection, mapCoords, timer);
            if (selectedDoor !== null) {
                hit = true;
                hitDoor = true;
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

        // Add ray to be rendered on mini-map
        miniMap.addRay(renderer, map, position, rayDirection, perpendicularWallDistance);
        
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
        if (hitDoor && selectedDoor.state !== "closed")
            offsetedWallX += selectedDoor.offset;
        textureCoords.x = Utils.castToInt(offsetedWallX * textureWidth);
        if (side === 0 && rayDirection.x > 0)
            textureCoords.x = textureWidth - textureCoords.x - 1;
        if (side === 1 && rayDirection.y < 0)
            textureCoords.x = textureWidth - textureCoords.x - 1;

        var step = 1.0 * textureHeight / lineHeight;
        let texturePosition = (drawStart - pitch - screenHeight / 2 + lineHeight / 2) * step;
        for (let y = Utils.castToInt(drawStart); y < Utils.castToInt(drawEnd); y++) {
            textureCoords.y = Utils.castToInt(texturePosition) & (textureHeight - 1);
            texturePosition += step;
            
            let dimFactor = 0.8 + (0.2 * perpendicularWallDistance);
            let fogPercentage = (optionsHandler.getOption("fog")) ? 0.1 * perpendicularWallDistance : 0;

            let selectedTexture;
            if (hitDoor)
                selectedTexture = doorTexture;
            else
                selectedTexture = wallTexture;

            // Divide the actual pixel values of the texture by this "dimmess factor" to make it dimmer or brighter
            // Set default wall to dark gray if wall, or lighter gray if door
            let red = 80;
            let green = 80;
            let blue = 80;
            
            if (hitDoor) {
                red = 120;
                green = 120;
                blue = 120;
            }

            red /=  dimFactor;
            red = red * (1 - fogPercentage) + fogPercentage * 0.1;
            green /= dimFactor;
            green = green * (1 - fogPercentage) + fogPercentage * 0.1;
            blue /= dimFactor;
            blue = blue * (1 - fogPercentage) + fogPercentage * 0.1;

            if (optionsHandler.getOption("textures")) { // Calculate wall texture values instead if box is selected
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

        for (let y = 0; y < Utils.castToInt(drawStart); y++) {
            let red = 0; // Set default ceiling texture to black
            let blue = 0;
            let green = 0;
            
            if (optionsHandler.getOption("textures")) { // Calculate ceiling texture values instead if box is selected
                currentDistance = screenHeight / (screenHeight - 2.0 * (y - pitch));

                let weight = currentDistance / perpendicularWallDistance;
                
                let currentCeiling = new Utils.Vector2(weight * floorCeilingWallPos.x + (1.0 - weight) * position.x,
                                            weight * floorCeilingWallPos.y + (1.0 - weight) * position.y)
        
                let ceilingTex = new Utils.Vector2(Utils.castToInt(currentCeiling.x * textureWidth) % textureWidth,
                                        Utils.castToInt(currentCeiling.y * textureHeight) % textureHeight);

                let dimFactor = 0.9 + (0.2 * (currentDistance));
                let fogPercentage = (optionsHandler.getOption("fog")) ? 0.1 * currentDistance : 0;

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

        for (let y = Utils.castToInt(drawEnd); y < screenHeight; y++) {
            let red = 0; // Set default floor texture to black
            let blue = 0;
            let green = 0;
            
            if (optionsHandler.getOption("textures")) { // Calculate floor texture values instead if box is selected
                currentDistance = screenHeight / (2.0 * (y - pitch) - screenHeight);
        
                let weight = currentDistance / perpendicularWallDistance;
                
                let currentFloor = new Utils.Vector2(weight * floorCeilingWallPos.x + (1.0 - weight) * position.x,
                                            weight * floorCeilingWallPos.y + (1.0 - weight) * position.y)
        
                let floorTex = new Utils.Vector2(Utils.castToInt(currentFloor.x * textureWidth) % textureWidth,
                                        Utils.castToInt(currentFloor.y * textureHeight) % textureHeight);

                let dimFactor = 0.9 + (0.2 * (currentDistance));
                let fogPercentage = (optionsHandler.getOption("fog")) ? 0.1 * currentDistance : 0;

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
    if (optionsHandler.getOption("map"))
        miniMap.renderMap(renderer, map, position);

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
const textureUrls = ["textures/bricks.png", "textures/tiles.png", "textures/tiles.png", "textures/door.png"];

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