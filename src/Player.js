import * as Utils from "./Utils.js";

const MOVE_SPEED = 3.7;
/**
 * @class Player representing a class used to control the player.
 */
export class Player {
  /**
   * Creates an instance of Player.
   */
  constructor() {
    this.position = new Utils.Vector2(3.5, 1.5);
    this.direction = new Utils.Vector2(1, 0);
    this.plane = new Utils.Vector2(0, 0.66);
    this.walkTime = 0.0;
    this.pitch = 0.0;
    this.moveSpeed = 3.7;
  }

  /**
   * Checks if a position is a valid move for the player
   */
  canMove(map, newPosition) {
    let canMove = false;
    if (map.getMapValue(newPosition.x, newPosition.y) === 0) {
      canMove = map.playerCanPassThroughAllDoors();
    }
  
    return canMove;
  }

  /**
   * Checks player movement
   */
  movePlayer(map, timer, inputHandler) {
    let moved = false;
    this.moveSpeed = MOVE_SPEED * timer.getDeltaTime();  // Use delta time to calculate a smooth movement speed based on framerate
  
    if (inputHandler.getArrowKey("right")) {
      var newPosition = new Utils.Vector2(this.position.x + (this.plane.x * this.moveSpeed), this.position.y + (this.plane.y * this.moveSpeed));
      if (this.canMove(map, new Utils.Vector2(newPosition.x, this.position.y)))
        this.position.x = newPosition.x;
      if (this.canMove(map, new Utils.Vector2(this.position.x, newPosition.y)))
        this.position.y = newPosition.y;
  
      moved = true;
    }
  
    if (inputHandler.getArrowKey("left")) {
      var newPosition = new Utils.Vector2(this.position.x - (this.plane.x * this.moveSpeed), this.position.y - (this.plane.y * this.moveSpeed));
      if (this.canMove(map, new Utils.Vector2(newPosition.x, this.position.y)))
        this.position.x = newPosition.x;
      if (this.canMove(map, new Utils.Vector2(this.position.x, newPosition.y)))
        this.position.y = newPosition.y;
  
      moved = true;
    }
  
    if (inputHandler.getArrowKey("up")) {
      var newPosition = new Utils.Vector2(this.position.x + (this.direction.x * this.moveSpeed), this.position.y + (this.direction.y * this.moveSpeed));
      if (this.canMove(map, new Utils.Vector2(newPosition.x, this.position.y)))
        this.position.x = newPosition.x;
      if (this.canMove(map, new Utils.Vector2(this.position.x, newPosition.y)))
        this.position.y = newPosition.y;
  
      moved = true;
    }
  
    if (inputHandler.getArrowKey("down")) {
      var newPosition = new Utils.Vector2(this.position.x - (this.direction.x * this.moveSpeed), this.position.y - (this.direction.y * this.moveSpeed));
      if (this.canMove(map, new Utils.Vector2(newPosition.x, this.position.y)))
        this.position.x = newPosition.x;
      if (this.canMove(map, new Utils.Vector2(this.position.x, newPosition.y)))
        this.position.y = newPosition.y;
      
      moved = true;
    }
  
    if (moved) {
      this.walkTime += timer.getDeltaTime();
      this.pitch += (Math.cos(10 * this.walkTime) / 2 * 7);
    }
  }

  rotatePlayer(event, timer, screenWidth, screenHeight) { // Rotation
    let differenceX = event.movementX / screenWidth;
    let differenceY = event.movementY / screenHeight;
    let rotationSpeedX = (differenceX * 60) * timer.getDeltaTime();
    let rotationSpeedY = -(differenceY * 12000) * timer.getDeltaTime();
  
    var newDirection = new Utils.Vector2();
    newDirection.x = this.direction.x * Math.cos(rotationSpeedX) - this.direction.y * Math.sin(rotationSpeedX);
    newDirection.y = this.direction.x * Math.sin(rotationSpeedX) + this.direction.y * Math.cos(rotationSpeedX);
    this.direction = newDirection;
  
    var newPlane = new Utils.Vector2();
    newPlane.x = this.plane.x * Math.cos(rotationSpeedX) - this.plane.y * Math.sin(rotationSpeedX);
    newPlane.y = this.plane.x * Math.sin(rotationSpeedX) + this.plane.y * Math.cos(rotationSpeedX);
    this.plane = newPlane;
  
    this.pitch += rotationSpeedY;
  }

  clipPitch(screenHeight) {
    let clipPitch = 230;
    if (screenHeight / 2 < clipPitch) 
      clipPitch = screenHeight / 2;
    if (this.pitch < -clipPitch)
      this.pitch = -clipPitch;
    if (this.pitch > clipPitch)
      this.pitch = clipPitch;
  }
}