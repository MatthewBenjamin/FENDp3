/*** Note on code structure:

    After the game mode and difficulty have been selected, enemy objects and the player object
    are created based on the game mode (currentMode).
    Items are also dependant on currentMode.

/*** Global Game State Variables ***/

//for game mode and difficulty selection
var inputPos = 0;

var level = 1;
var levelUp = false;

//currentMode is used for functions & objects that are dependant on the current game mode
var currentMode;
var gameModes = {
    0 : 'human',
    1 : 'bug'    
};

var currentDiff;
var diffModes =  {
    0 : "easy",
    1 : "medium",
    2 : "hard"
};

//TO DO: un-round pixel #s?
//Row & Column coordinates. These numbers have been rounded
var rows  = [60, 140, 220];
var columns  = [0, 100, 200, 300, 400];
var paused;

//These store the game's objects
var allEnemies = [];
var allItems = {}
allItems.gems = [];
allItems.rocks = [];
allItems.stars = [];
allItems.hearts = [];
var player;

/*** GENERAL UTILITY FUNCTIONS ***/

//randomly assign one value from all possible value of an array
var randomArray = function(inputArray) {
    var decision = Math.floor(Math.random() * inputArray.length);
    return inputArray[decision];
}
//check if x&y position is already occupied by an item
function allItemCollisions (targetX, targetY) {
    for (var item in allItems) {
        if (allItems.hasOwnProperty(item)) {
            for (var i = 0; i < allItems[item].length; i ++) {
                if (targetX === allItems[item][i].x && targetY === allItems[item][i].y) {
                    return true;
                }
            }            
        }
    }
}

/*** ITEMS ***/

//Gems (increase score upon contact with player)
var gemHelp = {};
gemHelp.sprites = {
    0 : 'images/Gem Orange.png',
    1 : 'images/Gem Green.png',
    2 : 'images/Gem Blue.png'
};
gemHelp.points = {
    0 : 100,
    1 : 250,
    2 : 500
};

var Gem = function(type) {
    this.sprite = gemHelp.sprites[type];
    this.points = gemHelp.points[type];
    this.x = randomArray(columns);
    this.y = randomArray(rows);
    this.lifespan = 500;
}

Gem.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
}

Gem.prototype.update = function(dt) {
    this.lifespan -= 50 * dt;
    if (this.lifespan < 0) {
        allItems.gems.splice(allItems.gems.indexOf(this), 1);
    }
}

//Rocks (block player movement)
var Rock = function() {
    this.x = randomArray(columns);
    this.y = randomArray(rows);
    this.sprite = 'images/Rock.png';

    if (currentMode === 'bug') {
        this.lifespan = 500;
    }

    if (currentMode === 'bug') {
        Rock.prototype.update = function(dt) {
            this.lifespan -= 50 * dt;
            if (this.lifespan < 0) {
                allItems.rocks.splice(allItems.rocks.indexOf(this), 1);
            }
        }
    }
}

Rock.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
}

//Stars (function varies based on game mode, see player.update & enemy.update methods)
var Star = function() {
    this.sprite = 'images/Star.png';
    this.x = randomArray(columns);
    this.y = randomArray(rows);
    this.lifespan = 500;
}

Star.prototype.render = function () {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);    
}

Star.prototype.update = function(dt) {
    this.lifespan -= 50 * dt;
    if (this.lifespan < 0) {
        allItems.stars.splice(allItems.gems.indexOf(this), 1);
    }
}

//Hearts (increase player health upon contact)
var Heart = function() {
    this.sprite = 'images/Heart.png';
    this.x = randomArray(columns);
    this.y = randomArray(rows);
    this.lifespan = 500;
}

Heart.prototype.render = function () {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);    
}

Heart.prototype.update = function(dt) {
    this.lifespan -= 50 * dt;
    if (this.lifespan < 0) {
        allItems.hearts.splice(allItems.hearts.indexOf(this), 1);
    }
}

//Item Generation/Updates

//updateItems[currentMode] is called in the updateEntities function in the game loop
//Human Mode: updates and creates gems, hearts, and stars
updateItems = {};
updateItems.human = function(dt) {
    generateHumanGems();
    generateHumanHearts();
    generateHumanStars();

    allItems.gems.forEach(function(gem) {
        gem.update(dt);
    });
    allItems.stars.forEach(function(star) {
        star.update(dt);
    });
    allItems.hearts.forEach(function(heart) {
        heart.update(dt);
    });
}
function generateHumanHearts(){
    if (Math.random() < .001) {
        var newHeart = new Heart;
        if (!allItemCollisions(newHeart.x, newHeart.y)) {
            allItems.hearts.push(newHeart);
        }
    }
}
function generateHumanGems() {
        var randomGem;
        var newGem;
        randomGem = Math.random()
        if (randomGem >= .995 && randomGem < .998) {
            newGem = new Gem(0);
        } else if (randomGem >= .998 && randomGem < .999) {
            newGem = new Gem(1);
        } else if (randomGem >= .999) {
            newGem = new Gem(2);
        }
        if (newGem && !allItemCollisions(newGem.x, newGem.y)) {
            allItems.gems.push(newGem);
        }
}
function generateHumanStars(){
    if (Math.random() < .001) {
        var newStar = new Star;
        if (!allItemCollisions(newStar.x, newStar.y)) {
            allItems.stars.push(newStar);
        }
    }
}

//Bug mode: Updates all items
updateItems.bug = function(dt) {
    allItems.rocks.forEach(function(rock) {
        rock.update(dt);
    });
    allItems.gems.forEach(function(gem) {
        gem.update(dt);
    });
    allItems.stars.forEach(function(star) {
        star.update(dt);
    });
    allItems.hearts.forEach(function(heart) {
        heart.update(dt);
    });
}



//Bug Mode: make items upon enemy death
var newItem;
function generateBugItems () {
    console.log("making a..");
    var randomNum = Math.random();
    var itemType;
    if (randomNum < .5) {
        //console.log("NOTHING", randomNum);
    } else if (randomNum >= .5 && randomNum < .75) {
        //console.log("GEM", randomNum);
        generateBugGems();
        itemType = 'gems';
    } else if (randomNum >= .75 && randomNum < .9) {
        //console.log("HEART", randomNum);
        newItem = new Heart;
        itemType = 'hearts';
    } else if (randomNum >= .9) {
        //console.log("STAR", randomNum);
        newItem = new Star;
        itemType = 'stars';
    }
    
    if (newItem) {
        newItem.x = player.x;
        if (player.y === 140) {
            newItem.y = player.y + 80;
        } else {
            newItem.y = 140;
        }
        if (!allItemCollisions(newItem.x, newItem.y)) {
            allItems[itemType].push(newItem);
        }
    }
    newItem = null;
}

//Helper for generateBugItems (above)
function generateBugGems() {
        var randomGem;
        //var newGem;
        randomGem = Math.random()
        if (randomGem < .5) {
            newItem = new Gem(0);
        } else if (randomGem >= .5 && randomGem < .8) {
            newItem = new Gem(1);
        } else if (randomGem >= .8) {
            newItem = new Gem(2);
        }
}

//Human mode: make rocks when leveling Up
function generateHumanRocks() {
    for (var i = 0; i < 4; i++) {
        if (Math.random() <= .2) {
            var newRock = new Rock;
            if (!allItemCollisions(newRock.x, newRock.y)) {
                allItems.rocks.push(newRock);
            }
        }
    }
}
//Bug mode: make rocks when player uses a star
function generateBugRocks() {
    for (var i = 0; i < 4; i++) {
        if (Math.random() <= .2) {
            var newRock = new Rock;
            //console.log("Maybe a rock...");
            if (!allItemCollisions(newRock.x, newRock.y) && newRock.x !== player.x && newRock.y !== player.y) {
                allItems.rocks.push(newRock);
                //console.log("Yes, a rock!");
            }
        }
    }
}

/*** ENEMY ***/

//helper object
var enemySprites = {};
enemySprites.bug = [
    'images/char-boy.png',
    'images/char-cat-girl.png',
    'images/char-horn-girl.png',
    'images/char-pink-girl.png',
    'images/char-princess-girl.png'
]
enemySprites.human = 'images/enemy-bug.png'

//Generate enemies based on currentMode
function makeEnemies() {
    var startMin;
    var startMax;
    if (currentMode === 'human') {
        startMin = -100
        startMax = 500
    } else {
        startMin = 300
        startMax = 600
    }

    var Enemy = function() {
        this.sprite = this.chooseSprite();
        this.speed = this.randomSpeed(20,3);
        if (currentMode === "human") {
                this.x = this.startPos(startMin, startMax);
                this.y = randomArray(rows);

        } else {
            this.x = randomArray(columns);
            this.y = this.startPos(startMin, startMax);
        }
    }

    Enemy.prototype.chooseSprite = function() {
        if (currentMode === 'human') {
            return enemySprites.human;
        } else {
            return randomArray(enemySprites.bug);
        }
    }

    Enemy.prototype.randomSpeed = function (base, modifier) {
        var modifier = Math.floor(Math.random() * modifier + 1);
        return base * modifier;   
    }

    Enemy.prototype.startPos = function(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);   
    }

    //Human only
    if (currentMode === "human") { 
        Enemy.prototype.update = function (dt) {
            // You should multiply any movement by the dt parameter
            // which will ensure the game runs at the same speed for
            // all computers.

            if (this.x > 505) {
                this.x = this.startPos(-300, -100);
                this.y = randomArray(rows);
                this.speed += 5;
            } else {
                this.x += this.speed * dt;
            }
        }
        //reset position and increase speed when increasing level
        Enemy.prototype.levelUp = function() {
            this.x = this.startPos(startMin, startMax);
            this.y = randomArray(rows);
            this.speed += 10 + level;
        }
        Enemy.prototype.render = function() {
            ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
        }
    } else {
        //bug only
        Enemy.prototype.update = function (dt) {
            //If player contacts star, all enemies are "killed", with score bonus
            if (player.star) {
                this.y = this.startPos(500,1000);
                player.score += this.speed * 1.5;
                this.sprite = this.chooseSprite();
                this.speed += 10;                    
            }
            //Enemy is "killed" upon collision with player
            if (this.x === player.x && this.y > player.y -40 && this.y < player.y + 40) {
                this.y = this.startPos(500,1000);
                player.score += this.speed;
                this.sprite = this.chooseSprite();
                this.speed += 10;
                generateBugItems();
            }
            //If enemy crosses threshold, reset enemy and decrease player health
            else if (this.y <= -200) {
                this.y = this.startPos(500,1000);
                this.sprite = this.chooseSprite();
                this.speed += 10;
                player.health -= 1;
            } else {
                this.y -= this.speed * dt;
            }
        }

        Enemy.prototype.render = function() {
            if (player.star) {
                //this makes all enemies flash when killed by star
                ctx.drawImage(Resources.get(player.starSprite), this.x, this.y);    
            }
            ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
        }
    }


    var numOfEnemies = {
        easy : 5,
        medium : 7,
        hard : 9
    };

    for (var i = 0; i < numOfEnemies[currentDiff]; i++) {
        var newEnemy = new Enemy;
        allEnemies.push(newEnemy);
    };
}

/*** PLAYER ***/
//Helper objects instantiate player based on game mode and difficulty
var playerHelp = {};
playerHelp.sprite = {
    human: 'images/char-boy.png',
    bug: 'images/enemy-bug.png'
};

playerHelp.startY = {
    human: 300,
    bug: 140
};

playerHelp.maxHealth = {
    easy: 4,
    medium: 3,
    hard: 2
}

//this generate a player based on currentMode
function makePlayer() {
    var startY = playerHelp.startY[currentMode];
    var maxHealth = playerHelp.maxHealth[currentDiff];

    var Player = function() {
        this.sprite = playerHelp.sprite[currentMode];
        this.x = 200;
        this.y = startY;
        this.score = 0;
        this.health = maxHealth;

        //images to display current health in top right
        this.heartSprite = 'images/Small Heart.png';
        this.noHeartSprite = 'images/Not-a-Heart.png';

        this.star = false;
        this.starSprite = 'images/Selector.png';

        if (currentMode === 'human') {
            this.starLife;
        }

    }

    //Check for items and perform updates
    Player.prototype.checkGems = function() {
        for (var g = 0; g < allItems.gems.length; g++) {
            if (this.y === allItems.gems[g].y && this.x === allItems.gems[g].x) {
                this.score += allItems.gems[g].points;
                allItems.gems.splice(g,1);
            }
        }    
    }
    Player.prototype.checkStars = function() {
        for (var g = 0; g < allItems.stars.length; g++) {
            if (this.y === allItems.stars[g].y && this.x === allItems.stars[g].x) {
                allItems.stars.splice(g,1);
                this.star = true;
                this.starLife = 100;
            }
        }        
    }
    Player.prototype.checkHearts = function () {
        for (var g = 0; g < allItems.hearts.length; g++) {
            if (this.y === allItems.hearts[g].y && this.x === allItems.hearts[g].x) {
                allItems.hearts.splice(g, 1);
                if (this.health < maxHealth) {
                    this.health += 1;
                }
            }
        }  
    }
    Player.prototype.checkRocks = function (targetX, targetY) {
        for (var g = 0; g < allItems.rocks.length; g ++) {
            if (targetX === allItems.rocks[g].x && targetY === allItems.rocks[g].y) {
                return true;
            }
        }        
    }

    if (currentMode === "human") {
        Player.prototype.update = function(dt) {
            //collision detection
            //player is invincible for some time after contact with a star
            if (!this.star) {
                for (var e = 0; e < allEnemies.length; e++) {
                    if (this.y === allEnemies[e].y && this.x < allEnemies[e].x + 80 && this.x > allEnemies[e].x -80) {
                        this.health -= 1;
                        this.x = 200;
                        this.y = 300;
                    }
                }
            } else {
                console.log(this.starLife, dt);
                this.starLife -= 50 * dt;
                if (this.starLife < 0) {
                    this.star = false;
                }
            }

            if (this.y === -20) {
                levelUp = true;
                this.x = 200;
                this.y = startY;
            }

            this.checkGems();
            this.checkStars();
            this.checkHearts();

        }
        Player.prototype.levelUp = function() {
            var scoreUp = 0;
            for (var e = 0; e < allEnemies.length; e ++) {
                scoreUp += allEnemies[e].speed;
            }
            this.score += scoreUp;
        }
    } else {
        //TO DO: add direction attribute and change image according to left/right direction
        Player.prototype.update = function(dt) {
            if (this.star) {
                generateBugItems();
                generateBugRocks();
                this.star = false;
            }
            this.checkGems();
            this.checkStars();
            this.checkHearts();
        }
    }

    Player.prototype.render = function() {
        if (this.star) {
            ctx.drawImage(Resources.get(this.starSprite), this.x,this.y);
        }
        ctx.textAlign = "left";
        ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
        ctx.fillText("SCORE: " + this.score, 0, 40);
        //TO DO: refactor LEVEL text
        if (currentMode === 'human') {
            ctx.fillText("LEVEL: " + level, 202, 40);
        }
        for (var h = 0; h < maxHealth; h++) {
            if (h < this.health) {
                ctx.drawImage(Resources.get(this.heartSprite), 465 - (h * 35), -10);
            } else {
                ctx.drawImage(Resources.get(this.noHeartSprite), 465 - (h * 35), -10);
            }
        }
    }

    //set upper and lower boundaries for player
    var upperBounds;
    var lowerBounds;
    if (currentMode === "human") {
        upperBounds = -20;
        lowerBounds = 380;
    } else {
        upperBounds = 60;
        lowerBounds = 220;
    }

    Player.prototype.handleInput = function (input) {
        //x 100
        //y 80
        if (input === 'enter') {
            if (paused) {
                paused = false;
            } else {
                paused = true;
            }
        }
        //If not at edge of map and no rocks, move
        if (!paused) {
            if (input === 'up' && this.y !== upperBounds && !this.checkRocks(this.x, this.y - 80)) {
                this.y -= 80;
            } else if (input === 'down' && this.y !== lowerBounds && !this.checkRocks(this.x, this.y + 80)) {
                this.y += 80;
            } else if (input === 'left' && this.x !== 0  && !this.checkRocks(this.x - 100, this.y)) {
                this.x -= 100;
            } else if (input === 'right' && this.x !== 400 && !this.checkRocks(this.x + 100, this.y)) {
                this.x += 100;
            }
        }
    }

    player = new Player;
}
//makes objects to begin game
function makeGameObjects() {
    makeEnemies();
    makePlayer();
    if (currentMode === 'human') {
        generateHumanRocks();
    }
}

// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
document.addEventListener('keyup', function(e) {
    // *** added 'enter' key ***
    var allowedKeys = {
        13: 'enter',
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };

    var key = allowedKeys[e.keyCode];

    //input functions for current game state
    if (!currentMode) {
        modeInput(key);
    } else if (!instructShown) {
        instructInput(key);
    } else if (player.health <= 0) {
        gameOverInput(key);
    } else {
        player.handleInput(allowedKeys[e.keyCode]);    
    }
    
});

//mode selection input handler
function modeInput(input) {
    //up & down keys toggle focus
    if (input === 'down' && inputPos === 0) {
            inputPos += 1;
    } else if (input === 'up' && inputPos === 1) {
            inputPos = 0;
    } else if (input === 'enter') {
        currentMode = gameModes[inputPos];
        inputPos = 0;
    }
};

//instruction screen/difficulty selection input handler
function instructInput(input){
    if (input === 'right' && (inputPos === 0 || inputPos === 1)) {
        inputPos += 1;
    } else if (input === 'left' && (inputPos === 1 || inputPos === 2)) {
        inputPos -= 1;
    } else if (input === 'enter') {
        currentDiff = diffModes[inputPos];
        makeGameObjects();
        instructShown = true;
    }
}

//game over input handler
var resetGame;
function gameOverInput(input) {
    if (input === 'enter') {
        resetGame = true;
    }
}