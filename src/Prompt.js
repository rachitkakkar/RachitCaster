import { castToInt } from "./Utils.js";

/**
 * @class Prompt representing a text prompt to the user.
 */
export class Prompt {
  /**
   * Creates an instance of Prompt.
   * 
   * @param {string} promptText The text of the prompt.
   * @param {number} screenWidth The width of the screen.
   */
  constructor(promptText, screenWidth) {
    this.promptText = promptText;
    this.promptX = screenWidth / 2 - 5 * promptText.length;
    this.promptY = -20;
    this.speed = 75;
    this.rectX = this.promptX - 2.5;
    this.rectY = this.promptY - 20;
    this.rectWidth = 10.5 * promptText.length;
    this.rectHeight = 25;
    this.maxHeight = 35;
    this.isVisible = true;
  }

  /**
   * Updates the y position of the text prompt.
   *
   * @param {number} deltaTime The time to render one frame.
   */
  update(deltaTime) {
    // If the prompt is visible, increase the y position of the prompt text and rectangle
    if (this.isVisible) {
      if (this.promptY < this.maxHeight) {
        this.promptY += castToInt(this.speed * deltaTime); // deltaTime is used to ensure speed is the same regardless of framerate
        this.rectY += castToInt(this.speed * deltaTime);
      }
    }
  }

  /**
   * Render the prompt.
   *
   * @param {Object} ctx The context of the Canvas.
   */
  render(ctx) {
    // Only render if visible
    if (this.isVisible) {
      ctx.font = "17px Helvetica";
      ctx.fillStyle = "white";
      ctx.fillRect(this.rectX, this.rectY, this.rectWidth, this.rectHeight);
      ctx.fillStyle = "black";
      ctx.fillText(this.promptText, this.promptX, this.promptY);
    }
  }

  /**
   * Set the visibilty of the prompt to true.
   */
  show() {
    this.isVisible = true;
  }

  /**
   * Set the visibilty of the prompt to false.
   */
  hide() {
    this.isVisible = false;
  }
}