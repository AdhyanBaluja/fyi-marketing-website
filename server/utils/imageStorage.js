const fs = require('fs');
const path = require('path');
const axios = require('axios');

/**
 * Ensure that the uploads directory exists.
 */
function ensureUploadsDir() {
  const uploadsPath = path.join(__dirname, '..', 'uploads');
  if (!fs.existsSync(uploadsPath)) {
    fs.mkdirSync(uploadsPath, { recursive: true });
  }
  return uploadsPath;
}

/**
 * Download image from a given URL and save it to /uploads/<filename>
 */
async function downloadImage(imageUrl, filename) {
  try {
    const uploadsPath = ensureUploadsDir();
    const filePath = path.join(uploadsPath, filename);

    // Request the image data as an arraybuffer
    const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    
    // Write the file asynchronously to avoid blocking the event loop
    await fs.promises.writeFile(filePath, response.data);
    console.log('Image saved to', filePath);
    return filePath;
  } catch (err) {
    console.error('Error downloading image:', err);
    return null; // Optionally, you can throw the error instead
  }
}

module.exports = {
  downloadImage,
};
