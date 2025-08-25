import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Youtube, MessageCircle, Hash, Facebook, Menu, Gamepad2, Shield, Headphones, Target, Download } from "lucide-react";
import Logo from "@/components/logo";
import ParticlesBackground from "@/components/particles-background";
import { useAuth } from "@/hooks/use-auth";

const socialLinks = [
  {
    name: "YouTube",
    icon: Youtube,
    url: "https://youtube.com/@adicherats",
    color: "hover:text-red-600",
    description: "Watch our latest tutorials and game highlights"
  },
  {
    name: "WhatsApp",
    icon: MessageCircle,
    url: "https://wa.me/1234567890",
    color: "hover:text-green-500",
    description: "Direct messaging for instant support"
  },
  {
    name: "Discord",
    icon: Hash,
    url: "https://discord.gg/adicherats",
    color: "hover:text-indigo-500",
    description: "Join our gaming community"
  },
  {
    name: "Facebook",
    icon: Facebook,
    url: "https://facebook.com/adicherats",
    color: "hover:text-blue-500",
    description: "Follow us for updates and news"
  }
];

export default function ContactPage() {
  const { user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
              <Link href="/resources" className="text-white hover:text-red-500 transition-colors duration-300 font-medium">
                Resources
              </Link>
              <Link href="/contact" className="text-red-500 font-medium">
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
                        <Button variant="ghost" className="w-full justify-start text-white hover:text-red-500 hover:bg-red-500/10">
                          <Download className="w-5 h-5 mr-3" />
                          Resources
                        </Button>
                      </Link>
                      <Link href="/contact" onClick={() => setIsMobileMenuOpen(false)}>
                        <Button variant="ghost" className="w-full justify-start text-red-500 bg-red-500/10">
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

      {/* Contact Section */}
      <section className="py-20 relative z-10">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold mb-4 sm:mb-6 text-glow px-4">
              Get in <span className="text-red-500 font-mono">Touch</span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-400 mb-8 sm:mb-12 px-4">
              Connect with us on social media or use our live chat for instant support
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-12 sm:mb-16 px-4">
              {socialLinks.map((social) => {
                const IconComponent = social.icon;
                
                return (
                  <a
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group block"
                  >
                    <Card className="card-glow hover:bg-glow transition-all duration-300 h-full">
                      <CardContent className="p-8 text-center">
                        <div className={`text-red-500 text-4xl mb-4 group-hover:animate-pulse transition-colors ${social.color}`}>
                          <IconComponent className="w-12 h-12 mx-auto" />
                        </div>
                        <h3 className="text-white font-semibold text-lg mb-2">{social.name}</h3>
                        <p className="text-gray-400 text-sm">{social.description}</p>
                      </CardContent>
                    </Card>
                  </a>
                );
              })}
            </div>

            {/* Additional Contact Info */}
            <Card className="card-glow p-8 text-center">
              <h3 className="text-2xl font-bold mb-6 text-glow">Need Immediate Help?</h3>
              <p className="text-gray-400 mb-6">
                Our live chat support is available 24/7 for all your gaming needs. 
                Click the chat button in the bottom right corner to start a conversation with our team.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button className="btn-glow">
                  <MessageCircle className="mr-2 w-4 h-4" />
                  Start Live Chat
                </Button>
                <Link href="/products">
                  <Button variant="outline" className="border-red-500 text-red-500 hover:bg-red-500/10">
                    Browse Products
                  </Button>
                </Link>
              </div>
            </Card>

            {/* Contact Features */}
            <div className="grid md:grid-cols-3 gap-8 mt-16">
              <div className="text-center">
                <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="w-8 h-8 text-red-500" />
                </div>
                <h4 className="text-xl font-bold mb-2">Live Chat</h4>
                <p className="text-gray-400">
                  Instant messaging with our support team for real-time assistance
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Hash className="w-8 h-8 text-red-500" />
                </div>
                <h4 className="text-xl font-bold mb-2">Community</h4>
                <p className="text-gray-400">
                  Join our Discord server to connect with other gamers and get tips
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Youtube className="w-8 h-8 text-red-500" />
                </div>
                <h4 className="text-xl font-bold mb-2">Tutorials</h4>
                <p className="text-gray-400">
                  Watch our YouTube channel for setup guides and gameplay tutorials
                </p>
              </div>
            </div>
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
    </div>
  );
}
