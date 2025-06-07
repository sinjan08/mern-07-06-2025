const multer = require('multer');
const path = require('path');

// Configure storage for uploaded files
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Directory where files will be stored
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname)); // Append original file extension
    }
});
// Create the multer instance with the storage configuration
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 5 // Limit file size to 5MB
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error('Please upload an image file (jpg, jpeg, png)'));
        }
        cb(null, true); // Accept the file
    }
});

/**
 * Middleware to handle file uploads
 * @param {string} fieldName - The name of the field in the form data
 * @returns {Function} - Multer middleware function
 */
const fileUploader = (fieldName) => {
    return upload.single(fieldName); // Use single file upload for the specified field
}

module.exports = {
    fileUploader
};