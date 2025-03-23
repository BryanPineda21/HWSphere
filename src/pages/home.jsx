import { Suspense } from "react";
import { DirectionalLight } from "three";
import { StlViewer } from "react-stl-viewer";
import { useEffect, useRef, useMemo} from "react";
import { passiveSupport } from "passive-events-support/src/utils";


// Custom styles
import '../custom-styles.css';


// Ui Components
import {   ArrowRight, 
  Github, 
  Code, 
  Cog, 
  FileText, 
  Upload, 
  Share2, 
  Users,
  Star,
  MessageSquare,
  Terminal,
  Zap} from 'lucide-react';
import { Button} from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import PreviewSection from "../components/previewSection.jsx";



const HomePage = () => {
  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-fade-in-up');
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    document.querySelectorAll('.reveal').forEach((element) => {
      observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-gradient-to-b dark:from-black dark:via-black dark:to-zinc-900">
      {/* Subtle grid background */}
      <div className="fixed inset-0 z-0 bg-[linear-gradient(to_right,#e5e5e5_1px,transparent_1px),linear-gradient(to_bottom,#e5e5e5_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#222_1px,transparent_1px),linear-gradient(to_bottom,#222_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />


      {/* Hero Section - Added top padding to accommodate navbar */}
      <div className="relative pt-24 md:pt-32 min-h-[90vh] flex items-center">
        <div className="container mx-auto px-4">
          <div className="relative z-10 max-w-4xl mx-auto text-center">
            <div className="reveal mb-8">
              <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold mb-4 tracking-tight">
                <span className="text-zinc-900 dark:text-white">HW</span>
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-green-500">
                  Sphere
                </span>
              </h1>
              <div className="h-0.5 w-48 mx-auto bg-gradient-to-r from-emerald-400 to-transparent" />
            </div>
            
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-light text-zinc-800 dark:text-white/90 mb-12 reveal">
              Your Engineering Portfolio Hub
              <span className="block text-lg md:text-xl mt-4 text-emerald-500/80 dark:text-emerald-400/80">
                Code • Design • Build
              </span>
            </h2>

            {/* Stats Section */}
            <div className="grid grid-cols-3 gap-8 mb-12 reveal">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <div className="flex flex-col items-center">
                      <Star className="w-6 h-6 text-emerald-500 dark:text-emerald-400 mb-2" />
                      <span className="text-2xl font-bold text-zinc-900 dark:text-white">10k+</span>
                      <span className="text-sm text-zinc-600 dark:text-zinc-400">Projects</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Active projects on our platform</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <div className="flex flex-col items-center">
                      <MessageSquare className="w-6 h-6 text-emerald-500 dark:text-emerald-400 mb-2" />
                      <span className="text-2xl font-bold text-zinc-900 dark:text-white">50k+</span>
                      <span className="text-sm text-zinc-600 dark:text-zinc-400">Engineers</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Active community members</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <div className="flex flex-col items-center">
                      <Zap className="w-6 h-6 text-emerald-500 dark:text-emerald-400 mb-2" />
                      <span className="text-2xl font-bold text-zinc-900 dark:text-white">24/7</span>
                      <span className="text-sm text-zinc-600 dark:text-zinc-400">Support</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Round-the-clock technical support</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            {/* Feature highlights */}
            <div className="mb-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-center reveal">
              <div className="p-6 rounded-xl bg-zinc-100/50 dark:bg-zinc-900/50 border border-zinc-300 dark:border-zinc-800 hover:border-emerald-500/50 transition-all duration-300">
                <Code className="w-6 h-6 text-emerald-500 dark:text-emerald-400 mx-auto mb-3" />
                <div className="text-zinc-900 dark:text-white font-medium mb-2">Software Projects</div>
                <div className="text-sm text-zinc-600 dark:text-zinc-400 font-geist font-light">Share your code with syntax highlighting</div>
              </div>
              <div className="p-6 rounded-xl bg-zinc-100/50 dark:bg-zinc-900/50 border border-zinc-300 dark:border-zinc-800 hover:border-emerald-500/50 transition-all duration-300">
                <Cog className="w-6 h-6 text-emerald-500 dark:text-emerald-400 mx-auto mb-3" />
                <div className="text-zinc-900 dark:text-white font-medium mb-2">CAD Models</div>
                <div className="text-sm text-zinc-600 dark:text-zinc-400 font-geist font-light">Interactive 3D model viewing</div>
              </div>
              <div className="p-6 rounded-xl bg-zinc-100/50 dark:bg-zinc-900/50 border border-zinc-300 dark:border-zinc-800 hover:border-emerald-500/50 transition-all duration-300">
                <FileText className="w-6 h-6 text-emerald-500 dark:text-emerald-400 mx-auto mb-3" />
                <div className="text-zinc-900 dark:text-white font-medium mb-2">Documentation</div>
                <div className="text-sm text-zinc-600 dark:text-zinc-400 font-geist font-light">Comprehensive technical docs</div>
              </div>
            </div>

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center reveal">
              <Button 
                className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-8 py-6 text-lg transition-all duration-300"
                size="lg"
              >
                Start Your Portfolio
                <ArrowRight className="ml-2 h-5 w-5 animate-bounce-x" />
              </Button>
              <Button 
                variant="outline" 
                className="w-full sm:w-auto border-2 border-emerald-500/50 text-zinc-800 dark:text-white hover:bg-emerald-500/10 px-8 py-6 text-lg transition-all duration-300"
                size="lg"
              >
                <Github className="mr-2 h-5 w-5" />
                View on GitHub
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="container mx-auto px-4 py-24">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              icon: <Upload className="w-6 h-6 text-emerald-500 dark:text-emerald-400" />,
              title: "Multi-Format Upload",
              description: "Share your code files, 3D models, PDFs, and videos in one unified space."
            },
            {
              icon: <Share2 className="w-6 h-6 text-emerald-500 dark:text-emerald-400" />,
              title: "Portfolio Creation",
              description: "Build and share professional portfolios that showcase your engineering journey."
            },
            {
              icon: <Users className="w-6 h-6 text-emerald-500 dark:text-emerald-400" />,
              title: "Community Driven",
              description: "Connect with fellow engineers and collaborate on innovative projects."
            }
          ].map((feature, index) => (
            <Card 
              key={index}
              className="bg-zinc-100/50 dark:bg-zinc-900/50 border-zinc-300 dark:border-zinc-800 hover:border-emerald-500/50 transition-all duration-300 reveal"
            >
              <CardContent className="p-6 space-y-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-emerald-500/10">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-zinc-900 dark:text-white">{feature.title}</h3>
                <p className="text-zinc-600 dark:text-zinc-400 font-geist font-light ">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Demo Section */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-24 min-h-screen flex items-center justify-center">
        <PreviewSection />
      </div>
    </div>
  );
};

export default HomePage;
