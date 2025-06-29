const admin = require('firebase-admin');
const { getFirestore } = require('firebase-admin/firestore');
const { getStorage } = require('firebase-admin/storage');
const logger = require('../utils/logger');

let db;
let bucket;

/**
 * Initialize Firebase Admin SDK
 */
const initializeFirebase = () => {
  try {
    const serviceAccount = {
      type: 'service_account',
      project_id: process.env.FIREBASE_PROJECT_ID,
      private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
    };

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET
    });

    db = getFirestore();
    bucket = getStorage().bucket();

    logger.info('✅ Firebase initialized successfully');
  } catch (error) {
    logger.error('❌ Failed to initialize Firebase:', error);
    throw error;
  }
};

/**
 * Get Firestore database instance
 */
const getDB = () => {
  if (!db) {
    throw new Error('Firebase not initialized. Call initializeFirebase() first.');
  }
  return db;
};

/**
 * Get Firebase Storage bucket instance
 */
const getBucket = () => {
  if (!bucket) {
    throw new Error('Firebase not initialized. Call initializeFirebase() first.');
  }
  return bucket;
};

/**
 * Upload file to Firebase Storage
 */
const uploadToStorage = async (filePath, destination, metadata = {}) => {
  try {
    const [file] = await bucket.upload(filePath, {
      destination,
      metadata: {
        metadata: {
          ...metadata,
          uploadedAt: new Date().toISOString()
        }
      }
    });

    logger.info(`File uploaded to Firebase Storage: ${destination}`);
    return {
      file,
      publicUrl: null, // No public URL by default
      gsUrl: `gs://${bucket.name}/${destination}`
    };
  } catch (error) {
    logger.error('Error uploading to Firebase Storage:', error);
    throw error;
  }
};

/**
 * Delete file from Firebase Storage
 */
const deleteFromStorage = async (filePath) => {
  try {
    await bucket.file(filePath).delete();
    logger.info(`File deleted from Firebase Storage: ${filePath}`);
  } catch (error) {
    if (error.code === 404) {
      logger.warn(`File not found in storage: ${filePath}`);
    } else {
      logger.error('Error deleting from Firebase Storage:', error);
      throw error;
    }
  }
};

/**
 * Get signed URL for private file access
 */
const getSignedUrl = async (filePath, expiresInMinutes = 60) => {
  try {
    const [url] = await bucket.file(filePath).getSignedUrl({
      action: 'read',
      expires: Date.now() + (expiresInMinutes * 60 * 1000)
    });
    return url;
  } catch (error) {
    logger.error('Error generating signed URL:', error);
    throw error;
  }
};

module.exports = {
  initializeFirebase,
  getDB,
  getBucket,
  uploadToStorage,
  deleteFromStorage,
  getSignedUrl,
  admin
};
