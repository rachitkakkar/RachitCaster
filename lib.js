// Util export functions
export async function loadImage(imageUrl) {
    let img;
    const imageLoadPromise = new Promise(resolve => {
        img = new Image();
        img.onload = resolve;
        img.src = imageUrl;
    });

    await imageLoadPromise;
    return img;
}

export async function loadImages(imageUrlArray) {
    const promiseArray = [];
    const imageArray = [];

    for (let imageUrl of imageUrlArray) {

        promiseArray.push(new Promise(resolve => {
            const img = new Image();
            img.onload = resolve;
            img.src = imageUrl;
            imageArray.push(img);
        }));
    }

    await Promise.all(promiseArray);
    return imageArray;
}

// Drawing export functions
export function drawPixel(screen, x, y, red, green, blue) {
    let pixelindex = (int(y) * screen.width + int(x)) * 4;
    
    screen.data[pixelindex] = red;
    screen.data[pixelindex+1] = green;
    screen.data[pixelindex+2] = blue;
    screen.data[pixelindex+3] = 255;
}

/*
export function getPixel(screen, x, y) {
    let pixelindex = (y * screenWidth + x) * 4;
    let red = screen.data[pixelindex]
    let green = screen.data[pixelindex+1];
    let blue = screen.data[pixelindex+2];

    return [red, green, blue];
}
*/

export function drawRectangle(screen, x, y, width, height, red, green, blue) {
    for (let xOffset = 0; xOffset < width; xOffset++) {
        for (let yOffset = 0; yOffset < height; yOffset++) {
            drawPixel(screen, int(x) + xOffset, int(y) + yOffset, red, green, blue);
        }
    }
}

export function drawVerticalLine(screen, x, start, end, red, green, blue) {
    for (let y = int(start); y <= int(end); y++) {
        drawPixel(screen, x, y, red, green, blue);
    }
}

export function drawLine(screen, p1, p2, red, green, blue) {
    // Create copies so the original values aren't affected (just in case!)
    let point1 = new Vector2(int(p1.x), int(p1.y));
    let point2 = new Vector2(int(p2.x), int(p2.y));

    let dx = point2.x - point1.x;
    let dy = point2.y - point1.y;
    if (Math.abs(dx) > Math.abs(dy)) {
        if (point1.x > point2.x) {
            swapPoints(point1, point2);
        }
        let a = dy / dx;
        let y = point1.y;
        for (let x = point1.x; x < point2.x; x++) {
            drawPixel(screen, x, y, red, green, blue);
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
            drawPixel(screen, x, y, red, green, blue);
            x += a;
        }
    }
}

export function eightWayPlot(screen, xc, yc, x, y, red, green, blue) {
    drawPixel(screen, xc+x, yc+y, red, green, blue);
    drawPixel(screen, xc-x, yc+y, red, green, blue);
    drawPixel(screen, xc+x, yc-y, red, green, blue);
    drawPixel(screen, xc-x, yc-y, red, green, blue);
    drawPixel(screen, xc+y, yc+x, red, green, blue);
    drawPixel(screen, xc-y, yc+x, red, green, blue);
    drawPixel(screen, xc+y, yc-x, red, green, blue);
    drawPixel(screen, xc-y, yc-x, red, green, blue);
}

export function drawCircle(screen, centerX, centerY, radius, red, green, blue) { // Bresenham’s circle drawing algorithm
    let x = 0;
    let y = radius;
    let d = 3 - 2 * radius;
    eightWayPlot(screen, centerX, centerY, x, y, red, green, blue);
    while (y >= x) {
        x++;

        if (d > 0) {
            y--;
            d = d + 4 * (x - y) + 10;
        }
        else
            d = d + 4 * x + 6;
        
        eightWayPlot(screen, centerX, centerY, x, y, red, green, blue);
    }
}

export function drawFilledCircle(screen, centerX, centerY, radius, red, green, blue) { // Solution from StackOverflow
    for (let x = -radius; x < radius ; x++) {
        let hh = int(Math.sqrt(radius * radius - x * x));
        let rx = centerX + x;
        let ph = centerY + hh;

        for (let y = centerY-hh; y < ph; y++)
            drawPixel(screen, rx, y, red, green, blue);
    }
}

/*
export function drawPixel(x, y, color)
{
    ctx.fillStyle = color;
    ctx.fillRect(x, y, 1, 1);
}

export function drawPixelBlock(x, y, width, height, color)
{
    ctx.fillStyle = color;
    ctx.fillRect(x, y, width, height);
}
*/

export function clearScreen(screen) {
    for (let i = 0; i < screen.width; i++) {
        for (let j = 0; j < screen.height; j++) {
            drawPixel(screen, i, j, 0, 0, 0);
        }
    }
}

// Math export functions
export function int(value) { // Originally parseInt(), but it was very slow and affected performance considerably
    return ~~value; 
}

export function float(value) { 
    return parseFloat(value); 
}

export function RGBToHex(r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

export function RGBToInt(red, green, blue) {
    var r = red & 0xFF;
    var g = green & 0xFF;
    var b = blue & 0xFF;

    return (r << 24) + (g << 16) + (b << 8) + 255;
}

export function intToRGB(i) {
    return {
        red: i >> 24 & 0xFF,
        green: i >> 16 & 0xFF,
        blue: i >> 8 & 0xFF,
    }
}

export function mapValue(value, leftMin, leftMax, rightMin, rightMax)
{
    var leftSpan = leftMax - leftMin;
    var rightSpan = rightMax - rightMin;
    var valueScaled = float(value - leftMin) / float(leftSpan);
    return rightMin + (valueScaled * rightSpan);
}

export function swapPoints(point1, point2) {
    let temp = point1.x;
    point1.x = point2.x;
    point2.x = temp;

    temp = point1.y;
    point1.y = point2.y;
    point2.y = temp;
}

export function interpolate(i0, d0, i1, d1) {
    let values = [];
    let a = (d1 - d0) / (i1 - i0);
    let d = d0;
    for (let i = i0; i < i1; i++) {
        values.push(d);
        d += a;
    }

    return values;
}

export function Vector2(x, y) {
    this.x = x;
    this.y = y;
}