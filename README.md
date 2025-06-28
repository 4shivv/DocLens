# 🧾 DocuLens - AI-Powered Tax Document Analysis

> **Transform tax confusion into clarity with AI-powered document analysis**

DocuLens is an intelligent web application that scans uploaded tax documents (PDFs, photos, or scanned images), detects potential red flags like missing data or inconsistencies, and visually explains what's wrong in a simple, interactive format.

## 🌟 Features

- **🔍 Smart Document Analysis**: Uses Google Gemini AI to understand tax documents
- **📋 Issue Detection**: Identifies missing fields, inconsistencies, and formatting errors  
- **💡 Plain English Explanations**: Converts complex tax jargon into simple language
- **🎯 Visual Feedback**: Highlights problem areas directly on your document
- **📊 Risk Assessment**: Provides completeness scores and risk levels
- **📱 Multiple Formats**: Supports PDFs and images (JPG, PNG)

## 🧠 What Problem Does It Solve?

- **Understanding**: Most people don't understand what's inside their W2, 1099, or 1040 forms
- **Accuracy**: They often file with missing data, misclassified deductions, or formatting issues
- **Consequences**: This leads to rejections, audits, or financial penalties
- **Accessibility**: Many can't afford a CPA or don't know what questions to ask
- **Solution**: DocuLens provides a visual, AI-guided walkthrough—like having a tax assistant beside you

## 🔁 How It Works

1. **📤 Upload**: User uploads a scanned or photographed tax document
2. **🔍 OCR**: Tesseract.js extracts text and spatial layout from images
3. **🏗️ Parse**: Text parser extracts key tax-relevant fields into structured JSON
4. **⚠️ Validate**: Rule-based engine identifies common issues (missing EIN, line mismatches)
5. **🤖 Analyze**: Gemini API simplifies jargon, ranks red flags, and generates summaries
6. **🎨 Visualize**: Fabric.js overlays colored boxes and tooltips on the original document
7. **📋 Report**: User gets interactive visual experience and downloadable report

## 🏗️ Project Structure

```
DocuLens/
├── backend/                 # Node.js + Express API
│   ├── src/
│   │   ├── controllers/     # API endpoint handlers
│   │   ├── services/        # Business logic (OCR, AI, processing)
│   │   ├── middleware/      # Auth, validation, rate limiting
│   │   ├── models/          # Data schemas and types
│   │   ├── routes/          # API route definitions
│   │   ├── utils/           # Helper functions and utilities
│   │   └── config/          # Firebase, Gemini, and app config
│   ├── tests/               # Unit and integration tests
│   ├── uploads/             # Temporary file storage
│   └── docs/                # API documentation
├── frontend/                # React web application (future)
├── shared/                  # Shared types and constants
└── docker/                  # Container configuration
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Firebase project with Firestore & Storage
- Google Gemini API key

### Backend Setup

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your Firebase and Gemini credentials

# Start development server
npm run dev
```

### API Testing
```bash
# Health check
curl http://localhost:3000/api/health

# Upload document
curl -X POST -F "document=@your-tax-form.pdf" \
  http://localhost:3000/api/documents/upload
```

## 📚 Tech Stack

### Backend
- **Runtime**: Node.js 18+ with Express.js
- **Database**: Firebase Firestore (document storage)
- **File Storage**: Firebase Storage (file persistence) 
- **AI/ML**: Google Gemini 2.5 Flash API
- **OCR**: Tesseract.js (fallback text extraction)
- **Processing**: Bull.js + Redis (async job queues)
- **Security**: Helmet, CORS, rate limiting, input validation

### Frontend (Planned)
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS
- **Document Viewer**: PDF.js + Fabric.js for annotations
- **State Management**: Redux Toolkit or Zustand
- **File Upload**: react-dropzone

## 📋 API Endpoints

### Document Management
```http
POST   /api/documents/upload        # Upload tax document
GET    /api/documents/{id}          # Get document details  
GET    /api/documents/{id}/status   # Check processing status
GET    /api/documents/{id}/results  # Get analysis results
GET    /api/documents/{id}/report   # Download formatted report
DELETE /api/documents/{id}          # Delete document
```

### System
```http
GET /api/health                     # Health check
GET /api/documents/supported-formats # Supported file types
```

## 🧪 Development

### Running Tests
```bash
cd backend

# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test
npm test -- documentService.test.js
```

### Code Quality
```bash
# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format
```

### Docker Development
```bash
# Build and run with Docker Compose
docker-compose -f docker/docker-compose.yml up --build

# Backend will be available at http://localhost:3000
# Redis will be available at localhost:6379
```

## 🔒 Security Features

- **File Validation**: Magic number checking, size limits, type restrictions
- **Rate Limiting**: Configurable per endpoint to prevent abuse
- **Input Sanitization**: XSS prevention and data validation
- **Error Handling**: Structured responses without sensitive data exposure
- **API Security**: CORS configuration, security headers

## 📊 Monitoring & Analytics

### Logging
- Structured logging with Winston
- Separate log files for errors, HTTP requests, and general application events
- Log rotation and retention policies

### Metrics
- Processing performance tracking
- Gemini API usage monitoring
- Error rate analysis
- File upload statistics

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Write tests for new functionality
4. Ensure all tests pass (`npm test`)
5. Commit changes (`git commit -m 'Add amazing feature'`)
6. Push to branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Code Standards
- Follow ESLint configuration
- Maintain test coverage above 80%
- Document new API endpoints
- Use conventional commit messages

## 📈 Roadmap

### Phase 1: MVP Backend (Current)
- [x] File upload and validation
- [x] Gemini AI integration
- [x] Basic OCR fallback
- [x] Document processing pipeline
- [x] API endpoints and documentation

### Phase 2: Frontend Development
- [ ] React application setup
- [ ] Document upload interface
- [ ] Processing status tracking
- [ ] Results visualization
- [ ] Issue highlighting with Fabric.js

### Phase 3: Enhanced Features
- [ ] User authentication and accounts
- [ ] Document history and management
- [ ] Advanced tax form support
- [ ] Batch processing capabilities
- [ ] Mobile-responsive design

### Phase 4: Production Ready
- [ ] Performance optimization
- [ ] Advanced monitoring
- [ ] Deployment automation
- [ ] User feedback system
- [ ] Analytics and insights

## 🔧 Configuration

### Environment Variables
See `backend/.env.example` for all required configuration options.

### Firebase Setup
1. Create Firebase project
2. Enable Firestore Database and Storage
3. Generate service account key
4. Configure security rules

### Gemini API Setup
1. Get API key from Google AI Studio
2. Configure rate limits and quotas
3. Set up usage monitoring

## 📞 Support

### Common Issues
- **File Upload Errors**: Check file size limits and supported formats
- **Processing Failures**: Verify Gemini API key and network connectivity  
- **Database Issues**: Confirm Firebase credentials and permissions

### Getting Help
- 📖 Check the [API Documentation](backend/README.md)
- 🐛 Report bugs via GitHub Issues
- 💬 Join discussions in GitHub Discussions
- 📧 Contact support for critical issues

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Google Gemini**: For powerful document understanding capabilities
- **Firebase**: For reliable backend infrastructure
- **Tesseract.js**: For OCR functionality
- **Open Source Community**: For the amazing tools and libraries

---

**Made with ❤️ for taxpayers everywhere who deserve clarity in their financial documents.**
