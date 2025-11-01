// Global variables
let uploadedImages = [];
let currentImageIndex = 0;
let map;
let marker;
let geocoder;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
    initializeMap();
});

// Initialize all event listeners
function initializeEventListeners() {
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const browseBtn = document.getElementById('browseBtn');
    const applyMetadataBtn = document.getElementById('applyMetadata');
    const downloadBtn = document.getElementById('downloadImage');
    const resetBtn = document.getElementById('resetForm');

    // File input events
    browseBtn.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', handleFileSelect);

    // Drag and drop events
    dropZone.addEventListener('click', () => fileInput.click());
    dropZone.addEventListener('dragover', handleDragOver);
    dropZone.addEventListener('dragleave', handleDragLeave);
    dropZone.addEventListener('drop', handleDrop);

    // Button events
    applyMetadataBtn.addEventListener('click', applyMetadata);
    downloadBtn.addEventListener('click', downloadImage);
    resetBtn.addEventListener('click', resetForm);

    // Location search
    const locationSearch = document.getElementById('locationSearch');
    if (typeof google !== 'undefined' && google.maps && google.maps.places) {
        const autocomplete = new google.maps.places.Autocomplete(locationSearch);
        autocomplete.bindTo('bounds', map);
        autocomplete.addListener('place_changed', function() {
            const place = autocomplete.getPlace();
            if (!place.geometry) {
                return;
            }
            if (place.geometry.viewport) {
                map.fitBounds(place.geometry.viewport);
            } else {
                map.setCenter(place.geometry.location);
                map.setZoom(17);
            }
            updateMapLocation(place.geometry.location);
        });
    }
}

// Initialize Google Map
function initializeMap() {
    const mapElement = document.getElementById('map');
    const defaultLocation = { lat: 40.7128, lng: -74.0060 }; // New York

    map = new google.maps.Map(mapElement, {
        center: defaultLocation,
        zoom: 12,
        mapTypeControl: true,
        streetViewControl: false,
    });

    // Add click listener to set marker
    map.addListener('click', function(event) {
        updateMapLocation(event.latLng);
    });

    // Initialize geocoder
    geocoder = new google.maps.Geocoder();

    // Try to get user's current location
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            function(position) {
                const pos = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                map.setCenter(pos);
                updateMapLocation(new google.maps.LatLng(pos.lat, pos.lng));
            },
            function() {
                // If geolocation fails, keep default location
            }
        );
    }
}

// Update map marker and coordinates
function updateMapLocation(location) {
    if (marker) {
        marker.setMap(null);
    }

    marker = new google.maps.Marker({
        position: location,
        map: map,
        draggable: true,
        animation: google.maps.Animation.DROP
    });

    // Update coordinates
    document.getElementById('latitude').value = location.lat().toFixed(6);
    document.getElementById('longitude').value = location.lng().toFixed(6);

    // Add drag listener
    marker.addListener('drag', function(event) {
        document.getElementById('latitude').value = event.latLng.lat().toFixed(6);
        document.getElementById('longitude').value = event.latLng.lng().toFixed(6);
    });
}

// Handle drag over
function handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.add('drag-over');
}

// Handle drag leave
function handleDragLeave(e) {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove('drag-over');
}

// Handle drop
function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove('drag-over');
    
    const files = e.dataTransfer.files;
    processFiles(files);
}

// Handle file select
function handleFileSelect(e) {
    const files = e.target.files;
    processFiles(files);
}

// Process uploaded files
function processFiles(files) {
    const imageFiles = Array.from(files).filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length === 0) {
        showErrorMessage('Please upload valid image files');
        return;
    }

    uploadedImages = [];
    const previewSection = document.getElementById('imagePreviewSection');
    const previewContainer = document.getElementById('imagePreview');
    const metadataSection = document.getElementById('metadataSection');

    previewContainer.innerHTML = '';
    
    imageFiles.forEach((file, index) => {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            const imageData = {
                file: file,
                originalName: file.name,
                dataUrl: e.target.result,
                processedDataUrl: null
            };
            
            uploadedImages.push(imageData);
            
            // Create preview card
            const card = document.createElement('div');
            card.className = 'preview-card';
            card.innerHTML = `
                <img src="${e.target.result}" alt="Preview">
                <button class="remove-btn" onclick="removeImage(${index})">&times;</button>
            `;
            previewContainer.appendChild(card);
            
            // Show sections after first image
            if (uploadedImages.length === 1) {
                previewSection.style.display = 'block';
                metadataSection.style.display = 'block';
                populateFormWithDefaults(file);
            }
        };
        
        reader.readAsDataURL(file);
    });
}

// Remove image from preview
function removeImage(index) {
    uploadedImages.splice(index, 1);
    
    if (uploadedImages.length === 0) {
        document.getElementById('imagePreviewSection').style.display = 'none';
        document.getElementById('metadataSection').style.display = 'none';
    } else {
        // Refresh preview
        const previewContainer = document.getElementById('imagePreview');
        previewContainer.innerHTML = '';
        uploadedImages.forEach((img, idx) => {
            const card = document.createElement('div');
            card.className = 'preview-card';
            card.innerHTML = `
                <img src="${img.dataUrl}" alt="Preview">
                <button class="remove-btn" onclick="removeImage(${idx})">&times;</button>
            `;
            previewContainer.appendChild(card);
        });
    }
}

// Populate form with default values
function populateFormWithDefaults(file) {
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 16);
    
    // Set default values
    document.getElementById('fileName').value = file.name.replace(/\.[^/.]+$/, '');
    document.getElementById('metaTitle').value = file.name.replace(/\.[^/.]+$/, '').replace(/-|_/g, ' ');
    document.getElementById('dateTaken').value = dateStr;
    document.getElementById('rating').value = '5';
    
    // Set current year in copyright
    const currentYear = now.getFullYear();
    document.getElementById('copyright').value = `© ${currentYear}`;
}

// Apply metadata to images
function applyMetadata() {
    if (uploadedImages.length === 0) {
        showErrorMessage('Please upload images first');
        return;
    }

    const metadata = {
        fileName: document.getElementById('fileName').value || 'image',
        metaTitle: document.getElementById('metaTitle').value || '',
        subject: document.getElementById('subject').value || '',
        author: document.getElementById('author').value || '',
        dateTaken: document.getElementById('dateTaken').value || new Date().toISOString(),
        copyright: document.getElementById('copyright').value || '',
        altTag: document.getElementById('altTag').value || '',
        tags: document.getElementById('tags').value || '',
        comments: document.getElementById('comments').value || '',
        rating: document.getElementById('rating').value || '5',
        latitude: document.getElementById('latitude').value || '',
        longitude: document.getElementById('longitude').value || ''
    };

    showLoading();

    // Process each image
    uploadedImages.forEach((imageData, index) => {
        processImageWithMetadata(imageData, metadata, index);
    });

    setTimeout(() => {
        hideLoading();
        showSuccessMessage('Metadata applied successfully!');
        document.getElementById('downloadImage').disabled = false;
    }, 1000);
}

// Process image with metadata using piexif
function processImageWithMetadata(imageData, metadata, index) {
    try {
        const img = new Image();
        img.onload = function() {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);

            // Prepare EXIF data
            const exifObj = {
                "0th": {},
                "Exif": {},
                "GPS": {},
                "Interop": {},
                "1st": {}
            };

            // Set basic metadata
            if (metadata.author) {
                exifObj["0th"][piexif.ImageIFD.Artist] = metadata.author;
            }
            if (metadata.copyright) {
                exifObj["0th"][piexif.ImageIFD.Copyright] = metadata.copyright;
            }
            if (metadata.metaTitle) {
                exifObj["0th"][piexif.ImageIFD.ImageDescription] = metadata.metaTitle;
            }

            // Set EXIF specific metadata
            if (metadata.dateTaken) {
                const dateObj = new Date(metadata.dateTaken);
                const exifDate = formatExifDate(dateObj);
                exifObj["Exif"][piexif.ExifIFD.DateTimeOriginal] = exifDate;
                exifObj["Exif"][piexif.ExifIFD.DateTimeDigitized] = exifDate;
            }

            // Set rating (using the 0th IFD Rating tag)
            if (metadata.rating) {
                exifObj["0th"][0x4746] = parseInt(metadata.rating, 10);
            }

            // Set tags (using XPKeywords tag 0x9c9e in 0th IFD)
            // XPKeywords expects UTF-16LE encoded string
            if (metadata.tags) {
                const tagsUtf16 = stringToUtf16LE(metadata.tags);
                exifObj["0th"][0x9c9e] = tagsUtf16;
            }

            // Set comments as plain text in UserComment
            if (metadata.comments) {
                exifObj["Exif"][piexif.ExifIFD.UserComment] = metadata.comments;
            }

            // Store subject in XPSubject field
            if (metadata.subject) {
                exifObj["0th"][0x9c9f] = stringToUtf16LE(metadata.subject); // XPSubject
            }

            // Set GPS data if available
            if (metadata.latitude && metadata.longitude) {
                const lat = parseFloat(metadata.latitude);
                const lng = parseFloat(metadata.longitude);
                
                exifObj["GPS"][piexif.GPSIFD.GPSLatitudeRef] = lat >= 0 ? 'N' : 'S';
                exifObj["GPS"][piexif.GPSIFD.GPSLatitude] = degToDmsRational(Math.abs(lat));
                exifObj["GPS"][piexif.GPSIFD.GPSLongitudeRef] = lng >= 0 ? 'E' : 'W';
                exifObj["GPS"][piexif.GPSIFD.GPSLongitude] = degToDmsRational(Math.abs(lng));
            }

            // Insert EXIF data
            const exifBytes = piexif.dump(exifObj);
            const newDataUrl = piexif.insert(exifBytes, canvas.toDataURL('image/jpeg', 0.95));
            
            imageData.processedDataUrl = newDataUrl;
            imageData.metadata = metadata;
        };
        img.src = imageData.dataUrl;
    } catch (error) {
        console.error('Error processing image:', error);
    }
}

// Convert degrees to DMS (Degrees, Minutes, Seconds) rational format for EXIF
function degToDmsRational(deg) {
    const d = Math.floor(deg);
    const minFloat = (deg - d) * 60;
    const m = Math.floor(minFloat);
    const secFloat = (minFloat - m) * 60;
    const s = Math.round(secFloat * 100);
    
    return [[d, 1], [m, 1], [s, 100]];
}

// Convert string to UTF-16LE byte array for Windows XP tags
function stringToUtf16LE(str) {
    const arr = [];
    for (let i = 0; i < str.length; i++) {
        const charCode = str.charCodeAt(i);
        // Handle surrogate pairs for characters outside BMP (code points > 0xFFFF)
        if (charCode >= 0xD800 && charCode <= 0xDBFF && i + 1 < str.length) {
            // High surrogate, get the low surrogate
            const lowSurrogate = str.charCodeAt(i + 1);
            if (lowSurrogate >= 0xDC00 && lowSurrogate <= 0xDFFF) {
                // Valid surrogate pair, add both code units
                arr.push(charCode & 0xff);
                arr.push((charCode >> 8) & 0xff);
                arr.push(lowSurrogate & 0xff);
                arr.push((lowSurrogate >> 8) & 0xff);
                i++; // Skip the low surrogate in next iteration
                continue;
            }
        }
        // Normal character or lone surrogate
        arr.push(charCode & 0xff);
        arr.push((charCode >> 8) & 0xff);
    }
    // Add null terminator
    arr.push(0);
    arr.push(0);
    return arr;
}

// Format date for EXIF (YYYY:MM:DD HH:MM:SS)
function formatExifDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    
    return `${year}:${month}:${day} ${hours}:${minutes}:${seconds}`;
}

// Download processed images
function downloadImage() {
    if (uploadedImages.length === 0) {
        showErrorMessage('No images to download');
        return;
    }

    uploadedImages.forEach((imageData, index) => {
        const dataUrl = imageData.processedDataUrl || imageData.dataUrl;
        const fileName = imageData.metadata?.fileName || imageData.originalName.replace(/\.[^/.]+$/, '');
        const extension = imageData.originalName.split('.').pop();
        
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = `${fileName}_optimized_${index + 1}.${extension}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });

    showSuccessMessage('Images downloaded successfully!');
}

// Reset form and clear images
function resetForm() {
    uploadedImages = [];
    document.getElementById('imagePreviewSection').style.display = 'none';
    document.getElementById('metadataSection').style.display = 'none';
    document.getElementById('metadataForm').reset();
    document.getElementById('fileInput').value = '';
    document.getElementById('downloadImage').disabled = true;
    document.getElementById('imagePreview').innerHTML = '';
    
    // Reset rating to 5 stars
    document.getElementById('rating').value = '5';
    
    // Clear map marker
    if (marker) {
        marker.setMap(null);
        marker = null;
    }
    document.getElementById('latitude').value = '';
    document.getElementById('longitude').value = '';
}

// Show loading overlay
function showLoading() {
    const overlay = document.createElement('div');
    overlay.className = 'loading-overlay';
    overlay.id = 'loadingOverlay';
    overlay.innerHTML = '<div class="loading-spinner"></div>';
    document.body.appendChild(overlay);
}

// Hide loading overlay
function hideLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.remove();
    }
}

// Show success message
function showSuccessMessage(message) {
    const existingMessage = document.querySelector('.success-message');
    if (existingMessage) {
        existingMessage.remove();
    }

    const messageDiv = document.createElement('div');
    messageDiv.className = 'success-message';
    messageDiv.textContent = message;
    
    const container = document.querySelector('.container');
    container.insertBefore(messageDiv, container.firstChild);
    
    setTimeout(() => {
        messageDiv.remove();
    }, 3000);
}

// Show error message
function showErrorMessage(message) {
    const existingMessage = document.querySelector('.error-message');
    if (existingMessage) {
        existingMessage.remove();
    }

    const messageDiv = document.createElement('div');
    messageDiv.className = 'error-message';
    messageDiv.textContent = message;
    
    const container = document.querySelector('.container');
    container.insertBefore(messageDiv, container.firstChild);
    
    setTimeout(() => {
        messageDiv.remove();
    }, 3000);
}
