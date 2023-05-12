var screenWidth = 0;
var screenHeight = 0;
var title = "";
var lastUpdate = Date.now();
var backgroundColor = "";
var canvas = 0;
var ctx = 0;

//Set up fuctions
function createCanvas()
{
    canvas = document.createElement("canvas");
    canvas.width = screenWidth;
    canvas.height = screenHeight;
    document.body.appendChild(canvas);
    ctx = canvas.getContext("2d");
}
function setTitle()
{
    document.title = title;
}

//Update functions
function update(func, fps)
{
    setInterval(func, 1000/fps);
}
function erase()
{
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, screenWidth, screenHeight);
}
function getDownKeys(func)
{
    document.addEventListener("keydown", func);
}
function deltaTime()
{
    var now = Date.now();
    var deltaTime = (now - lastUpdate) / 1000;
    lastUpdate = now;
    return deltaTime;
}

//Drawing functions
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

//Math functions
function pi()
{
    return 3.14159265358979323846264338327950288419716939937510;
}
function int(value)
{
    return parseInt(value);
}
function float(value)
{
    return parseFloat(value);
}
function round(value)
{
    return Math.round(value);
}
function sin(value)
{
    return Math.sin(value);
}
function cos(value)
{
    return Math.cos(value);
}
function atan(value)
{
    return Math.atan(value);
}
function atan2(value1, value2)
{
    return Math.atan2(value1, value2);
}
function tan(value)
{
    return Math.tan(value);
}
function sqrt(value)
{
    return Math.sqrt(value);
}
function abs(value)
{
    return Math.abs(value);
}
function rgbToHex(r, g, b)
{
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}
function map(value, leftMin, leftMax, rightMin, rightMax)
{
    var leftSpan = leftMax - leftMin;
    var rightSpan = rightMax - rightMin;
    var valueScaled = float(value - leftMin) / float(leftSpan);
    return rightMin + (valueScaled * rightSpan);
}
function sample(x, y, width, height)
{
    sx = int(x * width);
    sy = int(y * height);
    if (x < 0 || x >= width || y < 0 || y >= height)
        return;
    return sx, sy;
}