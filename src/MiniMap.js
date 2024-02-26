import { Vector2, castToInt } from "./Utils.js";

export class MiniMap {
  constructor(blockSize, playerSize, padding) {
    this.blockSize = blockSize;
    this.playerSize = playerSize;
    this.padding = padding;

    this.raysOnMap = [];
  }

  addRay(renderer, map, position, rayDirection, distance) {
    let rayOnMap = new Vector2(((position.x + (rayDirection.x * distance)) * this.blockSize) + (renderer.getWidth() - map.getWidth() * this.blockSize - this.padding),
                   (position.y + (rayDirection.y * distance)) * this.blockSize + this.padding);
    this.raysOnMap.push(rayOnMap);
  }
  
  renderMap(renderer, map, position) {
    renderer.drawRectangle((renderer.getWidth() - map.getWidth() * this.blockSize - this.padding), this.padding, map.getWidth() * this.blockSize, map.getHeight() * this.blockSize, 66, 66, 66);

    let adjustedPosition = new Vector2((position.x * this.blockSize) + (renderer.getWidth() - map.getWidth() * this.blockSize - this.padding),
                       position.y * this.blockSize + this.padding);
    renderer.drawFilledCircle(adjustedPosition.x, adjustedPosition.y, this.playerSize, 255, 92, 92);
    this.raysOnMap.forEach(rayOnMap =>
      renderer.drawLine(adjustedPosition, rayOnMap, 255, 92, 92)
    );

    for (const door of map.getDoors()) {
      if (door.side === 0) {
        let doorBlockLength = (this.blockSize - 1) * (1.0 - door.offset);
        let doorBlockWidth = castToInt(this.blockSize / 2.5);
  
        let adjustedDoorX = ((door.position.x + 0.5) * this.blockSize + (renderer.getWidth() - map.getWidth() * this.blockSize - this.padding)) - doorBlockWidth / 1.5;
        let adjustedDoorY = (door.position.y * this.blockSize + this.padding);
        renderer.drawRectangle(adjustedDoorX, adjustedDoorY, doorBlockWidth, doorBlockLength, 200, 200, 200);
      }
  
      if (door.side === 1) {
        let doorBlockLength = castToInt(this.blockSize / 2.5);
        let doorBlockWidth = (this.blockSize - 1) * (1.0 - door.offset);
  
        let adjustedDoorX = (door.position.x * this.blockSize + (renderer.getWidth() - map.getWidth() * this.blockSize - this.padding));
        let adjustedDoorY = ((door.position.y + 0.5) * this.blockSize + this.padding) - doorBlockLength / 1.5;
        renderer.drawRectangle(adjustedDoorX, adjustedDoorY, doorBlockWidth, doorBlockLength, 200, 200, 200);
      }
    }

    for (let x = 0; x < map.getWidth(); x++) {
      for (let y = 0; y < map.getHeight(); y++) {
        if (map.getMapValue(x, y) > 0)
          renderer.drawRectangle((x * this.blockSize) + (renderer.getWidth() - map.getWidth() * this.blockSize - this.padding), y * this.blockSize + this.padding, this.blockSize - 1, this.blockSize - 1, 255, 255, 255);
      }
    }
   
    // Clear rays
    this.raysOnMap = [];
  }
}