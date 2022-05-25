var endOfMap;
var gameChar_x;
var gameChar_y;
var floorPos_y;
var scrollPos;
var gameChar_world_x;

var isLeft;
var isRight;
var isFalling;
var isPlummeting;
var playerDied;
var waitingInput;

var introWaiting;

var trees;
var trees_x;
var clouds;
var mountains;
var birds;
var canyons;
var collectables;
var flagpole;
var platforms;
var enemies;

var game_score;
var lives;

var jumpSound;
var tokenSound;
var backgroundMusic;

//function preload()
//{
//    soundFormats('mp3','wav');
//    
//    //load your sounds here
//    jumpSound = loadSound('assets/jump.wav');
//    tokenSound = loadSound('assets/zapsplat_cartoon_pop_bubble_high_pitched_short_fast_80361.mp3');
//    backgroundMusic = loadSound('assets/music_zapsplat_banana_tree.mp3');
//    jumpSound.setVolume(0.1);
//    tokenSound.setVolume(0.1);
//    backgroundMusic.setVolume(0.05);
//}

//Setup function

function setup()
{
    
    createCanvas(1024, 576);
    endOfMap = 3000;
    floorPos_y = height * 3/4;
	lives = 3;
    game_score = 0;
    // backgroundMusic.loop();
    
    // Flagpole
    
    flagpole = 
    {
        x_pos: 3000,
        isReached: false
    };
    
    //Mountains
    
    mountains = [];
    createMountains(12);
    
    //Birds 
    
    birds = [];
    // createBirds();
    
    // Trees
    
    trees = [];
    createTrees(50);
    
    // Collectables
    
    collectables = [];
    for(var i = 0; i < 5; i++)
    {
        collectables.push(createCollectable(450 + i * 30));
    }
    for(var i = 0; i < 10; i++)
    {
        collectables.push(createCollectable(710 + i * 30));
    }
    for(var i = 0; i < 20; i++)
    {
        collectables.push(createCollectable(1500 + i * 25));
    }
    
    // Canyons
    
    canyons = [];
    canyons.push(createCanyon(350, 65))
    canyons.push(createCanyon(600, 80))
    canyons.push(createCanyon(1000, 70))
    canyons.push(createCanyon(1400, 75))
    canyons.push(createCanyon(2000, 75))
    
    startGame();
    //noLoop();
}

// Start game function

function startGame()
{
    gameChar_x = width/8;
	gameChar_y = floorPos_y;
	// Variable to control the background scrolling.
	
    scrollPos = 0;

	// Variable to store the real position of the gameChar in the game world. Needed for collision detection.
	
    gameChar_world_x = gameChar_x - scrollPos;

	// Boolean variables to control the movement of the game character.
	
    isLeft = false;
	isRight = false;
	isFalling = false;
	isPlummeting = false;
    playerDied = false;
    waitingInput = false;
    
    // Set introWaiting to true for intro load screening
    
    introWaiting = true;
    

	// Initialise arrays of scenery objects.
    
    // Clouds
    
    clouds = [];
    
    for(i = 0; i < 20; i++)
    {
        var cloud = 
            {
                x_pos: random(100) + i * 200,
                y_pos: random(50, 100),
                size: 85
            }
        clouds.push(cloud);
    }
    
    // Platform
    
    platforms = [];
    platforms.push(createPlatforms(800, floorPos_y - 75, 100));
    platforms.push(createPlatforms(1600, floorPos_y - 75, 50));
    platforms.push(createPlatforms(1750, floorPos_y - 75, 50));
    platforms.push(createPlatforms(1900, floorPos_y - 75, 50));
    //platforms.push(createPlatforms(100, floorPos_y - 215, 100));
    //platforms.push(createPlatforms(100, floorPos_y - 284, 100));
    
    //Enemies 
    
    enemies = [];
    enemies.push(new Enemy(750, floorPos_y, 200, 1.5, 1))
    enemies.push(new Enemy(1550, floorPos_y, 400, 1.5, 1))
    enemies.push(new Enemy(1950, floorPos_y, 400, -1.5, -1))
}

function draw()
{   
    background(100, 155, 255); // fill the sky blue
	noStroke();
	fill(0,155,0);
	rect(0, floorPos_y, width, height/4); // draw some green ground
    
    //Translate scenery
    push();
    translate(scrollPos, 0);

	// Draw clouds.
    
    drawClouds();
    

	// Draw mountains.
    
    drawMountains();    

	// Draw trees.
    
    drawTrees(); 
    
    // Canyons
    
    for(var i = 0; i < canyons.length; i++)
    {
        canyons[i].draw();
        if(canyons[i].checkCanyon(gameChar_world_x, gameChar_y))
        {
            isPlummeting = true;
            isLeft = false;
            isRight = false;
        }
    }
    
    // Draw collectable items.
    
    for(var i = 0; i < collectables.length; i++)
    {
        if(!collectables[i].isFound)
        {
            collectables[i].draw();
            if (collectables[i].checkCollectable(gameChar_world_x, gameChar_y))
            {
                collectables[i].isFound = true; 
                game_score += 1; // increase score when collectable is found
                //tokenSound.play();
            }
        }
    }
    
    // Draw flagpole
    
    renderFlagpole();
    
    // Draw Platforms
    
    for(var i = 0; i < platforms.length; i++)
    {
        platforms[i].draw();
    }
    
    // Draw enemies
    
    for(var i = 0; i < enemies.length; i++)
    {
        enemies[i].draw();
    }
    
    //Restore drawing state
    
    pop();

	// Draw game character.
	
    drawGameChar();
    
    // Draw game score
    
    drawScore();
    
    // Draw life tokens
    drawLifeTokens();
    
    // Check if character has died 
    
    checkPlayerDie(); 
    
    // Check flagpole
    
    checkFlagpole();
    
	// Logic to make the game character move or the background scroll.
	
    if(isLeft)
	{
		if(gameChar_x > width * 0.8)
		{
			gameChar_x -= 4;
		}
		else
        {
			scrollPos += 4;
		}
	}

	if(isRight)
	{
		if(gameChar_x < width * 0.2)
		{
			gameChar_x  += 4;
		}
		else
		{
			scrollPos -= 4; // negative for moving against the background
		}
	}

	// Logic to make the game character rise and fall.
    
    if(gameChar_y < floorPos_y)
    {
        var isContact = false;
        var isCaught = false;
        for(var i = 0; i < platforms.length; i++)
        {
            if(platforms[i].checkContact(gameChar_world_x, gameChar_y))
            {
                isContact = true;
                isFalling = false;
                break;
            }
        }
        for(var i = 0; i < enemies.length; i++)
        {
            if(enemies[i].checkContact(gameChar_world_x, gameChar_y))
            {
                isFalling = true;
                isCaught = true;
                break;
            }
        }
        if(isContact == false && isCaught == false)
        {
            isFalling = true;
            gameChar_y += 4;
        }

    }
    else
    {
        isFalling = false;
    }
    
    //Logic to make character plummet down canyon
    
    if(isPlummeting)
    {
        gameChar_y += 4; 
    }

	// Update real position of gameChar for collision detection.
    
	gameChar_world_x = gameChar_x - scrollPos;
    
    if(introWaiting) 
    {
        intro();
    }
}


// ---------------------
// Key control functions
// ---------------------

function keyPressed()
{

    // if statements to control the animation of the character when keys are pressed. 
    
    if(keyCode == 37)
    {
        isLeft = true;
    }

    if(keyCode == 39)
    {
        isRight = true;
    }

    if(keyCode == 32 && isFalling == false && isPlummeting == false && introWaiting == false)
    {
        gameChar_y -= 100;
        //jumpSound.play();
    }
    
    if(keyCode == 32 && waitingInput == true)
    {
        startGame();
    }

    // Restart game after all lives lost

    if(keyCode == 32 && lives < 1)
    {
        setup();
    }

    // Restart game after level complete

    if(keyCode == 32 && flagpole.isReached)
    {
        setup();
    }
    
    if(keyCode == 32 && introWaiting == true)
    {
        //redraw();
        //loop();
        introWaiting = false;
    }

}

function keyReleased()
{
	// if statements to control the animation of the character when keys are released.

    if (keyCode == 37)
    {
        isLeft = false;
    }
    
    if (keyCode == 39)
    {
        isRight = false;
    }
}


// ------------------------------
// Game character render function
// ------------------------------

// Function to draw the game character.

function drawGameChar()
{
	// draw game character
    
    if(isLeft && isFalling)
	{
		// add your jumping-left code
        stroke(0);
        noFill();
        ellipse(gameChar_x, gameChar_y - 65, 20); //Head
        line(gameChar_x, gameChar_y - 55, gameChar_x, gameChar_y - 28); //Body
        line(gameChar_x, gameChar_y - 51, gameChar_x - 10, gameChar_y - 75); //R Arm
        line(gameChar_x, gameChar_y - 51, gameChar_x - 10, gameChar_y - 75); //L Arm
        line(gameChar_x, gameChar_y - 28, gameChar_x + 3, gameChar_y - 5); //R Leg
        line(gameChar_x, gameChar_y - 28, gameChar_x + 3, gameChar_y - 5); //L Leg
	}
	else if(isRight && isFalling)
	{
		// add your jumping-right code
        stroke(0);
        noFill();
        ellipse(gameChar_x, gameChar_y - 65, 20); //Head
        line(gameChar_x, gameChar_y - 55, gameChar_x, gameChar_y - 28); //Body
        line(gameChar_x, gameChar_y - 51, gameChar_x + 10, gameChar_y - 75); //R Arm
        line(gameChar_x, gameChar_y - 51, gameChar_x + 10, gameChar_y - 75); //L Arm
        line(gameChar_x, gameChar_y - 28, gameChar_x - 3, gameChar_y - 5); //R Leg
        line(gameChar_x, gameChar_y - 28, gameChar_x - 3, gameChar_y - 5); //L Leg
	}
	else if(isLeft)
	{
		// add your walking left code
        stroke(0);
        noFill();
        ellipse(gameChar_x, gameChar_y - 60, 20); //Head
        line(gameChar_x, gameChar_y - 50, gameChar_x, gameChar_y - 20); //Body
        line(gameChar_x, gameChar_y - 46, gameChar_x - 6, gameChar_y - 28); //R arm
        line(gameChar_x, gameChar_y - 46, gameChar_x + 6, gameChar_y - 28); //L arm
        line(gameChar_x, gameChar_y - 20, gameChar_x - 6, gameChar_y); //R leg
        line(gameChar_x, gameChar_y - 20, gameChar_x + 6, gameChar_y); //L leg
	}
	else if(isRight)
	{
		// add your walking right code
        stroke(0);
        noFill();
        ellipse(gameChar_x, gameChar_y - 60, 20); //Head
        line(gameChar_x, gameChar_y - 50, gameChar_x, gameChar_y - 20); //Body
        line(gameChar_x, gameChar_y - 46, gameChar_x - 6, gameChar_y - 28); //R arm
        line(gameChar_x, gameChar_y - 46, gameChar_x + 6, gameChar_y - 28); //L arm
        line(gameChar_x, gameChar_y - 20, gameChar_x - 6, gameChar_y); //R leg
        line(gameChar_x, gameChar_y - 20, gameChar_x + 6, gameChar_y); //L leg
	}
	else if(isFalling || isPlummeting)
	{
		// add your jumping facing forwards code
        stroke(0);
        noFill();
        ellipse(gameChar_x, gameChar_y - 65, 20); //Head
        strokeWeight(2);
        point(gameChar_x - 4, gameChar_y - 67); //R Eye
        point(gameChar_x + 4, gameChar_y - 67); //L Eye
        strokeWeight(1);
        ellipse(gameChar_x, gameChar_y - 61, 5); //Mouth
        line(gameChar_x, gameChar_y - 55, gameChar_x, gameChar_y - 28); //Body
        line(gameChar_x, gameChar_y - 51, gameChar_x - 16, gameChar_y - 60); //R Arm
        line(gameChar_x, gameChar_y - 51, gameChar_x + 16, gameChar_y - 60); //L Arm
        line(gameChar_x, gameChar_y - 28, gameChar_x - 3, gameChar_y - 5); //R Leg
        line(gameChar_x, gameChar_y - 28, gameChar_x + 3, gameChar_y - 5); //L Leg
	}
	else
	{
		// add your standing front facing code
        stroke(0);
        noFill();
        ellipse(gameChar_x, gameChar_y - 60, 20); //Head
        strokeWeight(2);
        point(gameChar_x - 4, gameChar_y - 62); //R eye
        point(gameChar_x + 4, gameChar_y - 62); //L eye
        strokeWeight(1);
        arc(gameChar_x, gameChar_y - 58, 10, 8, 0, PI); //Mouth
        line(gameChar_x, gameChar_y - 50, gameChar_x, gameChar_y - 20); //Body
        line(gameChar_x, gameChar_y - 46, gameChar_x - 6, gameChar_y - 28); //R arm
        line(gameChar_x, gameChar_y - 46, gameChar_x + 6, gameChar_y - 28); //L arm
        line(gameChar_x, gameChar_y - 20, gameChar_x - 6, gameChar_y); //R leg
        line(gameChar_x, gameChar_y - 20, gameChar_x + 6, gameChar_y); //L leg
    }
}

// ---------------------------
// Background render functions
// ---------------------------

// Function to draw cloud objects.

function drawClouds()
{
    for(var i=0; i < clouds.length; i++)
    {
        fill(255);
        ellipse(clouds[i].x_pos, clouds[i].y_pos, clouds[i].size, clouds[i].size * 0.8);
        ellipse(clouds[i].x_pos - 30, clouds[i].y_pos + 10, clouds[i].size * 0.9, clouds[i].size * 0.7);
        ellipse(clouds[i].x_pos + 30, clouds[i].y_pos + 10, clouds[i].size * 0.9, clouds[i].size * 0.7);
    }
}

//Function to create Mountains

function createMountains(m)
{
    for(var i = 0; i < m; i++)
    {
        var mountain =
        {
            x: random(-100, endOfMap),
            size: random(0, 200)
        }
        mountains.push(mountain);
    }
}

// Function to draw mountains objects.

function drawMountains()
{
    for(var i=0; i < mountains.length; i++)
    {
        fill(131,95,0);
        triangle(mountains[i].x - mountains[i].size, floorPos_y, mountains[i].x + 150, floorPos_y - 232 - mountains[i].size, mountains[i].x + 300 + mountains[i].size, floorPos_y);
    }
}

//Birds function 

function birds()
{
    
}

//Function to create Trees

function createTrees(t)
{
    for(var i = 0; i < t; i++)
    {
        var tree =
        {
            x: random(-100, endOfMap)
        }
        trees.push(tree);
    }
}

// Function to draw trees objects.

function drawTrees()
{
    for(var i=0; i < trees.length; i++)
    {
        fill(153, 76, 0);
        rect(trees[i].x, floorPos_y -80, 20, 80);
        fill(0, 100, 0);
        ellipse(trees[i].x - 10, floorPos_y -80, 50, 50);
        ellipse(trees[i].x + 10, floorPos_y -100, 50, 50);
        ellipse(trees[i].x + 30, floorPos_y -80, 50, 50);
    }
}

// ---------------------------------
// Function to create canyons
// ---------------------------------

function createCanyon(x, width)
{
    var can =
    {
        x: x,
        width: width,
        draw: function()
        {
            fill(100, 60, 0);
            rect(this.x, floorPos_y, this.width, height - floorPos_y);
            fill(51,25,0);
            rect(this.x - 10, floorPos_y, 10, 144);
            rect(this.x + this.width, floorPos_y, 10, height - floorPos_y);
        },
        checkCanyon: function(gc_x, gc_y)
        {
            if(gc_x < this.x + this.width && gc_x > this.x && gc_y >= floorPos_y)
            {
                return true;
            }
            return false;
        }
    }
    return can;
}

// ----------------------------------
// Collectable 
// ----------------------------------

function createCollectable(x)
{
    var col =
    {
        x: x,
        y: floorPos_y - 10,
        size: 10,
        isFound: false,
        draw: function()
        {
            fill(243,230,38);
            ellipse(this.x, this.y, this.size);
            stroke(243,230,38);
            strokeWeight(1);
            noFill();
            ellipse(this.x, this.y, this.size + 5);
        },
        checkCollectable: function(gc_x, gc_y)
        {
            if(dist(gc_x, gc_y, this.x, this.y) < 20)
            {
                return true;
            }
            return false;
        }
    }
    return col;
}

// Function to draw score

function drawScore()
{
    fill(180);
    noStroke();
    textSize(15);
    text("Score: " + game_score, gameChar_x - 20, gameChar_y - 110); 
}

// Function to draw life tokens

function drawLifeTokens()
{
    fill(180);
    noStroke();
    textSize(15);
    text("Lives:", gameChar_x - 20, gameChar_y - 90);
    
    // For loop to generate tokens
    
    for(var i = 0; i < lives; i++)
    {
        push();
        stroke(0);
        noFill();
        ellipse(gameChar_x + 30 + i * 15, gameChar_y - 60 - 35, 11); //Head
        strokeWeight(1);
        point(gameChar_x + 31 - 4 + i * 15, gameChar_y - 62 - 35); //R eye
        point(gameChar_x + 28 + 4 + i * 15, gameChar_y - 62 - 35); //L eye
        strokeWeight(1);
        arc(gameChar_x + 30 + i * 15, gameChar_y - 58 - 36, 5, 4, 0, PI); //Mouth
        pop();
    }
}

// Function to draw flagpole

function renderFlagpole()
{
    fill(120);
    noStroke();
    rect(flagpole.x_pos, floorPos_y - 200, 5, 200);
    fill(255, 0, 0);
    rect(flagpole.x_pos, floorPos_y - 200, 70, 50);
    
    //conditional statement for raising the flag when reached.
    
    if(flagpole.isReached)
    {
        fill(0, 255, 0);
        rect(flagpole.x_pos, floorPos_y - 200, 70, 50);
    }
}

// Function to check Flagpole

function checkFlagpole()
{
    if(dist(gameChar_world_x, gameChar_y, flagpole.x_pos, gameChar_y) < 20)
    {
        flagpole.isReached = true;
        push();
        fill(0);
        noStroke();
        textSize(45);
        text("Level Complete", width/2, height/6);
        textSize(30);
        text("Score: " + game_score, width/2, height/6 + 50);
        text("Collectables missed: " + (collectables.length - game_score), width/2, height/6 + 100);
        text("Press space to continue", width/2, height/6 + 150);
        pop();
        //backgroundMusic.stop();
        for(var i = 0; i < enemies.length; i++)
        {
            enemies[i].inc = 0;
        }
        isLeft = false;
        isRight = false;
        return;
    }
}

// Function to check if player has fallen below canvas level (died)

function checkPlayerDie()
{
    //Check if fallen down canyon
    
    if(gameChar_y > height + 100 && playerDied == false)
    {     
        //startGame();
       // backgroundMusic.stop();
        
        lives -= 1;
        playerDied = true;
    }
    
    //Check if contact with enemy
    
    for(var i = 0; i < enemies.length; i++)
    {   
        var isContact = enemies[i].checkContact(gameChar_world_x, gameChar_y);
        if(isContact && !playerDied)
        {
            lives -= 1;
            playerDied = true;
            break;
//            if(lives > 0)
//            {
//                startGame();
//                break;
//            }
        }
    }
    
    if(lives > 0 && playerDied)
    {
        push();
        fill(0);
        noStroke();
        textSize(45);
        text("You died", width/2, height/6);
        textSize(30)
        text("Current score: " + game_score, width/2, height/6 + 50);
        text("Collectables left: " + (collectables.length - game_score), width/2, height/6 + 100)
        text("Lives remaining: " + lives, width/2, height/6 + 150)
        text("Press space to continue", width/2, height/6 + 200)
        pop();
        for(var i = 0; i < enemies.length; i++)
        {
            enemies[i].inc = 0;
        }
        isLeft = false;
        isRight = false;
        waitingInput = true;
        return;
    }
   if(lives < 1 && playerDied)
    {
        push();
        fill(0);
        noStroke();
        textSize(45);
        text("Game Over", width/2, height/6);
        textSize(30)
        text("Score: " + game_score, width/2, height/6 + 50);
        text("Collectables missed: " + (collectables.length - game_score), width/2, height/6 + 100)
        text("Press space to start a new game", width/2, height/6 + 150)
        pop();
       // backgroundMusic.stop();
        for(var i = 0; i < enemies.length; i++)
        {
            enemies[i].inc = 0;
        }
        isLeft = false;
        isRight = false;
        return;
    }
}

//////////////// BROKEN///////////////////

//Add background music change when levelComplete.

//function levelComplete()
//{
//    backgroundMusic.stop();
//    tokenSound.play();
//    break;
//}

//Function - template to create platforms

function createPlatforms(x, y, length)
{
    var p = 
    {
        x: x,
        y: y,
        length: length,
        draw: function()
        {
            fill(205, 133, 63);
            rect(this.x, this.y, this.length, 10);
        },
        checkContact: function(gc_x, gc_y)
        {
            if(gc_x > this.x && gc_x < this.x + this.length)
            {
                if(gc_y <= this.y && gc_y > this.y - 2)
                {
                    return true;     
                }    
            }
            
            return false;
        }
    }
    
    return p;
}

function Enemy(x, y, range, inc, dir)
{
    this.x = x;
    this.y = y;
    this.range = range;
    
    this.currentX = x;
    this.inc = inc;
    this.dir = dir;
    
    this.update = function()
    {
        this.currentX += this.inc;
        
        if(this.dir == 1)
        {
            if(this.currentX >= this.x + this.range)
            {
                this.inc *= -1;
            }
        
            else if(this.currentX < this.x)
            {
                this.inc *= -1;
            }
        }
        if(this.dir == -1)
        {
            if(this.currentX <= this.x - this.range)
            {
                this.inc *= -1;
            }
        
            else if(this.currentX > this.x)
            {
                this.inc *= -1;
            }
        }
    }
    
    this.draw = function()
    {
        this.update();
        stroke(0);
        fill(0);
        ellipse(this.currentX, this.y - 60, 20); //Head
        strokeWeight(2);
        stroke(255, 0, 0);
        point(this.currentX - 4, this.y - 62); //R eye
        point(this.currentX + 4, this.y - 62); //L eye
        strokeWeight(1);
        stroke(0);
        line(this.currentX, this.y - 50, this.currentX, this.y - 20); //Body
        line(this.currentX, this.y - 45, this.currentX - 16, this.y - 60); //R Arm
        line(this.currentX, this.y - 45, this.currentX + 16, this.y - 60); //L Arm
        line(this.currentX, this.y - 20, this.currentX - 6, this.y); //R leg
        line(this.currentX, this.y - 20, this.currentX + 6, this.y); //L leg
    }
    
    this.checkContact = function(gc_x, gc_y)
    {
        //var d = dist(gc_x, gc_y, this.currentX, this.y);
        
//        if(d < 30)
//        {
//            return true;
//        }
        var x = abs(gc_x - this.currentX)
        var y = abs(gc_y - this.y)
        if(x < 25 && y < 60)
        {
            return true;
        }
        
        return false;
    }
}

//Intro function 

function intro()
{
    background(200);
    fill(0);
    noStroke();
    textSize(50);
    text("Welcome to my game", width/4, height/7);
    
    //Front facing character
    
    var introX = 50;
    var introY = 280;
    var introLives = 3;
    var introGameScore = 0;
    stroke(0);
    noFill();
    ellipse(introX, introY - 60, 20); //Head
    strokeWeight(2);
    point(introX - 4, introY - 62); //R eye
    point(introX + 4, introY - 62); //L eye
    strokeWeight(1);
    arc(introX, introY - 58, 10, 8, 0, PI); //Mouth
    line(introX, introY - 50, introX, introY - 20); //Body
    line(introX, introY - 46, introX - 6, introY - 28); //R arm
    line(introX, introY - 46, introX + 6, introY - 28); //L arm
    line(introX, introY - 20, introX - 6, introY); //R leg
    line(introX, introY - 20, introX + 6, introY); //L leg
    
    //Score and Lives info
    
    fill(0);
    noStroke();
    textSize(15);
    text("Score: " + introGameScore, introX - 20, introY - 110);
    
    fill(0);
    noStroke();
    textSize(15);
    text("Lives:", introX - 20, introY - 90);
    
    // For loop to generate tokens
    
    for(var i = 0; i < introLives; i++)
    {
        push();
        stroke(0);
        noFill();
        ellipse(introX + 30 + i * 15, introY - 60 - 35, 11); //Head
        strokeWeight(1);
        point(introX + 31 - 4 + i * 15, introY - 62 - 35); //R eye
        point(introX + 28 + 4 + i * 15, introY - 62 - 35); //L eye
        strokeWeight(1);
        arc(introX + 30 + i * 15, introY - 58 - 36, 5, 4, 0, PI); //Mouth
        pop();
    }
    
    //Character instructions
    
    fill(0);
    noStroke();
    textSize(15);
    text("You control this guy.", 20, 310);
    text("Use left and right arrow", 20, 330);
    text("keys to control direction.", 20, 350);
    text("Use spacebar to jump.", 20, 370);
    text("You start with 3 lives.", 20, 390);
    
    //Collectables
    
    var introCollectableX = 260;
    var introCollectableY = 275;
    var introCollectableSize = 10
    fill(243,230,38);
    ellipse(introCollectableX, introCollectableY, introCollectableSize);
    stroke(243,230,38);
    strokeWeight(1);
    noFill();
    ellipse(introCollectableX, introCollectableY, introCollectableSize + 5);
    
    //Collectable instructions
    fill(0);
    noStroke();
    textSize(15);
    text("Collect these to", 220, 310);
    text("increase score.", 220, 330);
    
    //Canyon
    
    var introCanyonX = 390;
    var introCanyonY = 280; 
    var introCanyonWidth = 60;
    var introCanyonDepth = 100
    fill(100, 60, 0);
    rect(introCanyonX, introCanyonY, introCanyonWidth, introCanyonDepth);
    fill(51, 25, 0);
    rect(introCanyonX - 10, introCanyonY, 10, introCanyonDepth);
    rect(introCanyonX + introCanyonWidth, introCanyonY, 10, introCanyonDepth);
    
    //Canyon instructions
    
    fill(0);
    noStroke();
    textSize(15);
    text("Don't fall into these.", 360, 410);
    
    //Enemy instructions 
    
    var introEnemyX = 560;
    var introEnemyY = 280;
    stroke(0);
    fill(0);
    ellipse(introEnemyX, introEnemyY - 60, 20); //Head
    strokeWeight(2);
    stroke(255, 0, 0);
    point(introEnemyX - 4, introEnemyY - 62); //R eye
    point(introEnemyX + 4, introEnemyY - 62); //L eye
    strokeWeight(1);
    stroke(0);
    line(introEnemyX, introEnemyY - 50, introEnemyX, introEnemyY - 20); //Body
    line(introEnemyX, introEnemyY - 45, introEnemyX - 16, introEnemyY - 60); //R Arm
    line(introEnemyX, introEnemyY - 45, introEnemyX + 16, introEnemyY - 60); //L Arm
    line(introEnemyX, introEnemyY - 20, introEnemyX - 6, introEnemyY); //R leg
    line(introEnemyX, introEnemyY - 20, introEnemyX + 6, introEnemyY); //L leg
    
    //Enemy instructions
    
    fill(0);
    noStroke();
    textSize(15);
    text("Avoid these guys.", 520, 310);
    
    //Platform 
    
    var introPlatformX = 710; 
    var introPlatformY = 230;
    var introPlatformLength = 100;
    fill(205, 133, 63);
    rect(introPlatformX, introPlatformY, introPlatformLength, 10);
    
    //Platform instructions 
    
    fill(0);
    noStroke();
    textSize(15);
    text("Use platforms to help you.", 680, 270);
    
    //Flagpole
    
    var introFlagX = 920;
    var introFlagY = 300;
    fill(120);
    noStroke();
    rect(introFlagX, introFlagY - 200, 5, 200);
    fill(255, 0, 0);
    rect(introFlagX, introFlagY - 200, 70, 50);
    
    //Flagpole instructions 
    
    fill(0);
    noStroke();
    textSize(15);
    text("Reach this to", 890, 330);
    text("complete level.", 890, 350);
    
    //Final message
    
    fill(0);
    noStroke();
    textSize(50);
    text("Good luck!", 370, 500);
    textSize(30);
    text("Press spacebar to start game", 300, 550)

}
