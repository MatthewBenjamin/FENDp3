/*
 *** TO DOs: ***

****    add helper functions (refactor player and enemy classes) to gameInfo object
        how to organize this? gameInfo.difficulty.stuff
                          PlayerHelp.human/bug
                          EnemyHelp.human/bug

**** add comments

**** possibly vary item frequency based on difficulty

****    Death Screen

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

var modeSelect= {
    0 : 'human',
    1 : 'bug'
};

var inputPos = 0;

var gameInfo = {}
gameInfo.level = 1;
gameInfo.levelUp = false;
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

//These store the game's objects
var allEnemies = [];
var allItems = {}
allItems.gems = [];
allItems.rocks = [];
allItems.stars = [];
allItems.hearts = [];
var player;

/*** Helper Functions ***/

//randomly assign one value from all possible value of an array
var randomArray = function(inputArray) {
    var decision = Math.floor(Math.random() * inputArray.length);
    return inputArray[decision];
}
//check if x&y position is already occupied
//TO DO: do I even still use this? --> this is only used to check if potential player move may collide with rock, refactor?
/*
function itemCollision (targetX, targetY, itemType) {
        for (var g = 0; g < allItems[itemType].length; g ++) {
            if (targetX === allItems[itemType][g].x && targetY === allItems[itemType][g].y) {
                return true;
            }
        }
} */
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

    /* OLD code for this function
    var gemCol = itemCollision(targetX, targetY, 'gems');
    var rockCol = itemCollision(targetX, targetY, 'rocks');
    var starCol = itemCollision(targetX, targetY, 'stars');
    var heartCol = itemCollision(targetX, targetY, 'hearts');
    if (gemCol || rockCol || starCol || heartCol) {
        return true;
    } */
}

// *** TO DO: how to generate Gems and Rocks in different modes? Make 2 different functions to run in the game loop.
// *** one function for each mode, that executes the proper item generatation function for that game mode

/*
generateLoopItems = {
    human: function() {
        genHearts();
        genStars();
        genGems(); //move gems from next level to loop
    bug :
        genRocks(); *** OR - all items, including rocks upon enemy death? in this case need                         different updateEntities() functions
        *** other items generated upon enemy death

        updateEntities = {}
        updateEntities.human
        updateEntities.bug
        updateEntities[gameInfo.mode];

        *****************************
        Human mode: hearts, gems, & stars are possibly generated each game loop, rocks at next level
        Bug Mode: hearts, gems, & stars are possibly generated when bug kills enemy
                  rocks are possibly generated when STAR kills enemies
                  also, bonus points when using star
*/
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
updateItems.bug = function(dt) {
    //NO generation
    //update already existing items, INCLUDING rocks
    //generateBugRocks();
    //generateBugGems();
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
var newItem;
function generateBugItems (randomNumD) {
    console.log("making a..");
    var randomNumD = Math.random();
    var itemType;
    if (randomNumD < .5) {
        console.log("NOTHING", randomNumD);
        newItem = null;
    } else if (randomNumD >= .5 && randomNumD < .75) {
        console.log("GEM", randomNumD);
        generateBugGems();
        itemType = 'gems';
    } else if (randomNumD >= .75 && randomNumD < .9) {
        console.log("HEART", randomNumD);
        newItem = new Heart;
        itemType = 'hearts';
    } else if (randomNumD >= .9) {
        console.log("STAR", randomNumD);
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
}
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
    //same
    this.sprite = gemHelp.sprites[type];
    this.points = gemHelp.points[type];
    this.x = randomArray(gameInfo.columns);
    this.y = randomArray(gameInfo.rows);
    this.lifespan = 500;
}

//same
Gem.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
}
Gem.prototype.update = function(dt) {
    this.lifespan -= 50 * dt;
    if (this.lifespan < 0) {
        allItems.gems.splice(allItems.gems.indexOf(this), 1);
    }
}

//H mode
function generateHumanGems() {
        var randomGem;
        var newGem;
        randomGem = Math.random()
        if (randomGem >= .995 && randomGem < .998) {
            newGem = new Gem(0);
            //TO DO: this repeats itself, but can't put below, make helper function?
            if (!allItemCollisions(newGem.x, newGem.y)) {
                allItems.gems.push(newGem);
            }
        } else if (randomGem >= .998 && randomGem < .999) {
             newGem = new Gem(1);
            if (!allItemCollisions(newGem.x, newGem.y)) {
                allItems.gems.push(newGem);
            }
        } else if (randomGem >= .999) {
             newGem = new Gem(2);
            if (!allItemCollisions(newGem.x, newGem.y)) {
                allItems.gems.push(newGem);
            }
        }
}

//B mode
//TO DO: change to make gems (potentially) upon h-enemy death
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
        console.log(newItem);
}


var Rock = function() {
    this.x = randomArray(gameInfo.columns);
    this.y = randomArray(gameInfo.rows);
    this.sprite = 'images/Rock.png';

    //only B mode
    this.lifespan = 500;
}

Rock.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
}

//H mode
function generateRocks() {
    for (var i = 0; i < 4; i++) {
        if (Math.random() <= .2) {
            var newRock = new Rock;
            console.log("Maybe a rock...");
            if (!allItemCollisions(newRock.x, newRock.y)) {
                allItems.rocks.push(newRock);
                console.log("Yes, a rock!");
            }
        }
    }
}

//B mode
function generateBugRocks() {
    if (Math.random() < .001) {
        var newRock = new Rock;
        if (!allItemCollisions(newRock.x, newRock.y) && !(newRock.x === player.x && newRock.y === player.y)) {
            allItems.rocks.push(newRock);
        }
    }
}

Rock.prototype.update = function(dt) {
    this.lifespan -= 50 * dt;
    if (this.lifespan < 0) {
        allItems.rocks.splice(allItems.rocks.indexOf(this), 1);
    }
}

//All star function same for both modes
var Star = function() {
    this.sprite = 'images/Star.png';
    this.x = randomArray(gameInfo.columns);
    this.y = randomArray(gameInfo.rows);
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

function generateHumanStars(){
    if (Math.random() < .001) {
        var newStar = new Star;
        if (!allItemCollisions(newStar.x, newStar.y)) {
            allItems.stars.push(newStar);
        }
    }
}

//All heart functions same for both modes
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
        allItems.hearts.splice(allItems.hearts.indexOf(this), 1);
    }
}

function generateHumanHearts(){
    if (Math.random() < .001) {
        var newHeart = new Heart;
        if (!allItemCollisions(newHeart.x, newHeart.y)) {
            allItems.hearts.push(newHeart);
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
        this.speed = this.randomSpeed(20,3);    //TO DO: var baseSpeed & modifySpeed ? -->make function that can be used
                                                                                    //to randomly set speed during 
                                                                                    //initialization, enemy.update, &
                                                                                    //levelUp
        if (gameInfo.mode === "human") {
                this.x = this.startPos(startMin, startMax);
                this.y = randomArray(gameInfo.rows);

        } else {
            this.x = randomArray(gameInfo.columns);
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

    Enemy.prototype.randomSpeed = function (base, modifier) {
        console.log("Random Speed call");
        var modifier = Math.floor(Math.random() * modifier + 1);
        return base * modifier;   
    }

    Enemy.prototype.startPos = function(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);   
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
                this.y = randomArray(gameInfo.rows);
                this.speed += 10;
            } else {
                this.x += this.speed * dt;
            }
        }
        Enemy.prototype.levelUp = function() {
            this.x = this.startPos(startMin, startMax);
            this.y = randomArray(gameInfo.rows);
            //TO DO: change speed update to react to difficulty and level
            //this.speed += this.randomSpeed(this.speed += gameInfo.level, basemultiplier + gameInfo.level) ?
            this.speed += 10 + gameInfo.level;
        }
    } else {
        //bug mode
        Enemy.prototype.update = function (dt) {
                //TO DO: proper speed modification
                // if enemy has traversed entire area, LOSE
                if (player.star) {
                    this.y = this.startPos(500,1000);
                    player.score += this.speed * 1.5;
                    this.sprite = this.chooseSprite();
                    this.speed += 10;                    
                }
                if (this.x === player.x && this.y > player.y -40 && this.y < player.y + 40) {
                    this.y = this.startPos(500,1000);
                    player.score += this.speed;
                    this.sprite = this.chooseSprite();
                    this.speed += 10;
                    generateBugItems();
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

    // TO DO: refactor for star image only in bug mode
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

function makePlayer() {
    var startY = playerHelp.startY[gameInfo.mode];
    var maxHealth = playerHelp.maxHealth[gameInfo.difficulty.current];

    var Player = function() {
        this.sprite = playerHelp.sprite[gameInfo.mode];
        this.x = 200;
        this.y = startY;
        this.score = 0;
        this.health = maxHealth;
        this.heartSprite = 'images/Small Heart.png';
        this.noHeartSprite = 'images/Not-a-Heart.png';
        this.star = false;
        this.starSprite = 'images/Selector.png';

        if (gameInfo.mode === 'human') {
            this.starLife;
        }

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
    Player.prototype.checkRocks = function (targetX, targetY) {
        for (var g = 0; g < allItems.rocks.length; g ++) {
            if (targetX === allItems.rocks[g].x && targetY === allItems.rocks[g].y) {
                return true;
            }
        }        
    }
    Player.prototype.checkDeath = function() {
        if (this.health <= 0) {
            //TO DO: reset game upon death
            this.x = 200;
            this.y = startY;
            //this.score = 0;
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
            this.checkHearts();
            this.checkDeath();

        }
        Player.prototype.levelUp = function() {
            var scoreUp = 0;
            for (var e = 0; e < allEnemies.length; e ++) {
                scoreUp += allEnemies[e].speed;
            }
            this.score += scoreUp;
        }
    } else {
        //TO DO: add direction attribute and change img according to direction
        Player.prototype.update = function(dt) {
            if (this.star) {
                generateBugItems();
                generateRocks();
                this.star = false;
            }
            this.checkGems();
            this.checkStars();
            //TO DO: change so hearts(and other items (including Rocks?) ?) may occur when enemy is killed?
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
        //TO DO: refactor LEVEL text
        if (gameInfo.mode === 'human') {
            ctx.fillText("LEVEL: " + gameInfo.level, 202, 40);
        }
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

    //TO DO: is this function necessary? or just refactor handleInput() ?
    /*
    Player.prototype.move = function(input) {
        if (input === 'up' && !this.checkRocks(this.x, this.y - 80)) {
            this.y -= 80;
        } else if (input === 'down' && !this.checkRocks(this.x, this.y + 80)) {
            this.y += 80;
        } else if (input === 'left' && !this.checkRocks(this.x - 100, this.y)) {
            this.x -= 100;
        } else if (input === 'right' && !this.checkRocks(this.x + 100, this.y)) {
            this.x += 100;
        }    
    } */
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
//one function to make all game objects, or just one function for, enemy, player, star, etc. ?
function makeGameObjects() {
    makeEnemies();
    makePlayer();
    if (gameInfo.mode === 'human') {
        generateRocks();
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
        gameInfo.mode = modeSelect[inputPos];
        inputPos = 0;
    }
};

function instructInput(input){
    if (input === 'right' && (inputPos === 0 || inputPos === 1)) {
        inputPos += 1;
    } else if (input === 'left' && (inputPos === 1 || inputPos === 2)) {
        inputPos -= 1;
    } else if (input === 'enter') {
        gameInfo.difficulty.current = gameInfo.difficulty.modes[inputPos];
        makeGameObjects();
        instructions.shown = true;
    }
}