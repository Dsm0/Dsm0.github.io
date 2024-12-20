const NUM_SLIDERS = 20;
const SLIDER_GAP = 30;  // Gap between sliders
const SLIDER_LENGTH = 400;  // Length of each slider
const SLIDER_THICKNESS = 20;  // Thickness of the slider track
const INCREMENT_AMOUNT = 1;  // Amount to change slider value by

// Add state tracking for slider directions
const sliderDirections = new Map();

let animationInterval = null;

function createAnimationControls() {
  const controlsContainer = document.createElement('div');
  controlsContainer.style.position = 'fixed';
  controlsContainer.style.top = '40px';
  controlsContainer.style.right = '20px';
  controlsContainer.style.display = 'flex';
  controlsContainer.style.gap = '10px';
  controlsContainer.style.alignItems = 'center';

  // Create speed slider
  const speedSlider = document.createElement('input');
  speedSlider.type = 'range';
  speedSlider.min = '1';  // 60fps
  speedSlider.max = '2000';  // 1 second
  speedSlider.value = '100';  // Default speed
  speedSlider.style.width = '100px';

  const speedLabel = document.createElement('span');
  speedLabel.textContent = 'Speed: ';
  speedLabel.style.color = 'white';

  // Create play/pause button
  const playButton = document.createElement('button');
  playButton.textContent = 'Play';
  playButton.style.padding = '10px';
  playButton.style.top = '20px';
  playButton.style.position = 'absolute';

  let isPlaying = false;

  const updateAnimation = () => {
    if (isPlaying) {
      clearInterval(animationInterval);
      animationInterval = setInterval(animateSliders, parseInt(speedSlider.value));
    }
  };

  playButton.addEventListener('click', () => {
    isPlaying = !isPlaying;
    playButton.textContent = isPlaying ? 'Pause' : 'Play';

    if (isPlaying) {
      updateAnimation();
    } else {
      clearInterval(animationInterval);
    }
  });

  speedSlider.addEventListener('input', updateAnimation);

  controlsContainer.appendChild(speedLabel);
  controlsContainer.appendChild(speedSlider);
  controlsContainer.appendChild(playButton);
  document.body.appendChild(controlsContainer);
}

function animateSliders() {
  document.querySelectorAll('input[type="range"]').forEach(slider => {
    // Handle value animation
    const currentValue = parseInt(slider.value);
    const direction = sliderDirections.get(slider) || 1;

    // Calculate new value
    const newValue = currentValue + (INCREMENT_AMOUNT * direction);

    // Check bounds and update direction if needed
    if (newValue >= slider.max) {
      sliderDirections.set(slider, -1);
      slider.value = slider.max;
    } else if (newValue <= slider.min) {
      sliderDirections.set(slider, 1);
      slider.value = slider.min;
    } else {
      slider.value = newValue;
    }

    // Randomly adjust z-index
    if (Math.random() < 0.1) { // 10% chance to change z-index each frame
      slider.style.zIndex = Math.floor(Math.random() * 30) + 1; // Random z-index between 1-3
    }
  });
}

function createSliderPair(index) {
  const sliderContainer = document.createElement('div');
  sliderContainer.className = 'slider-pair';

  // Create vertical slider
  const verticalSlider = document.createElement('input');
  verticalSlider.type = 'range';
  verticalSlider.className = 'vertical-slider';
  verticalSlider.min = 0;
  verticalSlider.max = 100;
  verticalSlider.value = 50;

  // Create horizontal slider
  const horizontalSlider = document.createElement('input');
  horizontalSlider.type = 'range';
  horizontalSlider.className = 'horizontal-slider';
  horizontalSlider.min = 0;
  horizontalSlider.max = 100;
  horizontalSlider.value = 50;

  // Position the sliders with absolute positioning
  verticalSlider.style.left = `${index * SLIDER_GAP}px`;
  horizontalSlider.style.top = `${index * SLIDER_GAP}px`;

  // Initialize direction for new sliders
  sliderDirections.set(verticalSlider, 1);
  sliderDirections.set(horizontalSlider, 1);

  // Add event listeners for interaction
  const handleSliderFocus = (slider) => {
    // Reset all sliders to their default z-index
    document.querySelectorAll('input[type="range"]').forEach(s => {
      s.style.zIndex = s.classList.contains('horizontal-slider') && index % 2 === 0 ||
        s.classList.contains('vertical-slider') && index % 2 === 1 ? 2 : 1;
    });
    // Set the active slider to highest z-index
    slider.style.zIndex = 3;
  };

  verticalSlider.addEventListener('mousedown', () => handleSliderFocus(verticalSlider));
  horizontalSlider.addEventListener('mousedown', () => handleSliderFocus(horizontalSlider));

  document.body.appendChild(verticalSlider);
  document.body.appendChild(horizontalSlider);
}

// Create all slider pairs
for (let i = 0; i < NUM_SLIDERS; i++) {
  createSliderPair(i);
}

// Add the control button
createAnimationControls();



