function Diagon(players, boardWidth, boardHeight, boardColours, numTiles) {
    this.players = players;
    players.forEach((p, i) => {
        p.setIndex(i);
    });

    this.numTiles = numTiles ?? 10;
    if (this.numTiles % 2 !== 0) {
        throw RangeError('numTiles must be an even number, was ' + this.numTiles);
    }
    this.ts = width / ((this.numTiles + 2) / 2); // diagonal length (tileSize)
    this.bw = boardWidth ?? width;
    this.bh = boardHeight ?? height;

    // distances for centre square
    this.c1 = (this.numTiles + 2) / 4;
    this.c2 = this.c1 - 1;

    this.boardColours = boardColours ?? {
        primary: "#964b00",
        secondary: "#3e1f00",
        tertiary: "#190d00",
    };
    
    this.board = [...Array(this.numTiles)].map(() => Array(this.numTiles));
    let halfNT = this.numTiles/2;
    for (i = 0; i < halfNT; i++) {
        for (j = 0; j < halfNT; j++) {
            let isWall = j < halfNT - 2 - i;
            let isDark = j == halfNT || j == halfNT - 1 || i == halfNT || i == halfNT - 1;
            let options = {isWall, isDark};
            this.board[i][j] = new Tile(options);
            this.board[i][this.numTiles-1-j] = new Tile(options);
            this.board[this.numTiles-1-i][j] = new Tile(options);
            this.board[this.numTiles-1-i][this.numTiles-1-j] = new Tile(options);
        }
    }
    console.log(this.board);

    this.updateScore();
}

Diagon.prototype.drawBoard = function() {
    // board base
    noStroke();
    fill(this.boardColours.primary);
    square(0, 0, this.bw);

    // dark x
    fill(this.boardColours.secondary);
    quad(0, this.ts, this.ts, 0, this.bw, this.bh-this.ts, this.bw-this.ts, this.bh);
    quad(this.bw, this.ts, this.bw-this.ts, 0, 0, this.bh-this.ts, this.ts, this.bh);

    // centre square
    fill(this.boardColours.tertiary);
    quad(this.c1*this.ts, this.c2*this.ts, this.c2*this.ts, this.c1*this.ts, this.bw-this.c1*this.ts, this.bh-this.c2*this.ts, this.bw-this.c2*this.ts, this.bh-this.c1*this.ts);

    // gridlines
    stroke('black');
    strokeWeight(2);
    for (let s = this.ts; s < this.bw*2; s += this.ts) {
        line(0, s, s, 0);
        line(this.bw-s, 0, this.bw, s);
    }

    // corners
    fill('black');
    triangle(0, 0, this.ts, 0, 0, this.ts);
    triangle(this.bw, 0, this.bw-this.ts, 0, this.bw, this.ts);
    triangle(this.bw, this.bh, this.bw-this.ts, this.bh, this.bw, this.bh-this.ts);
    triangle(0, this.bh, this.ts, this.bh, 0, this.bh-this.ts);
}

Diagon.prototype.drawSides = function() {

}

Diagon.prototype.draw = function() {
    this.drawBoard();
    this.drawSides();
}

Diagon.prototype.getPosition = function() {
    return this.board;
}

Diagon.prototype.setPosition = function(positionList) { // [[1,1,player1],[2,3,player2]]
    for (let p of positionList) {
        this.board[p[0],p[1]] = p[3];
    }
    this.updateScore();
    return this.board;
}

Diagon.prototype.getScore = function() {
    return this.scores;
}

Diagon.prototype.updateScore = function() {
    let scores = Array(this.players.length).fill(0);
    for (let i = 0; i < this.numTiles; i++) {
        // check rows
        this.board[i].forEach(tile => {
            if (tile.player) {
                scores[tile.player.getIndex()]++;
            }
        });

        // check columns
        this.board.forEach(row => {
            if (row[i].player) {
                scores[row[i].player.getIndex()]++;
            }
        });
    }

    return this.scores = scores;
}


function Tile({isWall, isDark}) {
    this.isWall = isWall ?? false;
    this.isDark = isDark ?? false;
    this.player = null;
}


function Player(numStones) {
    this.numStones = numStones ?? 5;
}

Player.prototype.getIndex = function() {
    return this.index;
}

Player.prototype.setIndex = function(index) {
    this.index = index;
}