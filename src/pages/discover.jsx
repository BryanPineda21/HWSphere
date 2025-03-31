import React, { useState, useEffect, useCallback, useRef } from "react";
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, ArrowUpRight, Users, Star, Eye, Rocket, Bookmark, ExternalLink, Filter } from 'lucide-react'
import { AspectRatio } from "@/components/ui/aspect-ratio"
import { useTheme } from "../components/ui/themeProvider";
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import '../custom-styles.css';


// Import Firebase services
import { getProjects, getTags, searchProjects } from "@/search/firebaseSearch";

// Skeleton loader for projects
const ProjectSkeleton = () => (
  <Card className="bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 overflow-hidden">
    <div className="relative overflow-hidden">
      <AspectRatio ratio={16 / 9}>
        <div className="w-full h-full bg-gray-200 dark:bg-zinc-800 animate-pulse" />
      </AspectRatio>
    </div>
    <CardHeader className="pt-5 pb-2">
      <div className="h-6 w-3/4 bg-gray-200 dark:bg-zinc-800 rounded animate-pulse" />
    </CardHeader>
    <CardContent className="pb-3">
      <div className="h-4 w-full bg-gray-200 dark:bg-zinc-800 rounded animate-pulse mb-2" />
      <div className="h-4 w-5/6 bg-gray-200 dark:bg-zinc-800 rounded animate-pulse mb-4" />
      <div className="flex gap-1.5 mb-2">
        <div className="h-6 w-16 bg-gray-200 dark:bg-zinc-800 rounded animate-pulse" />
        <div className="h-6 w-16 bg-gray-200 dark:bg-zinc-800 rounded animate-pulse" />
      </div>
    </CardContent>
    <CardFooter className="pt-1 pb-4 flex justify-between border-t border-gray-100 dark:border-zinc-800/50">
      <div className="flex gap-4">
        <div className="h-4 w-12 bg-gray-200 dark:bg-zinc-800 rounded animate-pulse" />
        <div className="h-4 w-12 bg-gray-200 dark:bg-zinc-800 rounded animate-pulse" />
      </div>
      <div className="h-8 w-24 bg-gray-200 dark:bg-zinc-800 rounded animate-pulse" />
    </CardFooter>
  </Card>
);

// Helper function to check if a project is new (less than 7 days old)
const isProjectNew = (project) => {
  if (!project.createdAt) return false;
  
  const createdAtDate = project.createdAt.toDate ? project.createdAt.toDate() : new Date(project.createdAt);
  const now = new Date();
  const diffTime = Math.abs(now - createdAtDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays <= 7;
};

// Optimized project card component
const ProjectCard = ({ project }) => {
  const isNew = isProjectNew(project);
  
  return (
    <Card 
      key={project.id} 
      className="group bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 hover:border-emerald-300 dark:hover:border-emerald-700 overflow-hidden transition-all duration-300 hover:shadow-md hover:shadow-emerald-100 dark:hover:shadow-emerald-950"
    >
      <div className="relative overflow-hidden">
        <AspectRatio ratio={16 / 9}>
          {project.thumbnailUrl ? (
            <img
              src={project.thumbnailUrl}
              alt={project.title}
              className="object-cover w-full h-full transform group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 dark:bg-zinc-700 flex items-center justify-center">
              <span className="text-gray-400 dark:text-zinc-500">No Image</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-70 group-hover:opacity-60 transition-opacity duration-300" />
        </AspectRatio>
        
        {/* Primary tag badge */}
        <Badge className="absolute top-3 left-3 bg-white/90 dark:bg-zinc-900/90 text-emerald-600 dark:text-emerald-400 backdrop-blur-sm border-0 shadow-md">
          {project.tags && project.tags.length > 0 ? project.tags[0] : "Project"}
        </Badge>
        
        {/* Featured/New tag */}
        {project.isPinned && (
          <Badge className="absolute bottom-3 left-3 bg-amber-500/90 text-white backdrop-blur-sm border-0 shadow-md">
            Featured
          </Badge>
        )}
        {/* New tag - items less than 7 days old */}
        {!project.isPinned && isNew && (
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
        <CardTitle className="text-xl group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors duration-300 truncate">
          {project.title}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="pb-3">
        <p className="text-gray-600 dark:text-zinc-400 text-sm mb-4 font-geist font-normal line-clamp-2">{project.description}</p>
        <div className="flex flex-wrap gap-1.5 mb-2">
          {project.tags && project.tags.slice(0, 3).map((tag) => (
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
            <span className="truncate max-w-[80px]">{project.author}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Star className="w-3.5 h-3.5" />
            <span>{project.likeCount || 0}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5" />
            <span>{project.viewCount || 0}</span>
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
  );
};

const DiscoverPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("trending");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const { theme } = useTheme();
  
  // State for projects and pagination
  const [projects, setProjects] = useState([]);
  const [categories, setCategories] = useState(["All"]); // We'll use tags as categories
  const [lastVisible, setLastVisible] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [totalProjects, setTotalProjects] = useState(0);
  
  // Refs to prevent duplicate fetches and track initial load
  const isLoadingRef = useRef(false);
  const initialLoadRef = useRef(false);
  const searchTimerRef = useRef(null);

  // Debounce search input to reduce Firebase reads
  useEffect(() => {
    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current);
    }
    
    searchTimerRef.current = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);

    return () => {
      if (searchTimerRef.current) {
        clearTimeout(searchTimerRef.current);
      }
    };
  }, [searchQuery]);

  // Function to fetch projects based on current filters
  const fetchProjects = useCallback(async (reset = false) => {
    // Prevent duplicate fetches
    if (isLoadingRef.current) {
      console.log("Already fetching, skipping");
      return;
    }
    
    console.log("Fetching projects with:", { reset, query: debouncedSearchQuery, category: selectedCategory, tab: activeTab });
    
    isLoadingRef.current = true;
    
    try {
      if (reset) {
        setLoading(true);
        setLastVisible(null);
      } else {
        setLoadingMore(true);
      }

      // Configure query options
      const options = {
        pageSize: 3, // Reduced from 6 to 3 for initial faster loading
        lastVisible: reset ? null : lastVisible,
        tag: selectedCategory === "All" ? null : selectedCategory,
        filterType: activeTab
      };

      // If search query exists, use search function instead of regular fetch
      let result;
      if (debouncedSearchQuery.trim()) {
        result = await searchProjects(debouncedSearchQuery, options);
      } else {
        result = await getProjects(options);
      }

      if (reset) {
        setProjects(result.projects);
      } else {
        setProjects(prev => [...prev, ...result.projects]);
      }

      setLastVisible(result.lastVisible);
      setHasMore(result.projects.length === options.pageSize);
      setTotalProjects(reset ? result.projects.length : projects.length + result.projects.length);
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
      isLoadingRef.current = false;
    }
  }, [debouncedSearchQuery, selectedCategory, activeTab, lastVisible]);

  // Fetch tags on mount
  useEffect(() => {
    const loadTags = async () => {
      try {
        const tags = await getTags();
        setCategories(tags);
      } catch (error) {
        console.error("Error loading tags:", error);
      }
    };
    
    loadTags();
  }, []);

  // Fetch projects when filters change
  useEffect(() => {
    // Skip initial mount effect when no ref changes
    if (!initialLoadRef.current) {
      initialLoadRef.current = true;
      fetchProjects(true);
      return;
    }
    
    // Add slight delay for search to prevent excessive fetches while typing
    const timer = setTimeout(() => {
      fetchProjects(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, [debouncedSearchQuery, selectedCategory, activeTab]);

  // Handle tag change
  const handleCategoryClick = (category) => {
    if (category === selectedCategory) return; // Don't reload if same category clicked
    setSelectedCategory(category);
  };

  // Handle load more
  const handleLoadMore = () => {
    if (!loadingMore && hasMore && !isLoadingRef.current) {
      fetchProjects(false);
    }
  };

  // Handle scroll-based load more
  useEffect(() => {
    const handleScroll = () => {
      if (
        !loading && 
        !loadingMore && 
        hasMore && 
        !isLoadingRef.current &&
        window.innerHeight + window.scrollY >= document.body.offsetHeight - 500
      ) {
        handleLoadMore();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loading, loadingMore, hasMore, projects]);

  // Memoized skeleton placeholders
  const renderSkeletons = useCallback(() => {
    return Array(3).fill(0).map((_, index) => (
      <ProjectSkeleton key={`skeleton-${index}`} />
    ));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 transition-colors duration-300">
      {/* Main content with top padding to avoid navbar */}
      <div className="pt-16">
        {/* Hero section with 3D-like elements */}
        <div className="relative bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 overflow-hidden py-16 md:py-24">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-gradient-to-br from-emerald-300/20 to-emerald-500/20 dark:from-emerald-400/10 dark:to-emerald-600/10 blur-3xl"></div>
            <div className="absolute top-1/2 left-1/4 w-96 h-96 rounded-full bg-gradient-to-tr from-teal-300/20 to-cyan-500/20 dark:from-teal-400/10 dark:to-cyan-600/10 blur-3xl transform -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-1/3 w-80 h-80 rounded-full bg-gradient-to-br from-emerald-400/20 to-green-500/20 dark:from-emerald-500/10 dark:to-green-600/10 blur-3xl"></div>
            <div className="absolute inset-0 bg-grid-pattern opacity-5 dark:opacity-10"></div>
          </div>

          <div className="container relative mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-5">
                <span className="inline-block bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-500 dark:from-emerald-400 dark:to-teal-300">
                  Discover Engineering
                </span>
                <span className="relative inline-block ml-2 before:absolute before:inset-x-0 before:bottom-2 before:h-3 before:bg-emerald-200/40 dark:before:bg-emerald-800/40 before:-z-10 before:skew-y-1">
                  Projects
                </span>
              </h1>
              
              <p className="text-gray-600 dark:text-zinc-400 text-lg mb-8 max-w-2xl mx-auto leading-relaxed font-geist font-light">
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
                    className="w-full h-12 pl-14 pr-5 text-lg rounded-full border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/80 shadow-lg shadow-emerald-200/20 dark:shadow-emerald-900/10 
                              focus-visible:ring-emerald-500/30 focus-visible:border-emerald-400 dark:focus-visible:border-emerald-600
                              placeholder:text-gray-400 dark:placeholder:text-zinc-600 transition-all duration-200 font-geist font-extralight"
                    placeholder="Search projects, technologies, or topics..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button 
                  className="h-12 px-5 rounded-full bg-white dark:bg-zinc-900 text-gray-700 dark:text-zinc-300 border border-gray-200 dark:border-zinc-800 shadow-lg shadow-emerald-200/10 dark:shadow-emerald-900/5 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-all duration-200"
                >
                  <Filter className="h-5 w-5 mr-2" />
                  Filter
                </Button>
              </div>

              {/* Quick filter categories - horizontal scrollable on mobile */}
              <div className="mt-6 flex gap-2 justify-center overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-zinc-700 scrollbar-track-transparent">
                <div className="inline-flex flex-nowrap gap-2 px-4 md:px-0">
                  {categories.map((category) => (
                    <Button 
                      key={category}
                      variant={category === selectedCategory ? "default" : "outline"}
                      className={
                        category === selectedCategory
                          ? "rounded-full h-9 px-4 bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-600 dark:hover:bg-emerald-700 dark:text-white whitespace-nowrap"
                          : "rounded-full h-9 px-4 text-gray-600 dark:text-zinc-400 border-gray-200 dark:border-zinc-800 hover:border-emerald-400 dark:hover:border-emerald-600 hover:text-emerald-600 dark:hover:text-emerald-400 bg-white/80 dark:bg-zinc-900/80 whitespace-nowrap"
                      }
                      onClick={() => handleCategoryClick(category)}
                    >
                      {category}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main project content */}
        <div className="container mx-auto px-4 py-8">
          {/* Tabs for different views */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
            <Tabs defaultValue="trending" className="w-full sm:w-auto" onValueChange={setActiveTab} value={activeTab}>
              <TabsList className="bg-gray-100 dark:bg-zinc-900 p-1 rounded-lg w-full sm:w-auto">
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
              <span>Showing {totalProjects} projects</span>
            </div>
          </div>

          {/* Projects Grid with Skeleton loading */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Render actual projects */}
            {!loading && projects.length > 0 && 
              projects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))
            }
            
            {/* Render skeletons during loading */}
            {loading && renderSkeletons()}
            
            {/* No results message */}
            {!loading && projects.length === 0 && (
              <div className="col-span-1 md:col-span-2 lg:col-span-3 py-16 text-center">
                <div className="mx-auto w-16 h-16 mb-4 text-gray-300 dark:text-zinc-700">
                  <Search className="w-full h-full" />
                </div>
                <h3 className="text-xl font-medium text-gray-700 dark:text-zinc-300 mb-2">No projects found</h3>
                <p className="text-gray-500 dark:text-zinc-400 max-w-md mx-auto">
                  We couldn't find any projects matching your criteria. Try changing your filters or search terms.
                </p>
              </div>
            )}
            
            {/* Loading more skeletons */}
            {loadingMore && renderSkeletons()}
          </div>

          {/* Load more button - only show if not already loading and has more */}
          {!loading && hasMore && projects.length > 0 && !loadingMore && (
            <div className="mt-10 text-center">
              <Button 
                className="rounded-full px-8 py-4 h-auto bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800 shadow-lg shadow-emerald-200/20 dark:shadow-emerald-900/10 transition-all duration-200"
                onClick={handleLoadMore}
                disabled={loadingMore || isLoadingRef.current}
              >
                Load More Projects
              </Button>
            </div>
          )}
          
          {/* Loading indicator for load more */}
          {loadingMore && (
            <div className="mt-10 text-center">
              <div className="inline-flex items-center justify-center">
                <div className="animate-spin h-5 w-5 border-2 border-emerald-500 rounded-full border-t-transparent mr-2"></div>
                <span className="text-gray-500 dark:text-zinc-400">Loading more projects...</span>
              </div>
            </div>
          )}
        </div>

        {/* Floating action button */}
        <Button 
          className="fixed bottom-6 right-6 h-12 w-12 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20 dark:shadow-emerald-900/30"
          size="icon"
        >
          <Rocket className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};

export default DiscoverPage;