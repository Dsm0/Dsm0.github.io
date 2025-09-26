// Blob Tracking with p5.js
// This sketch detects and tracks colored blobs using your webcam

let video;
let blobs = [];
let colorToTrack = [255, 0, 0]; // Default: tracking red objects
let threshold = 80; // Color matching threshold
let trackingMode = 'color'; // Default tracking mode: 'color', 'luminance', or 'motion'
let luminanceThreshold = 200; // Default luminance threshold for bright tracking
let luminanceMode = 'bright'; // Default luminance mode: 'bright' or 'dark'

// Motion detection variables
let frames = []; // Array to store previous frames
let maxFrames = 2; // Maximum number of frames to store
let motionFrameOffset = 1; // Default: compare with 5th previous frame
let motionThreshold = 40; // Default threshold for motion detection
let motionBlurAmount = 1; // Blur amount for motion detection

let diffImg;

function setup() {
  const canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent('sketch-container');
  
  // Initialize webcam
  video = createCapture(VIDEO);
  video.size(width, height);
  video.hide();

  video2 = createCapture(VIDEO);
  video2.size(width, height);
  video2.hide();
  
  // Initialize frames array with empty frames
  for (let i = 0; i < maxFrames; i++) {
    frames.push(createImage(width, height));
  }
  
  // Create control panel
  createControlPanel();
}

function draw() {
  background(0);
  
  // Display the video feed
//   image(video, 0, 0, width, height);
//   image(video2, 0, 0, width, height);


  
//   // Only process video if it's ready
  if (video.loadedmetadata) {
    // Load pixel data from video
    video.loadPixels();

    // Load pixel data from video2 for comparison
    video2.loadPixels();
    
    // Create a difference display
    diffImg = createImage(width, height);
    diffImg.loadPixels();
    
    // Calculate pixel differences between video and video2
    for (let i = 0; i < video.pixels.length; i += 4) {
      // Get RGB values from both videos
      let r1 = video.pixels[i];
      let g1 = video.pixels[i + 1];
      let b1 = video.pixels[i + 2];
      
      let r2 = video2.pixels[i];
      let g2 = video2.pixels[i + 1];
      let b2 = video2.pixels[i + 2];
      
      // Calculate color difference
      let diffR = Math.abs(r1 - r2);
      let diffG = Math.abs(g1 - g2);
      let diffB = Math.abs(b1 - b2);
      
      // Set difference pixels
      diffImg.pixels[i] = diffR;
      diffImg.pixels[i + 1] = diffG;
      diffImg.pixels[i + 2] = diffB;
      diffImg.pixels[i + 3] = 255; // Alpha
    }
    
    diffImg.updatePixels();
    
    // Display the difference image
    image(diffImg, 0, 0, width, height);
    
    // Store current frame for motion detection
    if (trackingMode === 'motion') {
      storeCurrentFrame();
    }
    
    // Reset blobs for new frame
    blobs = [];
    
    // Process video to find blobs
    findBlobs();
    
    // Draw blobs
    drawBlobs();
  }

}

// Store current frame for motion detection
function storeCurrentFrame() {
  // Shift all frames one position
  for (let i = frames.length - 1; i > 0; i--) {
    frames[i] = frames[i-1];
  }
  
  // Store current frame
  frames[0] = createImage(width, height);
  frames[0].copy(video, 0, 0, width, height, 0, 0, width, height);
  
  // Apply blur if configured (using built-in p5.js filter)
  if (motionBlurAmount > 0) {
    frames[0].filter(BLUR, motionBlurAmount);
  }
}

function findBlobs() {
  // Sample every 5 pixels for performance
  const step = 5;

  
  
  
  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      const index = (y * width + x) * 4;
      
      // Get current pixel color from video
      const r = diffImg.pixels[index];
      const g = diffImg.pixels[index + 1];
      const b = diffImg.pixels[index + 2];
      
      let matchesTarget = false;
      
      if (trackingMode === 'color') {
        // Check if pixel matches our target color
        matchesTarget = colorDistance([r, g, b], colorToTrack) < threshold;
      } else if (trackingMode === 'luminance') {
        // Calculate luminance (perceived brightness)
        const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
        
        if (luminanceMode === 'bright') {
          matchesTarget = luminance > luminanceThreshold;
        } else { // dark mode
          matchesTarget = luminance < luminanceThreshold;
        }
      } else if (trackingMode === 'motion' && frames.length > motionFrameOffset && frames[motionFrameOffset]) {
        // Check if pixel shows significant motion by comparing frames directly
        if (frames[0].pixels && frames[motionFrameOffset].pixels) {
          // Get pixel from current frame
          const r1 = frames[0].pixels[index];
          const g1 = frames[0].pixels[index + 1];
          const b1 = frames[0].pixels[index + 2];
          
          // Get pixel from offset frame
          const r2 = frames[motionFrameOffset].pixels[index];
          const g2 = frames[motionFrameOffset].pixels[index + 1];
          const b2 = frames[motionFrameOffset].pixels[index + 2];
          
          // Calculate difference
          const diff = Math.abs(r1 - r2) + Math.abs(g1 - g2) + Math.abs(b1 - b2);
          matchesTarget = diff > motionThreshold;
        }
      }
      
      if (matchesTarget) {
        // Potential blob pixel found
        let foundExistingBlob = false;
        
        // Check if pixel belongs to existing blob
        for (let i = 0; i < blobs.length; i++) {
          if (dist(x, y, blobs[i].x, blobs[i].y) < blobs[i].size / 2) {
            // Update existing blob
            blobs[i].x = (blobs[i].x + x) / 2;
            blobs[i].y = (blobs[i].y + y) / 2;
            blobs[i].size += 1;
            blobs[i].pixels.push({ x, y });
            foundExistingBlob = true;
            break;
          }
        }
        
        // Create new blob if needed
        if (!foundExistingBlob && blobs.length < 10) { // Limit to 10 blobs
          blobs.push({
            x: x,
            y: y,
            size: 20,
            pixels: [{ x, y }]
          });
        }
      }
    }
  }
  
  // Filter out small blobs
  blobs = blobs.filter(blob => blob.pixels.length > 10);
  
  // Update blob centers and sizes
  blobs.forEach(blob => {
    // Recalculate center
    let sumX = 0, sumY = 0;
    blob.pixels.forEach(pixel => {
      sumX += pixel.x;
      sumY += pixel.y;
    });
    
    blob.x = sumX / blob.pixels.length;
    blob.y = sumY / blob.pixels.length;
    
    // Calculate size based on pixel count
    blob.size = sqrt(blob.pixels.length) * 4;
  });
}

function drawBlobs() {
  // Draw each blob
  for (let i = 0; i < blobs.length; i++) {
    const blob = blobs[i];
    
    // Choose outline color based on tracking mode
    if (trackingMode === 'color') {
      stroke(255, 255, 0); // Yellow for color tracking
    } else if (trackingMode === 'luminance') {
      if (luminanceMode === 'bright') {
        stroke(0, 255, 255); // Cyan for bright tracking
      } else {
        stroke(255, 0, 255); // Magenta for dark tracking
      }
    } else if (trackingMode === 'motion') {
      stroke(255, 128, 0); // Orange for motion tracking
    }
    
    // Draw blob outline
    noFill();
    strokeWeight(2);
    ellipse(blob.x, blob.y, blob.size, blob.size);
    
    // Draw blob center
    fill(0, 255, 0);
    noStroke();
    ellipse(blob.x, blob.y, 10, 10);
    
    // Draw blob ID
    fill(255);
    textSize(16);
    text(`Blob ${i+1}`, blob.x + blob.size/2, blob.y);
  }
  
  // Display blob count and current mode
  fill(255);
  textSize(16);
  text(`Blobs detected: ${blobs.length}`, 20, 30);
  
  // Display current mode and settings
  let modeText = "";
  if (trackingMode === 'color') {
    modeText = "Color Tracking";
  } else if (trackingMode === 'luminance') {
    modeText = `Luminance Tracking (${luminanceMode === 'bright' ? 'Bright' : 'Dark'})`;
  } else if (trackingMode === 'motion') {
    modeText = `Motion Tracking (${motionFrameOffset} frames offset)`;
    
    // Display motion detection preview
    if (trackingMode === 'motion' && frames.length > motionFrameOffset && frames[motionFrameOffset]) {
      // Draw small preview of current and offset frame
      const previewSize = 100;
      const previewX = width - previewSize - 10;
      const previewY = 10;
      
      // Draw frame borders
      noFill();
      stroke(255);
      rect(previewX, previewY, previewSize, previewSize);
      rect(previewX, previewY + previewSize + 10, previewSize, previewSize);
      
      // Draw preview images - check that frames exist
      if (frames[0]) {
        image(frames[0], previewX, previewY, previewSize, previewSize);
      }
      if (frames[motionFrameOffset]) {
        image(frames[motionFrameOffset], previewX, previewY + previewSize + 10, previewSize, previewSize);
      }
      
      // Add labels
      noStroke();
      fill(255);
      text("Current", previewX, previewY - 5);
      text(`-${motionFrameOffset} frames`, previewX, previewY + previewSize + 5);
    }
  }
  text(`Mode: ${modeText}`, 20, 55);
  
  // Display threshold value
  let thresholdText = "";
  if (trackingMode === 'color') {
    thresholdText = `Color threshold: ${threshold}`;
  } else if (trackingMode === 'luminance') {
    thresholdText = `Luminance threshold: ${luminanceThreshold}`;
  } else if (trackingMode === 'motion') {
    thresholdText = `Motion threshold: ${motionThreshold}`;
  }
  text(thresholdText, 20, 80);
}

// Calculate Euclidean distance between colors
function colorDistance(color1, color2) {
  return sqrt(
    pow(color1[0] - color2[0], 2) +
    pow(color1[1] - color2[1], 2) +
    pow(color1[2] - color2[2], 2)
  );
}

// Create UI controls
function createControlPanel() {
  // Create a section title for tracking modes
  createP('Tracking Mode:').position(20, height + 10);
  
  // Create mode selection buttons
  const colorModeBtn = createButton('Color Tracking');
  colorModeBtn.position(20, height + 40);
  colorModeBtn.mousePressed(() => { 
    trackingMode = 'color';
    updateControlVisibility();
  });
  
  const luminanceModeBtn = createButton('Luminance Tracking');
  luminanceModeBtn.position(150, height + 40);
  luminanceModeBtn.mousePressed(() => { 
    trackingMode = 'luminance';
    updateControlVisibility();
  });
  
  const motionModeBtn = createButton('Motion Tracking');
  motionModeBtn.position(300, height + 40);
  motionModeBtn.mousePressed(() => { 
    trackingMode = 'motion';
    updateControlVisibility();
  });
  
  // Section titles
  createP('Select color to track:').position(20, height + 70);
  createP('Color threshold:').position(20, height + 130);
  createP('Luminance mode:').position(20, height + 70);
  createP('Luminance threshold:').position(20, height + 130);
  createP('Motion settings:').position(20, height + 70);
  createP('Motion threshold:').position(20, height + 130);
  createP('Frame offset (m):').position(20, height + 190);
  createP('Blur amount:').position(250, height + 190);
  
  // Add ID to paragraphs for hiding/showing
  const paragraphs = selectAll('p');
  paragraphs[1].id('color-title-1');
  paragraphs[2].id('color-title-2');
  paragraphs[3].id('luminance-title-1');
  paragraphs[4].id('luminance-title-2');
  paragraphs[5].id('motion-title-1');
  paragraphs[6].id('motion-title-2');
  paragraphs[7].id('motion-title-3');
  paragraphs[8].id('motion-title-4');
  
  // Color tracking controls
  // Red
  const redButton = createButton('Red');
  redButton.position(20, height + 100);
  redButton.mousePressed(() => { colorToTrack = [255, 0, 0]; });
  redButton.id('red-btn');
  
  // Green
  const greenButton = createButton('Green');
  greenButton.position(80, height + 100);
  greenButton.mousePressed(() => { colorToTrack = [0, 255, 0]; });
  greenButton.id('green-btn');
  
  // Blue
  const blueButton = createButton('Blue');
  blueButton.position(140, height + 100);
  blueButton.mousePressed(() => { colorToTrack = [0, 0, 255]; });
  blueButton.id('blue-btn');
  
  // Yellow
  const yellowButton = createButton('Yellow');
  yellowButton.position(200, height + 100);
  yellowButton.mousePressed(() => { colorToTrack = [255, 255, 0]; });
  yellowButton.id('yellow-btn');
  
  // Threshold slider for color
  const thresholdSlider = createSlider(20, 200, threshold, 1);
  thresholdSlider.position(150, height + 140);
  thresholdSlider.input(() => { threshold = thresholdSlider.value(); });
  thresholdSlider.id('color-threshold');
  
  // Luminance tracking controls
  // Bright mode
  const brightButton = createButton('Track Bright Areas');
  brightButton.position(20, height + 100);
  brightButton.mousePressed(() => { 
    luminanceMode = 'bright'; 
    luminanceThreshold = 200; // Default for bright
    document.getElementById('luminance-threshold').value = luminanceThreshold;
  });
  brightButton.id('bright-btn');
  
  // Dark mode
  const darkButton = createButton('Track Dark Areas');
  darkButton.position(170, height + 100);
  darkButton.mousePressed(() => { 
    luminanceMode = 'dark'; 
    luminanceThreshold = 50; // Default for dark
    document.getElementById('luminance-threshold').value = luminanceThreshold;
  });
  darkButton.id('dark-btn');
  
  // Threshold slider for luminance
  const luminanceSlider = createSlider(0, 255, luminanceThreshold, 1);
  luminanceSlider.position(150, height + 140);
  luminanceSlider.input(() => { luminanceThreshold = luminanceSlider.value(); });
  luminanceSlider.id('luminance-threshold');
  
  // Motion tracking controls
  // Threshold slider for motion
  const motionThresholdSlider = createSlider(10, 150, motionThreshold, 1);
  motionThresholdSlider.position(150, height + 140);
  motionThresholdSlider.input(() => { motionThreshold = motionThresholdSlider.value(); });
  motionThresholdSlider.id('motion-threshold');
  
  // Motion frame offset slider
  const frameOffsetSlider = createSlider(1, maxFrames - 1, motionFrameOffset, 1);
  frameOffsetSlider.position(150, height + 200);
  frameOffsetSlider.input(() => { motionFrameOffset = frameOffsetSlider.value(); });
  frameOffsetSlider.id('frame-offset');
  
  // Blur amount slider
  const blurSlider = createSlider(0, 5, motionBlurAmount, 0.5);
  blurSlider.position(350, height + 200);
  blurSlider.input(() => { motionBlurAmount = blurSlider.value(); });
  blurSlider.id('blur-amount');
  
  // Save frames button
  const saveFramesBtn = createButton('Save Current Frame Set');
  saveFramesBtn.position(450, height + 140);
  saveFramesBtn.mousePressed(saveFrameSet);
  saveFramesBtn.id('save-frames-btn');
  
  // Initial UI setup
  updateControlVisibility();
}

// Function to save current frame set - modified to work with p5.js
function saveFrameSet() {
  // Save the current frame and the comparison frame
  if (frames.length > motionFrameOffset && frames[motionFrameOffset]) {
    // Create temporary canvases to draw and save the frames
    let currentCanvas = createGraphics(width, height);
    let offsetCanvas = createGraphics(width, height);
    
    // Draw frames to canvases
    currentCanvas.image(frames[0], 0, 0);
    offsetCanvas.image(frames[motionFrameOffset], 0, 0);
    
    // Save canvases
    saveCanvas(currentCanvas, 'current-frame', 'png');
    saveCanvas(offsetCanvas, `frame-minus-${motionFrameOffset}`, 'png');
    
    console.log(`Saved current frame and frame from ${motionFrameOffset} frames ago`);
    
    // Clean up temporary graphics objects
    currentCanvas.remove();
    offsetCanvas.remove();
  } else {
    console.log("Not enough frames stored yet to save comparison");
  }
}

// Function to update control visibility based on tracking mode
function updateControlVisibility() {
  // Show/hide color tracking controls
  const colorControls = ['red-btn', 'green-btn', 'blue-btn', 'yellow-btn', 'color-threshold', 
                         'color-title-1', 'color-title-2'];
  colorControls.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = trackingMode === 'color' ? 'block' : 'none';
  });
  
  // Show/hide luminance tracking controls
  const luminanceControls = ['bright-btn', 'dark-btn', 'luminance-threshold',
                             'luminance-title-1', 'luminance-title-2'];
  luminanceControls.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = trackingMode === 'luminance' ? 'block' : 'none';
  });
  
  // Show/hide motion tracking controls
  const motionControls = ['motion-threshold', 'frame-offset', 'blur-amount', 'save-frames-btn',
                          'motion-title-1', 'motion-title-2', 'motion-title-3', 'motion-title-4'];
  motionControls.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = trackingMode === 'motion' ? 'block' : 'none';
  });
}

// Handle window resizing
function windowResized() {
  // You can uncomment this to make the canvas responsive
  // resizeCanvas(windowWidth, windowHeight);
}
