let diagon;
let players = [];

function preload() {
    players.push(new Player(1)); // stone icon loads here
    players.push(new Player(2));
}

function setup() {
    const board = document.getElementById('board');
    createCanvas(board.parentNode.clientWidth, board.parentNode.clientHeight, board);
    pixelDensity(2 * pixelDensity()); // fix poor drawing quality
    diagon = new Diagon(players);
    // setup starting position
    let stonePositions = [[2, 5], [4, 7], [0, 5], [4, 9], [4, 5]];
    let positionMap = new Map();
    for (let i in players) {
        positionMap.set(players[i], stonePositions.map((x, j) => [...x, players[i].stones[j]]));
        stonePositions.forEach(p => p.reverse());
    }
    diagon.setPosition(positionMap);
    // setup event handlers
    mouseClicked = diagon.handleMouseClick.bind(diagon);
    mousePressed = diagon.handleMousePress.bind(diagon);
    mouseReleased = diagon.handleMouseRelease.bind(diagon);
    mouseMoved = diagon.handleMouseMove.bind(diagon);
    mouseDragged = diagon.handleMouseDrag.bind(diagon);
}

function draw() {
    diagon.draw();

}