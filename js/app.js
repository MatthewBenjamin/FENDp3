/*** Note on code structure:

    After the game mode and difficulty have been selected, enemy objects and the player object
    are created based on the game mode (currentMode).
    Items are also dependant on currentMode.
***/

"use strict";

/*** Global Game State Variables ***/

// for game mode and difficulty selection
var inputPos = 0;

var level = 1;
var levelUp = false;

// currentMode is used for functions & objects that are dependant on the current game mode
var currentMode;
var gameModes = {
    0 : 'human',
    1 : 'bug'
};

var currentDiff;
var diffModes =  {
    0 : 'easy',
    1 : 'medium',
    2 : 'hard'
};

// TODO: un-round pixel #s?
// Row & Column coordinates. These numbers have been rounded
var rows  = [60, 140, 220];
var columns  = [0, 100, 200, 300, 400];
var paused;

// These store the game's objects
var allEnemies = [];
var allItems = {};
allItems.gems = [];
allItems.rocks = [];
allItems.stars = [];
allItems.hearts = [];
var player;

/*** GENERAL UTILITY FUNCTIONS ***/

// randomly assign one value from all possible value of an array
var randomArray = function(inputArray) {
    var decision = Math.floor(Math.random() * inputArray.length);
    return inputArray[decision];
};

// check if x&y position is already occupied by an item
function allItemCollisions(targetX, targetY) {
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

/*** PARENT OBJECTS ***/

// all game objects
var GameObject = function(x,y) {
    this.x = x;
    this.y = y;
};

// All items & human-mode enemies
var NormalRender = function(x,y) {
    GameObject.call(this, x, y);
};

NormalRender.prototype = Object.create(GameObject.prototype);
NormalRender.prototype.constructor = NormalRender;
NormalRender.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

// All items, EXCEPT rocks in HUMAN mode
var LifespanObject = function(x,y, lifespan) {
    NormalRender.call(this, x, y);

    this.lifespan = lifespan;
};

LifespanObject.prototype = Object.create(NormalRender.prototype);
LifespanObject.prototype.constructor = LifespanObject;
LifespanObject.prototype.update = function(dt, type) {
    this.lifespan -= 50 * dt;
    if (this.lifespan < 0) {
        allItems[type].splice(allItems[type].indexOf(this), 1);
    }
};

/*** ITEMS ***/

// Gems (increase score upon contact with player)
var Gem = function(type) {
    LifespanObject.call(this, randomArray(columns), randomArray(rows), 500);
    this.sprite = Gem.sprites[type];
    this.points = Gem.points[type];
};
Gem.prototype = Object.create(LifespanObject.prototype);
Gem.prototype.constructor = Gem;
Gem.sprites = {
    0 : 'images/Gem-Orange.png',
    1 : 'images/Gem-Green.png',
    2 : 'images/Gem-Blue.png'
};
Gem.points = {
    0 : 100,
    1 : 250,
    2 : 500
};
// Called in updateItems.human (below)
Gem.initHuman = function() {
    var randomGem;
    var newGem;
    randomGem = Math.random();
    if (randomGem >= 0.995 && randomGem < 0.998) {
        newGem = new Gem(0);
    } else if (randomGem >= 0.998 && randomGem < 0.999) {
        newGem = new Gem(1);
    } else if (randomGem >= 0.999) {
        newGem = new Gem(2);
    }
    if (newGem && !allItemCollisions(newGem.x, newGem.y)) {
        allItems.gems.push(newGem);
    }
};
// Helper for generateBugItems (below)
Gem.initBug = function() {
    var randomGem;
    randomGem = Math.random();
    if (randomGem < 0.5) {
        newItem = new Gem(0);
    } else if (randomGem >= 0.5 && randomGem < 0.8) {
        newItem = new Gem(1);
    } else if (randomGem >= 0.8) {
        newItem = new Gem(2);
    }
};

// Stars (function varies based on game mode, see player.update & enemy.update methods)
var Star = function() {
    LifespanObject.call(this, randomArray(columns), randomArray(rows), 500);

    this.sprite = 'images/Star.png';
};
Star.prototype = Object.create(LifespanObject.prototype);
Star.prototype.constructor = Star;

// Called in updateItems.human (below)
Star.initHuman = function() {
    if (Math.random() < 0.001) {
        var newStar = new Star();
        if (!allItemCollisions(newStar.x, newStar.y)) {
            allItems.stars.push(newStar);
        }
    }
};

// Hearts (increase player health upon contact)
var Heart = function() {
    LifespanObject.call(this, randomArray(columns), randomArray(rows), 500);

    this.sprite = 'images/Heart.png';
};
Heart.prototype = Object.create(LifespanObject.prototype);
Heart.prototype.constructor = Heart;

// Called in updateItems.human (below)
Heart.initHuman = function() {
    if (Math.random() < 0.001) {
        var newHeart = new Heart();
        if (!allItemCollisions(newHeart.x, newHeart.y)) {
            allItems.hearts.push(newHeart);
        }
    }
};

// Rocks (block player movement)
var Rock = function() {
    if (currentMode === 'human') {
        NormalRender.call(this, randomArray(columns), randomArray(rows));
    } else {
        LifespanObject.call(this, randomArray(columns), randomArray(rows), 500);
    }

    this.sprite = 'images/Rock.png';
};
Rock.gameSetup = function() {
    if (currentMode === 'human') {
        Rock.prototype = Object.create(NormalRender.prototype);
        Rock.initHuman();
    } else {
        Rock.prototype = Object.create(LifespanObject.prototype);
    }
};
Rock.prototype.constructor = Rock;

// Human mode: make rocks when leveling Up
Rock.initHuman = function() {
    for (var i = 0; i < 4; i++) {
        if (Math.random() <= 0.2) {
            var newRock = new Rock();
            if (!allItemCollisions(newRock.x, newRock.y)) {
                allItems.rocks.push(newRock);
            }
        }
    }
};

// Bug mode: make rocks when player uses a star
Rock.initBug = function() {
    for (var i = 0; i < 4; i++) {
        if (Math.random() <= 0.2) {
            var newRock = new Rock();
            if (!allItemCollisions(newRock.x, newRock.y) && newRock.x !== player.x && newRock.y !== player.y) {
                allItems.rocks.push(newRock);
            }
        }
    }
};

/*** ITEM UPDATES ***/

// updateItems[currentMode] is called in the updateEntities function in the game loop
// Human Mode: updates and creates gems, hearts, and stars
var updateItems = {};
updateItems.human = function(dt) {
    Gem.initHuman();
    Heart.initHuman();
    Star.initHuman();

    allItems.gems.forEach(function(gem) {
        gem.update(dt, 'gems');
    });
    allItems.stars.forEach(function(star) {
        star.update(dt, 'stars');
    });
    allItems.hearts.forEach(function(heart) {
        heart.update(dt, 'hearts');
    });
};

// Bug mode: Updates all items
updateItems.bug = function(dt) {
    allItems.rocks.forEach(function(rock) {
        rock.update(dt, 'rocks');
    });
    allItems.gems.forEach(function(gem) {
        gem.update(dt, 'gems');
    });
    allItems.stars.forEach(function(star) {
        star.update(dt, 'stars');
    });
    allItems.hearts.forEach(function(heart) {
        heart.update(dt, 'hearts');
    });
};

// Bug Mode: make items upon enemy death
var newItem;
// called in Enemy.update and Player.update methods
function generateBugItems() {
    var randomNum = Math.random();
    var itemType;
    if (randomNum < 0.5) {
    } else if (randomNum >= 0.5 && randomNum < 0.75) {
        Gem.initBug();
        itemType = 'gems';
    } else if (randomNum >= 0.75 && randomNum < 0.9) {
        newItem = new Heart();
        itemType = 'hearts';
    } else if (randomNum >= 0.9) {
        newItem = new Star();
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

/*** ENEMY ***/

// Generate enemies based on currentMode
var Enemy = function() {
    if (currentMode === 'human') {
        NormalRender.call(this, this.startPos(Enemy.startMin[currentMode], Enemy.startMax[currentMode]), randomArray(rows));
    } else {
        GameObject.call(this, randomArray(columns), this.startPos(Enemy.startMin[currentMode], Enemy.startMax[currentMode]));
    }

    this.sprite = this.chooseSprite();
    this.speed = this.randomSpeed(20,3);
};
Enemy.prototype.constructor = Enemy;

// Helpers
Enemy.startMin = {
    human: -100,
    bug: 300
};
Enemy.startMax = {
    human: 500,
    bug: 600
};
Enemy.sprites = {
    bug : [
        'images/char-boy.png',
        'images/char-cat-girl.png',
        'images/char-horn-girl.png',
        'images/char-pink-girl.png',
        'images/char-princess-girl.png'
    ],
    human : 'images/enemy-bug.png'
};
Enemy.initHuman = function() {
    Enemy.prototype = Object.create(NormalRender.prototype);
    Enemy.prototype.update = function(dt) {
        if (this.x > 505) {
            this.x = this.startPos(-300, -100);
            this.y = randomArray(rows);
            this.speed += 5;
        } else {
            this.x += this.speed * dt;
        }
    };
    // reset position and increase speed when increasing level
    Enemy.prototype.levelUp = function() {
        this.x = this.startPos(Enemy.startMin[currentMode], Enemy.startMax[currentMode]);
        this.y = randomArray(rows);
        this.speed += 10 + level;
    };
};
Enemy.initBug = function() {
    Enemy.prototype = Object.create(GameObject.prototype);
    Enemy.prototype.update = function(dt) {
        // If player contacts star, all enemies are "killed", with score bonus
        if (player.star) {
            this.x = randomArray(columns);
            this.y = this.startPos(500,1000);
            player.score += this.speed * 1.5;
            this.sprite = this.chooseSprite();
            this.speed += 10;
        }
        // Enemy is "killed" upon collision with player
        if (this.x === player.x && this.y > player.y -40 && this.y < player.y + 40) {
            this.x = randomArray(columns);
            this.y = this.startPos(500,1000);
            player.score += this.speed;
            this.sprite = this.chooseSprite();
            this.speed += 10;
            generateBugItems();
        }
        // If enemy crosses threshold, reset enemy and decrease player health
        else if (this.y <= -200) {
            this.x = randomArray(columns);
            this.y = this.startPos(500,1000);
            this.sprite = this.chooseSprite();
            this.speed += 10;
            player.health -= 1;
        } else {
            this.y -= this.speed * dt;
        }
    };

    Enemy.prototype.render = function() {
        if (player.star) {
            ctx.drawImage(Resources.get(player.starSprite), this.x, this.y);
        }
        ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
    };
};
Enemy.init = function() {
    if (currentMode === 'human' ) {
        Enemy.initHuman();
    } else {
        Enemy.initBug();
    }

    // Both modes
    // Located here b/c Enemy.initBug & initHuman assign different parent objects
    Enemy.prototype.chooseSprite = function() {
        if (currentMode === 'human') {
            return Enemy.sprites.human;
        } else {
            return randomArray(Enemy.sprites.bug);
        }
    };

    Enemy.prototype.randomSpeed = function(base, modifier) {
        modifier = Math.floor(Math.random() * modifier + 1);
        return base * modifier;
    };

    Enemy.prototype.startPos = function(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    };

    var numOfEnemies = {
        easy : 5,
        medium : 7,
        hard : 9
    };

    for (var i = 0; i < numOfEnemies[currentDiff]; i++) {
        var newEnemy = new Enemy();
        allEnemies.push(newEnemy);
    }
};

/*** PLAYER ***/

var Player = function() {
    GameObject.call(this, 200, Player.startY[currentMode]);
    this.sprite = Player.sprites[currentMode];
    this.score = 0;
    this.health = Player.maxHealth[currentDiff];

    // images to display current health in top right
    this.heartSprite = 'images/Small-Heart.png';
    this.noHeartSprite = 'images/Not-a-Heart.png';

    this.star = false;
    this.starSprite = 'images/Selector.png';

    if (currentMode === 'human') {
        this.starLife;
    }

};
Player.prototype = Object.create(GameObject.prototype);
Player.prototype.constructor = Player;

//Helpers
Player.sprites = {
    human: 'images/char-boy.png',
    bug: 'images/enemy-bug.png'
};
Player.maxHealth = {
    easy: 4,
    medium: 3,
    hard: 2
};
Player.startY = {
    human: 300,
    bug: 140
};
Player.upperBounds = {
    human: -20,
    bug: 60,
};
Player.lowerBounds = {
    human: 380,
    bug: 220
};

// Player functions for both modes

// Check for items and perform updates
Player.prototype.checkGems = function() {
    for (var g = 0; g < allItems.gems.length; g++) {
        if (this.y === allItems.gems[g].y && this.x === allItems.gems[g].x) {
            this.score += allItems.gems[g].points;
            allItems.gems.splice(g,1);
        }
    }
};
Player.prototype.checkStars = function() {
    for (var g = 0; g < allItems.stars.length; g++) {
        if (this.y === allItems.stars[g].y && this.x === allItems.stars[g].x) {
            allItems.stars.splice(g,1);
            this.star = true;
            this.starLife = 100;
        }
    }
};
Player.prototype.checkHearts = function() {
    for (var g = 0; g < allItems.hearts.length; g++) {
        if (this.y === allItems.hearts[g].y && this.x === allItems.hearts[g].x) {
            allItems.hearts.splice(g, 1);
            if (this.health < Player.maxHealth[currentDiff]) {
                this.health += 1;
            }
        }
    }
};
Player.prototype.checkRocks = function(targetX, targetY) {
    for (var g = 0; g < allItems.rocks.length; g ++) {
        if (targetX === allItems.rocks[g].x && targetY === allItems.rocks[g].y) {
            return true;
        }
    }
};
Player.prototype.render = function() {
    if (this.star) {
        ctx.drawImage(Resources.get(this.starSprite), this.x,this.y);
    }
    ctx.textAlign = 'left';
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
    ctx.fillText('SCORE: ' + this.score, 0, 40);
    // TODO: refactor LEVEL text
    if (currentMode === 'human') {
        ctx.fillText('LEVEL: ' + level, 202, 40);
    }
    for (var h = 0; h < Player.maxHealth[currentDiff]; h++) {
        if (h < this.health) {
            ctx.drawImage(Resources.get(this.heartSprite), 465 - (h * 35), -10);
        } else {
            ctx.drawImage(Resources.get(this.noHeartSprite), 465 - (h * 35), -10);
        }
    }
};
Player.prototype.handleInput = function(input) {
    if (input === 'enter') {
        if (paused) {
            paused = false;
        } else {
            paused = true;
        }
    }
    // If not at edge of map and no rocks, move
    // x 100
    // y 80
    if (!paused) {
        if (input === 'up' && this.y !== Player.upperBounds[currentMode] && !this.checkRocks(this.x, this.y - 80)) {
            this.y -= 80;
        } else if (input === 'down' && this.y !== Player.lowerBounds[currentMode] && !this.checkRocks(this.x, this.y + 80)) {
            this.y += 80;
        } else if (input === 'left' && this.x !== 0  && !this.checkRocks(this.x - 100, this.y)) {
            this.x -= 100;
        } else if (input === 'right' && this.x !== 400 && !this.checkRocks(this.x + 100, this.y)) {
            this.x += 100;
        }
    }
};

Player.humanInit = function() {
    Player.prototype.update = function(dt) {
        // player is invincible for some time after contact with a star
        if (!this.star) {
            // collision detection
            for (var e = 0; e < allEnemies.length; e++) {
                if (this.y === allEnemies[e].y && this.x < allEnemies[e].x + 80 && this.x > allEnemies[e].x -80) {
                    this.health -= 1;
                    this.x = 200;
                    this.y = 300;
                }
            }
        } else {
            this.starLife -= 50 * dt;
            if (this.starLife < 0) {
                this.star = false;
            }
        }

        if (this.y === -20) {
            levelUp = true;
            this.x = 200;
            this.y = Player.startY[currentMode];
        }

        this.checkGems();
        this.checkStars();
        this.checkHearts();

    };
    Player.prototype.levelUp = function() {
        var scoreUp = 0;
        for (var e = 0; e < allEnemies.length; e ++) {
            scoreUp += allEnemies[e].speed;
        }
        this.score += scoreUp;
    };
};
Player.bugInit = function() {
    Player.prototype.update = function() {
    // TODO: add direction attribute and change image according to left/right direction
        if (this.star) {
            generateBugItems();
            Rock.initBug();
            this.star = false;
        }
        this.checkGems();
        this.checkStars();
        this.checkHearts();
    };
};
Player.init = function() {
    if (currentMode === 'human') {
        Player.humanInit();
    } else {
        Player.bugInit();
    }

    player = new Player();
};

// Makes objects to begin game
function makeGameObjects() {
    Enemy.init();
    Player.init();
    Rock.gameSetup();
}
//input handlers
function modeInput(input) {
    // up & down keys toggle focus
    if (input === 'down' && inputPos === 0) {
            inputPos += 1;
    } else if (input === 'up' && inputPos === 1) {
            inputPos = 0;
    } else if (input === 'enter') {
        currentMode = gameModes[inputPos];
        inputPos = 0;
    }
}

// instruction screen/difficulty selection input handler
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

// game over input handler
var resetGame;
function gameOverInput(input) {
    if (input === 'enter') {
        resetGame = true;
    }
}

// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
document.addEventListener('keyup', function(e) {
    // added 'enter' key
    var allowedKeys = {
        13: 'enter',
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };

    var key = allowedKeys[e.keyCode];

    // input functions for current game state
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