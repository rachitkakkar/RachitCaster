import { castToInt, Vector2, swapPoints } from "./Utils.js";

/**
 * @class RenderBuffer representing a buffer that pixels can be drawn to.
 */
export class RenderBuffer {
    /**
     * Creates an instance of RenderBuffer.
     * 
     * @param {number} screenWidth The width of the screen.
     * @param {number} screenHeight The height of the screen.
     * @param {CanvasRenderingContext2D} ctx The context of the canvas.
     */
    constructor(screenWidth, screenHeight, ctx) {
        /**
         * @property {number} screenWidth The width of the buffer.
         */
        this.screenWidth = screenWidth;

        /**
         * @property {number} screenHeight The height of the buffer.
         */
        this.screenHeight = screenHeight;

        /**
         * @property {ImageData} buffer The actual buffer (same size as screen).
         */
        this.buffer = ctx.createImageData(this.screenWidth, this.screenHeight);
    }

    /**
     * Draws a pixel to the buffer.
     *
     * @param {number} x The x position of the pixel.
     * @param {number} y The y position of the pixel.
     * @param {number} red The red value of the RGB color of the pixel.
     * @param {number} green The green value of the RGB color of the pixel.
     * @param {number} blue The blue value of the RGB color of the pixel.
     */
    drawPixel(x, y, red, green, blue) {
        // Check if the pixel is within bounds
        if (x > 0 && x < this.screenWidth) {
            if (y > 0 && y < this.screenHeight) {
                let pixelindex = (castToInt(y) * this.screenWidth + castToInt(x)) * 4; // Calculate its index on the buffer (each pixel is 4 bits)
                
                // Set the pixel to the RGB value provided with full opacity
                this.buffer.data[pixelindex] = red;
                this.buffer.data[pixelindex+1] = green;
                this.buffer.data[pixelindex+2] = blue;
                this.buffer.data[pixelindex+3] = 255;
            }
        }
    }

    /**
     * Draws a rectangle to the buffer.
     *
     * @param {number} x The x position of the rectangle.
     * @param {number} y The y position of the rectangle.
     * @param {number} width The width of the rectangle.
     * @param {number} height The height of the rectangle.
     * @param {number} red The red value of the RGB color of the rectangle.
     * @param {number} green The green value of the RGB color of the rectangle.
     * @param {number} blue The blue value of the RGB color of the rectangle.
     */
    drawRectangle(x, y, width, height, red, green, blue) {
        // Draw a pixel from x to x + width and y to y + height with the right colors
        for (let xOffset = 0; xOffset < width; xOffset++) {
            for (let yOffset = 0; yOffset < height; yOffset++) {
                this.drawPixel(x + xOffset, y + yOffset, red, green, blue);
            }
        }
    }

    /**
     * Draws a vertical line to the buffer.
     *
     * @param {number} x The x position of the line.
     * @param {number} start The starting y position of the line.
     * @param {number} end The ending y position of the line.
     * @param {number} red The red value of the RGB color of the line.
     * @param {number} green The green value of the RGB color of the line.
     * @param {number} blue The blue value of the RGB color of the line.
     */
    drawVerticalLine(x, start, end, red, green, blue) {
        // Draw a pixel at position x from the starting y to ending y
        for (let y = castToInt(start); y <= castToInt(end); y++) {
            this.drawPixel(x, y, red, green, blue);
        }
    }

    /**
     * Draws any line to the buffer.
     *
     * @param {Vector2} p1 The first point of the line.
     * @param {Vector2} p2 The second point of the line.
     * @param {number} red The red value of the RGB color of the line.
     * @param {number} green The green value of the RGB color of the line.
     * @param {number} blue The blue value of the RGB color of the line.
     */
    drawLine(p1, p2, red, green, blue) {
        // Create copies to ensure integers
        let point1 = new Vector2(castToInt(p1.x), castToInt(p1.y));
        let point2 = new Vector2(castToInt(p2.x), castToInt(p2.y));

        // Draw a line form the x and y position of the first point to the x and y position of the second point.
        let dx = point2.x - point1.x;
        let dy = point2.y - point1.y;
        if (Math.abs(dx) > Math.abs(dy)) {
            if (point1.x > point2.x) {
                swapPoints(point1, point2);
            }
            let a = dy / dx;
            let y = point1.y;
            for (let x = point1.x; x < point2.x; x++) {
                this.drawPixel(x, y, red, green, blue);
                y += a;
            }
        } 
        
        else {
            if (point1.y > point2.y) {
                swapPoints(point1, point2);
            }

            let a = dx / dy;
            let x = point1.x;
            for (let y = point1.y; y < point2.y; y++) {
                this.drawPixel(x, y, red, green, blue);
                x += a;
            }
        }
    }

    eightWayPlot(xc, yc, x, y, red, green, blue) {
        this.drawPixel(xc+x, yc+y, red, green, blue);
        this.drawPixel(xc-x, yc+y, red, green, blue);
        this.drawPixel(xc+x, yc-y, red, green, blue);
        this.drawPixel(xc-x, yc-y, red, green, blue);
        this.drawPixel(xc+y, yc+x, red, green, blue);
        this.drawPixel(xc-y, yc+x, red, green, blue);
        this.drawPixel(xc+y, yc-x, red, green, blue);
        this.drawPixel(xc-y, yc-x, red, green, blue);
    }

    drawCircle(centerX, centerY, radius, red, green, blue) { // Bresenham’s circle drawing algorithm
        let x = 0;
        let y = radius;
        let d = 3 - 2 * radius;
        this.eightWayPlot(centerX, centerY, x, y, red, green, blue);
        while (y >= x) {
            x++;
    
            if (d > 0) {
                y--;
                d = d + 4 * (x - y) + 10;
            }
            else {
                d = d + 4 * x + 6;
            }
            
            this.eightWayPlot(centerX, centerY, x, y, red, green, blue);
        }
    }

    drawFilledCircle(centerX, centerY, radius, red, green, blue) { // Solution from StackOverflow
        for (let x = -radius; x <= radius ; x++) {
            let hh = castToInt(Math.sqrt(radius * radius - x * x));
            let rx = centerX + x;
            let ph = centerY + hh;
    
            for (let y = centerY-hh; y <= ph; y++)
                this.drawPixel(rx, y, red, green, blue);
        }
    }

    drawWhiteText(font, text, x, y, ctx) {
        ctx.font = font;
        ctx.fillStyle = "white";
        ctx.fillText(text, x, y);
    }

    clearScreen() {
        for (let x = 0; x < this.screenWidth; x++) {
            for (let y = 0; y < this.screenHeight; y++) {
                this.drawPixel(x, y, 0, 0, 0);
            }
        }
    }

    renderBuffer(ctx) {
        ctx.putImageData(this.buffer, 0, 0);
    }
    
    getWidth() {
        return this.screenWidth;
    }

    getHeight() {
        return this.screenHeight;
    }
}