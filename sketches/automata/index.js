// Set to > 0 if the DSP is polyphonic
const FAUST_DSP_VOICES = 64;

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

// Game of Life implementation
const CELL_SIZE = 6;
const GRID_WIDTH = 64;
const GRID_HEIGHT = 64;

let gameOfLifeWorld;
let animationInterval;
let isRunning = false;
let updateRate = 10; // Default rate in Hz
let currentRuleset = 'game-of-life';

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
            });

            world.initialize([
                { name: 'living', distribution: 100 }
            ]);
        },
        getCellColor: function(cell) {
            return cell.alive ? '#44ff44' : '#000000';
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
    }
};

function cellStateChange(x, y, isOn) {
    if (!faustNode) return;
    
    const ruleset = RULESETS[currentRuleset];
    const pitch = ruleset.soundMapping.getPitch(x, y);
    const cell = gameOfLifeWorld.grid[y][x];
    const velocity = ruleset.soundMapping.getVelocity(x, y, cell.value);
    
    if (isOn) {
        faustNode.keyOn(0, pitch, velocity);
        pianoState.activeKeys.add(pitch);
    } else {
        faustNode.keyOff(0, pitch);
        pianoState.activeKeys.delete(pitch);
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
    initWorld();
    drawWorld();
}

function randomizeGameOfLife() {
    if (isRunning) {
        startGameOfLife(); // Stop the animation
    }
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
    });
    
    rulesetContainer.appendChild(rulesetLabel);
    rulesetContainer.appendChild(rulesetSelect);
    
    // Insert ruleset selector before rate control
    const rateControl = document.querySelector('.parameter-control');
    rateControl.parentNode.insertBefore(rulesetContainer, rateControl);

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

    // Add click interaction with the canvas
    const canvas = document.getElementById('automata-canvas');
    canvas.addEventListener('click', (e) => {
        const rect = canvas.getBoundingClientRect();
        const x = Math.floor((e.clientX - rect.left) / CELL_SIZE);
        const y = Math.floor((e.clientY - rect.top) / CELL_SIZE);
        
        if (x >= 0 && x < GRID_WIDTH && y >= 0 && y < GRID_HEIGHT) {
            const cell = gameOfLifeWorld.grid[y][x];
            const ruleset = RULESETS[currentRuleset];
            const isOn = ruleset.toggleCell(cell);
            
            if (isOn) {
                cellStateChange(x, y, true);
            } else {
                cellStateChange(x, y, false);
            }
            
            drawWorld();
        }
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
            faustNode.setParamValue(`/${faustNodeJSON.name}/${param.name}`, param.default);
        }
    };
    
    slider.oninput = () => {
        value.textContent = slider.value;
        if (faustNode) {
            let paramName = `/${faustNodeJSON.name}/${param.name}`;
            faustNode.setParamValue(paramName, parseFloat(slider.value));
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
                faustNode.setParamValue(`/${faustNodeJSON.name}/${param.name}`, val);
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
    ctx.fillStyle = isActive ? '#4CAF50' : (isBlack ? '#000' : '#fff');
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
