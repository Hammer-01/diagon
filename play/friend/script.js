let diagon;

function setup() {
    const board = document.getElementById('board');
    const boardSize = board.parentNode.clientWidth;
    createCanvas(boardSize, boardSize, board);
    diagon = new Diagon();
}

function draw() {
    diagon.draw();

}