/**
 * The main game class
 */
class Diagon {
    /**
     * Creates an instance of Diagon
     * @param {Player[]} players An array of players
     * @param {number} boardWidth The width of the board
     * @param {number} boardHeight The height of the board
     * @param {object} boardColours The colours of the board
     * @param {number} numTiles The number of tiles on the board (corner to corner)
     */
    constructor(players, boardWidth, boardHeight, boardColours, numTiles) {
        if (players.length > 4) throw RangeError('Maximum of 4 players, given ' + players.length);

        // resize so we have a square canvas
        resizeCanvas(min(width, height), min(width, height));

        /** The game board @type {Board} */
        this.board = new Board(boardWidth, boardHeight, boardColours, numTiles);

        /** An array of players @type {Player[]} */
        this.players = players;
        players.forEach((p, i) => {
            p.setIndex(i);
            p.setBoard(this.board);
        });

        /**
         * @typedef GrabbedStone
         * @property {Stone} stone The currently grabbed stone
         * @property {[x: number, y: number]} offset The offset of the stone
         * @property {[row: number, col: number]} originalPos The original position the stone was on
        */
        /** The currently grabbed stone @type {GrabbedStone | null} */
        this.grabbedStone = null;

        // setup the board representation and populate with Tiles
        /** A representation of the board, a 2D array of Tiles @type {Tile[][]} */
        this.boardRep = Array.from({length: this.board.numTiles}, () => Array(this.board.numTiles));
        for (let i = 0; i < this.board.hnt; i++) {
            for (let j = 0; j < this.board.hnt; j++) {
                let isWall = j < this.board.hnt - 2 - i;
                this.boardRep[i][j] = new Tile(isWall, [i,j]);
                this.boardRep[i][this.board.numTiles - 1 - j] = new Tile(isWall, [i,this.board.numTiles-1-j]);
                this.boardRep[this.board.numTiles - 1 - i][j] = new Tile(isWall, [this.board.numTiles-1-i,j]);
                this.boardRep[this.board.numTiles - 1 - i][this.board.numTiles - 1 - j] = new Tile(isWall, [this.board.numTiles-1-i,this.board.numTiles-1-j]);
            }
        }
        console.log(this.boardRep);
    }

    /**
     * Draws all the board elements
     */
    draw() {
        clear();
        this.board.draw();
        this.players.forEach(p => p.draw());
        if (this.grabbedStone) this.grabbedStone.stone.draw(); // draw grabbed stone on top of all other stones
    }

    /**
     * Returns the current state of the board
     * @returns {Tile[][]} The board
     */
    getPosition() {
        return this.boardRep;
    }

    /**
     * Sets the position of the board
     * 
     * @example
     * ```
     * diagon.setPosition(new Map([
     *     [player1, [[2,3,player1.stones[0]]]],
     *     [player2, [[5,1,player2.stones[0]],[3,7,player2.stones[4]]]]
     * ]));
     * ```
     * @param {Map<Player,[number, number, Stone][]} positionMap The position of the board
     * @returns {Tile[][]} The board
     */
    setPosition(positionMap) {
        // positionMap = Map{player1:[[1,1,stone1],[1,2,stone2]],player2:[[2,3,stone3]]}
        for (let [player, positionList] of positionMap) {
            for (let [row, col, stone] of positionList) {
                // remove old stone if it exists
                // todo: confirm this is what we want to do
                if (this.boardRep[row][col].stone) {
                    player.removeStoneFromBoard(this.boardRep[row][col].stone);
                }
                // update board representation
                this.boardRep[row][col].stone = stone;

                // update stone coordinates
                player.moveStone(stone, ...this.getCoordsFromBoardRep(row, col));
            }
        }
        return this.boardRep;
    }

    /**
     * Returns the (board rep) coordinates of the given (screen space) coordinates
     * @param {number} x the x coordinate
     * @param {number} y the y coordinate
     * @returns {[row: number, col: number]} the board rep coordinates
     */
    getBoardRepRelativeCoords(x, y) {
        [x, y] = rotateVectorClockwise([x, y], QUARTER_PI);
        let offset = height / 2 - this.board.tl * this.board.hnt;
        return [(x - offset) / this.board.tl, (y - offset) / this.board.tl];
    }

    /**
     * Returns the tile at the given (board rep) coordinates
     * @param {number} row the coordinate corresponding to the row of the board representation
     * @param {number} col the coordinate corresponding to the column of the board representation
     * @returns {Tile | null} the tile at the given (board rep) coordinates, or null if none exists
     */
    getTileFromBoardRepRelativeCoords(row, col) {
        if (row < 0 || row >= this.board.numTiles || col < 0 || col >= this.board.numTiles) return null;
        return this.boardRep[floor(row)][floor(col)];
    }

    /**
     * Returns the tile at the given (screen space) coordinates
     * @param {number} x the x coordinate
     * @param {number} y the y coordinate
     * @returns {Tile | null} the tile at the given (screen space) coordinates, or null if none exists
     */
    getTileFromCoords(x, y) {
        let [row, col] = this.getBoardRepRelativeCoords(x, y);
        return this.getTileFromBoardRepRelativeCoords(row, col);
    }

    /**
     * Returns the (screen space) coordinates of the tile at the given (board rep) coordinates
     * @param {number} row the row of the board representation
     * @param {number} col the column of the board representation
     * @returns {[x: number, y: number]} the (screen space) coordinates of the tile at the given (board rep) coordinates
     */
    getCoordsFromBoardRep(row, col) {
        let offset = height / 2 - this.board.tl * this.board.hnt;
        let leftCorner = rotateVectorClockwise([floor(row) * this.board.tl + offset, floor(col) * this.board.tl + offset], -QUARTER_PI);
        return [leftCorner[0] + this.board.hts, leftCorner[1]];
    }

    getSideStoneFromCoords(x, y) {
        if (this.board.isOnBoard(x, y)) return null;
        // todo
    }

    /**
     * Returns the stone at the given (screen space) coordinates, along with the offset
     * @param {number} x the x coordinate
     * @param {number} y the y coordinate
     * @returns {GrabbedStone | null} the stone at the given (screen space) coordinates, or null if none exists
     */
    getStoneAtCoords(x, y) {
        // todo: handle side stones
        let [boardX, boardY] = this.getBoardRepRelativeCoords(x, y);
        let stone = this.getTileFromBoardRepRelativeCoords(boardX, boardY)?.stone;
        if (stone) {
            if (dist(boardX, boardY, floor(boardX) + 0.5, floor(boardY) + 0.5) < stone.getSize() / this.board.tl / 2) {
                let offset = this.getCoordsFromBoardRep(boardX, boardY);
                offset[0] -= x;
                offset[1] -= y;
                return {stone, offset, originalPos: [floor(boardX), floor(boardY)]};
            }
        }
        return null;
    }

    /* Event handlers */

    // todo
    handleMouseClick(event) {
        console.log(event, mouseX, mouseY);
        if (this.board.isOnBoard(mouseX, mouseY)) {
            console.log('clicked on tile:', this.getTileFromBoardRepRelativeCoords(...this.getBoardRepRelativeCoords(mouseX, mouseY)));
        } else {
            
        }
    }

    /**
     * Handles a mouse press (mousedown event)
     */
    handleMousePress() {
        let grabbedStone = this.getStoneAtCoords(mouseX, mouseY);
        if (grabbedStone) {
            cursor('grabbing');
            this.grabbedStone = grabbedStone;
            let tile = this.getTileFromCoords(mouseX, mouseY);
            tile.stone = null;
        }
    }

    /**
     * Handles a mouse release (mouseup event)
     */
    handleMouseRelease() {
        if (this.grabbedStone) {
            let {stone, originalPos} = this.grabbedStone;
            this.grabbedStone = null;
            let [boardX, boardY] = this.getBoardRepRelativeCoords(mouseX, mouseY);
            let tile = this.getTileFromBoardRepRelativeCoords(boardX, boardY);
            if (tile && !tile.isWall && !tile.stone) {
                tile.stone = stone;
                stone.setPosition(...this.getCoordsFromBoardRep(boardX, boardY));
            } else {
                this.getTileFromBoardRepRelativeCoords(...originalPos).stone = stone;
                stone.setPosition(...this.getCoordsFromBoardRep(...originalPos));
            }
        }

        this.handleMouseMove(); // update cursor
        this.board.clearHighlightedTiles();
    }

    /**
     * Handles a mouse drag (mousemove event while mouse button is held down)
     */
    handleMouseDrag() {
        if (!this.grabbedStone) return;
        let {stone, offset: [offsetX, offsetY]} = this.grabbedStone;
        stone.setPosition(mouseX + offsetX, mouseY + offsetY);
        let [boardX, boardY] = this.getBoardRepRelativeCoords(mouseX, mouseY);
        let tile = this.getTileFromBoardRepRelativeCoords(boardX, boardY);
        if (tile && !tile.isWall && !tile.stone) {
            let tileCoords = this.getCoordsFromBoardRep(boardX, boardY);
            tileCoords[0] -= this.board.hts;
            this.board.setHighlightedTiles(tileCoords);
        } else {
            this.board.clearHighlightedTiles();
        }
    }

    /**
     * Handles a mouse move (mousemove event while mouse button is not held down)
     */
    handleMouseMove() {
        if (this.getStoneAtCoords(mouseX, mouseY)) {
            cursor('grab');
        } else {
            cursor('default');
        }
    }
}

/**
 * Represents the game board
 */
class Board {
    /**
     * Creates an instance of Board
     * @param {number} boardWidth The width of the board
     * @param {number} boardHeight The height of the board
     * @param {object} boardColours The colours of the board
     * @param {number} numTiles The number of tiles on the board (corner to corner)
     */
    constructor(boardWidth, boardHeight, boardColours, numTiles) {
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
        /** tile length @type {number} */
        this.tl = this.ts * Math.SQRT1_2;

        /** board width @type {number} */
        this.bw = boardWidth ?? width - 2 * this.ts;
        /** board height @type {number} */
        this.bh = boardHeight ?? height - 2 * this.ts;

        /** half board width @type {number} */
        this.hbw = this.bw / 2;
        /** half board height @type {number} */
        this.hbh = this.bh / 2;

        /** The colours of the board @type {object} */
        this.boardColours = boardColours ?? {
            primary: "#964b00",
            secondary: "#875e2f",
            tertiary: "hotpink",
            highlight: "#fff8"
        };

        /** An array of highlighted tiles as a list of (screen space) coordinates @type {...number[]} */
        this.highlightedTiles = [];
    }

    /**
     * Draws the board
     */
    draw() {
        push();
        // temp
        // translate(width / 2, height / 2);
        // rotate(QUARTER_PI);
        // translate(-width / 2, -height / 2);
        // end temp
        translate(this.ts, this.ts);

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

        // highlighted tiles
        translate(-this.ts, -this.ts);
        for (let [x, y] of this.highlightedTiles) {
            this.highlightTile(x, y);
        }

        pop();
    }

    /**
     * Draws a tile
     * @param {number} x The number of tiles from the left (left corner)
     * @param {number} y The number of tiles from the top (left corner)
     */
    drawTile(x, y) {
        x *= this.ts;
        y *= this.ts;
        quad(x, y, x + this.hts, y - this.hts, x + this.ts, y, x + this.hts, y + this.hts);
    }

    /**
     * Highlights a tile
     * @param {number} x The x-coordinate (screen space)
     * @param {number} y The y-coordinate (screen space)
     */
    highlightTile(x, y) {
        fill(this.boardColours.highlight);
        noStroke();
        this.drawTile(x / this.ts, y / this.ts);
    }

    /**
     * Clears the highlighted tiles list
     */
    clearHighlightedTiles() {
        this.highlightedTiles = [];
    }

    /**
     * Sets tiles to be highlighted
     * @param {...number[]} coordsList A list of (screen space) coordinates
     */
    setHighlightedTiles(...coordsList) {
        this.highlightedTiles = coordsList;
    }

    /**
     * Checks if the given coordinates are on the board
     * @param {number} x The x-coordinate
     * @param {number} y The y-coordinate
     */
    isOnBoard(x, y) {
        // check if coords are out of board bounding box
        if (x < this.ts || x > this.bw + this.ts || y < this.ts || y > this.bh + this.ts) {
            return false;
        }

        // check if in corner triangles
        [x, y] = rotateVectorClockwise([x, y], QUARTER_PI);
        let offset = height / 2 - this.tl * this.hnt;
        return x > offset && x < this.numTiles * this.tl + offset && y > offset && y < this.numTiles * this.tl + offset;
    }
}

/**
 * Represents a tile
 */
class Tile {
    /**
     * Creates a tile
     * @param {boolean} isWall Whether the tile is a wall
     */
    constructor(isWall, _debug) {
        /** Whether the tile is a wall @type {boolean} */
        this.isWall = isWall ?? false;
        /** The stone that occupies the tile @type {Stone} */
        this.stone = null;

        this.debug = _debug?.toString(); // temp, coordinates of the tile
    }
}

/**
 * Represents a player
 */
class Player {
    /**
     * Creates a player
     * @param {number} stoneId The id of the stone image
     * @param {number} numStones The number of stones the player has (not including the Jim)
     */
    constructor(stoneId, numStones) {
        /** The number of stones the player has @type {number} */
        this.numStones = numStones ?? 4;

        /** An array containing the player's stones @type {Stone[]} */
        this.stones = Array.from({length: this.numStones}, () => new Stone(this, stoneId));
        this.stones.push(new Jim(this, stoneId));

        /** A set containing the player's stones that are on the side of the board @type {Set<Stone>} */
        this.sideStones = new Set();
        
        /** gap between stones when on the side of the board @type {number} */
        this.stoneGap = 0;
    }

    /**
     * Draws the stones on the board
     */
    draw() {
        this.stones.forEach(s => s.draw());
    }

    /**
     * Sets the board the player is playing on and update required properties
     * @param {Board} board The board the player is playing on
     */
    setBoard(board) {
        this.board = board;
        
        this.stoneGap = 0.1 * this.board.bw / this.board.numTiles;
        // todo: inline this function (setStoneSize) if only used once
        this.setStoneSize(this.board.bw / this.board.numTiles - this.stoneGap);
    }

    /**
     * Gets the index of the player
     * @returns {number} The index of the player
     */
    getIndex() {
        return this.index;
    }

    /**
     * Sets the index of the player
     * @param {number} index The index of the player
     */
    setIndex(index) {
        this.index = index;
    }

    /**
     * Sets the size of the player's stones
     * @param {number} size The size of the player's stones
     */
    setStoneSize(size) {
        this.stones.forEach(s => s.setSize(size));
    }

    /**
     * Moves a stone to a new position
     * @param {Stone} stone The stone to move
     * @param {number} x The x-coordinate of the new position
     * @param {number} y The y-coordinate of the new position
     */
    moveStone(stone, x, y) {
        if (this.sideStones.has(stone)) {
            this.sideStones.delete(stone);
            this.updateSideStonePositions();
        }
        stone.setPosition(x, y);
    }

    /**
     * Removes a stone from the board and moves it to the side
     * @param {Stone} stone The stone to remove
     */
    removeStoneFromBoard(stone) {
        // todo: remove from boardRep (probs move this function into the Diagon class)
        this.sideStones.add(stone);
        this.updateSideStonePositions();
    }

    /**
     * Updates the position of the player's stones that are on the side of the board
     */
    updateSideStonePositions() {
        let i = 0;
        this.sideStones.forEach(s => {
            let position = [(i + 0.5) * (s.size + this.stoneGap) - this.stoneGap / 2 + this.board.ts, this.board.bh + this.board.ts * 3 / 2];
            s.setPosition(...rotateVectorToPlayerPosition(position, this.index));
            i++;
        });
    }
}

/**
 * Represents a stone
 */
class Stone {
    /**
     * Creates a stone
     * @param {number} id The id of the stone image
     * @param {number} x The x-coordinate of the stone
     * @param {number} y The y-coordinate of the stone
     */
    constructor(player, id, x, y) {
        /** The player that owns the stone @type {Player} */
        this.player = player;

        /** The image of the stone @type {p5.Image} */
        this.img = loadImage(`/diagon/assets/stones/stone${id}.png`);

        /** The x-coordinate of the stone @type {number} */
        this.x = x ?? 0;

        /** The y-coordinate of the stone @type {number} */
        this.y = y ?? 0;

        /** The size (diameter) of the stone @type {number} */
        this.size = 0;
    }

    /**
     * Gets the size (diameter) of the stone
     * @returns {number} The size (diameter) of the stone
     */
    getSize() {
        return this.size;
    }

    /**
     * Sets the size (diameter) of the stone
     * @param {number} size The size (diameter) of the stone
     */
    setSize(size) {
        this.size = size;
    }

    /**
     * Sets the position of the stone
     * @param {number} x The x-coordinate of the stone
     * @param {number} y The y-coordinate of the stone
     */
    setPosition(x, y) {
        this.x = x;
        this.y = y;
    }
    
    /**
     * Draws the stone
     */
    draw() {
        imageMode(CENTER); // TODO: confirm this is desired
        image(this.img, this.x, this.y, this.size, this.size);
    }
}

/**
 * Represents a Jim
 */
class Jim extends Stone {
    /**
     * Draws the Jim
     */
    draw() {
        super.draw();
        noFill();
        stroke('white');
        strokeWeight(3);
        circle(this.x, this.y, this.size);
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
 * @param {number} startX the start x coordinate of the gradient
 * @param {number} startY the start y coordinate of the gradient
 * @param {number} endX the end x coordinate of the gradient
 * @param {number} endY the end y coordinate of the gradient
 * @param {number[][]} colourStops - an array of colour stops
 */
function linearGradient(x0, y0, x1, y1, x2, y2, x3, y3, startX, startY, endX, endY, ...colourStops) {
    let gradient = drawingContext.createLinearGradient(startX, startY, endX, endY);
    for (let i = 0; i < colourStops.length; i++) {
        gradient.addColorStop(...colourStops[i]);
    }
    drawingContext.fillStyle = gradient;
    quad(x0, y0, x1, y1, x2, y2, x3, y3);
}

/**
 * Rotates a vector based on the player number
 * @param {[number, number]} vector the vector to rotate
 * @param {number} playerNum the player number
 * @returns {[number, number]} the rotated vector
 */
function rotateVectorToPlayerPosition(vector, playerNum) {
    // select angle based on player number
    let angle = [0, PI, HALF_PI, 3 * HALF_PI][playerNum];

    return rotateVectorClockwise(vector, angle);
}

/**
 * Rotates a vector
 * @param {[number, number]} vector the vector to rotate
 * @param {number} angle the angle to rotate the vector by
 * @returns {[number, number]} the rotated vector
 */
function rotateVectorClockwise([x, y], angle) {
    // translate origin to center of canvas
    x -= width / 2;
    y -= height / 2;

    // rotate, then translate back and return
    return [
        x * cos(angle) - y * sin(angle) + width / 2,
        x * sin(angle) + y * cos(angle) + height / 2
    ];
}