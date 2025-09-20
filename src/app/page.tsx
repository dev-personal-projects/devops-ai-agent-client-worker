import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Bot,
  Github,
  GitBranch,
  BarChart3,
  MessageSquare,
  Settings,
  Zap,
  Shield,
  TrendingUp,
  ArrowRight,
  CheckCircle,
  GalleryVerticalEnd,
  ChevronRight,
  Sparkles,
  Users,
  Clock,
  Target
} from "lucide-react";
import Link from "next/link";

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4 mx-auto">
          <div className="flex items-center gap-2">
            <div className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-lg">
              <GalleryVerticalEnd className="size-4" />
            </div>
            <span className="text-xl font-bold">DevOps I-AGT</span>
          </div>
          
          <nav className="hidden md:flex items-center gap-6">
            <Link href="#features" className="text-sm font-medium hover:text-primary transition-colors">
              Features
            </Link>
            <Link href="#benefits" className="text-sm font-medium hover:text-primary transition-colors">
              Benefits
            </Link>
            <Link href="#pricing" className="text-sm font-medium hover:text-primary transition-colors">
              Pricing
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <ModeToggle />
            <Button variant="ghost" asChild className="hidden sm:inline-flex">
              <Link href="/auth/login">Sign In</Link>
            </Button>
            <Button asChild>
              <Link href="/auth/signup">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative py-20 lg:py-32">
          <div className="container px-4 mx-auto">
            <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
              <div className="space-y-8">
                <div className="space-y-4">
                  <Badge variant="secondary" className="w-fit">
                    <Sparkles className="w-3 h-3 mr-1" />
                    AI-Powered DevOps Platform
                  </Badge>
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
                    Revolutionize Your{" "}
                    <span className="text-primary">DevOps Workflow</span>{" "}
                    with AI
                  </h1>
                  <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl">
                    Streamline deployments, analyze code quality, and optimize infrastructure 
                    with intelligent automation. Your AI-powered DevOps assistant that learns 
                    and adapts to your team's workflow.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Button size="lg" asChild className="group">
                    <Link href="/auth/signup">
                      Start Free Trial
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </Button>
                  <Button variant="outline" size="lg" asChild>
                    <Link href="#features">Learn More</Link>
                  </Button>
                </div>

                <div className="flex items-center gap-8 pt-4">
                  <div className="flex items-center gap-2">
                    <Github className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">GitHub Integration</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Enterprise Security</span>
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 blur-3xl"></div>
                <Card className="relative border-2 shadow-2xl">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">DevOps Dashboard</CardTitle>
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <GitBranch className="h-4 w-4 text-green-500" />
                          <span className="text-sm">Deployments</span>
                        </div>
                        <div className="text-2xl font-bold">47</div>
                        <div className="text-xs text-muted-foreground">This month</div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <BarChart3 className="h-4 w-4 text-blue-500" />
                          <span className="text-sm">Code Quality</span>
                        </div>
                        <div className="text-2xl font-bold">94%</div>
                        <div className="text-xs text-muted-foreground">Score</div>
                      </div>
                    </div>
                    <Separator />
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>AI Recommendations</span>
                        <Badge variant="secondary">3 New</Badge>
                      </div>
                      <div className="space-y-1 text-xs text-muted-foreground">
                        <div>• Optimize Docker build time</div>
                        <div>• Update dependency versions</div>
                        <div>• Infrastructure scaling alert</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 bg-muted/30">
          <div className="container px-4 mx-auto">
            <div className="text-center space-y-4 mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold">
                Comprehensive DevOps Solutions
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Everything you need to streamline your development and deployment processes
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <MessageSquare className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>AI-Powered Chat Assistant</CardTitle>
                  <CardDescription>
                    Conversational AI that understands your DevOps challenges and provides 
                    intelligent solutions and recommendations.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <Bot className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Intelligent Code Analysis</CardTitle>
                  <CardDescription>
                    Advanced codebase scanning with AI-driven insights for code quality, 
                    security vulnerabilities, and performance optimization.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <BarChart3 className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Infrastructure Monitoring</CardTitle>
                  <CardDescription>
                    Real-time infrastructure analysis with predictive insights and 
                    automated scaling recommendations.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <Github className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>GitHub Integration</CardTitle>
                  <CardDescription>
                    Seamless integration with GitHub repositories, pull requests, and 
                    organizations for comprehensive project management.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <Settings className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Automated Deployments</CardTitle>
                  <CardDescription>
                    Intelligent deployment pipelines with automated testing, rollback 
                    capabilities, and environment management.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <TrendingUp className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Performance Analytics</CardTitle>
                  <CardDescription>
                    Comprehensive analytics and reporting with actionable insights to 
                    optimize your development workflow.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section id="benefits" className="py-20">
          <div className="container px-4 mx-auto">
            <div className="grid gap-16 lg:grid-cols-2 items-center">
              <div className="space-y-8">
                <div className="space-y-4">
                  <h2 className="text-3xl sm:text-4xl font-bold">
                    Why Choose DevOps I-AGT?
                  </h2>
                  <p className="text-lg text-muted-foreground">
                    Transform your development process with AI-driven automation 
                    and intelligent insights that adapt to your team's needs.
                  </p>
                </div>

                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                        <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">Reduce Deployment Time by 80%</h3>
                      <p className="text-muted-foreground">
                        Automated pipelines and intelligent decision-making drastically 
                        reduce manual intervention and deployment cycles.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                        <Zap className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">Increase Code Quality</h3>
                      <p className="text-muted-foreground">
                        AI-powered code analysis identifies potential issues before 
                        they reach production, improving overall code quality.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                        <Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">Enhanced Team Collaboration</h3>
                      <p className="text-muted-foreground">
                        Centralized dashboard and intelligent notifications keep your 
                        entire team aligned and productive.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-6">
                  <Card className="p-6 text-center hover:shadow-lg transition-shadow">
                    <Clock className="h-8 w-8 text-primary mx-auto mb-4" />
                    <div className="text-3xl font-bold mb-2">10x</div>
                    <div className="text-sm text-muted-foreground">Faster Issue Resolution</div>
                  </Card>
                  <Card className="p-6 text-center hover:shadow-lg transition-shadow">
                    <Target className="h-8 w-8 text-primary mx-auto mb-4" />
                    <div className="text-3xl font-bold mb-2">99.9%</div>
                    <div className="text-sm text-muted-foreground">Deployment Success Rate</div>
                  </Card>
                </div>
                <div className="space-y-6 sm:translate-y-8">
                  <Card className="p-6 text-center hover:shadow-lg transition-shadow">
                    <TrendingUp className="h-8 w-8 text-primary mx-auto mb-4" />
                    <div className="text-3xl font-bold mb-2">75%</div>
                    <div className="text-sm text-muted-foreground">Reduction in Manual Tasks</div>
                  </Card>
                  <Card className="p-6 text-center hover:shadow-lg transition-shadow">
                    <Shield className="h-8 w-8 text-primary mx-auto mb-4" />
                    <div className="text-3xl font-bold mb-2">100%</div>
                    <div className="text-sm text-muted-foreground">Security Compliance</div>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-primary/5">
          <div className="container px-4 mx-auto text-center">
            <div className="max-w-3xl mx-auto space-y-8">
              <div className="space-y-4">
                <h2 className="text-3xl sm:text-4xl font-bold">
                  Ready to Transform Your DevOps?
                </h2>
                <p className="text-lg text-muted-foreground">
                  Join thousands of developers who have revolutionized their workflows 
                  with our AI-powered DevOps platform. Start your free trial today.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" asChild className="group">
                  <Link href="/auth/signup">
                    Start Free Trial
                    <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link href="/auth/login">Sign In</Link>
                </Button>
              </div>

              <p className="text-sm text-muted-foreground">
                No credit card required • 14-day free trial • Cancel anytime
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="container px-4 mx-auto">
          <div className="grid gap-8 md:grid-cols-4">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
                  <GalleryVerticalEnd className="size-3" />
                </div>
                <span className="font-bold">DevOps I-AGT</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Revolutionizing DevOps workflows with intelligent automation and AI-powered insights.
              </p>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-semibold">Product</h4>
              <div className="space-y-2 text-sm">
                <Link href="#features" className="block text-muted-foreground hover:text-foreground transition-colors">
                  Features
                </Link>
                <Link href="#benefits" className="block text-muted-foreground hover:text-foreground transition-colors">
                  Benefits
                </Link>
                <Link href="#pricing" className="block text-muted-foreground hover:text-foreground transition-colors">
                  Pricing
                </Link>
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-semibold">Company</h4>
              <div className="space-y-2 text-sm">
                <Link href="/about" className="block text-muted-foreground hover:text-foreground transition-colors">
                  About
                </Link>
                <Link href="/contact" className="block text-muted-foreground hover:text-foreground transition-colors">
                  Contact
                </Link>
                <Link href="/support" className="block text-muted-foreground hover:text-foreground transition-colors">
                  Support
                </Link>
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-semibold">Legal</h4>
              <div className="space-y-2 text-sm">
                <Link href="/privacy" className="block text-muted-foreground hover:text-foreground transition-colors">
                  Privacy Policy
                </Link>
                <Link href="/terms" className="block text-muted-foreground hover:text-foreground transition-colors">
                  Terms of Service
                </Link>
              </div>
            </div>
          </div>
          
          <Separator className="my-8" />
          
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © 2024 DevOps I-AGT. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <ModeToggle />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;