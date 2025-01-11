function Diagon(players, boardWidth, boardHeight, boardColours, numTiles) {
    this.players = players;
    players.forEach((p, i) => {
        p.setIndex(i);
    });

    this.numTiles = numTiles ?? 10;
    if (this.numTiles % 2 !== 0) {
        throw RangeError('numTiles must be an even number, was ' + this.numTiles);
    }
    this.ts = width / ((this.numTiles + 6) / 2); // diagonal length (tileSize)
    this.bw = boardWidth ?? width - 2*this.ts;
    this.bh = boardHeight ?? height - 2*this.ts;

    resizeCanvas(this.bw + 2*this.ts, this.bh);

    // distances for centre square
    this.c1 = (this.numTiles + 2) / 4;
    this.c2 = this.c1 - 1;

    this.boardColours = boardColours ?? {
        primary: "#964b00",
        secondary: "#875e2f",
        tertiary: "hotpink",
    };
    
    // setup the board and populate with Tiles
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
    push();
    translate(this.ts, 0);

    // board base
    noStroke();
    fill(this.boardColours.primary);
    square(0, 0, this.bw);
    clip(() => square(0, 0, this.bw)); // make sure board edges are clean

    // win squares
    fill(this.boardColours.secondary);
    beginShape();
    vertex(this.c1*this.ts, this.c2*this.ts)
    vertex((this.c2 + 0.5)*this.ts, (this.c1 - 0.5)*this.ts)
    vertex(this.c1*this.ts, this.c1*this.ts)
    vertex((this.c2 + 0.5)*this.ts, (this.c1 + 0.5)*this.ts)
    vertex(this.bw-this.c1*this.ts, this.bh-this.c2*this.ts)
    vertex((this.c2 + 1.5)*this.ts, (this.c1 + 0.5)*this.ts)
    vertex(this.c1*this.ts, this.c1*this.ts)
    vertex((this.c2 + 1.5)*this.ts, (this.c1 - 0.5)*this.ts)
    endShape(CLOSE)

    //triangle highlight
    fill(this.boardColours.tertiary);
    beginShape();
    vertex(this.c1*this.ts, this.c2*this.ts)
    vertex((this.c2 + 1.5)*this.ts, (this.c1 - 0.5)*this.ts)
    vertex((this.c1 + 2.5)*this.ts, (this.c2 - 1.5)*this.ts)
    vertex((this.c1 + 2)*this.ts, (this.c2 - 2)*this.ts)
    endShape(CLOSE)

    beginShape();
    vertex(this.c1*this.ts, this.c2*this.ts)
    vertex((this.c2 + 0.5)*this.ts, (this.c1 - 0.5)*this.ts)
    vertex((this.c1 - 2.5)*this.ts, (this.c1 - 2.5)*this.ts)
    vertex((this.c1 - 2)*this.ts, (this.c1 - 3)*this.ts)
    endShape(CLOSE)

    beginShape();
    vertex((this.c2 + 0.5)*this.ts, (this.c1 + 0.5)*this.ts)
    vertex(this.bw-this.c1*this.ts, this.bh-this.c2*this.ts)
    vertex((this.c1 - 2)*this.ts, (this.c1 + 3)*this.ts)
    vertex((this.c1 - 2.5)*this.ts, (this.c1 + 2.5)*this.ts)
    endShape(CLOSE)

    beginShape();
    vertex(this.bw-this.c1*this.ts, this.bh-this.c2*this.ts)
    vertex((this.c2 + 1.5)*this.ts, (this.c1 + 0.5)*this.ts)
    vertex((this.c1 + 2.5)*this.ts, (this.c1 + 2.5)*this.ts)
    vertex((this.c1 + 2)*this.ts, (this.c1 + 3)*this.ts)
    endShape(CLOSE)

    // gridlines
    stroke('black');
    strokeWeight(2);
    for (let s = 2*this.ts; s <= this.bw; s += this.ts) {
        if (s === 6*this.ts) {
            strokeWeight(4);
            stroke('beige');
        }
        line(0, s, s, 0);
        line(this.bw-s, this.bh, this.bw, this.bh-s);
        line(this.bw-s, 0, this.bw, s);
        line(0, this.bh-s, s, this.bh);
    }

    // corners
    noStroke();
    fill('black');
    triangle(0, 0, this.ts, 0, 0, this.ts);
    triangle(this.bw, 0, this.bw-this.ts, 0, this.bw, this.ts);
    triangle(this.bw, this.bh, this.bw-this.ts, this.bh, this.bw, this.bh-this.ts);
    triangle(0, this.bh, this.ts, this.bh, 0, this.bh-this.ts);
    
    pop();
}

Diagon.prototype.drawStones = function() {
    this.players.forEach(p => p.stones.forEach(s => {
        if (s.pos !== null) {
            s.draw(s.pos.x, s.pos.y);
        } else {
            // stone is on the side of the board
            // TODO: figure out a way to check for other side stones
            //       and then draw in it in the correct position
        }
    }));
}

Diagon.prototype.draw = function() {
    this.drawBoard();
    this.drawStones();
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


function Player(stoneId, numStones) {
    this.numStones = numStones ?? 5;
    this.stones = Array(numStones).map(() => new Stone(this, stoneId));
}

Player.prototype.getIndex = function() {
    return this.index;
}

Player.prototype.setIndex = function(index) {
    this.index = index;
}


function Stone(player, id, position) {
    this.player = player; // is this necessary / a good idea
    this.img = loadImage(`https://hammer-01.github.io/diagon/assets/Stones/stone-${id}.png`) // TODO: change link when merged
    this.pos = position || null;
}

Stone.prototype.draw = function(x, y) {
    imageMode(CENTER); // TODO: confirm this is desired
    image(this.img, x, y); // TODO: add width and height
}