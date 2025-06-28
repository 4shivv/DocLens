# DocuLens Frontend

A modern React application for AI-powered tax document analysis with interactive visualization.

## 🚀 Features

- **Modern React 18** with TypeScript for type safety
- **Responsive Design** using Tailwind CSS
- **Interactive Document Viewer** with issue highlighting
- **Real-time Processing Status** with polling
- **Drag & Drop File Upload** with validation
- **Comprehensive Analysis Results** with visual summaries
- **Component Library** using Radix UI primitives
- **State Management** with React Query
- **Routing** with React Router
- **Toast Notifications** for user feedback

## 📁 Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── ui/              # Base UI components (Button, Card, etc.)
│   ├── layout/          # Layout components (Header, Layout)
│   ├── upload/          # Document upload components
│   ├── processing/      # Processing status components
│   ├── viewer/          # Document viewer components
│   └── analysis/        # Analysis results components
├── pages/               # Page components
│   ├── HomePage.tsx     # Landing page
│   ├── UploadPage.tsx   # Upload and processing flow
│   └── AnalysisPage.tsx # Results display
├── hooks/               # Custom React hooks
│   ├── useDocumentUpload.ts     # File upload logic
│   ├── useProcessingStatus.ts   # Status polling
│   └── useToast.ts             # Toast notifications
├── services/            # API integration
│   ├── api.ts          # Axios configuration
│   └── documentService.ts      # Document API calls
├── types/              # TypeScript definitions
│   └── index.ts        # All application types
├── lib/                # Utility functions
│   └── utils.ts        # Helper functions
└── globals.css         # Global styles
```

## 🛠️ Tech Stack

### Core
- **React 18** - UI framework with concurrent features
- **TypeScript** - Type safety and better DX
- **Vite** - Fast build tool and dev server

### Styling
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Headless UI primitives
- **Lucide React** - Beautiful icons

### State & Data
- **TanStack Query** - Server state management
- **React Router** - Client-side routing
- **Axios** - HTTP client with interceptors

### Document Processing
- **PDF.js** - PDF rendering (future integration)
- **Fabric.js** - Canvas-based annotations (future integration)

### Development
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Vitest** - Unit testing

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Backend API running on `http://localhost:3000`

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Environment setup**
   Create `.env.local` file:
   ```env
   VITE_API_URL=http://localhost:3000/api
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open browser**
   Visit `http://localhost:5173`

### Available Scripts

```bash
# Development
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build

# Code Quality
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking

# Testing
npm run test         # Run tests
npm run test:ui      # Run tests with UI
```

## 🔧 Configuration

### Vite Configuration
- **Proxy setup** for API calls to backend
- **Path aliases** for clean imports (`@/components`)
- **React SWC** for fast refresh

### Tailwind Configuration
- **Custom color palette** for tax document themes
- **Extended animations** for smooth UX
- **Responsive breakpoints** for mobile-first design

### TypeScript Configuration
- **Strict mode** enabled for better type safety
- **Path mapping** for organized imports
- **Modern ES features** support

## 📱 Responsive Design

The application is fully responsive with:
- **Mobile-first** approach
- **Tablet optimizations** for document viewing
- **Desktop enhancements** for analysis workflows
- **Touch-friendly** interactions

## 🎨 Component System

### Base Components (`components/ui/`)
- `Button` - Styled button with variants
- `Card` - Container component for content
- `Badge` - Status and label indicators
- `Progress` - Progress bars for uploads/processing
- `Toast` - Notification system

### Feature Components
- `DocumentUpload` - Drag & drop file upload
- `ProcessingStatus` - Real-time status updates
- `DocumentViewer` - Interactive document display
- `ResultsSummary` - Analysis overview
- `IssuesList` - Detailed issue breakdown

## 🔌 API Integration

### Service Layer
All API calls are centralized in `services/`:

```typescript
// Document upload
const result = await uploadDocument(file);

// Status polling
const status = await pollDocumentStatus(documentId);

// Analysis results
const analysis = await getDocumentAnalysis(documentId);
```

### Error Handling
- **Axios interceptors** for global error handling
- **Toast notifications** for user feedback
- **Retry logic** for failed requests
- **Loading states** throughout the app

## 🎯 Key Features Implementation

### File Upload
- **Drag & drop** with visual feedback
- **File validation** (type, size, format)
- **Progress tracking** with real-time updates
- **Error handling** with actionable messages

### Document Processing
- **Real-time status polling** every 3 seconds
- **Progress visualization** with stages
- **Automatic navigation** to results
- **Error recovery** with retry options

### Results Visualization
- **Interactive document viewer** with annotations
- **Issue highlighting** with hover details
- **Tabbed interface** for different views
- **Downloadable reports** in multiple formats

### User Experience
- **Loading states** for all async operations
- **Optimistic updates** where appropriate
- **Error boundaries** for graceful failures
- **Keyboard navigation** support

## 🔒 Security Considerations

- **File validation** on client and server
- **XSS prevention** in dynamic content
- **CSRF protection** via proper headers
- **Secure API communication** with tokens

## 📊 Performance Optimizations

- **Code splitting** with React.lazy()
- **Image optimization** with proper formats
- **Bundle analysis** for size monitoring
- **Memoization** for expensive calculations

## 🧪 Testing Strategy

### Unit Tests
- **Component testing** with React Testing Library
- **Hook testing** for custom hooks
- **Utility testing** for helper functions

### Integration Tests
- **API integration** testing
- **User flow** testing
- **Error scenario** testing

## 🚀 Deployment

### Build Process
```bash
npm run build
```

### Environment Variables
```env
VITE_API_URL=https://api.doclens.com/api
VITE_APP_VERSION=1.0.0
```

### Static Hosting
The built application can be deployed to:
- **Vercel** (recommended)
- **Netlify**
- **AWS S3 + CloudFront**
- **Any static hosting service**

## 🤝 Contributing

1. **Fork the repository**
2. **Create feature branch** (`git checkout -b feature/amazing-feature`)
3. **Follow code standards** (ESLint + Prettier)
4. **Add tests** for new functionality
5. **Commit changes** (`git commit -m 'Add amazing feature'`)
6. **Push to branch** (`git push origin feature/amazing-feature`)
7. **Open Pull Request**

### Code Standards
- **TypeScript** for all new code
- **ESLint rules** must pass
- **Component documentation** with JSDoc
- **Responsive design** required
- **Accessibility** WCAG 2.1 compliance

## 📝 Todo / Roadmap

### Short Term
- [ ] Add PDF.js integration for better document rendering
- [ ] Implement Fabric.js for interactive annotations
- [ ] Add more comprehensive error boundaries
- [ ] Improve mobile responsiveness

### Medium Term
- [ ] User authentication and accounts
- [ ] Document history and management
- [ ] Advanced filtering and search
- [ ] Bulk document processing

### Long Term
- [ ] Real-time collaboration features
- [ ] Advanced analytics dashboard
- [ ] Mobile applications
- [ ] API for third-party integrations

## 🔗 Related

- **Backend API**: [../backend/README.md](../backend/README.md)
- **Shared Types**: [../shared/README.md](../shared/README.md)
- **Docker Setup**: [../docker/README.md](../docker/README.md)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.
