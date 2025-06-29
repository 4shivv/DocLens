const { GoogleGenerativeAI } = require('@google/generative-ai');
const logger = require('../utils/logger');

class GeminiService {
  constructor() {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY environment variable is required');
    }
    
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
  }

  /**
   * Analyze tax document with Gemini AI
   */
  async analyzeDocument(fileData, mimeType, fileName) {
    try {
      const prompt = this.buildTaxAnalysisPrompt(fileName);
      
      const imagePart = {
        inlineData: {
          data: fileData.toString('base64'),
          mimeType: mimeType
        }
      };

      const result = await this.model.generateContent([prompt, imagePart]);
      const response = result.response;
      const analysisText = response.text();

      // Parse the structured response
      const analysis = this.parseAnalysisResponse(analysisText);
      
      logger.info(`Document analysis completed for: ${fileName}`);
      return analysis;
    } catch (error) {
      logger.error('Gemini API error:', error);
      throw new Error(`AI analysis failed: ${error.message}`);
    }
  }

  /**
   * Upload large file to Gemini File API
   */
  async uploadLargeFile(fileData, mimeType, displayName) {
    try {
      // Note: This is a placeholder for the File API implementation
      // You'll need to implement the actual File API upload here
      // based on the Gemini File API documentation
      
      logger.info(`Large file uploaded to Gemini: ${displayName}`);
      return { fileUri: 'placeholder-file-uri' };
    } catch (error) {
      logger.error('Gemini File API error:', error);
      throw error;
    }
  }

  /**
   * Build comprehensive tax analysis prompt
   */
  buildTaxAnalysisPrompt(fileName) {
    return `
You are an expert tax document analyzer. Analyze this tax document and provide a structured JSON response with the following format:

{
  "formType": "W2" | "1099" | "1040" | "Schedule C" | "unknown",
  "confidence": 0.0-1.0,
  "extractedFields": {
    // Key-value pairs of detected tax fields
    "employerName": "string",
    "employeeSSN": "string", 
    "wages": "number",
    "federalTaxWithheld": "number",
    // Add more fields based on form type
  },
  "detectedIssues": [
    {
      "type": "missing_field" | "inconsistent_data" | "formatting_error" | "calculation_error",
      "severity": "low" | "medium" | "high",
      "field": "field_name",
      "description": "Human-readable description of the issue",
      "suggestion": "Actionable suggestion to fix the issue",
      "coordinates": {
        "x": 0,
        "y": 0,
        "width": 100,
        "height": 50
      }
    }
  ],
  "simplifiedSummary": "Plain English explanation of what this document is and any critical issues found",
  "completenessScore": 0.0-1.0,
  "riskLevel": "low" | "medium" | "high"
}

Key analysis requirements:
1. Identify the type of tax form
2. Extract all numerical values and key information
3. Check for missing required fields
4. Verify calculations and cross-references
5. Flag potential red flags or inconsistencies
6. Provide spatial coordinates for issues when possible
7. Use simple, non-technical language in explanations

Document filename: ${fileName}

Please analyze thoroughly and return only the JSON response.`;
  }

  /**
   * Parse and validate Gemini response
   */
  parseAnalysisResponse(responseText) {
    try {
      // Clean the response to extract JSON
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in response');
      }

      const analysis = JSON.parse(jsonMatch[0]);
      
      // Validate required fields
      const requiredFields = ['formType', 'confidence', 'extractedFields', 'detectedIssues', 'simplifiedSummary'];
      for (const field of requiredFields) {
        if (!(field in analysis)) {
          logger.warn(`Missing required field in analysis: ${field}`);
        }
      }

      // Ensure detectedIssues is an array
      if (!Array.isArray(analysis.detectedIssues)) {
        analysis.detectedIssues = [];
      }

      // Set defaults for missing fields
      analysis.confidence = analysis.confidence || 0.5;
      analysis.completenessScore = analysis.completenessScore || 0.5;
      analysis.riskLevel = analysis.riskLevel || 'medium';

      return analysis;
    } catch (error) {
      logger.error('Failed to parse Gemini response:', error);
      
      // Return a fallback analysis structure
      return {
        formType: 'unknown',
        confidence: 0.3,
        extractedFields: {},
        detectedIssues: [{
          type: 'processing_error',
          severity: 'high',
          field: 'general',
          description: 'Unable to fully process document. Manual review recommended.',
          suggestion: 'Please ensure document is clear and properly oriented.'
        }],
        simplifiedSummary: 'Document analysis encountered errors. Please review manually or try uploading a clearer image.',
        completenessScore: 0.3,
        riskLevel: 'high'
      };
    }
  }

  /**
   * Simplify complex tax language using Gemini
   */
  async simplifyTaxLanguage(complexText) {
    try {
      const prompt = `
Simplify this tax-related text into plain English that a non-expert can understand:

"${complexText}"

Make it:
- Clear and simple
- Free of jargon
- Actionable when possible
- Under 200 words

Response:`;

      const result = await this.model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      logger.error('Error simplifying tax language:', error);
      return complexText; // Return original if simplification fails
    }
  }
}

module.exports = new GeminiService();
