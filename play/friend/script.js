function setup() {
    const board = document.getElementById('board');
    const size = board.parentNode.clientWidth;
    createCanvas(size, size, board);
}

function draw() {
    drawBoard();

}