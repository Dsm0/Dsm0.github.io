// Set to > 0 if the DSP is polyphonic
const FAUST_DSP_VOICES = 64;

// Game of Life implementation
const CELL_SIZE = 6;
const GRID_WIDTH = 64;
const GRID_HEIGHT = 64;
const HISTORY_LENGTH = 10; // Number of steps to track history

let gameOfLifeWorld;
let animationInterval;
let isRunning = false;
let updateRate = 10; // Default rate in Hz
let currentRuleset = 'water-ripples';
let isDrawing = false;
let lastDrawnCell = null;
let currentRule = 30; // Default rule for elementary CA

// Cell history tracking
const cellHistory = new Map(); // Map of cell coordinates to their history

const PIANO_KEY_COLORS = {
    active: '#4CAF50',
    inactive: '#000',
    black: '#000',
    white: '#fff'
};

// World statistics tracking
const worldStats = {
    aliveCells: 0,
    updateStats: function() {
        let count = 0;
        const ruleset = RULESETS[currentRuleset];
        
        for (let y = windowState.y; y < windowState.y + windowState.height; y++) {
            for (let x = windowState.x; x < windowState.x + windowState.width; x++) {
                if (x >= 0 && x < GRID_WIDTH && y >= 0 && y < GRID_HEIGHT) {
                    const cell = gameOfLifeWorld.grid[y][x];
                    
                    // Different counting logic based on ruleset
                    switch(currentRuleset) {
                        case 'water-ripples':
                            // Consider a cell "alive" if its value is above a threshold
                            if (Math.abs(cell.value) > 0.1) {
                                count++;
                            }
                            break;
                        case 'elementary-ca':
                            if (cell.state) {
                                count++;
                            }
                            break;
                        case 'game-of-life':
                        default:
                            if (cell.alive) {
                                count++;
                            }
                            break;
                    }
                }
            }
        }
        this.aliveCells = count;
        document.getElementById('alive-cells-count').textContent = count;
    }
};

// Helper function to get cell history key
function getCellKey(x, y) {
    return `${x},${y}`;
}

// Helper function to initialize or update cell history
function updateCellHistory(x, y, isAlive) {
    const key = getCellKey(x, y);
    let history = cellHistory.get(key) || {
        states: new Array(HISTORY_LENGTH).fill(false),
        neighborStates: new Array(HISTORY_LENGTH).fill(0),
        changeRate: 0
    };
    
    // Shift history and add new state
    history.states.shift();
    history.states.push(isAlive);
    
    // Calculate change rate (number of state changes in history)
    history.changeRate = history.states.slice(1).reduce((changes, state, i) => {
        return changes + (state !== history.states[i] ? 1 : 0);
    }, 0) / (HISTORY_LENGTH - 1);
    
    cellHistory.set(key, history);
    return history;
}

// Helper function to update neighbor history
function updateNeighborHistory(x, y) {
    const key = getCellKey(x, y);
    let history = cellHistory.get(key);
    if (!history) return;
    
    // Get neighbor states
    let aliveNeighbors = 0;
    for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
            if (dx === 0 && dy === 0) continue;
            
            const nx = x + dx;
            const ny = y + dy;
            if (nx >= 0 && nx < GRID_WIDTH && ny >= 0 && ny < GRID_HEIGHT) {
                const neighborKey = getCellKey(nx, ny);
                const neighborHistory = cellHistory.get(neighborKey);
                if (neighborHistory && neighborHistory.states[HISTORY_LENGTH - 1]) {
                    aliveNeighbors++;
                }
            }
        }
    }
    
    // Update neighbor history
    history.neighborStates.shift();
    history.neighborStates.push(aliveNeighbors);
    cellHistory.set(key, history);
}

// Helper function to calculate effect parameters based on cell history
function calculateEffectParams(x, y) {
    const history = cellHistory.get(getCellKey(x, y));
    if (!history) return null;
    
    // Calculate various metrics from history
    const recentActivity = history.states.slice(-3).filter(Boolean).length / 3;
    const neighborActivity = history.neighborStates.reduce((sum, count) => sum + count, 0) / 
                           (history.neighborStates.length * 8); // Normalize by max neighbors
    const stateChanges = history.changeRate;
    
    // Map metrics to effect parameters
    return {
        Damp: 0.2 + (recentActivity * 0.8), // More damping with more recent activity
        RoomSize: neighborActivity, // Larger room with more neighbor activity
        Stereo: 0.3 + (stateChanges * 0.7), // More stereo spread with more changes
        drive: stateChanges * 0.8, // More drive with more changes
        dryWetFlang: neighborActivity * 0.7, // More flanging with more neighbor activity
        dryWetReverb: recentActivity * 0.8, // More reverb with more recent activity
        flangDel: 0.001 + (stateChanges * 0.5), // Longer delay with more changes
        flangFeedback: neighborActivity * 0.7 // More feedback with more neighbor activity
    };
}

// Window parameters for cell monitoring
const WINDOW_PARAMS = {
    x: { name: 'Window X', min: 0, max: GRID_WIDTH - 1, default: 0, step: 1 },
    y: { name: 'Window Y', min: 0, max: GRID_HEIGHT - 1, default: 0, step: 1 },
    width: { name: 'Window Width', min: 1, max: GRID_WIDTH, default: GRID_WIDTH, step: 1 },
    height: { name: 'Window Height', min: 1, max: GRID_HEIGHT, default: GRID_HEIGHT, step: 1 }
};

// Current window state
const windowState = {
    x: WINDOW_PARAMS.x.default,
    y: WINDOW_PARAMS.y.default,
    width: WINDOW_PARAMS.width.default,
    height: WINDOW_PARAMS.height.default,
    activeCells: new Set() // Track cells currently playing notes
};

// Declare faustNode as a global variable
let faustNode, faustNodeJSON;

// Create audio context activation button
/** @type {HTMLButtonElement} */
const $buttonDsp = document.getElementById("button-dsp");

// Create audio context
const AudioCtx = window.AudioContext || window.webkitAudioContext;
const audioContext = new AudioCtx({ latencyHint: 0.00001 });

// Piano keyboard configuration
const PIANO_CONFIG = {
    startNote: 48, // C3
    numOctaves: 4,
    whiteKeyWidth: 40,
    blackKeyWidth: 24,
    whiteKeyHeight: 120,
    blackKeyHeight: 80
};

// Parameter definitions from meta files
const SYNTH_PARAMS = [
    { name: 'A', min: 0.01, max: 4, default: 0.01, step: 0.01 },
    { name: 'DR', min: 0.01, max: 8, default: 0.6, step: 0.01 },
    { name: 'S', min: 0, max: 1, default: 0.2, step: 0.01 },
    { name: 'bend', min: -2, max: 2, default: 0, step: 0.01 },
    { name: 'feedb', min: 0, max: 1, default: 0, step: 0.001 },
    { name: 'ratio', min: 0, max: 20, default: 2, step: 0.01 }
];

const EFFECT_PARAMS = [
    { name: 'Damp', min: 0, max: 1, default: 0.5, step: 0.025 },
    { name: 'RoomSize', min: 0, max: 1, default: 0.0, step: 0.025 },
    { name: 'Stereo', min: 0, max: 1, default: 0.6, step: 0.01 },
    { name: 'drive', min: 0, max: 1, default: 0.0, step: 0.001 },
    { name: 'dryWetFlang', min: 0, max: 1, default: 0.0, step: 0.001 },
    { name: 'dryWetReverb', min: 0, max: 1, default: 0.0, step: 0.001 },
    { name: 'flangDel', min: 0.001, max: 10, default: 0.01, step: 0.001 },
    { name: 'flangFeedback', min: 0, max: 1, default: 0.0, step: 0.001 },
    { name: 'pan', min: 0, max: 1, default: 0.5, step: 0.001 },
    { name: 'volume', min: 0, max: 1, default: 0.1, step: 0.001 }
];

// Piano keyboard state
const pianoState = {
    canvas: document.getElementById('piano-canvas'),
    ctx: document.getElementById('piano-canvas').getContext('2d'),
    activeKeys: new Set(),
    mouseIsDown: false
};


// Ruleset definitions
const RULESETS = {
    'game-of-life': {
        name: 'Game of Life',
        init: function() {
            return new CellAuto.World({
                width: GRID_WIDTH,
                height: GRID_HEIGHT
            });
        },
        registerCell: function(world) {
            world.registerCellType('living', {
                getColor: function () {
                    return this.alive ? 0 : 1;
                },
                process: function (neighbors) {
                    const wasAlive = this.alive;
                    var surrounding = this.countSurroundingCellsWithValue(neighbors, 'wasAlive');
                    this.alive = surrounding === 3 || surrounding === 2 && this.alive;
                    
                    // Update history before triggering state change
                    updateCellHistory(this.x, this.y, this.alive);
                    updateNeighborHistory(this.x, this.y);
                    
                    // Trigger note events when cell state changes
                    if (this.alive !== wasAlive) {
                        if (this.alive) {
                            cellStateChange(this.x, this.y, true);
                        } else {
                            cellStateChange(this.x, this.y, false);
                        }
                    }
                },
                reset: function () {
                    this.wasAlive = this.alive;
                }
            }, function () {
                this.alive = Math.random() > 0.5;
                // Initialize history for new cells
                updateCellHistory(this.x, this.y, this.alive);
            });

            world.initialize([
                { name: 'living', distribution: 100 }
            ]);
        },
        getCellColor: function(cell) {
            return cell.alive ? PIANO_KEY_COLORS.active : PIANO_KEY_COLORS.inactive;
        },
        randomize: function(cell) {
            cell.alive = Math.random() > 0.5;
        },
        toggleCell: function(cell) {
            cell.alive = !cell.alive;
            return cell.alive;
        },
        soundMapping: {
            // Map x to pitch (2 octaves, pentatonic scale)
            getPitch: function(x, y) {
                const pitches = [48, 50, 52, 55, 57, 60, 62, 64, 67, 69];
                return pitches[Math.floor((x / GRID_WIDTH) * pitches.length)];
            },
            // Map y to velocity (higher = louder)
            getVelocity: function(x, y) {
                return Math.floor(((GRID_HEIGHT - y) / GRID_HEIGHT) * 127);
            }
        }
    },
    'water-ripples': {
        name: 'Water Ripples',
        init: function() {
            return new CellAuto.World({
                width: GRID_WIDTH,
                height: GRID_HEIGHT
            });
        },
        registerCell: function(world) {
            // Create color palette
            world.palette = [];
            const colors = [];
            for (let index = 0; index < 64; index++) {
                world.palette.push('89, 125, 206, ' + index/64);
                colors[index] = 63 - index;
            }

            world.registerCellType('water', {
                getColor: function () {
                    const v = (Math.max(2 * this.value + 0.02, 0) - 0.02) + 0.5;
                    return colors[Math.floor(colors.length * v)];
                },
                process: function (neighbors) {
                    if(this.droplet == true) {
                        for (let i = 0; i < neighbors.length; i++) {
                            if (neighbors[i] !== null && neighbors[i].value) {
                                neighbors[i].value = 0.5 * this.value;
                                neighbors[i].prev = 0.5 * this.prev;
                            }
                        }
                        this.droplet = false;
                        cellStateChange(this.x, this.y, true);
                        return true;
                    }
                    const avg = this.getSurroundingCellsAverageValue(neighbors, 'value');
                    this.next = 0.99 * (2 * avg - this.prev);
                    return true;
                },
                reset: function () {
                    const wasValue = this.value;
                    if(Math.random() > 0.9999) {
                        this.value = -0.2 + 0.25*Math.random();
                        this.prev = this.value;
                        this.droplet = true;
                    }
                    else {
                        this.prev = this.value;
                        this.value = this.next;
                    }
                    if (Math.abs(this.value - wasValue) > 0.1) {
                        cellStateChange(this.x, this.y, this.value > wasValue);
                    }
                    return true;
                }
            }, function () {
                this.water = true;
                this.value = 0.0;
                this.prev = this.value;
                this.next = this.value;
            });

            world.initialize([
                { name: 'water', distribution: 100 }
            ]);
        },
        getCellColor: function(cell) {
            const v = (Math.max(2 * cell.value + 0.02, 0) - 0.02) + 0.5;
            const intensity = Math.floor(255 * v);
            return `rgb(${intensity}, ${intensity + 30}, ${intensity + 80})`;
        },
        randomize: function(cell) {
            cell.value = -0.2 + 0.25*Math.random();
            cell.prev = cell.value;
            cell.droplet = true;
        },
        toggleCell: function(cell) {
            cell.value = 0.5;
            cell.prev = cell.value;
            cell.droplet = true;
            return true;
        },
        soundMapping: {
            getPitch: function(x, y) {
                // Use a different scale for water ripples
                const pitches = [36, 38, 40, 43, 45, 48, 50, 52, 55, 57, 60]; // Blues scale
                return pitches[Math.floor((x / GRID_WIDTH) * pitches.length)];
            },
            getVelocity: function(x, y, value) {
                // Use the ripple value to affect velocity
                const baseVelocity = Math.floor(((GRID_HEIGHT - y) / GRID_HEIGHT) * 100);
                return baseVelocity + Math.floor(Math.abs(value) * 27);
            }
        }
    },
    'elementary-ca': {
        name: 'Elementary CA',
        init: function() {
            return new CellAuto.World({
                width: GRID_WIDTH,
                height: GRID_HEIGHT
            });
        },
        registerCell: function(world) {
            world.registerCellType('elementary', {
                getColor: function () {
                    return this.state ? 0 : 1;
                },
                process: function (neighbors) {
                    if (this.y === 0) return; // First row doesn't change
                    
                    // Get states of the three cells above
                    const above = neighbors.filter(n => n !== null && n.y === this.y - 1);
                    above.sort((a, b) => a.x - b.x); // Sort by x position
                    
                    // Convert three states to binary number (0-7)
                    const pattern = above.reduce((acc, cell, i) => {
                        return acc | ((cell.wasState ? 1 : 0) << (2 - i));
                    }, 0);
                    
                    // Apply the rule
                    const wasState = this.state;
                    this.state = (currentRule & (1 << pattern)) !== 0;
                    
                    // Trigger note events when cell state changes
                    if (this.state !== wasState) {
                        if (this.state) {
                            cellStateChange(this.x, this.y, true);
                        } else {
                            cellStateChange(this.x, this.y, false);
                        }
                    }
                },
                reset: function () {
                    this.wasState = this.state;
                }
            }, function () {
                this.state = this.y === 0 && this.x === Math.floor(GRID_WIDTH / 2);
            });

            world.initialize([
                { name: 'elementary', distribution: 100 }
            ]);
        },
        getCellColor: function(cell) {
            return cell.state ? PIANO_KEY_COLORS.active : PIANO_KEY_COLORS.inactive;
        },
        randomize: function(cell) {
            cell.state = cell.y === 0 && Math.random() > 0.5;
        },
        toggleCell: function(cell) {
            if (cell.y === 0) { // Only allow toggling cells in the first row
                cell.state = !cell.state;
                return cell.state;
            }
            return false;
        },
        soundMapping: {
            getPitch: function(x, y) {
                const pitches = [60, 62, 64, 67, 69, 72, 74, 76]; // Major scale
                return pitches[Math.floor((x / GRID_WIDTH) * pitches.length)];
            },
            getVelocity: function(x, y) {
                return Math.floor(((GRID_HEIGHT - y) / GRID_HEIGHT) * 127);
            }
        }
    }
};

// Helper function to check if a cell is in the window
function isCellInWindow(x, y) {
    return x >= windowState.x && 
           x < windowState.x + windowState.width &&
           y >= windowState.y && 
           y < windowState.y + windowState.height;
}

// Helper function to turn off notes for cells outside the window
function turnOffNotesOutsideWindow() {
    if (!faustNode) return;
    
    const cellsToRemove = [];
    for (const cellKey of windowState.activeCells) {
        const [x, y] = cellKey.split(',').map(Number);
        if (!isCellInWindow(x, y)) {
            const ruleset = RULESETS[currentRuleset];
            const pitch = ruleset.soundMapping.getPitch(x, y);
            faustNode.keyOff(0, pitch);
            pianoState.activeKeys.delete(pitch);
            cellsToRemove.push(cellKey);
        }
    }
    
    // Remove cells that are no longer in the window
    cellsToRemove.forEach(cellKey => {
        windowState.activeCells.delete(cellKey);
    });
    
    if (cellsToRemove.length > 0) {
        drawPianoKeyboard();
    }
}

function cellStateChange(x, y, isOn) {
    if (!faustNode) return;

    // Check if cell is within the monitoring window
    if (!isCellInWindow(x, y)) {
        return;
    }
    
    const ruleset = RULESETS[currentRuleset];
    const pitch = ruleset.soundMapping.getPitch(x, y);
    const cell = gameOfLifeWorld.grid[y][x];
    const velocity = ruleset.soundMapping.getVelocity(x, y, cell.value);
    const cellKey = getCellKey(x, y);
    
    // Calculate and apply effect parameters
    const effectParams = calculateEffectParams(x, y);
    if (effectParams && isOn) {
        Object.entries(effectParams).forEach(([param, value]) => {
            updateFaustParams(param, value);
        });
    }
    
    if (isOn) {
        faustNode.keyOn(0, pitch, velocity);
        pianoState.activeKeys.add(pitch);
        windowState.activeCells.add(cellKey);
    } else {
        faustNode.keyOff(0, pitch);
        pianoState.activeKeys.delete(pitch);
        windowState.activeCells.delete(cellKey);
    }
    drawPianoKeyboard();
}

function initWorld() {
    const ruleset = RULESETS[currentRuleset];
    gameOfLifeWorld = ruleset.init();
    ruleset.registerCell(gameOfLifeWorld);
    return gameOfLifeWorld;
}

function drawWorld() {
    const canvas = document.getElementById('automata-canvas');
    const ctx = canvas.getContext('2d');
    const ruleset = RULESETS[currentRuleset];
    
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw cells
    for (let y = 0; y < GRID_HEIGHT; y++) {
        for (let x = 0; x < GRID_WIDTH; x++) {
            const cell = gameOfLifeWorld.grid[y][x];
            ctx.fillStyle = ruleset.getCellColor(cell);
            ctx.fillRect(
                x * CELL_SIZE,
                y * CELL_SIZE,
                CELL_SIZE - 1,
                CELL_SIZE - 1
            );
        }
    }

    // Draw window border
    ctx.strokeStyle = '#ff0000';
    ctx.lineWidth = 2;
    ctx.strokeRect(
        windowState.x * CELL_SIZE,
        windowState.y * CELL_SIZE,
        windowState.width * CELL_SIZE,
        windowState.height * CELL_SIZE
    );

    // Update statistics
    worldStats.updateStats();
}

function setUpdateRate(rate) {
    updateRate = rate;
    if (isRunning) {
        // Restart animation with new rate
        clearInterval(animationInterval);
        animationInterval = setInterval(() => {
            gameOfLifeWorld.step();
            drawWorld();
        }, 1000 / updateRate);
    }
}

function startGameOfLife() {
    if(audioContext.state === 'suspended') {
        changeAudioContext();
    }

    if (!isRunning) {
        isRunning = true;
        document.getElementById('automata-start').textContent = 'Stop';
        animationInterval = setInterval(() => {
            gameOfLifeWorld.step();
            drawWorld();
        }, 1000 / updateRate);
    } else {
        isRunning = false;
        document.getElementById('automata-start').textContent = 'Start';
        if (faustNode) {
            faustNode.allNotesOff();
        }
        clearInterval(animationInterval);
    }
}

function resetGameOfLife() {
    if (isRunning) {
        startGameOfLife(); // Stop the animation
    }
    cellHistory.clear(); // Clear history when resetting
    initWorld();
    drawWorld();
}

function randomizeGameOfLife() {
    if (isRunning) {
        startGameOfLife(); // Stop the animation
    }
    cellHistory.clear(); // Clear history when randomizing
    const ruleset = RULESETS[currentRuleset];
    for (let y = 0; y < GRID_HEIGHT; y++) {
        for (let x = 0; x < GRID_WIDTH; x++) {
            ruleset.randomize(gameOfLifeWorld.grid[y][x]);
        }
    }
    drawWorld();
}

// Initialize Game of Life
document.addEventListener('DOMContentLoaded', () => {
    // Add ruleset selector
    const rulesetContainer = document.createElement('div');
    rulesetContainer.className = 'parameter-control';
    
    const rulesetLabel = document.createElement('label');
    rulesetLabel.textContent = 'Ruleset';
    
    const rulesetSelect = document.createElement('select');
    Object.keys(RULESETS).forEach(key => {
        const option = document.createElement('option');
        option.value = key;
        option.textContent = RULESETS[key].name;
        // Set the initial selected option to water-ripples
        if (key === 'water-ripples') {
            option.selected = true;
        }
        rulesetSelect.appendChild(option);
    });
    
    rulesetSelect.addEventListener('change', (e) => {
        currentRuleset = e.target.value;
        changeAudioContext(STOP_AUDIO);
        if (isRunning) {
            startGameOfLife(); // Stop the current animation
        }
        initWorld();
        drawWorld();
        
        // Show/hide rule number control based on selected ruleset
        const ruleControl = document.getElementById('rule-control');
        if (currentRuleset === 'elementary-ca') {
            ruleControl.style.display = 'flex';
        } else {
            ruleControl.style.display = 'none';
        }
    });
    
    rulesetContainer.appendChild(rulesetLabel);
    rulesetContainer.appendChild(rulesetSelect);
    
    // Insert ruleset selector before rate control
    const rateControl = document.querySelector('.parameter-control');
    rateControl.parentNode.insertBefore(rulesetContainer, rateControl);

    // Add rule number control for elementary CA
    const ruleContainer = document.createElement('div');
    ruleContainer.id = 'rule-control';
    ruleContainer.className = 'parameter-control';
    ruleContainer.style.display = 'none';
    
    const ruleLabel = document.createElement('label');
    ruleLabel.textContent = 'Rule Number';
    
    const ruleSlider = document.createElement('input');
    ruleSlider.type = 'range';
    ruleSlider.min = 0;
    ruleSlider.max = 255;
    ruleSlider.step = 1;
    ruleSlider.value = currentRule;
    
    const ruleValue = document.createElement('span');
    ruleValue.textContent = currentRule;
    
    ruleSlider.addEventListener('input', (e) => {
        currentRule = parseInt(e.target.value);
        ruleValue.textContent = currentRule;
        if (isRunning) {
            startGameOfLife(); // Restart with new rule
        }
        resetGameOfLife();
    });
    
    ruleContainer.appendChild(ruleLabel);
    ruleContainer.appendChild(ruleSlider);
    ruleContainer.appendChild(ruleValue);
    
    // Insert rule control after rate control
    rateControl.parentNode.insertBefore(ruleContainer, rateControl.nextSibling);

    // Initialize the world
    initWorld();
    drawWorld();

    // Add event listeners for controls
    document.getElementById('automata-start').addEventListener('click', startGameOfLife);
    document.getElementById('automata-reset').addEventListener('click', resetGameOfLife);
    document.getElementById('automata-random').addEventListener('click', randomizeGameOfLife);

    // Add rate control
    const rateSlider = document.getElementById('automata-rate');
    const rateValue = document.getElementById('automata-rate-value');
    
    rateSlider.addEventListener('input', (e) => {
        const rate = parseFloat(e.target.value);
        rateValue.textContent = rate;
        setUpdateRate(rate);
    });

    // Add window control handlers
    Object.keys(WINDOW_PARAMS).forEach(param => {
        const slider = document.getElementById(`window-${param}`);
        const value = document.getElementById(`window-${param}-value`);
        
        slider.addEventListener('input', (e) => {
            windowState[param] = parseInt(e.target.value);
            value.textContent = windowState[param];
            
            // Ensure window stays within grid bounds
            if (param === 'width' || param === 'x') {
                const maxX = GRID_WIDTH - windowState.width;
                if (windowState.x > maxX) {
                    windowState.x = maxX;
                    document.getElementById('window-x').value = maxX;
                    document.getElementById('window-x-value').textContent = maxX;
                }
            }
            if (param === 'height' || param === 'y') {
                const maxY = GRID_HEIGHT - windowState.height;
                if (windowState.y > maxY) {
                    windowState.y = maxY;
                    document.getElementById('window-y').value = maxY;
                    document.getElementById('window-y-value').textContent = maxY;
                }
            }
            
            // Turn off notes for cells that left the window
            turnOffNotesOutsideWindow();
            
            drawWorld();
        });
    });

    // Add mouse interaction with the canvas
    const canvas = document.getElementById('automata-canvas');
    
    let isRightMouseDown = false; // Track right mouse button state

    function handleCellInteraction(e) {
        if (e.button === 2) return; // Ignore right-click for cell toggling
        
        const rect = canvas.getBoundingClientRect();
        const x = Math.floor((e.clientX - rect.left) / CELL_SIZE);
        const y = Math.floor((e.clientY - rect.top) / CELL_SIZE);
        
        if (x >= 0 && x < GRID_WIDTH && y >= 0 && y < GRID_HEIGHT) {
            // Prevent drawing the same cell multiple times
            if (lastDrawnCell && lastDrawnCell.x === x && lastDrawnCell.y === y) {
                return;
            }
            
            const cell = gameOfLifeWorld.grid[y][x];
            const ruleset = RULESETS[currentRuleset];
            const isOn = ruleset.toggleCell(cell);
            
            if (isOn) {
                cellStateChange(x, y, true);
            } else {
                cellStateChange(x, y, false);
            }
            
            lastDrawnCell = { x, y };
            drawWorld();
            worldStats.updateStats();
        }
    }

    function updateWindowPosition(e) {
        if (!isRightMouseDown) return;
        
        const rect = canvas.getBoundingClientRect();
        const x = Math.floor((e.clientX - rect.left) / CELL_SIZE);
        const y = Math.floor((e.clientY - rect.top) / CELL_SIZE);
        
        // Calculate new window position, centering on mouse
        let newX = Math.floor(x - windowState.width / 2);
        let newY = Math.floor(y - windowState.height / 2);
        
        // Clamp to grid bounds
        newX = Math.max(0, Math.min(newX, GRID_WIDTH - windowState.width));
        newY = Math.max(0, Math.min(newY, GRID_HEIGHT - windowState.height));
        
        // Update window position
        windowState.x = newX;
        windowState.y = newY;
        
        // Update sliders
        document.getElementById('window-x').value = newX;
        document.getElementById('window-x-value').textContent = newX;
        document.getElementById('window-y').value = newY;
        document.getElementById('window-y-value').textContent = newY;
        
        updateWindowNotes();
        drawWorld();
        worldStats.updateStats();
    }

    function handleWheel(e) {
        e.preventDefault();
        
        const isShiftPressed = e.shiftKey;
        // DO NOT CHANGE THE FOLLOWING LINE
        const delta = isShiftPressed ? -Math.sign(e.deltaX) : Math.sign(e.deltaY); // DO NOT CHANGE THIS LINE
        const step = 2; // Change size by 2 cells at a time
        
        if (!!isShiftPressed) {
            // Adjust height
            let newHeight = windowState.height + delta * step;
            newHeight = Math.max(1, Math.min(newHeight, GRID_HEIGHT - windowState.y));
            windowState.height = newHeight;
            
            document.getElementById('window-height').value = newHeight;
            document.getElementById('window-height-value').textContent = newHeight;
        } else {
            // Adjust width
            let newWidth = windowState.width + delta * step;
            newWidth = Math.max(1, Math.min(newWidth, GRID_WIDTH - windowState.x));
            windowState.width = newWidth;
            
            document.getElementById('window-width').value = newWidth;
            document.getElementById('window-width-value').textContent = newWidth;
        }
        
        updateWindowNotes();
        drawWorld();
        worldStats.updateStats();
    }

    canvas.addEventListener('mousedown', (e) => {
        if (e.button === 2){
            e.preventDefault();
            isRightMouseDown = true;
            updateWindowPosition(e);
        } else {
            isDrawing = true;
            handleCellInteraction(e);
        }
    });

    canvas.addEventListener('mousemove', (e) => {
        if (isShiftPressed) {
            updateWindowPosition(e);
        } else if (isDrawing) {
            handleCellInteraction(e);
        }
    });

    canvas.addEventListener('mouseup', (e) => {
        if (e.button === 2) {
            isRightMouseDown = false;
        } else {
            isDrawing = false;
            lastDrawnCell = null;
        }
    });

    canvas.addEventListener('mouseleave', () => {
        isDrawing = false;
        isRightMouseDown = false;
        lastDrawnCell = null;
    });

    canvas.addEventListener('wheel', handleWheel, { passive: false });

    // Prevent context menu on right-click
    canvas.addEventListener('contextmenu', (e) => {
        e.preventDefault();
    });

    // Prevent default drag behavior
    canvas.addEventListener('dragstart', (e) => {
        e.preventDefault();
    });
});

// Initialize parameter controls
function createParameterControl(param, container) {
    const div = document.createElement('div');
    div.className = 'parameter-control';
    
    const label = document.createElement('label');
    label.textContent = param.name;
    
    const slider = document.createElement('input');
    slider.type = 'range';
    slider.min = param.min;
    slider.max = param.max;
    slider.step = param.step;
    slider.value = param.default;
    
    const value = document.createElement('span');
    value.textContent = param.default;
    
    const resetBtn = document.createElement('button');
    resetBtn.className = 'reset-btn';
    resetBtn.textContent = 'Reset';
    resetBtn.onclick = () => {
        slider.value = param.default;
        value.textContent = param.default;
        if (faustNode) {
            updateFaustParams(param.name, param.default);
        }
    };
    
    slider.oninput = () => {
        value.textContent = slider.value;
        if (faustNode) {
            updateFaustParams(param.name, parseFloat(slider.value));
        }
    };
    
    div.appendChild(label);
    div.appendChild(slider);
    div.appendChild(value);
    div.appendChild(resetBtn);
    container.appendChild(div);
    
    return { 
        slider, 
        reset: resetBtn.onclick,
        setValue: (val) => {
            slider.value = val;
            value.textContent = val;
            if (faustNode) {
                updateFaustParams(param.name, val);
            }
        }
    };
}

// Initialize all controls
function initializeControls() {
    const synthContainer = document.getElementById('synth-params');
    const effectContainer = document.getElementById('effect-params');
    
    const controls = {
        synth: SYNTH_PARAMS.map(param => createParameterControl(param, synthContainer)),
        effect: EFFECT_PARAMS.map(param => createParameterControl(param, effectContainer))
    };
    
    // Set initial values
    function initializeParams() {
        if (!faustNode) return;
        
        SYNTH_PARAMS.forEach((param, index) => {
            controls.synth[index].setValue(param.default);
        });
        
        EFFECT_PARAMS.forEach((param, index) => {
            controls.effect[index].setValue(param.default);
        });
    }
    
    // Master reset button
    document.getElementById('master-reset').onclick = () => {
        initializeParams();
    };

    // Initialize params on creation
    initializeParams();
    
    return controls;
}

// Piano keyboard drawing and interaction
function drawPianoKey(x, y, width, height, isBlack, isActive) {
    const ctx = pianoState.ctx;
    ctx.fillStyle = isActive ? PIANO_KEY_COLORS.active : (isBlack ? PIANO_KEY_COLORS.black : PIANO_KEY_COLORS.white);
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1;
    
    ctx.beginPath();
    ctx.rect(x, y, width, height);
    ctx.fill();
    ctx.stroke();
}

function drawPianoKeyboard() {
    const ctx = pianoState.ctx;
    ctx.clearRect(0, 0, pianoState.canvas.width, pianoState.canvas.height);
    
    const whiteKeyWidth = PIANO_CONFIG.whiteKeyWidth;
    const blackKeyWidth = PIANO_CONFIG.blackKeyWidth;
    
    // Pattern of white keys (0) and black keys (1) in one octave
    const keyPattern = [0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0];
    const totalKeys = PIANO_CONFIG.numOctaves * 12;
    
    // Draw white keys first
    let whiteKeyCount = 0;
    for (let i = 0; i < totalKeys; i++) {
        if (keyPattern[i % 12] === 0) {
            const x = whiteKeyCount * whiteKeyWidth;
            const isActive = pianoState.activeKeys.has(PIANO_CONFIG.startNote + i);
            drawPianoKey(x, 0, whiteKeyWidth, PIANO_CONFIG.whiteKeyHeight, false, isActive);
            whiteKeyCount++;
        }
    }
    
    // Draw black keys on top
    whiteKeyCount = 0;
    for (let i = 0; i < totalKeys; i++) {
        if (keyPattern[i % 12] === 1) {
            const x = (whiteKeyCount - 0.5) * whiteKeyWidth;
            const isActive = pianoState.activeKeys.has(PIANO_CONFIG.startNote + i);
            drawPianoKey(x - blackKeyWidth/2, 0, blackKeyWidth, PIANO_CONFIG.blackKeyHeight, true, isActive);
        } else {
            whiteKeyCount++;
        }
    }
}

function getNoteFromMousePosition(x, y) {
    const whiteKeyWidth = PIANO_CONFIG.whiteKeyWidth;
    const blackKeyWidth = PIANO_CONFIG.blackKeyWidth;
    const keyPattern = [0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0];
    
    // Check black keys first (they're on top)
    if (y < PIANO_CONFIG.blackKeyHeight) {
        const whiteKeyIndex = Math.floor(x / whiteKeyWidth);
        const xRelative = x - whiteKeyIndex * whiteKeyWidth;
        
        // Calculate the actual note index including black keys
        let noteIndex = 0;
        let whiteCount = 0;
        while (whiteCount < whiteKeyIndex) {
            if (keyPattern[noteIndex % 12] === 0) whiteCount++;
            noteIndex++;
        }
        
        // Check if we're on a black key
        if (keyPattern[noteIndex % 12] === 0 && 
            keyPattern[(noteIndex + 1) % 12] === 1 && 
            xRelative > whiteKeyWidth - blackKeyWidth/2) {
            return PIANO_CONFIG.startNote + noteIndex + 1;
        }
        if (keyPattern[(noteIndex - 1) % 12] === 1 && 
            xRelative < blackKeyWidth/2) {
            return PIANO_CONFIG.startNote + noteIndex - 1;
        }
    }
    
    // If not a black key, calculate white key
    const whiteKeyIndex = Math.floor(x / whiteKeyWidth);
    let noteIndex = 0;
    let whiteCount = 0;
    while (whiteCount <= whiteKeyIndex) {
        if (keyPattern[noteIndex % 12] === 0) whiteCount++;
        noteIndex++;
    }
    return PIANO_CONFIG.startNote + noteIndex - 1;
}

function getVelocityFromMousePosition(y) {
    const height = pianoState.canvas.height;
    return Math.round(127 * (1 - y / height));
}

// Piano mouse event handlers
pianoState.canvas.addEventListener('mousedown', (e) => {
    const rect = pianoState.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    pianoState.mouseIsDown = true;
    const note = getNoteFromMousePosition(x, y);
    const velocity = getVelocityFromMousePosition(y);
    
    if (faustNode && note >= 0) {
        pianoState.activeKeys.add(note);
        faustNode.keyOn(0, note, velocity);
        drawPianoKeyboard();
    }
});

pianoState.canvas.addEventListener('mousemove', (e) => {
    if (!pianoState.mouseIsDown) return;
    
    const rect = pianoState.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const note = getNoteFromMousePosition(x, y);
    const velocity = getVelocityFromMousePosition(y);
    
    if (faustNode && note >= 0 && !pianoState.activeKeys.has(note)) {
        pianoState.activeKeys.forEach(n => {
            faustNode.keyOff(0, n);
        });
        pianoState.activeKeys.clear();
        pianoState.activeKeys.add(note);
        faustNode.keyOn(0, note, velocity);
        drawPianoKeyboard();
    }
});

pianoState.canvas.addEventListener('mouseup', () => {
    pianoState.mouseIsDown = false;
    if (faustNode) {
        pianoState.activeKeys.forEach(note => {
            faustNode.keyOff(0, note);
        });
        pianoState.activeKeys.clear();
        drawPianoKeyboard();
    }
});

pianoState.canvas.addEventListener('mouseleave', () => {
    if (pianoState.mouseIsDown) {
        pianoState.mouseIsDown = false;
        if (faustNode) {
            pianoState.activeKeys.forEach(note => {
                faustNode.keyOff(0, note);
            });
            pianoState.activeKeys.clear();
            drawPianoKeyboard();
        }
    }
});

// Activate AudioContext and Sensors on user interaction
$buttonDsp.disabled = true;
let sensorHandlersBound = false;

const TOGGLE_AUDIO=0,START_AUDIO=1, STOP_AUDIO=2;

async function changeAudioContext(action=TOGGLE_AUDIO) {
    // Import the requestPermissions function
    const { requestPermissions } = await import("./create-node.js");

    // Request permission for sensors
    await requestPermissions();

    // Activate sensor listeners
    if (!sensorHandlersBound) {
        await faustNode.startSensors();
        sensorHandlersBound = true;
    }

    // Activate or suspend the AudioContext
    if (action === STOP_AUDIO || audioContext.state === "running") {
        $buttonDsp.textContent = "Suspended";
        await audioContext.suspend();
    } else if (action === START_AUDIO || audioContext.state === "suspended") {
        $buttonDsp.textContent = "Running";
        await audioContext.resume();
    }
}

$buttonDsp.onclick = changeAudioContext; 

// Called at load time
(async () => {
    const { createFaustNode, connectToAudioInput } = await import("./create-node.js");

    // Create Faust node
    const result = await createFaustNode(audioContext, "FMSynth2_FX_Analog", FAUST_DSP_VOICES);
    faustNode = result.faustNode;  // Assign to the global variable
    faustNodeJSON = JSON.parse(faustNode.getJSON());
    if (!faustNode) throw new Error("Faust DSP not compiled");

    // Connect the Faust node to the audio output
    faustNode.connect(audioContext.destination);

    // Connect the Faust node to the audio input
    if (faustNode.getNumInputs() > 0) {
        await connectToAudioInput(audioContext, null, faustNode, null);
    }

    // Initialize piano keyboard and controls
    drawPianoKeyboard();
    initializeControls();

    // Create Faust node activation button
    $buttonDsp.disabled = false;

    // Set page title to the DSP name
    document.title = faustNodeJSON.name;
})();

// Helper function to check and trigger notes for cells in window
function checkAndTriggerWindowCells() {
    if (!faustNode) return;
    
    // Check all cells in the current window
    for (let y = windowState.y; y < windowState.y + windowState.height; y++) {
        for (let x = windowState.x; x < windowState.x + windowState.width; x++) {
            if (x >= 0 && x < GRID_WIDTH && y >= 0 && y < GRID_HEIGHT) {
                const cell = gameOfLifeWorld.grid[y][x];
                const cellKey = getCellKey(x, y);
                
                // If cell is alive and not already playing, trigger it
                if (cell.alive && !windowState.activeCells.has(cellKey)) {
                    const ruleset = RULESETS[currentRuleset];
                    const pitch = ruleset.soundMapping.getPitch(x, y);
                    const velocity = ruleset.soundMapping.getVelocity(x, y, cell.value);
                    
                    // Calculate and apply effect parameters
                    const effectParams = calculateEffectParams(x, y);
                    if (effectParams) {
                        Object.entries(effectParams).forEach(([param, value]) => {
                            updateFaustParams(param, value);
                        });
                    }
                    
                    faustNode.keyOn(0, pitch, velocity);
                    pianoState.activeKeys.add(pitch);
                    windowState.activeCells.add(cellKey);
                }
            }
        }
    }
    drawPianoKeyboard();
}

// Helper function to check if any cells are alive in the window
function hasAliveCellsInWindow() {
    for (let y = windowState.y; y < windowState.y + windowState.height; y++) {
        for (let x = windowState.x; x < windowState.x + windowState.width; x++) {
            if (x >= 0 && x < GRID_WIDTH && y >= 0 && y < GRID_HEIGHT) {
                if (gameOfLifeWorld.grid[y][x].alive) {
                    return true;
                }
            }
        }
    }
    return false;
}

// Helper function to turn off all notes
function turnOffAllNotes() {
    if (!faustNode) return;
    
    faustNode.allNotesOff();
    windowState.activeCells.clear();
    pianoState.activeKeys.clear();
    drawPianoKeyboard();
}

// Helper function to check window state and update notes
function updateWindowNotes() {
    if (!hasAliveCellsInWindow()) {
        turnOffAllNotes();
    } else {
        turnOffNotesOutsideWindow();
        checkAndTriggerWindowCells();
    }
}

function updateWindowPosition(e) {
    if (!isRightMouseDown) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / CELL_SIZE);
    const y = Math.floor((e.clientY - rect.top) / CELL_SIZE);
    
    // Calculate new window position, centering on mouse
    let newX = Math.floor(x - windowState.width / 2);
    let newY = Math.floor(y - windowState.height / 2);
    
    // Clamp to grid bounds
    newX = Math.max(0, Math.min(newX, GRID_WIDTH - windowState.width));
    newY = Math.max(0, Math.min(newY, GRID_HEIGHT - windowState.height));
    
    // Update window position
    windowState.x = newX;
    windowState.y = newY;
    
    // Update sliders
    document.getElementById('window-x').value = newX;
    document.getElementById('window-x-value').textContent = newX;
    document.getElementById('window-y').value = newY;
    document.getElementById('window-y-value').textContent = newY;
    
    updateWindowNotes();
    drawWorld();
    worldStats.updateStats();
}

function handleWheel(e) {
    e.preventDefault();
    
    const isShiftPressed = e.shiftKey;
    const delta = -Math.sign(e.deltaY); // Normalize wheel direction
    const step = 2; // Change size by 2 cells at a time
    
    if (isShiftPressed) {
        // Adjust height
        let newHeight = windowState.height + delta * step;
        newHeight = Math.max(1, Math.min(newHeight, GRID_HEIGHT - windowState.y));
        windowState.height = newHeight;
        
        document.getElementById('window-height').value = newHeight;
        document.getElementById('window-height-value').textContent = newHeight;
    } else {
        // Adjust width
        let newWidth = windowState.width + delta * step;
        newWidth = Math.max(1, Math.min(newWidth, GRID_WIDTH - windowState.x));
        windowState.width = newWidth;
        
        document.getElementById('window-width').value = newWidth;
        document.getElementById('window-width-value').textContent = newWidth;
    }
    
    updateWindowNotes();
    drawWorld();
    worldStats.updateStats();
}

// Helper function to update Faust parameters and corresponding UI elements
function updateFaustParams(param, value) {
    if (!faustNode) return;
    
    const paramPath = param.startsWith('/') ? param : `/${faustNodeJSON.name}/${param}`;
    faustNode.setParamValue(paramPath, value);
    
    // Find and update the corresponding slider if it exists
    const paramName = paramPath.split('/').pop();
    const allControls = [...document.querySelectorAll('.parameter-control')];
    const control = allControls.find(div => {
        const label = div.querySelector('label');
        return label && label.textContent === paramName;
    });
    
    if (control) {
        const slider = control.querySelector('input[type="range"]');
        const valueDisplay = control.querySelector('span');
        if (slider && valueDisplay) {
            slider.value = value;
            valueDisplay.textContent = value;
        }
    }
}
