import * as Utils from "./Utils.js";

export class Sprite {
  constructor(position, texture) {
    this.distance = 0.0;

    this.position = position;
    this.texture = texture;
  }
}

function generateSprites(textures, map) {
  let sprites = [];

  for (let x = 0; x < map.getWidth(); x++) {
    for (let y = 0; y < map.getHeight(); y++) {
      if (map.getMapValue(x, y) === 0) {
        if ((Math.random() * 8) > 7) {
          // Centered position with an offset that is between 0-0.25 (so it doesn't clip into wall) using Math.random()/4
          let position = new Utils.Vector2(x + 0.3 + Math.random()/4, y + 0.3 + Math.random()/4);
          sprites.push(new Sprite(position, textures[Math.floor(Math.random() * textures.length)]));
        }
      }
    }
  }

  console.log(sprites);

  return sprites;
}

export class SpriteHandler {
  constructor(textures, screenWidth, map) {
    this.sprites = generateSprites(textures, map);
    this.zBuffer = []
    for (let z = 0; z < screenWidth; z++) {
      this.zBuffer.push(0);
    }
  }

  updateZBuffer(player, perpendicularWallDistance, x) {
    // Set zBuffer for sprite casting
    this.zBuffer[x] = perpendicularWallDistance;
    for (const sprite of this.sprites) {
      sprite.distance = ((player.position.x - sprite.position.x) * (player.position.x - sprite.position.x) + (player.position.y - sprite.position.y) * (player.position.y - sprite.position.y));
    }
    this.sprites.sort((a, b) => b.distance - a.distance);
  }

  renderSprites(renderer, player, screenWidth, screenHeight, textureWidth, textureHeight, isFog) {
    for (const sprite of this.sprites) {
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
        if (transformPosition.y > 0 && stripe > 0 && stripe < screenWidth && transformPosition.y < this.zBuffer[stripe]) {
          for (let y =  Utils.castToInt(drawStartY); y <  Utils.castToInt(drawEndY); y++) {
            let d = Utils.castToInt((y - player.pitch) * 256 - screenHeight * 128 + spriteHeight * 128);
            let texY = Utils.castToInt(((d * textureHeight) / spriteHeight) / 256);
  
            // Use distance instead of perpendicular wall distance (zBuffer) or transform position to keep shading consistent across whole sprite
            let dimFactor = 0.8 + (0.085 * sprite.distance);
            let fogPercentage = (isFog) ? 0.015 * sprite.distance : 0;
  
            let pixelIndex = (texY * textureWidth + texX) * 4;
            let red = sprite.texture.data[pixelIndex] / dimFactor;
            red = red * (1 - fogPercentage) + fogPercentage * 0.1;
            let green = sprite.texture.data[pixelIndex+1] / dimFactor;
            green = green * (1 - fogPercentage) + fogPercentage * 0.1;
            let blue = sprite.texture.data[pixelIndex+2] / dimFactor;
            blue = blue * (1 - fogPercentage) + fogPercentage * 0.1;
            if (Utils.castToInt(red) != 0 && Utils.castToInt(green) != 0 && Utils.castToInt(blue) != 0) // Transparency for black
              renderer.drawPixel(stripe, y, red, green, blue);
          }
        }
      }
    }
  }
}