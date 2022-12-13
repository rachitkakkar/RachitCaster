// Drawing functions
function drawPixel(screen, x, y, screenWidth, red, green, blue) {
    var pixelindex = (y * screenWidth + x) * 4;
    
    screen.data[pixelindex] = red;
    screen.data[pixelindex+1] = green;
    screen.data[pixelindex+2] = blue;
    screen.data[pixelindex+3] = 255;
}

function drawRectangle(screen, x, y, width, height, screenWidth, red, green, blue) {
    for (let xOffset = 0; xOffset < width; xOffset++) {
        for (let yOffset = 0; yOffset < height; yOffset++) {
            drawPixel(screen, x + xOffset, y + yOffset, screenWidth, red, green, blue);
        }
    }
}

function drawVerticalLine(screen, x, start, end, screenWidth, red, green, blue) {
    for (let y = int(start); y <= int(end); y++) {
        drawPixel(screen, x, y, screenWidth, red, green, blue);
    }
}

/*
function drawPixel(x, y, color)
{
    ctx.fillStyle = color;
    ctx.fillRect(x, y, 1, 1);
}

function drawPixelBlock(x, y, width, height, color)
{
    ctx.fillStyle = color;
    ctx.fillRect(x, y, width, height);
}
*/

// Math functions
function int(value) { return parseInt(value); }
function float(value) { return parseFloat(value); }
function rgbToHex(r, g, b) // Unused
{
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

/*
function mapValue(value, leftMin, leftMax, rightMin, rightMax)
{
    var leftSpan = leftMax - leftMin;
    var rightSpan = rightMax - rightMin;
    var valueScaled = float(value - leftMin) / float(leftSpan);
    return rightMin + (valueScaled * rightSpan);
}
*/

function sample(x, y, width, height)
{
    let sx = int(x * width);
    let sy = int(y * height);
    if (x < 0 || x >= width || y < 0 || y >= height)
        return;
    return sx, sy;
}

function Vector2(x, y) 
{
    this.x = x;
    this.y = y;
}