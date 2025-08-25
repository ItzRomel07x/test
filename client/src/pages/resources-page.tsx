import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useQuery } from "@tanstack/react-query";
import { Resource } from "@shared/schema";
import { Search, Download, Gift, Menu, Gamepad2, Shield, Target, Headphones, ExternalLink, FileDown } from "lucide-react";
import Logo from "@/components/logo";
import ParticlesBackground from "@/components/particles-background";
import { useAuth } from "@/hooks/use-auth";

export default function ResourcesPage() {
  const [search, setSearch] = useState("");
  const [showFreeOnly, setShowFreeOnly] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user } = useAuth();

  const { data: resources = [], isLoading } = useQuery<Resource[]>({
    queryKey: ["/api/resources"],
  });

  const filteredResources = resources.filter(resource => {
    if (!resource.isActive) return false;
    
    const matchesSearch = search === "" || 
      resource.title.toLowerCase().includes(search.toLowerCase()) ||
      resource.description.toLowerCase().includes(search.toLowerCase());
    
    const matchesFreeFilter = !showFreeOnly || resource.isFree;
    
    return matchesSearch && matchesFreeFilter;
  });

  const handleDownload = (resource: Resource) => {
    window.open(resource.downloadUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-black text-white relative">
      <ParticlesBackground />

      {/* Navigation */}
      <nav className="bg-black/90 backdrop-blur-sm border-b border-red-500/30 sticky top-0 z-40">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/">
              <Logo />
            </Link>

            <div className="hidden md:flex items-center space-x-8">
              <Link href="/" className="text-white hover:text-red-500 transition-colors duration-300 font-medium">
                Home
              </Link>
              <Link href="/products" className="text-white hover:text-red-500 transition-colors duration-300 font-medium">
                Products
              </Link>
              <Link href="/resources" className="text-red-500 font-medium">
                Resources
              </Link>
              <Link href="/contact" className="text-white hover:text-red-500 transition-colors duration-300 font-medium">
                Contact
              </Link>
            </div>

            {/* Mobile Menu */}
            <div className="md:hidden">
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-white hover:text-red-500">
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[300px] bg-black/95 border-red-500/30">
                  <div className="flex flex-col space-y-6 mt-8">
                    <div className="text-center">
                      <Logo />
                    </div>
                    <nav className="flex flex-col space-y-4">
                      <Link href="/" onClick={() => setIsMobileMenuOpen(false)}>
                        <Button variant="ghost" className="w-full justify-start text-white hover:text-red-500 hover:bg-red-500/10">
                          <Gamepad2 className="w-5 h-5 mr-3" />
                          Home
                        </Button>
                      </Link>
                      <Link href="/products" onClick={() => setIsMobileMenuOpen(false)}>
                        <Button variant="ghost" className="w-full justify-start text-white hover:text-red-500 hover:bg-red-500/10">
                          <Shield className="w-5 h-5 mr-3" />
                          Products
                        </Button>
                      </Link>
                      <Link href="/resources" onClick={() => setIsMobileMenuOpen(false)}>
                        <Button variant="ghost" className="w-full justify-start text-red-500 bg-red-500/10">
                          <Download className="w-5 h-5 mr-3" />
                          Resources
                        </Button>
                      </Link>
                      <Link href="/contact" onClick={() => setIsMobileMenuOpen(false)}>
                        <Button variant="ghost" className="w-full justify-start text-white hover:text-red-500 hover:bg-red-500/10">
                          <Headphones className="w-5 h-5 mr-3" />
                          Contact
                        </Button>
                      </Link>
                    </nav>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </nav>

      {/* Resources Section */}
      <section className="py-20 relative z-10">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12 sm:mb-16 px-4">
              <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold mb-4 sm:mb-6 text-glow">
                Free <span className="text-red-500 font-mono">Resources</span>
              </h1>
              <p className="text-lg sm:text-xl text-gray-400 max-w-3xl mx-auto">
                Download free tools, guides, and resources for gaming enhancement
              </p>
            </div>

            {/* Filters */}
            <div className="mb-8 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400 font-medium">
                  {filteredResources.length} {filteredResources.length === 1 ? 'resource' : 'resources'} found
                </span>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search resources..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10 h-10 bg-gray-900 border-red-500/30 text-white placeholder-gray-400 focus:border-red-500 text-sm"
                  />
                </div>
                <Button
                  variant={showFreeOnly ? "default" : "outline"}
                  onClick={() => setShowFreeOnly(!showFreeOnly)}
                  className="h-10 border-red-500/30 text-sm"
                >
                  <Gift className="w-4 h-4 mr-2" />
                  Free Only
                </Button>
              </div>
            </div>

            {/* Resources Grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i} className="card-glow animate-pulse overflow-hidden">
                    <div className="h-48 bg-gray-800/50"></div>
                    <CardContent className="p-6">
                      <div className="h-6 bg-gray-800/50 rounded mb-3"></div>
                      <div className="h-4 bg-gray-800/50 rounded mb-4"></div>
                      <div className="h-10 bg-gray-800/50 rounded"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredResources.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">📁</div>
                <h3 className="text-2xl font-bold mb-4 text-gray-400">No resources found</h3>
                <p className="text-gray-500 mb-6">
                  {search || showFreeOnly 
                    ? "Try adjusting your search filters" 
                    : "No resources are currently available"}
                </p>
                {(search || showFreeOnly) && (
                  <Button 
                    onClick={() => {
                      setSearch("");
                      setShowFreeOnly(false);
                    }}
                    variant="outline" 
                    className="border-red-500 text-red-500 hover:bg-red-500/10"
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredResources.map((resource) => (
                  <Card key={resource.id} className="card-glow hover:scale-105 transition-all duration-300 group overflow-hidden">
                    <div className="relative h-48 bg-gradient-to-br from-red-500/15 to-red-700/15 border-b border-red-500/20 overflow-hidden">
                      {resource.image ? (
                        <img 
                          src={resource.image} 
                          alt={resource.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <FileDown className="text-red-500 w-16 h-16 group-hover:scale-110 transition-transform duration-300" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-300"></div>
                      {resource.isFree && (
                        <div className="absolute top-3 left-3 bg-green-500/90 text-white px-2 py-1 rounded text-xs font-bold">
                          FREE
                        </div>
                      )}
                      <div className="absolute top-3 right-3 bg-red-500/90 text-white px-2 py-1 rounded text-xs font-bold">
                        #{resource.id.toString().padStart(3, '0')}
                      </div>
                    </div>
                    <CardContent className="p-6">
                      <h4 className="text-xl font-bold mb-3 text-white group-hover:text-red-400 transition-colors duration-300 line-clamp-1">
                        {resource.title}
                      </h4>
                      <p className="text-gray-400 text-sm mb-6 line-clamp-3 leading-relaxed">
                        {resource.description}
                      </p>
                      <Button 
                        onClick={() => handleDownload(resource)}
                        className="w-full btn-glow flex items-center justify-center gap-2"
                      >
                        <Download className="w-4 h-4" />
                        Download
                        <ExternalLink className="w-3 h-3" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {filteredResources.length > 0 && (
              <div className="text-center mt-12">
                <p className="text-gray-400">
                  Showing {filteredResources.length} of {resources.length} resources
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-t from-gray-900 to-black py-12 border-t border-red-500/30">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto text-center">
            <Logo className="justify-center mb-4" />
            <p className="text-gray-400">
              © 2024 ADI CHEATS. All rights reserved. | Free Resources & Gaming Tools
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}