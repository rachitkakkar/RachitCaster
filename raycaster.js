import { InputHandler } from "./src/InputHandler.js";
import { Map } from "./src/Map.js";
import { Prompt } from "./src/Prompt.js";
import { RenderBuffer } from "./src/RenderBuffer.js";
import { Timer } from "./src/Timer.js";
import { MiniMap } from "./src/MiniMap.js";
import { OptionsHandler } from "./src/OptionsHandler.js";
import { Player } from "./src/Player.js";
import { Sprite } from "./src/Sprite.js";

import * as Utils from "./src/Utils.js";

// Screen dimensions (scaled to 55% of window with 16/10 aspect ratio)
const aspectRatio = 16.0 / 10.0;
const screenWidth = Utils.castToInt(window.innerWidth * 0.55);
const screenHeight = Utils.castToInt(screenWidth / aspectRatio);

// Dealing with canvas (setting dimensions, creating context)
canvas.width = screenWidth;
canvas.height = screenHeight;
var ctx = canvas.getContext("2d");
var renderer = new RenderBuffer(screenWidth, screenHeight, ctx);

// Player
var player = new Player();

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
inputHandler.bindOnPointerLockMoveAction((event) => { player.rotatePlayer(event, timer, screenWidth, screenHeight); })

var blockSize = Utils.castToInt(screenWidth / 110); // Minimap and crosshair values (calculated based on screen dimensions)
var padding = Utils.castToInt(blockSize / 2);
var playerSize = Utils.castToInt(padding * 4/5);

var miniMap = new MiniMap(blockSize, playerSize, padding);

// Sprite setup
var sprites = [new Sprite(new Utils.Vector2(5, 1.5), barrelTexture)];
var zBuffer = []
for (let z = 0; z < screenWidth; z++) {
  zBuffer.push(0);
}

// Main loop
function main() {
  // Calculate delta time
  timer.calculateDeltaTime();
  
  player.movePlayer(map, timer, inputHandler);
  player.clipPitch(screenHeight);

  // Update doors
  map.resetDoors(timer);
  
  for (let x = 0; x < screenWidth; x++) {
    let cameraX = 2 * x / screenWidth - 1;
    let rayDirection = new Utils.Vector2(player.direction.x + player.plane.x * cameraX, player.direction.y + player.plane.y * cameraX);
    
    let mapCoords = new Utils.Vector2(Utils.castToInt(player.position.x), Utils.castToInt(player.position.y));
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
      sideDistance.x = (player.position.x - mapCoords.x) * deltaDistance.x;
    }
    else {
      step.x = 1;
      sideDistance.x = (mapCoords.x + 1 - player.position.x) * deltaDistance.x;
    }
    if (rayDirection.y < 0) {
      step.y = -1;
      sideDistance.y = (player.position.y - mapCoords.y) * deltaDistance.y;
    }
    else {
      step.y = 1;
      sideDistance.y = (mapCoords.y + 1 - player.position.y) * deltaDistance.y;
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
      selectedDoor = map.checkCollisionWithDoor(player.position, side, sideDistance, deltaDistance, rayDirection, mapCoords, timer);
      if (selectedDoor !== null) {
        hit = true;
        hitDoor = true;
      }
    }

    let perpendicularWallDistance = 0;
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
    miniMap.addRay(renderer, map, player.position, rayDirection, perpendicularWallDistance);
    
    let lineHeight = Utils.castToInt(screenHeight / perpendicularWallDistance);
    let drawStart = screenHeight / 2 - lineHeight / 2 + player.pitch;
    if (drawStart < 0)
      drawStart = 0;
    let drawEnd = screenHeight / 2 + lineHeight / 2 + player.pitch;
    if (drawEnd >= screenHeight)
      drawEnd = screenHeight - 1;

    let wallX;
    if (side === 0)
      wallX = player.position.y + perpendicularWallDistance * rayDirection.y;
    else
      wallX = player.position.x + perpendicularWallDistance * rayDirection.x;
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
    let texturePosition = (drawStart - player.pitch - screenHeight / 2 + lineHeight / 2) * step;
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
        currentDistance = screenHeight / (screenHeight - 2.0 * (y - player.pitch));

        let weight = currentDistance / perpendicularWallDistance;
        
        let currentCeiling = new Utils.Vector2(
          weight * floorCeilingWallPos.x + (1.0 - weight) * player.position.x,
          weight * floorCeilingWallPos.y + (1.0 - weight) * player.position.y
        );

        let ceilingTex = new Utils.Vector2(
          Utils.castToInt(currentCeiling.x * textureWidth) % textureWidth,
          Utils.castToInt(currentCeiling.y * textureHeight) % textureHeight
        );

        let dimFactor = 0.9 + (0.2 * (currentDistance));
        let fogPercentage = (optionsHandler.getOption("fog")) ? 0.1 * currentDistance : 0;

        let pixelIndex = (ceilingTex.y * textureWidth + ceilingTex.x) * 4;
        red = ceilingTexture.data[pixelIndex] / dimFactor;
        red = red * (1 - fogPercentage) + fogPercentage * 0.1;
        green = ceilingTexture.data[pixelIndex+1] / dimFactor;
        green = green * (1 - fogPercentage) + fogPercentage * 0.1;
        blue = ceilingTexture.data[pixelIndex+2] / dimFactor;
        blue = blue * (1 - fogPercentage) + fogPercentage * 0.1;
      }
      
      renderer.drawPixel(x, y, red, green, blue);
    }

    for (let y = Utils.castToInt(drawEnd); y < screenHeight; y++) {
      let red = 0; // Set default floor texture to black
      let blue = 0;
      let green = 0;
      
      if (optionsHandler.getOption("textures")) { // Calculate floor texture values instead if box is selected
        currentDistance = screenHeight / (2.0 * (y - player.pitch) - screenHeight);
    
        let weight = currentDistance / perpendicularWallDistance;
        
        let currentFloor = new Utils.Vector2(
          weight * floorCeilingWallPos.x + (1.0 - weight) * player.position.x,
          weight * floorCeilingWallPos.y + (1.0 - weight) * player.position.y
        );
    
        let floorTex = new Utils.Vector2(
          Utils.castToInt(currentFloor.x * textureWidth) % textureWidth,
          Utils.castToInt(currentFloor.y * textureHeight) % textureHeight
        );

        let dimFactor = 0.9 + (0.2 * (currentDistance));
        let fogPercentage = (optionsHandler.getOption("fog")) ? 0.1 * currentDistance : 0;

        let pixelIndex = (floorTex.y * textureWidth + floorTex.x) * 4;
        red = groundTexture.data[pixelIndex] / dimFactor;
        red = red * (1 - fogPercentage) + fogPercentage * 0.1;
        green = groundTexture.data[pixelIndex+1] / dimFactor;
        green = green * (1 - fogPercentage) + fogPercentage * 0.1;
        blue = groundTexture.data[pixelIndex+2] / dimFactor;
        blue = blue * (1 - fogPercentage) + fogPercentage * 0.1;
      }

      renderer.drawPixel(x, y, red, green, blue);
    }

    // Set zBuffer for sprite casting
    zBuffer[x] = perpendicularWallDistance;
    for (const sprite of sprites) {
      sprite.distance = ((player.position.x - sprite.position.x) * (player.position.x - sprite.position.x) + (player.position.y - sprite.position.y) * (player.position.y - sprite.position.y));
    }
    sprites.sort((a, b) => a.distance - b.distance);
  }

  for (const sprite of sprites) {
    let relSpritePosition = new Utils.Vector2(
      sprite.position.x - player.position.x,
      sprite.position.y - player.position.y
    );

    let invDet = 1.0 / (player.plane.x * player.direction.y - player.direction.x * player.plane.y);
    let transformPosition = new Utils.Vector2(
      invDet * (player.direction.y * relSpritePosition.x - player.direction.x * relSpritePosition.y),
      invDet * (-player.plane.y * relSpritePosition.x + player.plane.x * relSpritePosition.y)
    );

    let spriteScreenX = Utils.castToInt((screenWidth / 2) * (1 + transformPosition.x / transformPosition.y));

    let spriteHeight = Math.abs(Utils.castToInt(screenHeight / (transformPosition.y)));
    let drawStartY = -spriteHeight / 2 + screenHeight / 2 + player.pitch;
    if (drawStartY < 0) drawStartY = 0;
    let drawEndY = spriteHeight / 2 + screenHeight / 2 + player.pitch;
    if (drawEndY >= screenHeight) drawEndY = screenHeight - 1;

    let spriteWidth = Math.abs(Utils.castToInt(screenHeight / (transformPosition.y)));
    let drawStartX = -spriteWidth / 2 + spriteScreenX;
    if (drawStartX < 0) drawStartX = 0;
    let drawEndX = spriteWidth / 2 + spriteScreenX;
    if (drawEndX >= screenWidth) drawEndX = screenWidth - 1;

    for (let stripe =  Utils.castToInt(drawStartX); stripe <  Utils.castToInt(drawEndX); stripe++) {
      let texX = Utils.castToInt(Utils.castToInt(256 * (stripe - (-spriteWidth / 2 + spriteScreenX)) * textureWidth / spriteWidth) / 256);
      // the conditions in the if are:
      // 1) it's in front of camera plane so you don't see things behind you
      // 2) it's on the screen (left)
      // 3) it's on the screen (right)
      // 4) ZBuffer, with perpendicular distance
      if (transformPosition.y > 0 && stripe > 0 && stripe < screenWidth && Utils.castToInt(transformPosition.y) < zBuffer[stripe]) {
        for (let y =  Utils.castToInt(drawStartY); y <  Utils.castToInt(drawEndY); y++) {
          let d = Utils.castToInt((y - player.pitch) * 256 - screenHeight * 128 + spriteHeight * 128);
          let texY = Utils.castToInt(((d * textureHeight) / spriteHeight) / 256);

          // Use distance instead of perpendicular wall distance (zBuffer) or transform position to keep shading consistent across whole sprite
          let dimFactor = 0.8 + (0.085 * sprite.distance);
          let fogPercentage = (optionsHandler.getOption("fog")) ? 0.015 * sprite.distance : 0;

          let pixelIndex = (texY * textureWidth + texX) * 4;
          let red = barrelTexture.data[pixelIndex] / dimFactor;
          red = red * (1 - fogPercentage) + fogPercentage * 0.1;
          let green = barrelTexture.data[pixelIndex+1] / dimFactor;
          green = green * (1 - fogPercentage) + fogPercentage * 0.1;
          let blue = barrelTexture.data[pixelIndex+2] / dimFactor;
          blue = blue * (1 - fogPercentage) + fogPercentage * 0.1;
          if (Utils.castToInt(red) != 0 && Utils.castToInt(green) != 0 && Utils.castToInt(blue) != 0) // Transparency for black
            renderer.drawPixel(stripe, y, red, green, blue);
        }
      }
    }
  }

  // Render minimap
  if (optionsHandler.getOption("map"))
    miniMap.renderMap(renderer, map, player.position);

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
const textureUrls = ["textures/bricks.png", "textures/tiles.png", "textures/tiles.png", "textures/door.png", "textures/barrel 2.png"];

var wallTexture;
var groundTexture;
var ceilingTexture;
var doorTexture;
var barrelTexture;

Utils.loadImages(textureUrls).then(textures => {
  ctx.drawImage(textures[0], 0, 0);
  wallTexture = ctx.getImageData(0, 0, textureWidth, textureHeight);

  ctx.drawImage(textures[1], 0, 0);
  groundTexture = ctx.getImageData(0, 0, textureWidth, textureHeight);

  ctx.drawImage(textures[2], 0, 0);
  ceilingTexture = ctx.getImageData(0, 0, textureWidth, textureHeight);

  ctx.drawImage(textures[3], 0, 0);
  doorTexture = ctx.getImageData(0, 0, textureWidth, textureHeight);

  ctx.drawImage(textures[4], 0, 0);
  barrelTexture = ctx.getImageData(0, 0, textureWidth, textureHeight);

  requestAnimationFrame(main);
});