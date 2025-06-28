const Tesseract = require('tesseract.js');
const sharp = require('sharp');
const pdf = require('pdf-parse');
const logger = require('../utils/logger');

class OCRService {
  constructor() {
    this.tesseractWorker = null;
    this.initializeWorker();
  }

  /**
   * Initialize Tesseract worker
   */
  async initializeWorker() {
    try {
      this.tesseractWorker = await Tesseract.createWorker();
      await this.tesseractWorker.loadLanguage('eng');
      await this.tesseractWorker.initialize('eng');
      logger.info('✅ Tesseract OCR worker initialized');
    } catch (error) {
      logger.error('❌ Failed to initialize Tesseract worker:', error);
    }
  }

  /**
   * Extract text from document
   */
  async extractText(fileData, mimeType) {
    try {
      logger.info(`Extracting text from document (${mimeType})`);

      if (mimeType === 'application/pdf') {
        return await this.extractFromPDF(fileData);
      } else if (mimeType.startsWith('image/')) {
        return await this.extractFromImage(fileData);
      } else {
        throw new Error(`Unsupported file type for OCR: ${mimeType}`);
      }
    } catch (error) {
      logger.error('OCR extraction failed:', error);
      throw error;
    }
  }

  /**
   * Extract text from PDF
   */
  async extractFromPDF(pdfData) {
    try {
      const data = await pdf(pdfData);
      
      return {
        text: data.text,
        confidence: 0.95, // PDF text extraction is typically very reliable
        method: 'pdf_text_extraction',
        pageCount: data.numpages,
        coordinates: [] // PDF text extraction doesn't provide coordinates easily
      };
    } catch (error) {
      logger.error('PDF text extraction failed:', error);
      throw new Error(`Failed to extract text from PDF: ${error.message}`);
    }
  }

  /**
   * Extract text from image using OCR
   */
  async extractFromImage(imageData) {
    try {
      // Preprocess image for better OCR results
      const processedImage = await this.preprocessImage(imageData);
      
      if (!this.tesseractWorker) {
        await this.initializeWorker();
      }

      const result = await this.tesseractWorker.recognize(processedImage);
      
      return {
        text: result.data.text,
        confidence: result.data.confidence / 100, // Convert to 0-1 scale
        method: 'tesseract_ocr',
        coordinates: this.extractCoordinates(result.data),
        processingDetails: {
          symbols: result.data.symbols?.length || 0,
          words: result.data.words?.length || 0,
          lines: result.data.lines?.length || 0,
          paragraphs: result.data.paragraphs?.length || 0
        }
      };
    } catch (error) {
      logger.error('Image OCR failed:', error);
      throw new Error(`Failed to extract text from image: ${error.message}`);
    }
  }

  /**
   * Preprocess image for better OCR results
   */
  async preprocessImage(imageData) {
    try {
      return await sharp(imageData)
        .greyscale() // Convert to grayscale
        .normalize() // Normalize contrast
        .sharpen() // Sharpen the image
        .resize({ width: 2000, height: 2000, fit: 'inside', withoutEnlargement: true }) // Resize if too large
        .png() // Convert to PNG for consistency
        .toBuffer();
    } catch (error) {
      logger.warn('Image preprocessing failed, using original:', error.message);
      return imageData; // Return original if preprocessing fails
    }
  }

  /**
   * Extract coordinate information from Tesseract result
   */
  extractCoordinates(tesseractData) {
    const coordinates = [];

    try {
      // Extract word-level coordinates
      if (tesseractData.words) {
        tesseractData.words.forEach((word, index) => {
          if (word.confidence > 60) { // Only include words with decent confidence
            coordinates.push({
              type: 'word',
              text: word.text,
              confidence: word.confidence / 100,
              bbox: {
                x: word.bbox.x0,
                y: word.bbox.y0,
                width: word.bbox.x1 - word.bbox.x0,
                height: word.bbox.y1 - word.bbox.y0
              }
            });
          }
        });
      }

      // Extract line-level coordinates
      if (tesseractData.lines) {
        tesseractData.lines.forEach((line, index) => {
          if (line.confidence > 60) {
            coordinates.push({
              type: 'line',
              text: line.text,
              confidence: line.confidence / 100,
              bbox: {
                x: line.bbox.x0,
                y: line.bbox.y0,
                width: line.bbox.x1 - line.bbox.x0,
                height: line.bbox.y1 - line.bbox.y0
              }
            });
          }
        });
      }
    } catch (error) {
      logger.warn('Failed to extract coordinates from OCR result:', error);
    }

    return coordinates;
  }

  /**
   * Extract specific patterns from text (tax-related)
   */
  extractTaxPatterns(text) {
    const patterns = {
      ssn: {
        regex: /\b\d{3}-?\d{2}-?\d{4}\b/g,
        description: 'Social Security Number'
      },
      ein: {
        regex: /\b\d{2}-?\d{7}\b/g,
        description: 'Employer Identification Number'
      },
      amounts: {
        regex: /\$?[\d,]+\.?\d*/g,
        description: 'Monetary amounts'
      },
      dates: {
        regex: /\b\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}\b/g,
        description: 'Dates'
      },
      taxYear: {
        regex: /\b20\d{2}\b/g,
        description: 'Tax year'
      },
      formNumbers: {
        regex: /\b(W-?2|1099|1040|Schedule [A-Z])\b/gi,
        description: 'Tax form numbers'
      }
    };

    const extractedPatterns = {};

    Object.entries(patterns).forEach(([key, pattern]) => {
      const matches = text.match(pattern.regex);
      if (matches) {
        extractedPatterns[key] = {
          matches: [...new Set(matches)], // Remove duplicates
          count: matches.length,
          description: pattern.description
        };
      }
    });

    return extractedPatterns;
  }

  /**
   * Validate OCR quality
   */
  validateOCRQuality(ocrResult) {
    const validation = {
      isValid: true,
      issues: [],
      recommendations: []
    };

    // Check overall confidence
    if (ocrResult.confidence < 0.7) {
      validation.issues.push('Low OCR confidence');
      validation.recommendations.push('Try uploading a clearer image');
      validation.isValid = false;
    }

    // Check if text was extracted
    if (!ocrResult.text || ocrResult.text.trim().length < 10) {
      validation.issues.push('Very little text extracted');
      validation.recommendations.push('Ensure document contains readable text');
      validation.isValid = false;
    }

    // Check for common OCR errors
    const commonErrors = ocrResult.text.match(/[^\w\s\.\,\-\$\%\(\)]/g);
    if (commonErrors && commonErrors.length > 10) {
      validation.issues.push('Many special characters detected (possible OCR errors)');
      validation.recommendations.push('Try improving image quality or orientation');
    }

    return validation;
  }

  /**
   * Clean up worker on shutdown
   */
  async terminate() {
    try {
      if (this.tesseractWorker) {
        await this.tesseractWorker.terminate();
        logger.info('Tesseract worker terminated');
      }
    } catch (error) {
      logger.error('Error terminating Tesseract worker:', error);
    }
  }
}

module.exports = new OCRService();

// Graceful shutdown
process.on('SIGTERM', async () => {
  const ocrService = require('./ocrService');
  await ocrService.terminate();
});

process.on('SIGINT', async () => {
  const ocrService = require('./ocrService');
  await ocrService.terminate();
});
