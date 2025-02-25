if (window.self === window.top) {
    if (!("keyboard" in navigator)) {
      alert("Your browser does not support the Keyboard Lock API.");
    }
  }
  
  const fullscreenButton = document.querySelector("#fullscreen");
  const keyboardButton = document.querySelector("#keyboard");
  const body = document.body;
  const div = document.querySelector("div");
  const info = document.querySelector(".info");
  
  const ENTER_FULLSCREEN = "Enter full screen";
  const LEAVE_FULLSCREEN = "Leave full screen";
  const ACTIVATE_KEYBOARD_LOCK = "Activate keyboard lock";
  const DEACTIVATE_KEYBOARD_LOCK = "Dectivate keyboard lock";
  
  const LOCKED_KEYS = ["MetaLeft", "MetaRight", "Tab", "KeyN", "KeyT", "Escape"];
  
  let lock = false;
  
  fullscreenButton.addEventListener("click", async () => {
    if (window.self !== window.top) {
      window.open(location.href, "", "noopener,noreferrer");
      return;
    }
    try {
      if (!document.fullscreen) {
        await document.documentElement.requestFullscreen();
        fullscreenButton.textContent = LEAVE_FULLSCREEN;
        return;
      }
      await document.exitFullscreen();
      fullscreenButton.textContent = ENTER_FULLSCREEN;
    } catch (err) {
      fullscreenButton.textContent = ENTER_FULLSCREEN;
      alert(`${err.name}: ${err.message}`);
    }
  });
  
  keyboardButton.addEventListener("click", async () => {
    try {
      if (!lock) {
        await navigator.keyboard.lock(LOCKED_KEYS);
        lock = true;
        keyboardButton.textContent = DEACTIVATE_KEYBOARD_LOCK;
        return;
      }
      navigator.keyboard.unlock();
      keyboardButton.textContent = ACTIVATE_KEYBOARD_LOCK;
      lock = false;
    } catch (err) {
      lock = false;
      keyboardButton.textContent = ACTIVATE_KEYBOARD_LOCK;
      alert(`${err.name}: ${err.message}`);
    }
  });
  
  document.addEventListener("fullscreenchange", () => {
    keyboardButton.textContent = ACTIVATE_KEYBOARD_LOCK;
    lock = false;
    if (document.fullscreen) {
      fullscreenButton.textContent = LEAVE_FULLSCREEN;
      document.getElementById('keyboard-lock-controls').hidden = false;
      return;
    }
    fullscreenButton.textContent = ENTER_FULLSCREEN;
    document.getElementById('keyboard-lock-controls').hidden = true;
  });
  
  document.addEventListener("keydown", (e) => {
    if (
      lock &&
      (e.code === "Escape" ||
        ((e.code === "KeyN" || e.code === "KeyT") &&
          (e.ctrlKey || e.metaKey)))
    ) {
      info.style.display = "block";
      setTimeout(() => {
        info.style.display = "none";
      }, 3000);
    }
  });
  
  // Keyboard Visualizer Code
  const pressedKeys = new Set();
  const pressedKeysElement = document.getElementById("pressed-keys");
  
  // Function to update the keyboard visualizer
  function updateKeyboardVisualizer() {
    // Update the pressed keys display
    if (pressedKeys.size === 0) {
      pressedKeysElement.textContent = "None";
    } else {
      pressedKeysElement.textContent = Array.from(pressedKeys).join(", ");
    }
  }
  
  // Function to handle key down events
  function handleKeyDown(event) {
    // Prevent default behavior for the locked keys when lock is active
    if (lock && LOCKED_KEYS.includes(event.code)) {
      event.preventDefault();
    }
    
    // Add the key to the set of pressed keys
    pressedKeys.add(event.code);
    
    // Highlight the key in the visualizer
    const keyElement = document.querySelector(`.key[data-key="${event.code}"]`);
    if (keyElement) {
      keyElement.classList.add("active");
    }
    
    // Handle modifier keys
    if (event.ctrlKey) {
      const ctrlElements = document.querySelectorAll('.key[data-key="ControlLeft"], .key[data-key="ControlRight"]');
      ctrlElements.forEach(el => el.classList.add("active"));
    }
    
    if (event.altKey) {
      const altElements = document.querySelectorAll('.key[data-key="AltLeft"], .key[data-key="AltRight"]');
      altElements.forEach(el => el.classList.add("active"));
    }
    
    if (event.shiftKey) {
      const shiftElements = document.querySelectorAll('.key[data-key="ShiftLeft"], .key[data-key="ShiftRight"]');
      shiftElements.forEach(el => el.classList.add("active"));
    }
    
    if (event.metaKey) {
      const metaElements = document.querySelectorAll('.key[data-key="MetaLeft"], .key[data-key="MetaRight"]');
      metaElements.forEach(el => el.classList.add("active"));
    }
    
    updateKeyboardVisualizer();
  }
  
  // Function to handle key up events
  function handleKeyUp(event) {
    // Remove the key from the set of pressed keys
    pressedKeys.delete(event.code);
    
    // Remove the highlight from the key in the visualizer
    const keyElement = document.querySelector(`.key[data-key="${event.code}"]`);
    if (keyElement) {
      keyElement.classList.remove("active");
    }
    
    // Handle modifier keys
    if (!event.ctrlKey) {
      const ctrlElements = document.querySelectorAll('.key[data-key="ControlLeft"], .key[data-key="ControlRight"]');
      ctrlElements.forEach(el => el.classList.remove("active"));
    }
    
    if (!event.altKey) {
      const altElements = document.querySelectorAll('.key[data-key="AltLeft"], .key[data-key="AltRight"]');
      altElements.forEach(el => el.classList.remove("active"));
    }
    
    if (!event.shiftKey) {
      const shiftElements = document.querySelectorAll('.key[data-key="ShiftLeft"], .key[data-key="ShiftRight"]');
      shiftElements.forEach(el => el.classList.remove("active"));
    }
    
    if (!event.metaKey) {
      const metaElements = document.querySelectorAll('.key[data-key="MetaLeft"], .key[data-key="MetaRight"]');
      metaElements.forEach(el => el.classList.remove("active"));
    }
    
    updateKeyboardVisualizer();
  }
  
  // Add event listeners for keyboard events
  document.addEventListener("keydown", handleKeyDown);
  document.addEventListener("keyup", handleKeyUp);
  
  // Initialize the keyboard visualizer
  updateKeyboardVisualizer();
  
  // Piano Roll Implementation
  const canvas = document.getElementById('piano-roll');
  const ctx = canvas.getContext('2d', { alpha: false });
  const speedSlider = document.getElementById('scroll-speed');
  const speedValue = document.getElementById('speed-value');
  
  // Enable hardware acceleration
  ctx.imageSmoothingEnabled = false;
  
  // Piano roll configuration
  const pianoRoll = {
    scrollSpeed: 1, // pixels per frame
    noteWidth: 1, // pixels per frame of note length (reduced to match scroll speed)
    laneHeight: 16, // height of each key lane (reduced for better fit)
    laneGap: 1, // gap between lanes (reduced for better fit)
    gridLineFrequency: 60, // frames between grid lines
    gridLineWidth: 1,
    backgroundColor: '#222',
    gridColor: '#333',
    noteColors: {
      default: '#4CAF50', // green
      modifier: '#2196F3', // blue
      modifierCombo: '#9C27B0', // purple
      locked: '#F44336', // red
      tab: '#FF9800', // orange
      escape: '#FFEB3B', // yellow
      meta: '#E91E63', // pink
      control: '#00BCD4', // cyan
      alt: '#FF5722', // deep orange
      shift: '#9E9E9E', // grey
    },
    notes: [], // active notes
    history: [], // past notes for scrolling
    keyLanes: {}, // mapping of key codes to lane indices
    laneCount: 0, // total number of lanes
    frame: 0, // current frame counter
  };
  
  // Create mapping of key codes to lane indices
  function initializePianoRoll() {
    // Define the order of keys in the piano roll (from bottom to top)
    const keyOrder = [
      // Bottom row (control keys)
      'ControlLeft', 'MetaLeft', 'AltLeft', 'Space', 'AltRight', 'MetaRight', 'ContextMenu', 'ControlRight',
      // Second row (shift, letters, etc.)
      'ShiftLeft', 'KeyZ', 'KeyX', 'KeyC', 'KeyV', 'KeyB', 'KeyN', 'KeyM', 'Comma', 'Period', 'Slash', 'ShiftRight',
      // Third row (caps, letters, etc.)
      'CapsLock', 'KeyA', 'KeyS', 'KeyD', 'KeyF', 'KeyG', 'KeyH', 'KeyJ', 'KeyK', 'KeyL', 'Semicolon', 'Quote', 'Enter',
      // Fourth row (tab, letters, etc.)
      'Tab', 'KeyQ', 'KeyW', 'KeyE', 'KeyR', 'KeyT', 'KeyY', 'KeyU', 'KeyI', 'KeyO', 'KeyP', 'BracketLeft', 'BracketRight', 'Backslash',
      // Fifth row (numbers, etc.)
      'Backquote', 'Digit1', 'Digit2', 'Digit3', 'Digit4', 'Digit5', 'Digit6', 'Digit7', 'Digit8', 'Digit9', 'Digit0', 'Minus', 'Equal', 'Backspace',
      // Top row (function keys)
      'Escape', 'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12'
    ];
    
    // Create mapping and count lanes
    keyOrder.forEach((keyCode, index) => {
      pianoRoll.keyLanes[keyCode] = index;
    });
    
    pianoRoll.laneCount = keyOrder.length;
    
    // Resize canvas height based on number of lanes
    const totalHeight = pianoRoll.laneCount * (pianoRoll.laneHeight + pianoRoll.laneGap);
    canvas.height = totalHeight;
    
    // Set the canvas width to match the window width
    canvas.width = window.innerWidth - 40; // Subtract padding
    
    // Update the canvas style to display at its actual size
    canvas.style.width = '100%';
    canvas.style.height = totalHeight + 'px';
    
    // Start animation loop
    requestAnimationFrame(drawPianoRoll);
  }
  
  // Resize canvas to fit container while maintaining aspect ratio
  function resizeCanvas() {
    // Update the canvas width to match the window width
    canvas.width = window.innerWidth - 40; // Subtract padding
    
    // Keep the canvas style height at its actual pixel height
    canvas.style.width = '100%';
    canvas.style.height = canvas.height + 'px';
  }
  
  // Check if a key is a modifier key
  function isModifierKey(keyCode) {
    return ['ShiftLeft', 'ShiftRight', 'ControlLeft', 'ControlRight', 
            'AltLeft', 'AltRight', 'MetaLeft', 'MetaRight'].includes(keyCode);
  }
  
  // Get the current modifier state
  function getCurrentModifierState() {
    return {
      shift: pressedKeys.has('ShiftLeft') || pressedKeys.has('ShiftRight'),
      ctrl: pressedKeys.has('ControlLeft') || pressedKeys.has('ControlRight'),
      alt: pressedKeys.has('AltLeft') || pressedKeys.has('AltRight'),
      meta: pressedKeys.has('MetaLeft') || pressedKeys.has('MetaRight'),
      hasAny: function() {
        return this.shift || this.ctrl || this.alt || this.meta;
      }
    };
  }
  
  // Get color for a note based on key and modifiers
  function getNoteColor(keyCode, hasModifier) {
    // Locked keys get the locked color
    if (lock && LOCKED_KEYS.includes(keyCode)) {
      return pianoRoll.noteColors.locked;
    }
    
    // Special keys get their own colors
    if (keyCode === 'Tab') return pianoRoll.noteColors.tab;
    if (keyCode === 'Escape') return pianoRoll.noteColors.escape;
    if (keyCode.startsWith('Meta')) return pianoRoll.noteColors.meta;
    if (keyCode.startsWith('Control')) return pianoRoll.noteColors.control;
    if (keyCode.startsWith('Alt')) return pianoRoll.noteColors.alt;
    if (keyCode.startsWith('Shift')) return pianoRoll.noteColors.shift;
    
    // If a non-modifier key is pressed with a modifier, use the combo color
    if (hasModifier) {
      return pianoRoll.noteColors.modifierCombo;
    }
    
    // Default color for regular keys
    return pianoRoll.noteColors.default;
  }
  
  // Handle key down for piano roll
  function handlePianoRollKeyDown(event) {
    const keyCode = event.code;
    const laneIndex = pianoRoll.keyLanes[keyCode];
    
    // Skip if we don't have a lane for this key
    if (laneIndex === undefined) return;
    
    // Check if any modifier is active using our helper
    const modifierState = getCurrentModifierState();
    const hasModifier = modifierState.hasAny();
    
    // Check if this note is already active
    const existingNoteIndex = pianoRoll.notes.findIndex(note => note.keyCode === keyCode);
    
    if (existingNoteIndex === -1) {
      // Create a new note
      pianoRoll.notes.push({
        keyCode,
        laneIndex,
        startFrame: pianoRoll.frame,
        length: 0, // Will be updated each frame
        color: getNoteColor(keyCode, hasModifier),
        hasModifier
      });
    }
    // We don't need to update existing notes here anymore since that's handled in drawPianoRoll
  }
  
  // Handle key up for piano roll
  function handlePianoRollKeyUp(event) {
    const keyCode = event.code;
    
    // Find the note for this key
    const noteIndex = pianoRoll.notes.findIndex(note => note.keyCode === keyCode);
    
    if (noteIndex !== -1) {
      // Move the note to history
      const note = pianoRoll.notes[noteIndex];
      note.endFrame = pianoRoll.frame;
      
      // Create a copy of the note for history to avoid reference issues
      pianoRoll.history.push({...note});
      
      // Remove from active notes
      pianoRoll.notes.splice(noteIndex, 1);
    }
  }
  
  // Draw the piano roll
  function drawPianoRoll() {
    // Clear the canvas
    ctx.fillStyle = pianoRoll.backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid lines
    drawGrid();
    
    // Draw lane labels
    drawLaneLabels();
    
    // Get current modifier state
    const modifierState = getCurrentModifierState();
    
    // Check if any modifier is currently active
    const hasModifier = modifierState.hasAny();
    
    // Update note lengths and colors for active notes
    pianoRoll.notes.forEach(note => {
      // Use the same rate for note length as for scrolling
      note.length = (pianoRoll.frame - note.startFrame) * pianoRoll.scrollSpeed;
      
      // Check if this is a non-modifier key that needs color update
      if (!isModifierKey(note.keyCode)) {
        // Update hasModifier status based on current state
        if (note.hasModifier !== hasModifier) {
          // If modifier state changed, create a history note with the current segment
          const historicalNote = {
            ...note,
            endFrame: pianoRoll.frame
          };
          pianoRoll.history.push(historicalNote);
          
          // Update the current note with new start frame and color
          note.startFrame = pianoRoll.frame;
          note.hasModifier = hasModifier;
          note.color = getNoteColor(note.keyCode, hasModifier);
          note.length = 0; // Reset length for the new segment
        }
      }
    });
    
    // Move history notes based on scroll speed
    pianoRoll.history.forEach(note => {
      // Calculate positions based on scroll speed
      note.startX = canvas.width - (pianoRoll.frame - note.startFrame) * pianoRoll.scrollSpeed;
      note.endX = canvas.width - (pianoRoll.frame - note.endFrame) * pianoRoll.scrollSpeed;
    });
    
    // Remove notes that have scrolled off the left edge
    pianoRoll.history = pianoRoll.history.filter(note => note.endX > 0);
    
    // Draw history notes
    pianoRoll.history.forEach(note => {
      const width = Math.max(1, note.endX - note.startX); // Ensure minimum width of 1px
      drawNote(note, note.startX, width);
    });
    
    // Draw active notes
    pianoRoll.notes.forEach(note => {
      const length = Math.max(1, note.length); // Ensure minimum length of 1px
      drawNote(note, canvas.width - length, length);
    });
    
    // Increment frame counter
    pianoRoll.frame++;
    
    // Continue animation loop
    requestAnimationFrame(drawPianoRoll);
  }
  
  // Draw grid lines
  function drawGrid() {
    ctx.strokeStyle = pianoRoll.gridColor;
    ctx.lineWidth = pianoRoll.gridLineWidth;
    
    // Draw horizontal grid lines (lane separators)
    for (let i = 0; i <= pianoRoll.laneCount; i++) {
      const y = i * (pianoRoll.laneHeight + pianoRoll.laneGap);
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }
    
    // Draw vertical grid lines (time markers)
    const gridSpacing = pianoRoll.gridLineFrequency * pianoRoll.scrollSpeed;
    const offset = pianoRoll.frame % pianoRoll.gridLineFrequency * pianoRoll.scrollSpeed;
    
    for (let x = canvas.width - offset; x > 0; x -= gridSpacing) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
  }
  
  // Draw lane labels
  function drawLaneLabels() {
    ctx.fillStyle = '#aaa';
    ctx.font = '9px monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    
    // Create a semi-transparent background for labels
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, 40, canvas.height);
    
    // Draw labels for each lane
    Object.entries(pianoRoll.keyLanes).forEach(([keyCode, laneIndex]) => {
      const y = (laneIndex + 0.5) * (pianoRoll.laneHeight + pianoRoll.laneGap);
      
      // Get key label from DOM
      const keyElement = document.querySelector(`.key[data-key="${keyCode}"]`);
      const label = keyElement ? keyElement.textContent : keyCode;
      
      // Draw label with contrasting color
      ctx.fillStyle = '#fff';
      ctx.fillText(label, 5, y);
    });
  }
  
  // Draw a note on the piano roll
  function drawNote(note, x, width) {
    const y = note.laneIndex * (pianoRoll.laneHeight + pianoRoll.laneGap);
    
    // Draw note rectangle
    ctx.fillStyle = note.color;
    ctx.fillRect(
      x, 
      y + 1, // +1 to avoid overlapping with grid lines
      width, 
      pianoRoll.laneHeight
    );
    
    // Draw note border
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1;
    ctx.strokeRect(
      x, 
      y + 1,
      width, 
      pianoRoll.laneHeight
    );
  }
  
  // Update scroll speed from slider
  speedSlider.addEventListener('input', () => {
    pianoRoll.scrollSpeed = parseFloat(speedSlider.value);
    speedValue.textContent = speedSlider.value + 'x';
  });
  
  // Add event listeners for piano roll
  document.addEventListener('keydown', handlePianoRollKeyDown);
  document.addEventListener('keyup', handlePianoRollKeyUp);
  
  // Handle window resize
  window.addEventListener('resize', resizeCanvas);
  
  // Initialize piano roll
  initializePianoRoll();
  
  // Reset the keyboard visualizer when the page is unloaded
  window.addEventListener("beforeunload", () => {
    // Reset keyboard visualizer
    pressedKeys.clear();
    document.querySelectorAll(".key").forEach(key => {
      key.classList.remove("active");
    });
    updateKeyboardVisualizer();
    
    // Reset piano roll
    pianoRoll.notes = [];
    pianoRoll.history = [];
  });
  