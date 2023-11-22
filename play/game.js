const boardColours = {
    primary: "#964b00",
    secondary: "#3e1f00",
    tertiary: "#190d00",
};

// Drawing functions

function drawBoard() {
    let tileSize = width / 6; // diagonal length

    // board base
    noStroke();
    fill(boardColours.primary);
    square(0, 0, width);
    fill(boardColours.secondary);
    quad(0, tileSize, tileSize, 0, width, height-tileSize, width-tileSize, height);
    quad(width, tileSize, width-tileSize, 0, 0, height-tileSize, tileSize, height);
    fill(boardColours.tertiary);
    quad(2*tileSize, 3*tileSize, 3*tileSize, 2*tileSize, width-2*tileSize, height-3*tileSize, width-3*tileSize, height-2*tileSize);
    fill('black');
    triangle(0, 0, tileSize, 0, 0, tileSize);
    triangle(width, 0, width-tileSize, 0, width, tileSize);
    triangle(width, height, width-tileSize, height, width, height-tileSize);
    triangle(0, height, tileSize, height, 0, height-tileSize);

    // draw gridlines
    stroke('black');
    strokeWeight(2);
    for (let s = tileSize; s < width*2; s += tileSize) {
        line(0, s, s, 0);
        line(width-s, 0, width, s);
    }
}