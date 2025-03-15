// utils/imageStorage.js
const fs = require('fs');
const path = require('path');
const axios = require('axios');

/**
 * Make sure uploads directory exists
 */
function ensureUploadsDir() {
  const uploadsPath = path.join(__dirname, '..', 'uploads');
  if (!fs.existsSync(uploadsPath)) {
    fs.mkdirSync(uploadsPath, { recursive: true });
  }
  return uploadsPath;
}

/**
 * Download image from a given URL and save to /uploads/dalle-xxxx.png
 */
async function downloadImage(imageUrl, filename) {
  try {
    const uploadsPath = ensureUploadsDir();

    // Example: /.../server/uploads/dalle-12345.png
    const filePath = path.join(uploadsPath, filename);

    // Request the image
    const response = await axios.get(imageUrl, {
      responseType: 'arraybuffer',
    });

    fs.writeFileSync(filePath, response.data);
    console.log('Image saved to', filePath);
    return filePath;
  } catch (err) {
    console.error('Error downloading image:', err);
    return null; // or throw err
  }
}

module.exports = {
  downloadImage,
};
