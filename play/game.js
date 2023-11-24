function Diagon(boardWidth, boardHeight, boardColours, numTiles) {
    this.numTiles = numTiles ?? 10;
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
    for (i = 0; i < this.numTiles/2; i++) {
        for (j = 0; j < this.numTiles/2; j++) {
            let isWall = j < this.numTiles/2 - 1 - i;
            this.board[i][j] = new Tile(isWall);
            this.board[i][this.numTiles-1-j] = new Tile(isWall);
            this.board[this.numTiles-1-i][j] = new Tile(isWall);
            this.board[this.numTiles-1-i][this.numTiles-1-j] = new Tile(isWall);
        }
    }
    console.log(this.board);
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

}

Diagon.prototype.setPosition = function() {

}


function Tile(isWall) {
    this.value = isWall === true ? 'wall' : ''; // TODO: rename value to a better name
    // TODO: add dark as possible value
}