/* *** TO DOs: ***
1   add helper functions (refactor gen player and enemy classes) to
    gameMode.human & gameMode.bug
    move difficulty object into gameMode.diffculty
2
    Implement Gems
        Human Mode: Generate upon next level(possibly with timer before appearing) - level and difficulty determine # and type
            i.e. var i = x - level, for (var a =0; i, a+=1) {equation for randomly picking if gem and type based on difficulty}
        Bug Mode: trigger potential generations occasionality based on dynamic levels

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
gameMode.mode;
gameMode.human = {};
gameMode.bug = {};
//gameMode.difficulty = {};
var inputPos = 0;

//features to implement: player characteristics: speed(?), health (human), attack (bug)

// Higher difficulty --> more enemies, less health
var difficulty = {}
difficulty.current;
difficulty.modes = {
    0 : "easy",
    1 : "medium",
    2 : "hard"
}
var instructions = {}
var paused = false;

//TO DO: refactor enemy objects to use these - ***THIS DOESN"T WORK - this.x/y points to function, not what
//the function returns
var randomCol = function () {
            //y pixel values for each row (rounded)
            var rows = [0, 100, 200, 300, 400];

            var decision = Math.floor(Math.random() * rows.length);
            return rows[decision];            
}
var randomRow = function () {
            //y pixel values for each row (rounded)
            var rows = [60, 140, 220];

            var decision = Math.floor(Math.random() * rows.length);
            return rows[decision];            
}

//TO DO: implement level function in human mode, higher level --> faster enemies
//bug mode won't have discrete levels, instead it will progressively get harder as each enemy is killed
var level;
var allEnemies = [];
var player;

//ROCKS, STARS, & GEMS should NOT occupy the same same (implement this after everything else works?)
//Generate these objects in nextlevel function!
//refactor gems help vars into Gem object?
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
var Gem = function() {
    //TO DO:
    //pop up randomly like stars but more likely
    // randomly pick value 0 - 2
    //this.gemClass = Math.floor(Math.random() * 3); change this to make higher classes rarer or incoporate into generateGems function
    this.sprite = gemSprites[0];
    //this.points/value = gemPoints[gemClass]
    this.x = 200; //randomRow;
    this.y = 160; //randomCol;
    // ----update to check for collision (or put in player update?)
}

Gem.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
}

var allGems = []
function generateGems() {
    //var numofGems = 1;
    allGems.push(new Gem);
}

generateGems();

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
    //TO DO:
    //rocks appear at the beginning of a new level (don't appear randomly like stars and gems)
    //random chance that they appear (goes up with difficulty/level)
    //this.x = randomRow();
    //this.y = randomCol();
    //blocks player movement (but not enemy movement)
    //this.x = this.randomX() -OR- randomX(); and use randomX for Stars, rocks, and gems
    //this.y same as this.x but separate Y function
}


var rows = [60, 140, 220];
var columns = [0, 100, 200, 300, 400];

function makeEnemies() {

    //TO DO: put if statement inside Enemy function? is this less efficient?
    //OR put parameters in outside object-variables and point to them
    if (gameMode.mode === "human") {
        //human mode
        var Enemy = function() {
            this.sprite = 'images/enemy-bug.png'; //different from bug mode
            this.speed = this.randomSpeed(10,10); //same   TO DO: fine tune parameters
            this.x = this.startPos(-500, 400); //diff parameters
            this.y = this.randomLane(rows); //same
        }
    } else {
         var Enemy = function() {
            this.sprite = 'images/char-boy.png'; // TO DO: make this random (select from all human pngs)
                                                 //different from human mode
            this.speed = this.randomSpeed(10,10); //same TO DO: fine tune parameters
            this.x = this.randomLane(columns); //same
            this.y = this.startPos(300,600);  //TO DO: fine tune parameters
        }
    }

    //same
    Enemy.prototype.randomSpeed = function (base, modifier) {
        var base = base;
        var modifier = Math.floor(Math.random() * modifier + 1);
        return base * modifier;   
    }

    //same
    Enemy.prototype.startPos = function(min, max) {
        return Math.floor(Math.random() * min + max);   
    }

    //same
    Enemy.prototype.randomLane = function (lanes) {
            var decision = Math.floor(Math.random() * lanes.length);
            return lanes[decision];            
    }

    //update method
    //combine?
    if (gameMode.mode === "human") { 
        Enemy.prototype.update = function (dt) {
            // You should multiply any movement by the dt parameter
            // which will ensure the game runs at the same speed for
            // all computers.

            // if enemy has traversed entire area, reset values (randomly)
            if (this.x > 505) {
                this.x = -100   //TO DO: make this random?
                this.y = this.randomLane(rows);
                this.speed = this.randomSpeed(10,10);
            } else {
                this.x += this.speed * dt;
            }
        }
    } else {
    //bug mode
    Enemy.prototype.update = function (dt) {
            // if enemy has traversed entire area, LOSE
            if (this.x === player.x && this.y > player.y -40 && this.y < player.y + 40) {
                this.y = 300;
                this.speed = 0;
            }
            else if (this.y <= -20) {
                this.y = 600;
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
    if (difficulty.current === 'easy') {
        numOfEnemies = 6;
    } else if (difficulty.current === 'medium') {
        numOfEnemies = 9;
    } else if (difficulty.current === 'hard') {
        numOfEnemies = 12;
    }

    for (var i = 0; i < numOfEnemies; i++) {
        var newEnemy = new Enemy;
        allEnemies.push(newEnemy);
    }
}



function makePlayer() {

    if (gameMode.mode === "human") {
        var Player = function() {
            this.sprite = 'images/char-boy.png'; //different
            var startX = 200;   //diff ---are these variables necessary?
            var startY = 300;   //diff
            this.x = startX;    //same
            this.y = startY;    //same
        }
    } else {
        var Player = function() {
            this.sprite = 'images/enemy-bug.png';   //diff
            var startX = 200;   //diff
            var startY = 140;   //diff
            this.x = startX;    //same
            this.y = startY;    //same
        }
    }

    //update functions
    //diff
    if (gameMode.mode === "human") {
        Player.prototype.update = function(dt) {
            //collision detection
            for (var e = 0; e < allEnemies.length; e++) {
                if (this.y === allEnemies[e].y && this.x < allEnemies[e].x + 80 && this.x > allEnemies[e].x -80) {
                    this.x = 200;
                    this.y = 300;
                }
            }
        }
    } else {
        Player.prototype.update = function(dt) {
            //collision detection
            for (var e = 0; e < allEnemies.length; e++) {
                if (this.y === allEnemies[e].y && this.x < allEnemies[e].x + 80 && this.x > allEnemies[e].x -80) {
                    //this won't work...or will need to be reset
                    //allEnemies[e].y = 1000;
                    //allEnemies[e].speed = 0;
                }
            }
        }        
    }

    //same
    Player.prototype.render = function() {
        ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
    }

    //same
    Player.prototype.handleInput = function (input) {
        //x 100
        //y 80
        // ** TODO: if reach water, next level!
        if (input === 'enter') {
            if (paused) {
                paused = false;
            } else {
                paused = true;
            }
        } 
        if (!paused) {
            if (input === 'up' && this.y !== -20) {
                this.y -= 80;
            } else if (input === 'down' && this.y !== 380) {
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

    if (!gameMode.mode) {
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
        //ie gameMode.mode = modeSelect.possibleModes[inputPos];
        if (inputPos === 0) {
            gameMode.mode = 'human';
        } else if (inputPos === 1) {
            gameMode.mode = 'bug';
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
        difficulty.current = difficulty.modes[inputPos]
        makeGameObjects();
        //paused = false;
        instructions.shown = true;
    }
}