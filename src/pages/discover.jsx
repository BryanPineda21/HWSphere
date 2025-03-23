import React,{useState, useEffect} from "react";
import { InstantSearch, Hits, Stats } from "react-instantsearch";
import TypesenseInstantSearchAdapter from 'typesense-instantsearch-adapter';
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Search, ArrowUpRight, Users, Star, Rocket, Bookmark, ExternalLink, Filter } from 'lucide-react'
import { AspectRatio } from "@/components/ui/aspect-ratio"
import { useTheme } from "../components/ui/themeProvider";
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import '../custom-styles.css';

// Bryan NOTES: remember to remove the API key before pushing to GitHub, turn into an environment variable
const typesenseInstantsearchAdapter = new TypesenseInstantSearchAdapter({
  server: {
    apiKey: 'iBGxcv7eINoJ1RtPfOuETcvzH3dInn8j', // Use your Search API Key
    nodes: [
      {
        host: 'hkjezcyq5xd1al3wp-1.a1.typesense.net', // Your Typesense Cloud host
        port: '443',
        protocol: 'https',
      },
    ],
  },
  additionalSearchParameters: {
    query_by: 'title,description', // Specify the fields to search by
  },
});


const searchClient = typesenseInstantsearchAdapter.searchClient;

const Hit = ({ hit }) => (
  <div className="bg-white border border-gray-500 rounded-lg shadow-md p-4 transition-transform duration-200 hover:-translate-y-1">
  <h3 className="text-lg font-semibold text-gray-800 mb-2">{hit.title}</h3>
  </div>
);


const DiscoverPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("trending");
  const { theme } = useTheme(); // Get current theme from your theme provider
  // State for UI interactions

  // Demo projects data with images
  const projects = [
    {
      id: 1,
      title: "Neural Network Robot Arm",
      description: "An intelligent robotic arm system that uses deep learning for precise object manipulation.",
      tags: ["AI & Machine Learning", "Hardware", "Robotics"],
      contributors: 12,
      stars: 345,
      category: "Robotics",
      image: "https://www.hpcwire.com/wp-content/uploads/2020/07/Photo-B-Robotic-system-2.jpg",
      featured: true,
      new: false
    },
    {
      id: 2,
      title: "3D Printed Drone Framework",
      description: "Open-source 3D printable drone design with modular components for custom UAV development.",
      tags: ["3D Models", "Aviation", "Hardware"],
      contributors: 8,
      stars: 267,
      category: "Aviation",
      image: "https://3dscanningservices.net/wp-content/uploads/2020/12/3drobotics.jpg",
      featured: false,
      new: true
    },
    {
      id: 3,
      title: "Smart Manufacturing Assistant",
      description: "AI-powered system for real-time quality control in manufacturing processes.",
      tags: ["AI & Machine Learning", "Manufacturing", "Computer Vision"],
      contributors: 15,
      stars: 423,
      category: "Manufacturing",
      image: "https://www.assemblymag.com/ext/resources/2024/01/12/asb0124campus4-forweb.jpg",
      featured: true,
      new: false
    },
    {
      id: 4,
      title: "Automated CAD Generator",
      description: "Machine learning model that generates optimized mechanical parts based on input parameters.",
      tags: ["3D Models", "AI & Machine Learning", "Design"],
      contributors: 6,
      stars: 189,
      category: "Design",
      image: "https://preview.redd.it/any-ai-to-make-3d-from-2d-cad-v0-i0g8skotm6cc1.jpeg?auto=webp&s=7fed2565256649fba5eab9ddeebe58670dab034e",
      featured: false,
      new: true
    },
    {
      id: 5,
      title: "Quantum Computing Simulator",
      description: "Educational platform for simulating quantum algorithms with interactive visualizations.",
      tags: ["Quantum Computing", "Education", "Computer Science"],
      contributors: 9,
      stars: 312,
      category: "Computing",
      image: "https://thequantuminsider.com/wp-content/uploads/1_ibhBqaA7NAfh86iT-wwJfQ.jpeg",
      featured: true,
      new: false
    },
    {
      id: 6,
      title: "Sustainable Energy Monitor",
      description: "IoT system for tracking and optimizing renewable energy production and consumption.",
      tags: ["IoT", "Sustainable Energy", "Data Science"],
      contributors: 11,
      stars: 276,
      category: "Energy",
      image: "https://www.nrel.gov/grid/assets/images/aes-what-it-is-v2.jpg",
      featured: false,
      new: true
    }
  ];

  // Filter categories for quick selection
  const categories = [
    "All", 
    "Robotics", 
    "AI & Machine Learning", 
    "Hardware", 
    "Design", 
    "Manufacturing",
    "Computing",
    "Energy"
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 transition-colors duration-300">
      {/* No floating header - removed as requested */}

      {/* Main content with top padding to avoid navbar */}
      <div className="pt-16">
        {/* Hero section with 3D-like elements */}
        <div className="relative bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 overflow-hidden py-20 md:py-28">
          {/* Abstract background elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-gradient-to-br from-emerald-300/20 to-emerald-500/20 dark:from-emerald-400/10 dark:to-emerald-600/10 blur-3xl"></div>
            <div className="absolute top-1/2 left-1/4 w-96 h-96 rounded-full bg-gradient-to-tr from-teal-300/20 to-cyan-500/20 dark:from-teal-400/10 dark:to-cyan-600/10 blur-3xl transform -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-1/3 w-80 h-80 rounded-full bg-gradient-to-br from-emerald-400/20 to-green-500/20 dark:from-emerald-500/10 dark:to-green-600/10 blur-3xl"></div>
            
            {/* Grid pattern overlay */}
            <div className="absolute inset-0 bg-grid-pattern opacity-5 dark:opacity-10"></div>
          </div>

          <div className="container relative mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                <span className="inline-block bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-500 dark:from-emerald-400 dark:to-teal-300">
                  Discover Engineering
                </span>
                <span className="relative inline-block ml-2 before:absolute before:inset-x-0 before:bottom-2 before:h-3 before:bg-emerald-200/40 dark:before:bg-emerald-800/40 before:-z-10 before:skew-y-1">
                  Projects
                </span>
              </h1>
              
              <p className="text-gray-600 dark:text-zinc-400 text-lg mb-10 max-w-2xl mx-auto leading-relaxed font-geist font-light">
                Explore cutting-edge engineering innovations, connect with talented developers, 
                and discover your next collaborative project.
              </p>
              
              {/* Search section with filter button */}
              <div className="relative max-w-2xl mx-auto flex gap-2">
                <div className="relative flex-grow">
                  <div className="absolute left-5 top-1/2 transform -translate-y-1/2">
                    <Search className="h-5 w-5 text-gray-400 dark:text-zinc-500" />
                  </div>
                  <Input
                    className="w-full h-14 pl-14 pr-5 text-lg rounded-full border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/80 shadow-lg shadow-emerald-200/20 dark:shadow-emerald-900/10 
                              focus-visible:ring-emerald-500/30 focus-visible:border-emerald-400 dark:focus-visible:border-emerald-600
                              placeholder:text-gray-400 dark:placeholder:text-zinc-600 transition-all duration-200 font-geist font-extralight"
                    placeholder="Search projects, technologies, or topics..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button 
                  className="h-14 px-5 rounded-full bg-white dark:bg-zinc-900 text-gray-700 dark:text-zinc-300 border border-gray-200 dark:border-zinc-800 shadow-lg shadow-emerald-200/10 dark:shadow-emerald-900/5 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-all duration-200"
                >
                  <Filter className="h-5 w-5 mr-2" />
                  Filter
                </Button>
              </div>

              {/* Quick filter categories */}
              <div className="mt-8 flex flex-wrap justify-center gap-2">
                {categories.map((category) => (
                  <Button 
                    key={category}
                    variant={category === "All" ? "default" : "outline"}
                    className={
                      category === "All"
                        ? "rounded-full h-9 px-4 bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-600 dark:hover:bg-emerald-700 dark:text-white"
                        : "rounded-full h-9 px-4 text-gray-600 dark:text-zinc-400 border-gray-200 dark:border-zinc-800 hover:border-emerald-400 dark:hover:border-emerald-600 hover:text-emerald-600 dark:hover:text-emerald-400 bg-white/80 dark:bg-zinc-900/80"
                    }
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Main project content */}
        <div className="container mx-auto px-4 py-12">
          {/* Tabs for different views */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
            <Tabs defaultValue="trending" className="w-full sm:w-auto" onValueChange={setActiveTab}>
              <TabsList className="bg-gray-100 dark:bg-zinc-900 p-1 rounded-lg">
                <TabsTrigger 
                  value="trending" 
                  className="data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 data-[state=active]:text-emerald-600 dark:data-[state=active]:text-emerald-400 rounded-md"
                >
                  Trending
                </TabsTrigger>
                <TabsTrigger 
                  value="newest"
                  className="data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 data-[state=active]:text-emerald-600 dark:data-[state=active]:text-emerald-400 rounded-md"
                >
                  Newest
                </TabsTrigger>
                <TabsTrigger 
                  value="featured"
                  className="data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 data-[state=active]:text-emerald-600 dark:data-[state=active]:text-emerald-400 rounded-md"
                >
                  Featured
                </TabsTrigger>
              </TabsList>
            </Tabs>
            
            <div className="flex items-center text-sm text-gray-500 dark:text-zinc-500">
              <span>Showing 6 projects</span>
            </div>
          </div>

          {/* Projects Grid - Modern card layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <Card 
                key={project.id} 
                className="group bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 hover:border-emerald-300 dark:hover:border-emerald-700 overflow-hidden transition-all duration-300 hover:shadow-md hover:shadow-emerald-100 dark:hover:shadow-emerald-950"
              >
                <div className="relative overflow-hidden">
                  <AspectRatio ratio={16 / 9}>
                    <img
                      src={project.image}
                      alt={project.title}
                      className="object-cover w-full h-full transform group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-70 group-hover:opacity-60 transition-opacity duration-300" />
                  </AspectRatio>
                  
                  {/* Category badge */}
                  <Badge className="absolute top-3 left-3 bg-white/90 dark:bg-zinc-900/90 text-emerald-600 dark:text-emerald-400 backdrop-blur-sm border-0 shadow-md">
                    {project.category}
                  </Badge>
                  
                  {/* Featured/New tag */}
                  {project.featured && (
                    <Badge className="absolute bottom-3 left-3 bg-amber-500/90 text-white backdrop-blur-sm border-0 shadow-md">
                      Featured
                    </Badge>
                  )}
                  {project.new && !project.featured && (
                    <Badge className="absolute bottom-3 left-3 bg-emerald-500/90 text-white backdrop-blur-sm border-0 shadow-md">
                      New
                    </Badge>
                  )}
                  
                  {/* Action buttons */}
                  <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Button size="icon" variant="outline" className="h-8 w-8 rounded-full bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm border-0 shadow-md text-gray-700 dark:text-zinc-300 hover:text-emerald-600 dark:hover:text-emerald-400">
                      <Bookmark className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="outline" className="h-8 w-8 rounded-full bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm border-0 shadow-md text-gray-700 dark:text-zinc-300 hover:text-emerald-600 dark:hover:text-emerald-400">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <CardHeader className="pt-5 pb-2">
                  <CardTitle className="text-xl group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors duration-300">
                    {project.title}
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="pb-3">
                  <p className="text-gray-600 dark:text-zinc-400 text-sm mb-4 font-geist font-normal">{project.description}</p>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {project.tags.slice(0, 3).map((tag) => (
                      <Badge 
                        key={tag} 
                        variant="outline" 
                        className="bg-gray-50 dark:bg-zinc-800/80 border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-zinc-400 text-xs hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
                
                <CardFooter className="pt-1 pb-4 flex justify-between items-center border-t border-gray-100 dark:border-zinc-800/50">
                  <div className="flex items-center gap-4 text-gray-500 dark:text-zinc-500 text-sm">
                    <div className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5" />
                      <span>{project.contributors}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Star className="w-3.5 h-3.5" />
                      <span>{project.stars}</span>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    className="h-8 text-xs px-3 text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/50"
                  >
                    View Project
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          {/* Load more button */}
          <div className="mt-12 text-center">
            <Button 
              className="rounded-full px-8 py-6 h-auto bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800 shadow-lg shadow-emerald-100/20 dark:shadow-emerald-900/10 transition-all duration-200"
            >
              Load More Projects
            </Button>
          </div>
        </div>

        {/* Floating action button */}
        <Button 
          className="fixed bottom-8 right-8 h-14 w-14 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20 dark:shadow-emerald-900/30"
          size="icon"
        >
          <Rocket className="h-6 w-6" />
        </Button>
      </div>

    </div>
  );
};

export default DiscoverPage;