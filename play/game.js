class Diagon {
    constructor(players, boardWidth, boardHeight, boardColours, numTiles) {
        this.players = players;
        players.forEach((p, i) => {
            p.setIndex(i);
        });

        /** the number of tiles on the board (corner to corner) @type {number} */
        this.numTiles = numTiles ?? 10;
        if (this.numTiles % 2 !== 0) {
            throw RangeError('numTiles must be an even number, was ' + this.numTiles);
        }
        /** half numTiles @type {number} */
        this.hnt = this.numTiles / 2;

        /** tile size (diagonal length) @type {number} */
        this.ts = width / ((this.numTiles + 6) / 2);
        /** half tileSize @type {number} */
        this.hts = this.ts / 2;

        /** board width @type {number} */
        this.bw = boardWidth ?? width - 2 * this.ts;
        /** board height @type {number} */
        this.bh = boardHeight ?? height - 2 * this.ts;

        /** half board width @type {number} */
        this.hbw = this.bw / 2;
        /** half board height @type {number} */
        this.hbh = this.bh / 2;

        resizeCanvas(this.bw + 2 * this.ts, this.bh);

        this.boardColours = boardColours ?? {
            primary: "#964b00",
            secondary: "#875e2f",
            tertiary: "hotpink",
        };

        // setup the board and populate with Tiles
        this.board = [...Array(this.numTiles)].map(() => Array(this.numTiles));
        for (let i = 0; i < this.hnt; i++) {
            for (let j = 0; j < this.hnt; j++) {
                let isWall = j < this.hnt - 2 - i;
                let isDark = j == this.hnt || j == this.hnt - 1 || i == this.hnt || i == this.hnt - 1;
                let options = {isWall, isDark};
                this.board[i][j] = new Tile(options);
                this.board[i][this.numTiles - 1 - j] = new Tile(options);
                this.board[this.numTiles - 1 - i][j] = new Tile(options);
                this.board[this.numTiles - 1 - i][this.numTiles - 1 - j] = new Tile(options);
            }
        }
        console.log(this.board);

        this.updateScore();
    }

    drawBoard() {
        push();
        translate(this.ts, 0);

        // board base
        noStroke();
        fill(this.boardColours.primary);
        square(0, 0, this.bw);
        clip(() => square(0, 0, this.bw)); // make sure board edges are clean

        // win squares
        fill(this.boardColours.secondary);
        this.drawTile(this.numTiles / 4, this.numTiles / 4);
        this.drawTile(this.numTiles / 4, this.numTiles / 4 + 1);

        // centreline gradients
        // top left
        linearGradient(
            this.hts, this.hts, this.ts, 0, this.hbw + this.hts, this.hbh - this.hts, this.hbw, this.hbh,
            this.hbw, this.hbh, this.hbw + this.hts, this.hbh - this.hts,
            [0, '#fffa'], [1, '#0000']
        );
        // bottom right
        linearGradient(
            this.hbw - this.hts, this.hbh + this.hts, this.bw - this.ts, this.bh, this.bw - this.hts, this.bh - this.hts, this.hbw, this.hbh,
            this.hbw - this.hts, this.hbh + this.hts, this.hbw, this.hbh,
            [0, '#0000'], [1, '#fffa']
        );
        // top right
        linearGradient(
            this.hbw - this.hts, this.hbh - this.hts, this.bw - this.ts, 0, this.bw - this.hts, this.hts, this.hbw, this.hbh,
            this.hbw, this.hbh, this.hbw - this.hts, this.hbh - this.hts,
            [0, '#fffa'], [1, '#0000']
        );
        // bottom left
        linearGradient(
            this.hts, this.bh - this.hts, this.ts, this.bh, this.hbw + this.hts, this.hbh + this.hts, this.hbw, this.hbh,
            this.hbw + this.hts, this.hbh + this.hts, this.hbw, this.hbh,
            [0, '#0000'], [1, '#fffa']
        );

        // gridlines
        stroke('black');
        strokeWeight(2);
        for (let i = 2; i <= this.hnt + 1; i++) {
            // use lighter gridlines for the middle
            if (i === this.hnt + 1) {
                strokeWeight(4);
                stroke('beige');
            }

            let s = i * this.ts;
            line(0, s, s, 0);
            line(this.bw - s, this.bh, this.bw, this.bh - s);
            line(this.bw - s, 0, this.bw, s);
            line(0, this.bh - s, s, this.bh);
        }

        // corners
        noStroke();
        fill('black');
        triangle(0, 0, this.ts, 0, 0, this.ts);
        triangle(this.bw, 0, this.bw - this.ts, 0, this.bw, this.ts);
        triangle(this.bw, this.bh, this.bw - this.ts, this.bh, this.bw, this.bh - this.ts);
        triangle(0, this.bh, this.ts, this.bh, 0, this.bh - this.ts);

        pop();
    }

    drawTile(x, y) {
        x *= this.ts;
        y *= this.ts;
        quad(x, y, x + this.hts, y - this.hts, x + this.ts, y, x + this.hts, y + this.hts);
    }

    drawStones() {
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

    draw() {
        this.drawBoard();
        this.drawStones();
    }

    getPosition() {
        return this.board;
    }

    setPosition(positionList) {
        // positionList = [[1,1,player1],[2,3,player2]]
        for (let p of positionList) {
            this.board[p[0], p[1]] = p[3];
        }
        this.updateScore();
        return this.board;
    }

    getScore() {
        return this.scores;
    }

    updateScore() {
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
}


class Tile {
    constructor({isWall, isDark}) {
        this.isWall = isWall ?? false;
        this.isDark = isDark ?? false;
        this.player = null;
    }
}


class Player {
    constructor(stoneId, numStones) {
        this.numStones = numStones ?? 5;
        this.stones = Array(numStones).map(() => new Stone(this, stoneId));
    }

    getIndex() {
        return this.index;
    }

    setIndex(index) {
        this.index = index;
    }
}


class Stone {
    constructor(player, id, position) {
        this.player = player; // is this necessary / a good idea
        this.img = loadImage(`https://hammer-01.github.io/diagon/assets/Stones/stone-${id}.png`); // TODO: change link when merged
        this.pos = position || null;
    }
    
    draw(x, y) {
        imageMode(CENTER); // TODO: confirm this is desired
        image(this.img, x, y); // TODO: add width and height
    }
}



/****** Utility Functions ******/
/**
 * Draws a quad with a linear gradient
 * @param {number} x0
 * @param {number} y0
 * @param {number} x1
 * @param {number} y1
 * @param {number} x2
 * @param {number} y2
 * @param {number} x3
 * @param {number} y3
 * @param {number} startX - the start x coordinate of the gradient
 * @param {number} startY - the start y coordinate of the gradient
 * @param {number} endX - the end x coordinate of the gradient
 * @param {number} endY - the end y coordinate of the gradient
 * @param {number[][]} colorStops - an array of color stops
 */
function linearGradient(x0, y0, x1, y1, x2, y2, x3, y3, startX, startY, endX, endY, ...colorStops) {
    let gradient = drawingContext.createLinearGradient(startX, startY, endX, endY);
    for (let i = 0; i < colorStops.length; i++) {
        gradient.addColorStop(...colorStops[i]);
    }
    drawingContext.fillStyle = gradient;
    quad(x0, y0, x1, y1, x2, y2, x3, y3);
}