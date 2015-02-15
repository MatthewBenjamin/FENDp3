// Enemies our player must avoid
var Enemy = function() {
    // Variables applied to each of our instances go here,
    // we've provided one for you to get started

    // The image/sprite for our enemies, this uses
    // a helper we've provided to easily load images
    this.sprite = 'images/enemy-bug.png';
    this.speed = this.randomSpeed();
    this.x = this.startX();
    this.y = this.randomRow();
}

Enemy.prototype.randomSpeed = function () {
    var defaultSpeed = 10;
    var modifier = Math.floor(Math.random() * 10 + 1);
    return defaultSpeed * modifier;
}

//start each enemy at random X coordinate between -minX and maxX
Enemy.prototype.startX = function () {
    var minX = -500;
    var maxX = -100;
    return Math.floor(Math.random() * minX + maxX);
}
Enemy.prototype.randomRow = function () {
    //Y coordinates for each row
    var rows = [60, 140, 220];

    var decision = Math.floor(Math.random() * rows.length);
    return rows[decision];
}


// Update the enemy's position, required method for game
// Parameter: dt, a time delta between ticks
Enemy.prototype.update = function(dt) {
    // You should multiply any movement by the dt parameter
    // which will ensure the game runs at the same speed for
    // all computers.

    // if enemy has traversed entire area, randomly reset values
    if (this.x > 505) {
        this.x = this.startX();
        this.y = this.randomRow();
        this.speed = this.randomSpeed();
    } else {
        this.x += this.speed * dt;
    }
}

// Draw the enemy on the screen, required method for game
Enemy.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
}

// Now write your own player class
// This class requires an update(), render() and
// a handleInput() method.

var Player = function() {
    this.sprite = 'images/char-boy.png';
    var startX = 200;
    var startY = 300;
    this.x = startX;
    this.y = startY;
}

Player.prototype.update = function(dt) {
    //collision detection
    for (var e = 0; e < allEnemies.length; e++) {
        if (this.y === allEnemies[e].y && this.x < allEnemies[e].x + 80 && this.x > allEnemies[e].x -80) {
            this.x = 200;
            this.y = 300;
        }
    }
}

Player.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
}

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

// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
// Place the player object in a variable called player

var numOfEnemies = 9
var allEnemies = [];

for (var i = 0; i < numOfEnemies; i++) {
    var newEnemy = new Enemy;
    allEnemies.push(newEnemy);
}

var player = new Player;

var paused = false;
var modeSelect= {};
modeSelect.gameMode = null;
modeSelect.inputPos = 0;
modeSelect.instructionsShown = false;
modeSelect.handleInput = function (input) {
    console.log("yes handle input");
    //if input = arrow key, update modeSelect.inputPos
    if (input === 'down' && modeSelect.inputPos === 0) {
            modeSelect.inputPos += 1;
    } else if (input === 'up' && modeSelect.inputPos === 1) {
            modeSelect.inputPos = 0;
    } else if (input === 'enter') {
        if (modeSelect.inputPos === 0) {
            modeSelect.gameMode = 'human';
        } else if (modeSelect.inputPos === 1) {
            modeSelect.gameMode = 'bug';
        } else {
            console.log("ERROR modeSelect.handleInput");
        }
    }
};

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

    if (!modeSelect.gameMode) {
        modeSelect.handleInput(allowedKeys[e.keyCode]);
    } else {
        player.handleInput(allowedKeys[e.keyCode]);    
    }
    
});
