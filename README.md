# Image SEO Optimizer

A powerful, client-side image SEO optimization tool that allows users to upload, edit metadata, add GEO tags, and download optimized images - all without requiring a database.

## Features

- **Drag & Drop Interface**: Easy-to-use drag and drop or browse interface for uploading images
- **Multiple Image Support**: Upload and process multiple images at once
- **Comprehensive SEO Metadata**:
  - File Name customization
  - Meta Title
  - Subject
  - Tags (comma separated)
  - Comments/Description
  - Author information
  - Date Taken
  - Copyright information
  - ALT tag for accessibility
  - Rating (default 5 stars)
- **GEO Location Tagging**: 
  - Interactive Google Maps integration
  - Search locations by address
  - Click map to set location
  - Drag marker to adjust position
  - Automatic GPS coordinates embedding
- **Client-Side Processing**: All processing happens in the browser - no server or database needed
- **EXIF Metadata**: Embeds all metadata into image EXIF data using piexifjs library
- **Download Optimized Images**: Download your images with all SEO metadata embedded

## Setup Instructions

### 1. Get Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - Maps JavaScript API
   - Places API
   - Geocoding API
4. Create credentials (API Key)
5. Copy your API key

### 2. Configure the Application

Open `index.html` and replace `YOUR_GOOGLE_MAPS_API_KEY` with your actual Google Maps API key:

```html
<script src="https://maps.googleapis.com/maps/api/js?key=YOUR_GOOGLE_MAPS_API_KEY&libraries=places"></script>
```

### 3. Run the Application

Simply open `index.html` in a modern web browser (Chrome, Firefox, Safari, or Edge).

**Note**: For local development, you may need to run a local server due to CORS restrictions. You can use:

```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000

# Node.js (with http-server package)
npx http-server

# PHP
php -S localhost:8000
```

Then navigate to `http://localhost:8000` in your browser.

## Usage Guide

1. **Upload Images**:
   - Drag and drop images onto the drop zone, or
   - Click "Browse Files" to select images from your computer

2. **Edit Metadata**:
   - Fill in the desired SEO metadata fields
   - All fields are optional but recommended for better SEO
   - Rating is automatically set to 5 stars

3. **Set GEO Location**:
   - Search for a location using the search box
   - Click anywhere on the map to set a marker
   - Drag the marker to fine-tune the location
   - Latitude and longitude are automatically populated

4. **Apply Metadata**:
   - Click "Apply Metadata" to embed all information into your images

5. **Download**:
   - Click "Download Optimized Image" to download your SEO-optimized images
   - Multiple images will download sequentially

6. **Reset**:
   - Click "Reset" to start over with new images

## Supported Image Formats

- JPEG/JPG
- PNG
- GIF
- WebP
- BMP

## Browser Compatibility

- Chrome (recommended)
- Firefox
- Safari
- Edge
- Opera

## Technical Details

### Libraries Used

- **piexifjs**: For reading and writing EXIF metadata to images
- **Google Maps JavaScript API**: For interactive map and geocoding
- **Native HTML5 Canvas API**: For image processing

### Metadata Storage

All metadata is embedded into the image file using EXIF tags:

- **Basic Info**: Stored in EXIF 0th IFD (Artist, Copyright, ImageDescription)
- **Date**: Stored in EXIF tags (DateTimeOriginal, DateTimeDigitized)
- **GPS**: Stored in GPS IFD (Latitude, Longitude)
- **Additional Data**: Stored in UserComment field as JSON

## Privacy & Security

- **100% Client-Side**: All processing happens in your browser
- **No Server Upload**: Images never leave your computer
- **No Database**: No data is stored anywhere
- **No Tracking**: No analytics or tracking code

## License

MIT License - Feel free to use and modify as needed.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

For issues or questions, please open an issue on GitHub.