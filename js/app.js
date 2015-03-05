/* *** TO DOs: ***

Basic Functionality:
-levels
-score
gameInfo object with level & score attributes (also gameMode attribute?)

1   add helper functions (refactor gen player and enemy classes) to
    gameMode.human & gameMode.bug
    move difficulty object into gameMode.diffculty
2
    Implement Gems
        Human Mode: Generate upon next level(possibly with timer before appearing) - level and difficulty determine # and type
            i.e. var i = x - level, for (var a =0; i, a+=1) {equation for randomly picking if gem and type based on difficulty}
        Bug Mode: trigger potential generations occasionality based on dynamic levels (when certain score is reached)
            so, the better you play the higher potential for ALL items(score mod # based on difficulty & level)

        different gems give different benefits? - points, extra points when killing enemies, extra health/attack
3
    Implement Stars
        Human: generate upon next level(possibly with timer before appearing) - level and difficulty determine features (like gems) - star with player invinciblity upon contact
        Bug: star kills all humans upon player contact
4
    Rocks
        Human: generate upon next level based on level and difficulty like above
                rock blocks player movement
        Gem: generate the same way
                detroys all humans that come into contact with it
                possibly make it so player and hold onto and drop rocks later
5
    Character Selection
        select which character sprite during initial game setup (after instructions?)
6
    Character Traits
        different characters will have different traits
        i.e. Health & Speed(hold down arrow keys - use keydown instead of keyup) for human mode
                Speed & Attack for bug mode
7
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

//TO DO: ??? store score(?), & helper functions(?) in gameInfo object ???
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
//features to implement: player characteristics: speed(?), health (human), attack (bug)

// Higher difficulty --> more enemies, less health
//var difficulty = {}
//difficulty.current;
//difficulty.modes = {
//    0 : "easy",
//    1 : "medium",
//    2 : "hard"
//}
var instructions = {}
//var paused = false;

//var rows = [60, 140, 220];
//var columns = [0, 100, 200, 300, 400];

//TO DO: refactor enemy objects to use these - ***THIS DOESN"T WORK - this.x/y points to function, not what
//the function returns
var randomArray = function(inputArray) {
    var decision = Math.floor(Math.random() * inputArray.length);
    return inputArray[decision];
}


//TO DO: implement level function in human mode, higher level --> faster enemies
//bug mode won't have discrete levels, instead it will progressively get harder as each enemy is killed

var allEnemies = [];
var allGems = [];
var allRocks = [];
var allStars = [];
var player;

//ROCKS, STARS, & GEMS should NOT occupy the same same (implement this after everything else works?)
//Generate these objects in nextlevel function!
//refactor gems help vars into Gem object?

//refactor player object to use this function?
function itemCollision (targetX, targetY, itemType) {
    for (var g = 0; g < allGems.length; g ++) {
        if (targetX === allGems[g].x && targetY === allGems[g].y) {
            return true;
        }
    }
    for (var r = 0; r < allRocks.length; r ++) {
        if (targetX === allRocks[r].x && targetY === allRocks[r].y) {
            return true;
        }
    }
    for (var s = 0; s < allStars.length; s ++) {
        if (targetX === allStars[s].x && targetY === allStars[s].y) {
            return true;
        }
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
    //TO DO:
    //pop up randomly like stars but more likely
    // randomly pick value 0 - 2
    //this.gemClass = Math.floor(Math.random() * 3); change this to make higher classes rarer or incoporate into generateGems function
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
    allGems = []
    for (var i=0; i < 5; i++) {
        randomGem = Math.random()
        console.log(randomGem);
        if (randomGem >= .4 && randomGem < .65) {
            newGem = new Gem(0);
            if (!itemCollision(newGem.x, newGem.y, null)) {
                allGems.push(newGem);
            }
        } else if (randomGem >= .65 && randomGem < .85) {
             newGem = new Gem(1);
            if (!itemCollision(newGem.x, newGem.y, null)) {
                allGems.push(newGem);
            }
        } else if (randomGem >= .85) {
             newGem = new Gem(2);
            if (!itemCollision(newGem.x, newGem.y, null)) {
                allGems.push(newGem);
            }
        }
    }
}

var Star = function() {
    //TO DO:
    //randomly assign if (and when? - every tick X % chance star is created)
    //this.sprite = 'images/Star.png';
    //this.x = randomRow();
    //this.y = randomCol();
    //prototype render
    //if collision with player, player invincible for certain time period (possibly implement this in player update)
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
    allRocks = [];
    allRocks.push(new Rock);    
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
                if (this.x === player.x && this.y > player.y -40 && this.y < player.y + 40) {
                    this.y = this.startPos(500,1000);
                    this.sprite = this.chooseSprite();
                    this.speed += 10;
                    player.score += 1;
                }
                else if (this.y <= -200) {
                    this.y = this.startPos(500,1000);
                    this.sprite = this.chooseSprite();
                    this.speed += 10;
                    player.score -= 1;
                } else {
                    this.y -= this.speed * dt;
                }
            }
    }

    // ***all below is the same***

    // Draw the enemy on the screen, required method for game
    Enemy.prototype.render = function() {
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

var upperBounds;
var lowerBounds;

function playerSprite() {
    if (gameInfo.mode === 'human') {
        //TO DO: add charaction sprite selection(use object points to sprites)
        return 'images/char-boy.png';
    } else {
        return 'images/enemy-bug.png';
    }
}

function startY() {
    if (gameInfo.mode === 'human') {
        return 300;
    } else {
        return 140;
    }
}

function makePlayer() {

    var Player = function() {
        this.sprite = playerSprite();
        this.x = 200;
        this.y = startY();
        this.score = 0;
    }

    //update functions
    //diff
    if (gameInfo.mode === "human") {
        Player.prototype.update = function(dt) {
            //collision detection
            for (var e = 0; e < allEnemies.length; e++) {
                if (this.y === allEnemies[e].y && this.x < allEnemies[e].x + 80 && this.x > allEnemies[e].x -80) {
                    this.x = 200;
                    this.y = 300;
                    //TO DO: reset game upon death
                    this.score = 0;
                }
            }
            for (var g = 0; g < allGems.length; g++) {
                if (this.y === allGems[g].y && this.x === allGems[g].x) {
                    //TO DO: modify score based on gem type
                    allGems[g].y -= 1000;
                    this.score += allGems[g].points;
                }
            }
            if (this.y === -100) {
                gameInfo.levelUp = true;
                this.x = 200;
                this.y = 300;
            }
        }
        Player.prototype.levelUp = function() {
            this.score += allEnemies.length + gameInfo.level;
        }
    } else {
        //TO DO: put something here or edit game engine
        //put score check to set up dyanmic level items here? --> yes b/c no objects = nowhere else to perform update(except engine)?
        //TO DO: add direction attribute and change img according to direction
        Player.prototype.update = function(dt) {}
    }

    //same
    Player.prototype.render = function() {
        ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
        ctx.fillText("SCORE: " + this.score, 50, 40);
        ctx.fillText("LEVEL: " + gameInfo.level, 300, 40);
    }

    //same
    if (gameInfo.mode === "human") {
        upperBounds = -100;
        lowerBounds = 380;
    } else {
        upperBounds = 60;
        lowerBounds = 220;
    }

    //TO DO: refactor to use helper functions, i.e. this.moveUp, this.moveDown, etc.
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
        if (!gameInfo.paused) {
            if (input === 'up' && this.y !== upperBounds) {
                this.y -= 80;
            } else if (input === 'down' && this.y !== lowerBounds) {
                this.y += 80;
            } else if (input === 'left' && this.x !== 0) {
                this.x -= 100;
            } else if (input === 'right' && this.x !== 400) {
                this.x += 100;
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