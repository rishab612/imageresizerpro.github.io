const imageUpload = document.getElementById('imageUpload');
const widthInput = document.getElementById('widthInput');
const heightInput = document.getElementById('heightInput');
const unitSelect = document.getElementById('unitSelect');
const dpiControl = document.querySelector('.dpi-control');
const dpiInput = document.getElementById('dpiInput');
const dimensionInfo = document.querySelector('.dimension-info');
const percentageOptions = document.querySelector('.percentage-options');
const displayWidth = document.getElementById('displayWidth');
const displayHeight = document.getElementById('displayHeight');
const displayWidthUnit = document.getElementById('displayWidthUnit');
const displayHeightUnit = document.getElementById('displayHeightUnit');
const percentValue = document.getElementById('percentValue');
const radioButtons = document.querySelectorAll('.radio-scale input[type="radio"]');
const resizeBtn = document.getElementById('resizeBtn');
const downloadBtn = document.getElementById('downloadBtn');
const formatSelect = document.getElementById('formatSelect');
const qualitySelect = document.getElementById('qualitySelect');
const imageCanvas = document.getElementById('imageCanvas');
const ctx = imageCanvas.getContext('2d');
const lockAspectRatio = document.getElementById('lockAspectRatio');
const progressBar = document.getElementById('progressBar');
const progressText = document.getElementById('progressText');
const progressWrapper = document.querySelector('.progress-wrapper');
const messageWrapper = document.querySelector('.message-wrapper');
const downloadMessage = document.querySelector('.download-message');

let img = new Image();
let originalWidth, originalHeight;
let aspectRatio;
let imageQuality = 1.0; // Default quality factor
let imageUploaded = false; // Track if image is uploaded

// Background image for the canvas
const bgImage = new Image();
bgImage.src = '/images/image-bg.webp';

document.querySelector('.logo').addEventListener('mousedown', function(event) {
    event.stopPropagation(); // Prevent default action
});


// Function to convert input units to pixels
function convertToPx(value, unit) {
    const dpi = parseFloat(dpiInput.value) || 96; // Get user-set DPI or default to 96 if empty
    switch (unit) {
        case 'in':
            return value * dpi; // Convert inches to pixels using DPI
        case 'cm':
            return (value * dpi) / 2.54; // Centimeters to pixels
        case 'mm':
            return (value * dpi) / 25.4; // Millimeters to pixels
        case '%':
            return (value / 100) * originalWidth; // Percentage of the original width
        default:
            return value; // If it's in pixels, return as is
    }
}

// Function to draw background image
function drawBackground() {
    ctx.clearRect(0, 0, imageCanvas.width, imageCanvas.height);
    ctx.drawImage(bgImage, 0, 0, imageCanvas.width, imageCanvas.height);
}

// Show DPI input when inches is selected
unitSelect.addEventListener('change', function () {
    dpiControl.style.display = unitSelect.value === 'in' ? 'block' : 'none';
});

// Display dimensions when an image is uploaded
imageUpload.addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
        imageUploaded = true;
        const reader = new FileReader();
        reader.onload = function(e) {
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    } else {
        imageUploaded = false;
        drawBackground(); // Draw background when no image is uploaded
    }
});

// When the image is loaded, update dimensions and canvas
img.onload = function() {
    originalWidth = img.width;
    originalHeight = img.height;
    aspectRatio = originalWidth / originalHeight;

    displayWidth.textContent = originalWidth;
    displayHeight.textContent = originalHeight;
    displayWidthUnit.textContent = 'px';
    displayHeightUnit.textContent = 'px';
    dimensionInfo.style.display = 'block';

    // Set canvas to the original image size
    imageCanvas.width = originalWidth;
    imageCanvas.height = originalHeight;

    // Draw the image on the canvas
    ctx.clearRect(0, 0, imageCanvas.width, imageCanvas.height);
    ctx.drawImage(img, 0, 0, originalWidth, originalHeight);

    // Set width and height inputs to image's original size
    widthInput.value = originalWidth;
    heightInput.value = originalHeight;
};

// Show/hide elements based on unit selection
unitSelect.addEventListener('change', function() {
    if (unitSelect.value === 'in') {
        dpiControl.style.display = 'block';
        dimensionInfo.style.display = 'block';
        percentageOptions.style.display = 'none';
    } else if (unitSelect.value === '%') {
        dpiControl.style.display = 'none';
        dimensionInfo.style.display = 'none';
        percentageOptions.style.display = 'block';
    } else {
        dpiControl.style.display = 'none';
        dimensionInfo.style.display = 'block';
        percentageOptions.style.display = 'none';
    }
});

// Update percentage value text when radio buttons change
radioButtons.forEach(button => {
    button.addEventListener('change', function() {
        percentValue.textContent = this.value;
    });
});

// Adjust height when width changes if aspect ratio is locked
widthInput.addEventListener('input', () => {
    if (lockAspectRatio.checked) {
        heightInput.value = Math.round(widthInput.value / aspectRatio);
    }
});

// Adjust width when height changes if aspect ratio is locked
heightInput.addEventListener('input', () => {
    if (lockAspectRatio.checked) {
        widthInput.value = Math.round(heightInput.value * aspectRatio);
    }
});

// Resize image and show progress bar
function resizeImage() {
    if (!imageUploaded) {
        alert('Please upload an image before resizing.');
        return;
    }

    progressWrapper.style.display = 'block'; // Show progress bar
    progressBar.style.width = '0%';
    progressText.textContent = 'Resizing... 0%';
    messageWrapper.style.display = 'none'; // Hide message initially

    let progress = 0;

    // Simulate progress
    const interval = setInterval(() => {
        progress += 10;
        progressBar.style.width = progress + '%';
        progressText.textContent = `Resizing... ${progress}%`;
        
        if (progress >= 100) {
            clearInterval(interval);
            progressBar.style.display = 'none'; // Hide progress bar
            progressText.textContent = 'Resizing is completed.';
            messageWrapper.style.display = 'block'; // Show message when done
        }
    }, 1000);

    setTimeout(() => {
        const newWidth = convertToPx(widthInput.value, unitSelect.value);
        const newHeight = convertToPx(heightInput.value, unitSelect.value);

        imageCanvas.width = newWidth;
        imageCanvas.height = newHeight;

        // Clear the canvas before resizing
        ctx.clearRect(0, 0, imageCanvas.width, imageCanvas.height);

        // Draw resized image on canvas
        ctx.drawImage(img, 0, 0, originalWidth, originalHeight, 0, 0, newWidth, newHeight);
    }, 10000); // Simulate resize duration
}

// Generate a unique ID based on timestamp
function generateUniqueId() {
    return Date.now();
}

// Reduce image quality
function reduceImageQuality(imageData, qualityFactor) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = imageCanvas.width;
    canvas.height = imageCanvas.height;
    ctx.drawImage(imageCanvas, 0, 0);

    // Apply quality reduction (using JPEG compression as an example)
    return canvas.toDataURL('image/jpeg', qualityFactor);
}

// Enhance image quality (mock implementation)
function enhanceImageQuality(imageData) {
    // Mock enhancement by just returning the image data with some applied effect
    return imageData;
}

// Handle resize button click
resizeBtn.addEventListener('click', () => {
    resizeImage(); // Trigger image resizing
});

// Show download timing message and start download after countdown
downloadBtn.addEventListener('click', () => {
    if (!imageUploaded) {
        alert('Please upload an image before downloading.');
        return;
    }

    let countdown = 5; // Countdown starting from 5 seconds
    downloadBtn.textContent = `Your download will start in ${countdown} seconds...`;

    const countdownInterval = setInterval(() => {
        countdown -= 1;
        if (countdown > 0) {
            downloadBtn.textContent = `Your download will start in ${countdown} seconds...`;
        } else {
            clearInterval(countdownInterval);
            const format = formatSelect.value;
            const uniqueId = generateUniqueId();
            
            let imageData = imageCanvas.toDataURL(`image/${format}`);

            // Apply quality adjustments based on user selection
            switch (qualitySelect.value) {
                case 'reduce':
                    imageData = reduceImageQuality(imageData, imageQuality);
                    break;
                case 'enhance':
                    imageData = enhanceImageQuality(imageData);
                    break;
                default:
                    // Default quality (no adjustment)
                    break;
            }

            const link = document.createElement('a');
            link.download = `resized-image-${uniqueId}.${format}`;
            link.href = imageData;
            link.click();
            
            // Reset button text
            downloadBtn.textContent = 'Download Image';
        }
    }, 1000); // Update every second
});

// Draw the background image initially
drawBackground();
