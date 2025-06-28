# DocuLens Backend API

Complete backend architecture for AI-powered tax document analysis.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Firebase project setup
- Google Gemini API key

### Installation

1. **Clone and navigate to backend directory**
```bash
cd backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment Setup**
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Start development server**
```bash
npm run dev
```

## 📋 Environment Variables

### Required Variables
```bash
# Server Configuration
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:3000

# Firebase Configuration
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_KEY\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@your-project.iam.gserviceaccount.com

# Google Gemini API
GEMINI_API_KEY=your-gemini-api-key-here

# File Upload Configuration
MAX_FILE_SIZE=52428800  # 50MB
ALLOWED_FILE_TYPES=pdf,jpg,jpeg,png
UPLOAD_PATH=./uploads
```

## 🏗️ Architecture Overview

### Core Components

```
src/
├── controllers/     # Request handlers
├── services/        # Business logic
├── middleware/      # Auth, validation, rate limiting
├── models/          # Data schemas and types
├── routes/          # API endpoints
├── utils/           # Helper functions
└── config/          # Configuration files
```

### Processing Pipeline

1. **File Upload** → Multer handles multipart uploads
2. **Validation** → File type, size, virus scanning
3. **Storage** → Firebase Storage for persistence
4. **OCR/AI Analysis** → Gemini API for document analysis
5. **Results Storage** → Firestore for metadata and results
6. **Response** → Structured JSON with analysis results

## 📚 API Documentation

### Document Endpoints

#### Upload Document
```http
POST /api/documents/upload
Content-Type: multipart/form-data

# Body: file upload (document field)
# Returns: documentId and processing status
```

#### Get Document Status
```http
GET /api/documents/{id}/status
# Returns: processing status and progress
```

#### Get Analysis Results
```http
GET /api/documents/{id}/results
# Returns: complete analysis with detected issues
```

#### Download Report
```http
GET /api/documents/{id}/report?format=json
# Returns: formatted analysis report
```

### Health Check
```http
GET /api/health
# Returns: service health status
```

## 🔧 Development Commands

```bash
# Development
npm run dev          # Start with nodemon
npm start           # Production start

# Testing
npm test            # Run all tests
npm run test:watch  # Watch mode
npm run test:coverage # Coverage report

# Code Quality
npm run lint        # ESLint check
npm run lint:fix    # Auto-fix issues

# Documentation
npm run docs        # Generate API docs
```

## 🐳 Docker Deployment

### Build and Run
```bash
# Build image
docker build -t doculens-backend -f docker/Dockerfile .

# Run with docker-compose
docker-compose -f docker/docker-compose.yml up
```

### Environment Variables for Docker
```bash
# Create .env file for docker-compose
cp .env.example .env.docker
# Edit with production values
```

## 🧪 Testing

### Test Structure
```
tests/
├── unit/           # Unit tests for services
├── integration/    # API endpoint tests
└── fixtures/       # Test files and data
```

### Running Tests
```bash
# All tests
npm test

# Specific test file
npm test -- documentService.test.js

# With coverage
npm run test:coverage
```

## 📊 Monitoring & Logging

### Log Levels
- **error**: Critical issues requiring immediate attention
- **warn**: Important events and security issues
- **info**: General application events
- **http**: HTTP request/response logging
- **debug**: Detailed debugging information

### Log Files
```
logs/
├── error-YYYY-MM-DD.log      # Error logs
├── combined-YYYY-MM-DD.log   # All logs
├── http-YYYY-MM-DD.log       # HTTP logs
├── exceptions.log            # Uncaught exceptions
└── rejections.log            # Unhandled rejections
```

## 🔒 Security Features

- **Rate Limiting**: Configurable per endpoint
- **File Validation**: Magic number checking
- **Input Sanitization**: XSS prevention
- **Error Handling**: Structured error responses
- **CORS**: Configurable origins
- **Helmet**: Security headers

## 🚨 Error Handling

### Error Types
```javascript
// API Errors
ApiError(statusCode, message, details)
ValidationError(message, details)
ProcessingError(message, stage)
ServiceUnavailableError(message, service)
```

### Error Response Format
```json
{
  "success": false,
  "error": {
    "message": "Error description",
    "type": "ErrorType",
    "details": {},
    "requestId": "uuid"
  }
}
```

## 📈 Performance Considerations

### Optimizations
- **Async Processing**: Background job queues
- **File Compression**: Image preprocessing
- **Caching**: Redis for repeated requests
- **Connection Pooling**: Database connections
- **Rate Limiting**: Prevent abuse

### Monitoring Metrics
- Request/response times
- Processing duration
- Gemini API usage
- Error rates
- File upload sizes

## 🔧 Configuration

### Firebase Setup
1. Create Firebase project
2. Enable Firestore and Storage
3. Generate service account key
4. Add credentials to environment

### Gemini API Setup
1. Get API key from Google AI Studio
2. Configure rate limits
3. Set up monitoring

## 🤝 Contributing

### Code Style
- Follow ESLint configuration
- Use Prettier for formatting
- Write tests for new features
- Document API changes

### Pull Request Process
1. Fork repository
2. Create feature branch
3. Write tests
4. Update documentation
5. Submit pull request

## 📞 Support

### Common Issues

**File Upload Fails**
- Check file size limits
- Verify file type support
- Check storage permissions

**Processing Errors**
- Verify Gemini API key
- Check network connectivity
- Review error logs

**Database Connection**
- Verify Firebase credentials
- Check project permissions
- Review security rules

## 📄 License

MIT License - see LICENSE file for details.

---

## 🔄 API Response Examples

### Successful Upload
```json
{
  "success": true,
  "message": "Document uploaded successfully",
  "data": {
    "documentId": "uuid-here",
    "fileName": "tax-form.pdf",
    "fileSize": 1048576,
    "status": "processing",
    "estimatedProcessingTime": "2-5 minutes"
  }
}
```

### Analysis Results
```json
{
  "success": true,
  "data": {
    "documentId": "uuid-here",
    "formType": "W2",
    "completenessScore": 0.95,
    "riskLevel": "low",
    "detectedIssues": [
      {
        "type": "missing_field",
        "severity": "medium",
        "field": "state_tax",
        "description": "State tax withholding amount appears to be missing",
        "suggestion": "Verify state tax information with your employer"
      }
    ],
    "simplifiedSummary": "This W-2 form is mostly complete with one minor issue detected.",
    "extractedFields": {
      "employerName": "Acme Corporation",
      "wages": 75000,
      "federalTaxWithheld": 12000
    }
  }
}
```
