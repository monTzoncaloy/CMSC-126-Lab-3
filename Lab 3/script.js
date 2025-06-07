const gridElement = document.getElementById('grid');

let startNode = null;
let endNode = null;
let grid = [];
let ROWS = 10;
let COLS = 10;
let animationSpeed = 50;

class Node {
  constructor(row, col) {
    this.row = row;
    this.col = col;
    this.isStart = false;
    this.isEnd = false;
    this.isWall = false;
    this.weight = 1;
    this.visited = false;
    this.distance = Infinity;
    this.previous = null;
  }

  get id() {
    return `cell-${this.row}-${this.col}`;
  }
}

document.getElementById('speedSelect').addEventListener('change', (e) => {
  animationSpeed = parseInt(e.target.value);
});

function createGrid() {
  grid = [];
  gridElement.innerHTML = '';

  gridElement.style.gridTemplateColumns = `repeat(${COLS}, 25px)`;
  gridElement.style.gridTemplateRows = `repeat(${ROWS}, 25px)`;

  for (let r = 0; r < ROWS; r++) {
    let row = [];
    for (let c = 0; c < COLS; c++) {
      const node = new Node(r, c);
      row.push(node);
      const cell = document.createElement('div');
      cell.className = 'cell';
      cell.id = node.id;
      cell.style.width = '25px';
      cell.style.height = '25px';
      cell.addEventListener('click', (e) => handleCellClick(node, e));
      cell.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        toggleWeight(node);
      });
      gridElement.appendChild(cell);
    }
    grid.push(row);
  }
}


function handleCellClick(node, event) {
  const cell = document.getElementById(node.id);

  if (node.isWall) {
    node.isWall = false;
    cell.classList.remove('wall');
  } else if (!startNode && !node.isEnd) {
    node.isStart = true;
    startNode = node;
    cell.classList.add('start');
  } else if (!endNode && !node.isStart) {
    node.isEnd = true;
    endNode = node;
    cell.classList.add('end');
  } else if (!node.isStart && !node.isEnd) {
    node.isWall = true;
    cell.classList.add('wall');
  }
}

function getNeighbors(node) {
  const directions = [
    [0, 1], [1, 0], [0, -1], [-1, 0]
  ];
  const neighbors = [];
  for (const [dr, dc] of directions) {
    const r = node.row + dr;
    const c = node.col + dc;
    if (r >= 0 && r < ROWS && c >= 0 && c < COLS && !grid[r][c].isWall) {
      neighbors.push(grid[r][c]);
    }
  }
  return neighbors;
}

async function visualizeDijkstra() {
  const openSet = [startNode];
  startNode.distance = 0;

  while (openSet.length > 0) {
    openSet.sort((a, b) => a.distance - b.distance);
    const current = openSet.shift();

    if (current.visited) continue;
    current.visited = true;

    const cell = document.getElementById(current.id);
    if (!current.isStart && !current.isEnd) {
      cell.classList.add('visited');
      await new Promise(resolve => setTimeout(resolve, 50));
    }

    if (current === endNode) {
      reconstructPath(endNode);
      return;
    }

    for (const neighbor of getNeighbors(current)) {
      if (!neighbor.visited) {
        const tempDist = current.distance + 1;
        if (tempDist < neighbor.distance) {
          neighbor.distance = tempDist;
          neighbor.previous = current;
          openSet.push(neighbor);
        }
      }
    }
  }
}

function reconstructPath(endNode) {
  let current = endNode.previous;
  while (current && !current.isStart) {
    document.getElementById(current.id).classList.add('path');
    current = current.previous;
  }
}

function startVisualization() {
  if (!startNode || !endNode) {
    alert('Please select a start and end node.');
    return;
  }
  visualizeDijkstra();
}

function resetGrid() {
  startNode = null;
  endNode = null;
  createGrid();
}

function handleCellClick(node) {
  const cell = document.getElementById(node.id);

  if (node.isWall) {
    node.isWall = false;
    cell.classList.remove('wall');
  } else if (!startNode && !node.isEnd) {
    node.isStart = true;
    startNode = node;
    cell.classList.add('start');
  } else if (!endNode && !node.isStart) {
    node.isEnd = true;
    endNode = node;
    cell.classList.add('end');
  } else if (!node.isStart && !node.isEnd) {
    node.isWall = true;
    cell.classList.add('wall');
  }
}

function toggleWeight(node) {
  const cell = document.getElementById(node.id);
  if (!node.isWall && !node.isStart && !node.isEnd) {
    node.weight = node.weight === 1 ? 5 : 1;
    cell.classList.toggle('weighted');
  }
}

function applyGridSize() {
  const size = parseInt(document.getElementById('gridSize').value);
  if (size >= 5 && size <= 30) {
    ROWS = size;
    COLS = size;
    startNode = null;
    endNode = null;
    createGrid();
  }
}

async function visualizeDijkstra() {
  const openSet = [startNode];
  startNode.distance = 0;

  while (openSet.length > 0) {
    openSet.sort((a, b) => a.distance - b.distance);
    const current = openSet.shift();

    if (current.visited) continue;
    current.visited = true;

    const cell = document.getElementById(current.id);
    if (!current.isStart && !current.isEnd) {
      cell.classList.add('visited');
      await new Promise(resolve => setTimeout(resolve, animationSpeed));
    }

    if (current === endNode) {
      reconstructPath(endNode);
      return;
    }

    for (const neighbor of getNeighbors(current)) {
      const tempDist = current.distance + neighbor.weight;
      if (tempDist < neighbor.distance) {
        neighbor.distance = tempDist;
        neighbor.previous = current;
        openSet.push(neighbor);
      }
    }
  }
}

function saveGrid() {
  const gridData = grid.map(row =>
    row.map(node => ({
      isWall: node.isWall,
      isStart: node.isStart,
      isEnd: node.isEnd,
      weight: node.weight
    }))
  );
  localStorage.setItem('savedGrid', JSON.stringify(gridData));
  alert('Grid saved.');
}

function loadGrid() {
  const saved = localStorage.getItem('savedGrid');
  if (!saved) return alert('No saved grid found.');

  const gridData = JSON.parse(saved);
  startNode = null;
  endNode = null;
  createGrid();

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const node = grid[r][c];
      const data = gridData[r][c];
      const cell = document.getElementById(node.id);
      
      node.isWall = data.isWall;
      node.isStart = data.isStart;
      node.isEnd = data.isEnd;
      node.weight = data.weight || 1;

      if (node.isWall) cell.classList.add('wall');
      if (node.isStart) {
        startNode = node;
        cell.classList.add('start');
      }
      if (node.isEnd) {
        endNode = node;
        cell.classList.add('end');
      }
      if (node.weight > 1) cell.classList.add('weighted');
    }
  }
}

createGrid();
