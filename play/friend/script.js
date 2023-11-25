let diagon;
let testPlayer;

function setup() {
    const board = document.getElementById('board');
    const boardSize = board.parentNode.clientWidth;
    createCanvas(boardSize, boardSize, board);
    testPlayer = new Player();
    diagon = new Diagon([testPlayer]);
}

function draw() {
    diagon.draw();

}