let diagon;
let testPlayer;

function preload() {
    testPlayer = new Player(1); // stone icon loads here
}

function setup() {
    const board = document.getElementById('board');
    const boardSize = board.parentNode.clientWidth;
    createCanvas(boardSize, boardSize, board);
    diagon = new Diagon([testPlayer]);
}

function draw() {
    diagon.draw();

}