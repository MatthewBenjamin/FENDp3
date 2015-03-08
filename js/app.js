/* *** TO DOs: ***

gameInfo object with level & score attributes (also gameMode attribute?)

1   add helper functions (refactor gen player and enemy classes) to gameInfo object
    how to organize this? gameInfo.difficulty.stuff
                          gameInfo.player
                          gameInfo.enemy

2
    Implement Gems for BUG mode
        Bug Mode: trigger potential generations occasionality based on dynamic levels (when certain score is reached)
            so, the better you play the higher potential for ALL items(score mod # based on difficulty & level)
3
    Rocks - MOSTLY DONE FOR HUMAN MODE
        Human: generate a random amount based on difficulty, level, etc
        Bug: generate the same way, but randomly instead of upon level up, has lifespan like stars
4
    Death Screen

Optional Stuff:
    Character Selection
        select which character sprite during initial game setup (after instructions?)

    Character Traits
        different characters will have different traits
        i.e. Health & Speed(hold down arrow keys - use keydown instead of keyup) for human mode
                Speed & Attack for bug mode

    Character Creator
        player assigns character sprite and trait points
*/

var modeSelect= {};
//modeSelect.gameMode;

//TO DO: add helper functions to
//gameMode.human & gameMode.bug
//move difficulty object into gameMode.diffculty ?
var gameMode = {};
//gameMode.mode;
gameMode.human = {};
gameMode.bug = {};
//gameMode.difficulty = {};
var inputPos = 0;

var gameInfo = {}
gameInfo.level = 1;
gameInfo.levelUp = false;
//gameInfo.score = 0;
gameInfo.mode;
gameInfo.difficulty = {}
gameInfo.difficulty.current;
gameInfo.difficulty.modes = {
    0 : "easy",
    1 : "medium",
    2 : "hard"
}
gameInfo.rows = [60, 140, 220];
gameInfo.columns = [0, 100, 200, 300, 400];
gameInfo.paused = false;

var instructions = {}

var randomArray = function(inputArray) {
    var decision = Math.floor(Math.random() * inputArray.length);
    return inputArray[decision];
}


var allEnemies = [];
var allItems = {}
allItems.gems = [];
allItems.rocks = [];
allItems.stars = [];
allItems.hearts = [];
var player;

function itemCollision (targetX, targetY, itemType) {
        for (var g = 0; g < allItems[itemType].length; g ++) {
            if (targetX === allItems[itemType][g].x && targetY === allItems[itemType][g].y) {
                console.log("Collision!",allItems[itemType][g])
                return true;
            }
        }
}
function allItemCollisions (targetX, targetY) {
    var gemCol = itemCollision(targetX, targetY, 'gems');
    var rockCol = itemCollision(targetX, targetY, 'rocks');
    var starCol = itemCollision(targetX, targetY, 'stars');
    if (gemCol || rockCol || starCol) {
        return true;
    }
}
var gemSprites = {
    0 : 'images/Gem Orange.png',
    1 : 'images/Gem Green.png',
    2 : 'images/Gem Blue.png'
}

var gemPoints = {
    0 : 5,
    1 : 10,
    2 : 20
}
var Gem = function(type) {
    this.sprite = gemSprites[type];
    this.points = gemPoints[type];
    this.x = randomArray(gameInfo.columns); //200; //randomRow;
    this.y = randomArray(gameInfo.rows); //randomCol;
    // ----update to check for collision (or put in player update?)
}

Gem.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
}

var randomGem;
var newGem;
function generateGems() {
    //TO DO: make genAttempts global to vary it based on difficulty? or just vary success rate?
    //TO DO: 2 gems can be in same location! add collision detection
    //TO DO: if collision, does not generate new gem, fix this? use recursion if so
    allItems.gems = []
    for (var i=0; i < 5; i++) {
        randomGem = Math.random()
        console.log(randomGem);
        if (randomGem >= .4 && randomGem < .65) {
            newGem = new Gem(0);
            if (!allItemCollisions(newGem.x, newGem.y)) {
                allItems.gems.push(newGem);
            }
        } else if (randomGem >= .65 && randomGem < .85) {
             newGem = new Gem(1);
            if (!allItemCollisions(newGem.x, newGem.y)) {
                allItems.gems.push(newGem);
            }
        } else if (randomGem >= .85) {
             newGem = new Gem(2);
            if (!allItemCollisions(newGem.x, newGem.y)) {
                allItems.gems.push(newGem);
            }
        }
    }
}

var Star = function() {
    //TO DO:
    //randomly assign if (and when? - every tick X % chance star is created)
    this.sprite = 'images/Star.png';
    this.x = randomArray(gameInfo.columns);
    this.y = randomArray(gameInfo.rows);
    this.lifespan = 500;
    //prototype render
    //if collision with player, player invincible for certain time period (possibly implement this in player update)

}

Star.prototype.render = function () {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);    
}

Star.prototype.update = function(dt) {
    this.lifespan -= 50 * dt;
    if (this.lifespan < 0) {
        allItems.stars.splice(this);
    }
}

function generateStars(){
    if (Math.random() < .001) {
        var newStar = new Star;
        if (!allItemCollisions(newStar.x, newStar.y)) {
            allItems.stars.push(newStar);
        }
    }
}

var Heart = function() {
    this.sprite = 'images/Heart.png';
    this.x = randomArray(gameInfo.columns);
    this.y = randomArray(gameInfo.rows);
    this.lifespan = 500;
}

Heart.prototype.render = function () {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);    
}

Heart.prototype.update = function(dt) {
    this.lifespan -= 50 * dt;
    if (this.lifespan < 0) {
        allItems.hearts.splice(this);
    }
}

function generateHearts(){
    if (Math.random() < .001) {
        var newHeart = new Heart;
        if (!allItemCollisions(newHeart.x, newHeart.y)) {
            allItems.hearts.push(newHeart);
        }
    }
}
var Rock = function() {
    this.x = randomArray(gameInfo.columns);
    this.y = randomArray(gameInfo.rows);
    this.sprite = 'images/Rock.png';
}

Rock.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
}

function generateRocks() {
    allItems.rocks = [];
    for (var i = 0; i < 1; i++) {
        var newRock = new Rock;

        if (!allItemCollisions(newRock.x, newRock.y)) {
            allItems.rocks.push(newRock);
        }
    }
}


var enemySprites = {};
enemySprites.bug = [
    'images/char-boy.png',
    'images/char-cat-girl.png',
    'images/char-horn-girl.png',
    'images/char-pink-girl.png',
    'images/char-princess-girl.png'
]
enemySprites.human = 'images/enemy-bug.png'
enemySprites.choose = function() {
    if (gameInfo.mode === 'human') {
        return enemySprites.human;
    } else {
        return randomArray(enemySprites.bug);
    }
}

//TO DO: fine tune startMin/Max, speed params
function makeEnemies() {
    var startMin;
    var startMax;
    if (gameInfo.mode === 'human') {
        startMin = -100
        startMax = 500
    } else {
        startMin = 300
        startMax = 600
    }

    var Enemy = function() {
        this.sprite = this.chooseSprite();
        this.speed = this.randomSpeed(10,5);    //TO DO: var baseSpeed & modifySpeed ? -->make function that can be used
                                                                                    //to randomly set speed during 
                                                                                    //initialization, enemy.update, &
                                                                                    //levelUp
        if (gameInfo.mode === "human") {
                this.x = this.startPos(startMin, startMax);
                this.y = this.randomLane(gameInfo.rows);

        } else {
            this.x = this.randomLane(gameInfo.columns);
            this.y = this.startPos(startMin, startMax);
        }
    }

    Enemy.prototype.chooseSprite = function() {
        if (gameInfo.mode === 'human') {
            return enemySprites.human;
        } else {
            return randomArray(enemySprites.bug);
        }
    }
    //same
    Enemy.prototype.randomSpeed = function (base, modifier) {
        console.log("Random Speed call");
        var modifier = Math.floor(Math.random() * modifier + 1);
        return base * modifier;   
    }

    //same
    Enemy.prototype.startPos = function(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);   
    }

    //TO DO: do I need this? randomArray
    Enemy.prototype.randomLane = function (lanes) {
            var decision = Math.floor(Math.random() * lanes.length);
            return lanes[decision];            
    }

    //update method
    //combine?
    if (gameInfo.mode === "human") { 
        Enemy.prototype.update = function (dt) {
            // You should multiply any movement by the dt parameter
            // which will ensure the game runs at the same speed for
            // all computers.

            // if enemy has traversed entire area, reset values (randomly)
            if (this.x > 505) {
                this.x = -100   //TO DO: make this random?
                this.y = this.randomLane(gameInfo.rows);
                //this.speed = this.randomSpeed(10,10);
            } else {
                this.x += this.speed * dt;
            }
        }
        Enemy.prototype.levelUp = function() {
            this.x = this.startPos(startMin, startMax);
            this.y = this.randomLane(gameInfo.rows);
            //TO DO: change speed update to react to difficulty and level
            // *** TO DO: this is a bug, enemy speed doesn't update correctly, fix this ***
            this.speed += 10 + gameInfo.level;
        }
    } else {
        //bug mode
        Enemy.prototype.update = function (dt) {
                //TO DO: proper speed modification
                // if enemy has traversed entire area, LOSE
                if (this.x === player.x && this.y > player.y -40 && this.y < player.y + 40 || player.star) {
                    this.y = this.startPos(500,1000);
                    this.sprite = this.chooseSprite();
                    this.speed += 10;
                    player.score += 1;
                }
                else if (this.y <= -200) {
                    this.y = this.startPos(500,1000);
                    this.sprite = this.chooseSprite();
                    this.speed += 10;
                    player.health -= 1;
                } else {
                    this.y -= this.speed * dt;
                }
            }
    }

    // Draw the enemy on the screen, required method for game
    Enemy.prototype.render = function() {
        if (player.star) { //TO DO: only in bug mode
            ctx.drawImage(Resources.get(player.starSprite), this.x, this.y);    
        }
        ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
    }

    var numOfEnemies;
    if (gameInfo.difficulty.current === 'easy') {
        numOfEnemies = 6;
    } else if (gameInfo.difficulty.current === 'medium') {
        numOfEnemies = 9;
    } else if (gameInfo.difficulty.current === 'hard') {
        numOfEnemies = 12;
    }

    for (var i = 0; i < numOfEnemies; i++) {
        var newEnemy = new Enemy;
        allEnemies.push(newEnemy);
    }
}

function playerSprite() {
    if (gameInfo.mode === 'human') {
        //TO DO: add charaction sprite selection(use object to point to sprites)
        return 'images/char-boy.png';
    } else {
        return 'images/enemy-bug.png';
    }
}

function findStartY() {
    if (gameInfo.mode === 'human') {
        return 300;
    } else {
        return 140;
    }
}

function findMaxHealth() {
    if (gameInfo.difficulty.current === "easy") {
        return 4;
    } else if (gameInfo.difficulty.current === "medium") {
        return 3;
    } else {
        return 2;
    }
}
function makePlayer() {
    var startY = findStartY();
    var maxHealth = findMaxHealth();

    var Player = function() {
        this.sprite = playerSprite();
        this.x = 200;
        this.y = startY;
        this.score = 0;
        this.health = maxHealth;
        this.heartSprite = 'images/Small Heart.png';
        this.noHeartSprite = 'images/Not-a-Heart.png';
        this.star = false;
        this.starLife; //only human mode
        this.starSprite = 'images/Selector.png'; //only human mode
    }

    //update functions
    //diff
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
    Player.prototype.checkDeath = function() {
        if (this.health <= 0) {
            //TO DO: reset game upon death
            this.x = 200;
            this.y = startY;
            this.score = 0;
        }
    }
    if (gameInfo.mode === "human") {
        Player.prototype.update = function(dt) {
            //collision detection
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
                gameInfo.levelUp = true;
                this.x = 200;
                this.y = startY;
            }

            this.checkGems();
            this.checkStars();
            if (this.health < maxHealth) {
                this.checkHearts();
            }
            this.checkDeath();

        }
        Player.prototype.levelUp = function() {
            this.score += allEnemies.length + gameInfo.level;
        }
    } else {
        //TO DO: put something here or edit game engine
        //put score check to set up dyanmic level items here? --> yes b/c no objects = nowhere else to perform update(except engine)?
        //TO DO: add direction attribute and change img according to direction
        Player.prototype.update = function(dt) {
            if (this.star) {
                this.star = false;
            }
            this.checkGems();
            this.checkStars();
            //TO DO: change so hearts may occur when enemy is killed
            this.checkHearts();
            this.checkDeath();
        }
    }

    //same
    Player.prototype.render = function() {
        if (this.star) {
            ctx.drawImage(Resources.get(this.starSprite), this.x,this.y);
        }
        ctx.textAlign = "left";
        ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
        ctx.fillText("SCORE: " + this.score, 0, 40);
        //TO DO: remove level from bug mode
        ctx.fillText("LEVEL: " + gameInfo.level, 202, 40);
        for (var h = 0; h < maxHealth; h++) {
            if (h < this.health) {
                ctx.drawImage(Resources.get(this.heartSprite), 465 - (h * 35), -10);
            } else {
                ctx.drawImage(Resources.get(this.noHeartSprite), 465 - (h * 35), -10);
            }
        }
    }

    //same
    var upperBounds;
    var lowerBounds;
    if (gameInfo.mode === "human") {
        upperBounds = -20;
        lowerBounds = 380;
    } else {
        upperBounds = 60;
        lowerBounds = 220;
    }

    //TO DO: refactor to use helper functions, i.e. this.moveUp, this.moveDown, etc.
    Player.prototype.move = function(input) {
        if (input === 'up' && !itemCollision(this.x, this.y - 80, 'rocks')) {
            this.y -= 80;
        } else if (input === 'down' && !itemCollision(this.x, this.y + 80, 'rocks')) {
            this.y += 80;
        } else if (input === 'left' && !itemCollision(this.x - 100, this.y, 'rocks')) {
            this.x -= 100;
        } else if (input === 'right' && !itemCollision(this.x + 100, this.y, 'rocks')) {
            this.x += 100;
        }    
    }
    Player.prototype.handleInput = function (input) {
        //x 100
        //y 80
        if (input === 'enter') {
            if (gameInfo.paused) {
                gameInfo.paused = false;
            } else {
                gameInfo.paused = true;
            }
        }
        //TO DO: refactor into move function?
        if (!gameInfo.paused) {
            if (input === 'up' && this.y !== upperBounds) {
                this.move(input);
            } else if (input === 'down' && this.y !== lowerBounds) {
                this.move(input);
            } else if (input === 'left' && this.x !== 0) {
                this.move(input);
            } else if (input === 'right' && this.x !== 400) {
                this.move(input);
            }
        }
    }

    player = new Player;
}
//one function to make all game objects, or just one function for, enemy, player, star, etc. ?
function makeGameObjects() {
    makeEnemies();
    makePlayer();
    generateGems();
    generateRocks();
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

    if (!gameInfo.mode) {
        modeInput(key);
    } else if (!instructions.shown) {
        instructInput(key);
    } else {
        player.handleInput(allowedKeys[e.keyCode]);    
    }
    
});

function modeInput(input) {
    //up & down keys toggle focus
    if (input === 'down' && inputPos === 0) {
            inputPos += 1;
    } else if (input === 'up' && inputPos === 1) {
            inputPos = 0;
    } else if (input === 'enter') {
        //use json here for possible game modes instead of more if statements?
        //ie gameInfo.mode = modeSelect.possibleModes[inputPos];
        if (inputPos === 0) {
            gameInfo.mode = 'human';
        } else if (inputPos === 1) {
            gameInfo.mode = 'bug';
        } else {
            console.log("ERROR modeSelect.handleInput");
        }
    }
};

function instructInput(input){
    if (input === 'right' && (inputPos === 0 || inputPos === 1)) {
        inputPos += 1;
    } else if (input === 'left' && (inputPos === 1 || inputPos === 2)) {
        inputPos -= 1;
    } else if (input === 'enter') {
        gameInfo.difficulty.current = gameInfo.difficulty.modes[inputPos]
        makeGameObjects();
        //paused = false;
        instructions.shown = true;
    }
}