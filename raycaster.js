// Screen dimensions
const screenWidth = window.innerWidth;
const screenHeight = window.innerHeight;

// Dealing with canvas
canvas.width = screenWidth;
canvas.height = screenHeight;

var ctx = canvas.getContext("2d");
var screen = ctx.createImageData(screenWidth, screenHeight);

// Delta time
var now;
var lastUpdate;
var deltaTime;

// World representation
function generateMaze(mazeWidth, mazeHeight) {
    if (mazeWidth !== mazeHeight || mazeHeight % 2 !== 1)
        return "Error: Size must be odd and square!"

    // Generate maze
    let maze = [];
    for (let x = 0; x < mazeWidth; x++) {
        let row = [];
        for (let y = 0; y < mazeHeight; y++) {
            row.push(1);
        }
        maze.push(row);
    }

    for (let x = 1; x < mazeWidth-2; x += 2) {
        for (let y = 1; y < mazeHeight-2; y += 2) {
            maze[x][y] = 0;
            
            let direction;
            if (x === 1 && y === 1)
                direction = 0;
            else
                direction = Math.floor(Math.random() * 2);
            if (direction === 0)
                maze[x+1][y] = 0;
            if (direction === 1)
                maze[x][y+1] = 0;
        }
    }

    for (let y = 1; y < mazeHeight-1; y++)
        maze[mazeWidth-2][y] = 0; 
    for (let x = 1; x < mazeWidth-1; x++)
        maze[x][mazeHeight-2] = 0; 

    return maze;
}

/*
const map = 
[
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,2,2,2,2,2,0,0,0,0,3,0,3,0,3,0,0,0,1],
    [1,0,0,0,0,0,2,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,2,0,0,0,2,0,0,0,0,3,0,0,0,3,0,0,0,1],
    [1,0,0,0,0,0,2,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,2,2,0,2,2,0,0,0,0,3,0,3,0,3,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,4,4,4,4,4,4,4,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,4,0,4,0,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,4,0,0,0,0,5,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,4,0,4,0,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,4,0,4,4,4,4,4,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,4,4,4,4,4,4,4,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];
*/

const mapWidth = 25;
const mapHeight = 25;
const map = generateMaze(mapWidth, mapHeight);

// Minimap values
const blockSize = Math.trunc(screenWidth / 120);
const padding = Math.trunc(blockSize / 2);

// Player
const MOVE_SPEED = 3;
const ROTATION_SPEED = 1.5;

var position = new Vector2(1.5, 1.5);
var direction = new Vector2(1, 0);
var plane = new Vector2(0, 0.66);

// Input and key handling
var keyRight = false;
var keyLeft = false;
var keyUp = false;
var keyDown = false;

document.addEventListener("keydown", keyPush);
document.addEventListener("keyup", keyReleased);

function keyPush(event) {
    switch(event.key) {
        case "ArrowRight":
            keyRight = true;
            break;
        case "ArrowLeft":
            keyLeft = true;
            break;

        case "ArrowUp":
            keyUp = true;
            break;
        case "ArrowDown":
            keyDown = true;
            break;
    }
}

function keyReleased(event) {
    switch(event.key) {
        case "ArrowRight":
            keyRight = false;
            break;
        case "ArrowLeft":
            keyLeft = false;
            break;

        case "ArrowUp":
            keyUp = false;
            break;
        case "ArrowDown":
            keyDown = false;
            break;
    }
}

// Movement
function movePlayer(moveSpeed, rotationSpeed) {
    if (keyRight) {
        var newDirection = new Vector2();
        newDirection.x = direction.x * Math.cos(rotationSpeed) - direction.y * Math.sin(rotationSpeed);
        newDirection.y = direction.x * Math.sin(rotationSpeed) + direction.y * Math.cos(rotationSpeed);
        direction = newDirection;

        var newPlane = new Vector2();
        newPlane.x = plane.x * Math.cos(rotationSpeed) - plane.y * Math.sin(rotationSpeed);
        newPlane.y = plane.x * Math.sin(rotationSpeed) + plane.y * Math.cos(rotationSpeed);
        plane = newPlane;
    }

    if (keyLeft) {
        var newDirection = new Vector2();
        newDirection.x = direction.x * Math.cos(-rotationSpeed) - direction.y * Math.sin(-rotationSpeed);
        newDirection.y = direction.x * Math.sin(-rotationSpeed) + direction.y * Math.cos(-rotationSpeed);
        direction = newDirection;

        var newPlane = new Vector2();
        newPlane.x = plane.x * Math.cos(-rotationSpeed) - plane.y * Math.sin(-rotationSpeed);
        newPlane.y = plane.x * Math.sin(-rotationSpeed) + plane.y * Math.cos(-rotationSpeed);
        plane = newPlane;
    }

    if (keyUp) {
        var newPosition = new Vector2(position.x + (direction.x * moveSpeed), position.y + (direction.y * moveSpeed));
        var checkPosition = new Vector2(position.x + (direction.x), position.y + (direction.y));
        if (map[int(checkPosition.x)][int(position.y)] === 0)
            position.x = newPosition.x;
        if (map[int(position.x)][int(checkPosition.y)] === 0) 
            position.y = newPosition.y;
    }

    if (keyDown) {
        var newPosition = new Vector2(position.x - (direction.x * moveSpeed), position.y - (direction.y * moveSpeed));
        var checkPosition = new Vector2(position.x + (direction.x), position.y + (direction.y));
        if (map[int(checkPosition.x)][int(position.y)] === 0)
            position.x = newPosition.x;
        if (map[int(position.x)][int(checkPosition.y)] === 0) 
            position.y = newPosition.y;
    }
}

// Sprite structure
function Sprite(x, y, texture) 
{
    this.x = x;
    this.y = y;
}

// Main loop
function main() {
    // Calculate delta time
    now = Date.now();
    deltaTime = (now - lastUpdate) / 1000;
    lastUpdate = now;

    ctx.putImageData(screen, 0, 0);
    for (let i = 0; i < screenWidth; i++) {
        for (let j = 0; j < screenHeight; j++) {
            drawPixel(screen, i, j, 0, 0, 0);
        }
    }

    // Use delta time to calculate a smooth movement speed based on framerate
    let moveSpeed = MOVE_SPEED * deltaTime;
    let rotationSpeed = ROTATION_SPEED * deltaTime;    var newPosition = new Vector2(position.x + (direction.x * moveSpeed), position.y + (direction.y * moveSpeed));
    movePlayer(moveSpeed, rotationSpeed);
    
    // Draw floor and ceiling
    let leftRayDirection = new Vector2(direction.x - plane.x, direction.y - plane.y);
    let rightRayDirection = new Vector2(direction.x + plane.x, direction.y + plane.y);
    for (let y = 0; y < screenHeight; y++) {
        let p = y - screenHeight / 2;
        let posZ = 0.5 * screenHeight;
        let rowDistance = posZ / p;

        let floorStep = new Vector2(rowDistance * (rightRayDirection.x - leftRayDirection.x) / screenWidth, 
                                rowDistance * (rightRayDirection.y - leftRayDirection.y) / screenWidth); 
        let floor = new Vector2(position.x + rowDistance * leftRayDirection.x, position.y + rowDistance * leftRayDirection.y);

        let dimFactor = 0.8 + (((screenHeight - y - 1) / 5) * 0.01);
        for (let x = 0; x < screenWidth; x++) {
            let cell = new Vector2(int(floor.x), int(floor.y));
            let textureCoords = new Vector2(int(textureWidth * (floor.x - cell.x)) & (textureWidth - 1),
                                            int(textureHeight * (floor.y - cell.y)) & (textureHeight - 1));

            floor.x += floorStep.x;
            floor.y += floorStep.y;
            
            let pixelindex = (textureCoords.y * textureWidth + textureCoords.x) * 4;
            let red = groundTexture.data[pixelindex] / dimFactor;
            let green = groundTexture.data[pixelindex+1] / dimFactor;
            let blue = groundTexture.data[pixelindex+2] / dimFactor;

            drawPixel(screen, x, y, red, green, blue);
            // drawPixel(screen, x, y, 72 / dimFactor, 171 / dimFactor, 62 / dimFactor);
            
            // red = ceilingTexture.data[pixelindex] / dimFactor;
            // green = ceilingTexture.data[pixelindex+1] / dimFactor;
            // blue = ceilingTexture.data[pixelindex+2] / dimFactor;

            // drawPixel(screen, x, screenHeight - y - 1, red, green, blue);
            drawPixel(screen, x, screenHeight - y - 1, 0 / dimFactor, 191 / dimFactor, 255 / dimFactor);
        }
    }

    // drawRectangle(screen, 0, 0, screenWidth, screenHeight / 2, 0, 191, 255);
    // drawRectangle(screen, 0, screenHeight / 2, screenWidth, screenHeight, 72, 171, 62);
    
    for (let x = 0; x < screenWidth; x++) {
        let cameraX = 2 * x / screenWidth - 1;
        let rayDirection = new Vector2(direction.x + plane.x * cameraX, direction.y + plane.y * cameraX);
        
        let mapCoords = new Vector2(int(position.x), int(position.y));
        let sideDistance = new Vector2();
        let deltaDistance = new Vector2(
            (rayDirection.x === 0) ? 1e+30 : Math.abs(1 / rayDirection.x),
            (rayDirection.y === 0) ? 1e+30 : Math.abs(1 / rayDirection.y)
        );

        var step = new Vector2();
        let hit = false;
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

            // Collision with wall
            if (map[mapCoords.x][mapCoords.y] > 0) 
                hit = true;
        }

        let perpendicularWallDistance;
        if (side === 0)
            perpendicularWallDistance = (sideDistance.x - deltaDistance.x);
        else
            perpendicularWallDistance = (sideDistance.y - deltaDistance.y);
    
        let lineHeight = int(screenHeight / perpendicularWallDistance);
        let drawStart = screenHeight / 2 - lineHeight / 2;
        if (drawStart < 0)
            drawStart = 0;
        let drawEnd = screenHeight / 2 + lineHeight / 2;
        if (drawEnd >= screenHeight)  
            drawEnd = screenHeight - 1;

        let wallX;
        if (side === 0)
            wallX = position.y + perpendicularWallDistance * rayDirection.y;
        else
            wallX = position.x + perpendicularWallDistance * rayDirection.x;
        wallX -= Math.floor(wallX);

        let textureCoords = new Vector2();
        textureCoords.x = int(wallX * textureWidth);
        if (side === 0 && rayDirection.x > 0)
            textureCoords.x = textureWidth - textureCoords.x - 1;
        if (side === 1 && rayDirection.y < 0)
            textureCoords.x = textureWidth - textureCoords.x - 1;

        var step = 1.0 * textureHeight / lineHeight;
        let texturePosition = (drawStart - screenHeight / 2 + lineHeight / 2) * step;
        for (let y = int(drawStart); y < int(drawEnd); y++) {
            textureCoords.y = int(texturePosition) & (textureHeight - 1);
            texturePosition += step;

            // Calculate the lighting of the texture based on the height of the line being rendered (which is based off of distance)
            let nearness;
            if (lineHeight > 100) // If the line is bigger than a 100 pixels, make it full brightness
                nearness = 100;
            else
                nearness = lineHeight;

            // Add 0.01 to the "dimness factor" for every pixel in the difference between the line height and a 100 pixels
            let dimFactor = 0.8 + (0.01 * (100 - nearness)); // Make the max "dimness factor" 0.8 so it is slightly brighter than the actual texture
            /*
            let dimFactor = 0.8;
            let temp = dimFactor;
            for (let i = 100; i >= 0; i -= 1) {
                temp += 0.01;
                if (lineHeight < i)
                    dimFactor = temp;
            }
            */
            
            // Divide the actual pixel values of the texture by this "dimmess factor" to make it dimmer or brighter
            pixelindex = (textureCoords.y * textureWidth + textureCoords.x) * 4;
            let red = wallTexture.data[pixelindex] / dimFactor;
            let green = wallTexture.data[pixelindex+1] / dimFactor;
            let blue = wallTexture.data[pixelindex+2] / dimFactor;

            drawPixel(screen, x, y, red, green, blue);
        }
    }


    // Render minimap
    for (let x = 0; x < mapWidth; x++) {
        for (let y = 0; y < mapHeight; y++) {
            if (map[x][y] > 0)
                drawRectangle(screen, (x * blockSize) + (screenWidth - mapWidth * blockSize - padding), y * blockSize + padding, blockSize, blockSize, 0, 255, 0);
            else
                drawRectangle(screen, (x * blockSize) + (screenWidth - mapWidth * blockSize - padding), y * blockSize + padding, blockSize, blockSize, 0, 0, 0);
        }
    }

    let adjustedPosition = new Vector2((position.x * blockSize) + (screenWidth - mapWidth * blockSize - padding),
                                       position.y * blockSize + padding);
    let leftAngle = new Vector2(((position.x + direction.x - plane.x) * blockSize) + (screenWidth - mapWidth * blockSize - padding),
                                (position.y + direction.y - plane.y) * blockSize + padding);
    let rightAngle = new Vector2(((position.x + direction.x + plane.x) * blockSize) + (screenWidth - mapWidth * blockSize - padding),
                                 (position.y + direction.y + plane.y) * blockSize + padding);
    
    // drawRectangle(screen, adjustedPosition.x, adjustedPosition.y, blockSize, blockSize, 255, 255, 255);    
    drawPixel(screen, adjustedPosition.x, adjustedPosition.y, 255, 255, 255);
    drawCircle(screen, adjustedPosition.x, adjustedPosition.y, 3, 255, 255, 255);
    drawLine(screen, new Vector2(adjustedPosition.x, adjustedPosition.y), leftAngle, 255, 255, 255);
    drawLine(screen, new Vector2(adjustedPosition.x, adjustedPosition.y), rightAngle, 255, 255, 255);

    ctx.putImageData(screen, 0, 0);

    window.requestAnimationFrame(main);

    ctx.font = "22px Helvetica";
    ctx.fillStyle = "white";
    ctx.fillText("Use Arrow Keys to Move", 5, 25);
    // ctx.fillText(`${(1 / deltaTime).toFixed(3)} FPS`, 5, 50);
}

// Textures
const textureWidth = 64;
const textureHeight = 64;
const textureUrls = ['textures/bricks.png', 'textures/tiles.png'];

loadImages(textureUrls).then(textures => {
    ctx.drawImage(textures[0], 0, 0);
    wallTexture = ctx.getImageData(0, 0, textureWidth, textureHeight);

    ctx.drawImage(textures[1], 0, 0);
    groundTexture = ctx.getImageData(0, 0, textureWidth, textureHeight);

    // ctx.drawImage(textures[2], 0, 0);
    // ceilingTexture = ctx.getImageData(0, 0, textureWidth, textureHeight);

    spriteArray = [
        Sprite(20.5, 11.5, '')
    ]
    
    main();
});