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
    let stonePositions = [[3, 5], [2, 4], [3, 7], [0, 4], [3, 4]];
    let positionMap = new Map();
    for (let i in players) {
        positionMap.set(players[i], stonePositions.map((x, j) => [...x, players[i].stones[j]]));
        stonePositions.forEach(p => p.reverse());
    }
    diagon.setPosition(positionMap);
}

function draw() {
    diagon.draw();

}