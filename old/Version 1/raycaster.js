//This is the amount we scale the frame calculated using the internal dimensions.
var scaleFactor = 1.5; // Decimal causes "retro-style" artifact 
//The Internal Screen Dimensions are the dimensions that all the calculations are based on.
var internalScreenWidth = window.innerWidth / scaleFactor;
var internalScreenHeight = window.innerHeight / scaleFactor;
//These are the actual displayed dimensions and are scaled up to fit the scaled up frame.
screenWidth = internalScreenWidth * scaleFactor;
screenHeight = internalScreenHeight * scaleFactor;
backgroundColor = "white";
createCanvas();
getDownKeys(keyPush);

//Important Variables
var playerX = 14.7;
var playerY = 5.09;
var playerA = 50;
var playerRotateSpeed = 0.8;
var playerMoveSpeed = 3;
var mapWidth = 32;
var mapHeight = 32;
var gameMap = "";

gameMap += "#########.......#########.......";
gameMap += "#...............#...............";
gameMap += "#.......#########.......########";
gameMap += "#..............##..............#";
gameMap += "#......##......##......##......#";
gameMap += "#......##..............##......#";
gameMap += "#..............##..............#";
gameMap += "###............####............#";
gameMap += "##.......B.....###.............#";
gameMap += "#............####............###";
gameMap += "#........................BB....#";
gameMap += "#..............##.........B....#";
gameMap += "#..............##..............#";
gameMap += "#...........#####...........####";
gameMap += "#..............................#";
gameMap += "###..####....########....#######";
gameMap += "####.####.......######..........";
gameMap += "#...............#...............";
gameMap += "#.......#########.......##..####";
gameMap += "#..............##..............#";
gameMap += "#.B....##......##.......#......#";
gameMap += "#.BB...##......##......##......#";
gameMap += "#..............##..............#";
gameMap += "###............####............#";
gameMap += "##.............###.............#";
gameMap += "#............####............###";
gameMap += "#..................B...........#";
gameMap += "#..................BB..........#";
gameMap += "#..............##..............#";
gameMap += "#...........##..............####";
gameMap += "#..............##..............#";
gameMap += "################################";

var FOV = pi()/2;
var depth = 32;
var deltaTime_ = 0;
var stepSize = 0.01;

//Key handling
function keyPush(evt)
{
    switch(evt.key)
    {
        case "ArrowLeft":
            playerA -= playerRotateSpeed * deltaTime_;
            break;
        case "ArrowRight":
            playerA += playerRotateSpeed * deltaTime_;
            break;
        case "ArrowUp":
            playerX += sin(playerA) * playerMoveSpeed * deltaTime_;
            playerY += cos(playerA) * playerMoveSpeed * deltaTime_;
            
            if (gameMap[int(playerX) * mapWidth + int(playerY)] == '#')
            {
                playerX -= sin(playerA) * playerMoveSpeed * deltaTime_;
                playerY -= cos(playerA) * playerMoveSpeed * deltaTime_;
            }
            break;
        
        case "ArrowDown":
            playerX -= sin(playerA) * playerMoveSpeed * deltaTime_;
            playerY -= cos(playerA) * playerMoveSpeed * deltaTime_;
            
            if (gameMap[int(playerX * mapWidth + playerY)] == '#')
            {
                playerX += sin(playerA) * playerMoveSpeed * deltaTime_;
                playerY += cos(playerA) * playerMoveSpeed * deltaTime_;
            }
            break;
    }
}

function main()
{
    erase();
    deltaTime_ = deltaTime();

    //Draw Walls
    for (var x = 0; x < internalScreenWidth; x++)
    {
        var rayAngle = (playerA - FOV / 2) + (x / internalScreenWidth) * FOV;
        var distanceToWall = 0;
        var hitWall = false;
        
        var eyeX = sin(rayAngle);
        var eyeY = cos(rayAngle);
        while (hitWall != true && distanceToWall < depth)
        {
            distanceToWall += stepSize;
            var testX = playerX +  eyeX * distanceToWall;
            var testY = playerY + eyeY * distanceToWall;
            if (testX < 0 || testX >= mapWidth || testY < 0 || testY >= mapHeight) //Ray has hit the edge of the world
            {
                hitWall = true;
                distanceToWall = depth;
            }
            else
            {
                if (gameMap[int(testY) * mapWidth + int(testX)] == "#") //Ray has hit wall
                {
                    hitWall = true;
                }
            }
        }

        distanceToWall *= cos(rayAngle - playerA); //Correct for fisheye
        var ceiling = (internalScreenHeight / 2) - internalScreenHeight / distanceToWall;
        var floor = internalScreenHeight - ceiling;
        var sampleY = 0; //Y position of the pixel from the wall texture that we draw to the screen
        var ceilingLength = 0;
        var wallLength = 0;

        for (var y = 0; y < internalScreenHeight; y++)
        {
            //Moving the x and y positions so that the scaled pixels are drawn correctly
            y_ = y * scaleFactor; 
            x_ = x * scaleFactor;
            if (y < ceiling) //Ceiling
            {
                ceilingLength++;
            }
            else if (y > ceiling && y < floor)
            {
                if (distanceToWall < depth)
                {
                    sampleY += distanceToWall / 2; // We add 1 to sampleX so next time the pixel under the current pixel is drawn
                    
                    var shade = "";
            
                if (distanceToWall <= depth / 4) {shade = "#807777";}
                    else if (distanceToWall <= depth / 3) {shade = "#6b6868";}
                    else if (distanceToWall <= depth / 2) {shade = "#5c5a5a";}
                    else if (distanceToWall <= depth) {shade = "#4a4a4a";}
                    else {shade = "#333333";}
                    wallLength++;                        
                }
                else
                {
                    drawPixelBlock(x_, y_, scaleFactor, scaleFactor, "#00BFFF"); //If the wall is two far, draw blue
                }
            }
            else
            {            
                drawPixelBlock(x_, y_, scaleFactor, scaleFactor, "#48ab3e");
            }
        }
        drawPixelBlock(x_, 0, scaleFactor, scaleFactor * ceilingLength, "#00BFFF");
        drawPixelBlock(x_, scaleFactor * ceilingLength, scaleFactor, scaleFactor * wallLength, shade);
    }

    ctx.font = "22px Helvetica";
    ctx.fillStyle = "white";
    ctx.fillText("Use Arrow Keys to Move", 5, 25);
}

//Run main every 10 frames
update(main, 10);