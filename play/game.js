function Diagon(boardWidth, boardHeight, boardColours, numTiles) {
    this.numTiles = numTiles ?? 6;
    this.ts = width / this.numTiles; // diagonal length (tileSize)
    this.bw = boardWidth ?? width;
    this.bh = boardHeight ?? height;

    this.boardColours = boardColours ?? {
        primary: "#964b00",
        secondary: "#3e1f00",
        tertiary: "#190d00",
    };
    
    this.board = [
        {}
    ];
}

Diagon.prototype.drawBoard = function() {
    // board base
    noStroke();
    fill(this.boardColours.primary);
    square(0, 0, this.bw);
    fill(this.boardColours.secondary);
    quad(0, this.ts, this.ts, 0, this.bw, this.bh-this.ts, this.bw-this.ts, this.bh);
    quad(this.bw, this.ts, this.bw-this.ts, 0, 0, this.bh-this.ts, this.ts, this.bh);
    fill(this.boardColours.tertiary);
    quad(2*this.ts, 3*this.ts, 3*this.ts, 2*this.ts, this.bw-2*this.ts, this.bh-3*this.ts, this.bw-3*this.ts, this.bh-2*this.ts);

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