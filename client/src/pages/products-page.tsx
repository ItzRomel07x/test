import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useQuery } from "@tanstack/react-query";
import { Product } from "@shared/schema";
import { Search, Gamepad2, Eye, Zap, Shield, Target, Menu, Headphones, ShoppingCart, ChevronLeft, ChevronRight, Download } from "lucide-react";
import Logo from "@/components/logo";
import ParticlesBackground from "@/components/particles-background";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

const categoryIcons = {
  "External Panel": Gamepad2,
  "Internal Panel": Shield,
  "Bypass": Target,
  "Silent Aim": Eye,
  "AimKill": Zap,
};

export default function ProductsPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [isProductViewDialogOpen, setIsProductViewDialogOpen] = useState(false);
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleViewProduct = (product: Product) => {
    setViewingProduct(product);
    setCurrentImageIndex(0);
    setIsProductViewDialogOpen(true);
  };

  const handleBuyProduct = (product: Product) => {
    toast({
      title: "Purchase Request",
      description: `Contact admin to purchase ${product.title}. Product ID: #${product.id.toString().padStart(4, '0')}`,
      duration: 5000,
    });
  };

  const nextImage = () => {
    if (viewingProduct?.images && viewingProduct.images.length > 1) {
      setCurrentImageIndex((prev) => 
        prev === viewingProduct.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (viewingProduct?.images && viewingProduct.images.length > 1) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? viewingProduct.images.length - 1 : prev - 1
      );
    }
  };

  const formatPrice = (product: Product) => {
    const usdPrice = parseFloat(product.price).toFixed(2);
    const inrPrice = product.priceInr ? parseFloat(product.priceInr).toFixed(0) : Math.round(parseFloat(product.price) * 83).toString();
    return `$${usdPrice} / ₹${inrPrice}`;
  };

  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products", { category: category === "all" ? undefined : category, search: search || undefined }],
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["/api/categories"],
  });

  const filteredProducts = products.filter(product => {
    const matchesSearch = search === "" || 
      product.title.toLowerCase().includes(search.toLowerCase()) ||
      product.description.toLowerCase().includes(search.toLowerCase()) ||
      product.id.toString().includes(search);
    
    const matchesCategory = category === "all" || product.category === category;
    
    return matchesSearch && matchesCategory;
  });

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
              <Link href="/products" className="text-red-500 font-medium">
                Products
              </Link>
              <Link href="/resources" className="text-white hover:text-red-500 transition-colors duration-300 font-medium">
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
                        <Button variant="ghost" className="w-full justify-start text-red-500 bg-red-500/10">
                          <Shield className="w-5 h-5 mr-3" />
                          Products
                        </Button>
                      </Link>
                      <Link href="/resources" onClick={() => setIsMobileMenuOpen(false)}>
                        <Button variant="ghost" className="w-full justify-start text-white hover:text-red-500 hover:bg-red-500/10">
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

      {/* Products Section */}
      <section className="py-20 relative z-10">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12 sm:mb-16 px-4">
              <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold mb-4 sm:mb-6 text-glow">
                Gaming <span className="text-red-500 font-mono">Products</span>
              </h1>
              <p className="text-lg sm:text-xl text-gray-400 max-w-3xl mx-auto">
                Professional gaming enhancement tools for competitive players
              </p>
            </div>

            {/* Improved Filters Layout */}
            <div className="mb-8 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold text-gray-300">Products</h2>
                <span className="bg-red-500/20 text-red-400 px-2 py-1 rounded text-sm">
                  {filteredProducts.length} found
                </span>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search products..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10 h-10 bg-gray-900 border-red-500/30 text-white placeholder-gray-400 focus:border-red-500 text-sm"
                  />
                </div>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="w-full sm:w-40 h-10 bg-gray-900 border-red-500/30 text-white focus:border-red-500 text-sm">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-red-500/30">
                    <SelectItem value="all">All</SelectItem>
                    {categories.map((cat: any) => (
                      <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Products Grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {Array.from({ length: 8 }).map((_, i) => (
                  <Card key={i} className="card-glow animate-pulse overflow-hidden">
                    <div className="h-40 bg-gray-800/50 border-b border-red-500/20"></div>
                    <CardContent className="p-4">
                      <div className="h-5 bg-gray-800/50 rounded mb-2"></div>
                      <div className="h-4 bg-gray-800/50 rounded mb-2"></div>
                      <div className="h-3 bg-gray-800/50 rounded mb-4 w-3/4"></div>
                      <div className="flex justify-between items-center">
                        <div className="h-5 bg-gray-800/50 rounded w-16"></div>
                        <div className="h-7 bg-gray-800/50 rounded w-12"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">🎮</div>
                <h3 className="text-2xl font-bold mb-4 text-gray-400">No products found</h3>
                <p className="text-gray-500 mb-6">
                  {search || category !== "all" 
                    ? "Try adjusting your search filters" 
                    : "No products are currently available"}
                </p>
                {(search || category !== "all") && (
                  <Button 
                    onClick={() => {
                      setSearch("");
                      setCategory("all");
                    }}
                    variant="outline" 
                    className="border-red-500 text-red-500 hover:bg-red-500/10"
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map((product) => {
                  const IconComponent = categoryIcons[product.category as keyof typeof categoryIcons] || Gamepad2;
                  
                  return (
                    <Card key={product.id} className="card-glow hover:scale-105 transition-all duration-300 group overflow-hidden">
                      <div className="relative h-40 bg-gradient-to-br from-red-500/15 to-red-700/15 border-b border-red-500/20 overflow-hidden">
                        {product.images && product.images.length > 0 ? (
                          <img 
                            src={product.images[0]} 
                            alt={product.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <IconComponent className="text-red-500 w-12 h-12 group-hover:scale-110 transition-transform duration-300" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-300"></div>
                        <div className="absolute top-3 right-3 bg-red-500/90 text-white px-2 py-1 rounded text-xs font-bold">
                          #{product.id.toString().padStart(4, '0')}
                        </div>
                        <div className="absolute bottom-3 left-3 bg-black/70 text-red-400 px-2 py-1 rounded text-xs font-medium backdrop-blur-sm">
                          {product.category}
                        </div>
                      </div>
                      <CardContent className="p-4">
                        <h4 className="text-lg font-bold mb-2 text-white group-hover:text-red-400 transition-colors duration-300 line-clamp-1">
                          {product.title}
                        </h4>
                        <p className="text-gray-400 text-sm mb-4 line-clamp-2 leading-relaxed">
                          {product.description}
                        </p>
                        <div className="space-y-3">
                          <div className="text-center">
                            <div className="text-lg font-bold text-red-500 mb-1">
                              {formatPrice(product)}
                            </div>
                            <div className="text-xs text-gray-400">USD / INR</div>
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="flex-1 text-xs border-red-500/30 text-red-400 hover:bg-red-500/10"
                              onClick={() => handleViewProduct(product)}
                            >
                              <Eye className="w-3 h-3 mr-1" />
                              View
                            </Button>
                            <Button 
                              size="sm" 
                              className="flex-1 btn-glow text-xs"
                              onClick={() => handleBuyProduct(product)}
                            >
                              <ShoppingCart className="w-3 h-3 mr-1" />
                              Buy
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}

            {filteredProducts.length > 0 && (
              <div className="text-center mt-12">
                <p className="text-gray-400">
                  Showing {filteredProducts.length} of {products.length} products
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
              © 2024 ADI CHEATS. All rights reserved. | Secure & Professional Gaming Solutions
            </p>
          </div>
        </div>
      </footer>

      {/* Enhanced Product View Dialog with Amazon-style Image Carousel */}
      <Dialog open={isProductViewDialogOpen} onOpenChange={setIsProductViewDialogOpen}>
        <DialogContent className="bg-gray-900 border-red-500/30 w-full max-w-6xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="text-glow flex items-center gap-2">
              <Eye className="w-5 h-5 text-red-500" />
              Product Details
            </DialogTitle>
            <DialogDescription className="text-gray-400">Complete product information and images</DialogDescription>
          </DialogHeader>
          
          {viewingProduct && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 overflow-y-auto max-h-[calc(90vh-140px)] py-2">
              {/* Amazon-style Image Carousel */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 002 2v12a2 2 0 002 2z" />
                    </svg>
                    Product Images ({viewingProduct.images?.length || 0})
                  </h3>
                  
                  {viewingProduct.images && viewingProduct.images.length > 0 ? (
                    <div className="space-y-4">
                      {/* Main Image Display */}
                      <div className="relative bg-gray-800/20 rounded-xl border border-gray-700/40 overflow-hidden">
                        <div className="aspect-video bg-gradient-to-br from-black/40 to-gray-900/60 flex items-center justify-center p-4 relative">
                          <img
                            src={viewingProduct.images[currentImageIndex]}
                            alt={`${viewingProduct.title} - Image ${currentImageIndex + 1}`}
                            className="w-full h-full object-contain rounded-lg shadow-2xl transition-all duration-300"
                            style={{
                              maxHeight: '400px',
                              filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.5))'
                            }}
                          />
                          
                          {/* Navigation Arrows */}
                          {viewingProduct.images.length > 1 && (
                            <>
                              <Button
                                variant="outline"
                                size="icon"
                                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/70 border-red-500/30 text-white hover:bg-red-500/20 w-10 h-10"
                                onClick={prevImage}
                              >
                                <ChevronLeft className="w-5 h-5" />
                              </Button>
                              <Button
                                variant="outline"
                                size="icon"
                                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/70 border-red-500/30 text-white hover:bg-red-500/20 w-10 h-10"
                                onClick={nextImage}
                              >
                                <ChevronRight className="w-5 h-5" />
                              </Button>
                            </>
                          )}
                          
                          {/* Image Counter */}
                          <div className="absolute top-3 right-3 bg-black/70 text-white px-3 py-1 rounded-full text-sm backdrop-blur-sm">
                            {currentImageIndex + 1} / {viewingProduct.images.length}
                          </div>
                        </div>
                        
                        {/* Image Thumbnails */}
                        {viewingProduct.images.length > 1 && (
                          <div className="p-3 bg-gray-800/30 border-t border-gray-700/30">
                            <div className="flex gap-2 overflow-x-auto pb-2">
                              {viewingProduct.images.map((image, index) => (
                                <button
                                  key={index}
                                  onClick={() => setCurrentImageIndex(index)}
                                  className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                                    index === currentImageIndex
                                      ? 'border-red-500 ring-2 ring-red-500/50'
                                      : 'border-gray-600 hover:border-red-400'
                                  }`}
                                >
                                  <img
                                    src={image}
                                    alt={`Thumbnail ${index + 1}`}
                                    className="w-full h-full object-cover"
                                  />
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-800/20 rounded-xl border border-gray-700/40 p-12 text-center">
                      <div className="w-20 h-20 bg-gray-700/30 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-10 h-10 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 002 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <h4 className="text-gray-400 font-semibold mb-2">No Images Available</h4>
                      <p className="text-gray-500 text-sm">Product images will appear here when uploaded by admin</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Product Information Section */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Product Information
                  </h3>
                  
                  <div className="space-y-4">
                    
                    {/* Product ID and Status */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-medium text-gray-400 block mb-2">Product ID</label>
                        <div className="bg-gradient-to-r from-red-500/15 to-red-600/5 p-3 rounded-lg text-red-400 font-mono font-bold border border-red-500/25">
                          #{viewingProduct.id.toString().padStart(4, '0')}
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-400 block mb-2">Status</label>
                        <div className="p-3 rounded-lg border border-gray-700/40 bg-gray-800/20">
                          <Badge 
                            variant={viewingProduct.isActive ? "default" : "secondary"} 
                            className={`text-sm px-3 py-1 ${
                              viewingProduct.isActive 
                                ? "bg-green-500/20 text-green-400 border-green-500/30" 
                                : "bg-gray-600/20 text-gray-400 border-gray-600/30"
                            }`}
                          >
                            {viewingProduct.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    {/* Title */}
                    <div>
                      <label className="text-xs font-medium text-gray-400 block mb-2">Product Title</label>
                      <div className="bg-gray-800/20 p-4 rounded-lg text-white font-semibold text-lg border border-gray-700/40">
                        {viewingProduct.title}
                      </div>
                    </div>
                    
                    {/* Description */}
                    <div>
                      <label className="text-xs font-medium text-gray-400 block mb-2">Description</label>
                      <div className="bg-gray-800/20 p-4 rounded-lg text-gray-300 max-h-32 overflow-y-auto border border-gray-700/40 leading-relaxed">
                        {viewingProduct.description}
                      </div>
                    </div>
                    
                    {/* Dual Currency Price */}
                    <div>
                      <label className="text-xs font-medium text-gray-400 block mb-2">Price (Dual Currency)</label>
                      <div className="bg-gradient-to-r from-red-500/15 to-red-600/5 p-4 rounded-lg border border-red-500/25">
                        <div className="text-red-400 font-bold text-2xl mb-1">
                          {formatPrice(viewingProduct)}
                        </div>
                        <div className="text-xs text-gray-400">USD / INR Pricing</div>
                      </div>
                    </div>
                    
                    {/* Category */}
                    <div>
                      <label className="text-xs font-medium text-gray-400 block mb-2">Category</label>
                      <div className="bg-gray-800/20 p-4 rounded-lg text-gray-300 font-semibold border border-gray-700/40">
                        {viewingProduct.category}
                      </div>
                    </div>
                    
                    {/* Created Date */}
                    <div>
                      <label className="text-xs font-medium text-gray-400 block mb-2">Created Date</label>
                      <div className="bg-gray-800/20 p-4 rounded-lg text-gray-300 font-medium border border-gray-700/40">
                        {new Date(viewingProduct.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: true
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter className="pt-6 border-t border-red-500/20 mt-4">
            <div className="flex gap-3 w-full">
              <Button
                variant="outline"
                onClick={() => setIsProductViewDialogOpen(false)}
                className="flex-1 border-gray-600 text-gray-400 hover:bg-gray-800 hover:text-white transition-all duration-200"
              >
                Close
              </Button>
              <Button
                onClick={() => {
                  if (viewingProduct) {
                    handleBuyProduct(viewingProduct);
                    setIsProductViewDialogOpen(false);
                  }
                }}
                className="flex-1 btn-glow bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-lg"
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Buy Now - {viewingProduct && formatPrice(viewingProduct)}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
