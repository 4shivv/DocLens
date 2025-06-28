import { Link } from "react-router-dom";
import { 
  FileText, 
  Upload, 
  Brain, 
  Shield, 
  Clock, 
  CheckCircle,
  ArrowRight,
  Zap,
  Eye,
  Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Layout from "@/components/layout/Layout";

export default function HomePage() {
  const features = [
    {
      icon: <Brain className="h-6 w-6" />,
      title: "AI-Powered Analysis",
      description: "Advanced AI understands tax forms and identifies potential issues automatically",
      highlight: "95% accuracy rate"
    },
    {
      icon: <Eye className="h-6 w-6" />,
      title: "Visual Issue Detection",
      description: "See exactly where problems are located with interactive document annotations",
      highlight: "Interactive highlights"
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Privacy & Security",
      description: "Your documents are processed securely and deleted after analysis",
      highlight: "Bank-level security"
    },
    {
      icon: <Clock className="h-6 w-6" />,
      title: "Instant Results",
      description: "Get comprehensive analysis results in under 2 minutes",
      highlight: "< 2 min processing"
    }
  ];

  const supportedForms = [
    "W-2 Wage and Tax Statement",
    "1099 Forms (All Types)",
    "1040 Individual Income Tax Return",
    "Schedule A (Itemized Deductions)",
    "Schedule C (Business Income)",
    "Schedule D (Capital Gains)",
    "Form 8829 (Home Office)",
    "And many more..."
  ];

  const stats = [
    { label: "Documents Analyzed", value: "10,000+", icon: <FileText className="h-5 w-5" /> },
    { label: "Issues Detected", value: "50,000+", icon: <CheckCircle className="h-5 w-5" /> },
    { label: "Happy Users", value: "2,500+", icon: <Users className="h-5 w-5" /> },
    { label: "Average Processing", value: "90 sec", icon: <Zap className="h-5 w-5" /> }
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="gradient-bg py-16 px-4">
        <div className="container mx-auto max-w-6xl text-center">
          <Badge variant="secondary" className="mb-6">
            🎯 AI-Powered Tax Document Analysis
          </Badge>
          
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Transform Tax Confusion into
            <span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              {" "}Clarity
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Upload your tax documents and get instant AI-powered analysis. 
            Identify missing information, detect errors, and understand your forms 
            with visual explanations—like having a tax expert by your side.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button asChild size="lg" className="text-lg px-8 py-4">
              <Link to="/upload">
                <Upload className="mr-2 h-5 w-5" />
                Upload Document
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            
            <Button variant="outline" size="lg" className="text-lg px-8 py-4">
              See How It Works
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div className="text-primary">{stat.icon}</div>
                  <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                </div>
                <p className="text-sm text-gray-600">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose DocuLens?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Powered by advanced AI technology to make tax document analysis simple and accurate
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-lg text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                      {feature.icon}
                    </div>
                    <div>
                      <CardTitle className="text-xl mb-1">{feature.title}</CardTitle>
                      <Badge variant="secondary" className="text-xs">
                        {feature.highlight}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600">
              Get professional tax document analysis in three simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                title: "Upload Your Document",
                description: "Drag and drop or select your tax form (PDF or image)",
                icon: <Upload className="h-8 w-8" />
              },
              {
                step: "2", 
                title: "AI Analysis",
                description: "Our AI reads, understands, and analyzes your document",
                icon: <Brain className="h-8 w-8" />
              },
              {
                step: "3",
                title: "Get Results",
                description: "View issues, completeness score, and recommendations",
                icon: <CheckCircle className="h-8 w-8" />
              }
            ].map((step, index) => (
              <div key={index} className="text-center">
                <div className="relative mb-6">
                  <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-4">
                    {step.icon}
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">
                    {step.step}
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Supported Forms */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Supported Tax Forms
            </h2>
            <p className="text-xl text-gray-600">
              We support all major tax forms and documents
            </p>
          </div>

          <Card className="max-w-4xl mx-auto">
            <CardContent className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {supportedForms.map((form, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-success-500" />
                    <span className="text-gray-700">{form}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-primary text-white">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Analyze Your Tax Documents?
          </h2>
          <p className="text-xl text-primary-foreground/90 mb-8">
            Join thousands of users who trust DocuLens for accurate tax document analysis
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" variant="secondary" className="text-lg px-8 py-4">
              <Link to="/upload">
                <Upload className="mr-2 h-5 w-5" />
                Start Analysis
              </Link>
            </Button>
            
            <Button variant="outline" size="lg" className="text-lg px-8 py-4 border-white text-white hover:bg-white hover:text-primary">
              Learn More
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
}
