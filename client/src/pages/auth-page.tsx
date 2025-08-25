import { useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema, InsertUser } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { Shield, LogIn, Gamepad2, Eye, Zap, Lock } from "lucide-react";
import Logo from "@/components/logo";
import ParticlesBackground from "@/components/particles-background";

type LoginData = Pick<InsertUser, "username" | "password">;

export default function AuthPage() {
  const [, setLocation] = useLocation();
  const { user, loginMutation } = useAuth();

  const loginForm = useForm<LoginData>({
    resolver: zodResolver(insertUserSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      setLocation(user.isAdmin ? "/admin" : "/");
    }
  }, [user, setLocation]);

  const onLogin = (data: LoginData) => {
    loginMutation.mutate(data);
  };

  // Don't render if user is already logged in
  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      <ParticlesBackground />

      <div className="relative z-10 min-h-screen flex">
        {/* Left side - Forms */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <Logo className="justify-center mb-6" />
              <h1 className="text-3xl font-bold mb-2 text-glow">Welcome Back</h1>
              <p className="text-gray-400">Access your gaming tools and admin panel</p>
            </div>

            <Card className="card-glow">
              <CardHeader>
                <CardTitle className="text-glow flex items-center">
                  <Lock className="w-5 h-5 mr-2 text-red-500" />
                  Admin Access Only
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
                    <FormField
                      control={loginForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Enter admin username"
                              className="bg-gray-800 border-red-500/30 focus:border-red-500"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="password"
                              placeholder="Enter admin password"
                              className="bg-gray-800 border-red-500/30 focus:border-red-500"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="submit"
                      className="w-full btn-glow"
                      disabled={loginMutation.isPending}
                    >
                      <LogIn className="w-4 h-4 mr-2" />
                      {loginMutation.isPending ? "Signing In..." : "Admin Login"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>

            {/* Admin Login Hint */}
            <div className="mt-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-sm text-red-400 text-center">
                <Shield className="w-4 h-4 inline mr-1" />
                Authorized Personnel Only - Single Owner Access
              </p>
            </div>
          </div>
        </div>

        {/* Right side - Hero Section */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-red-500/10 to-black items-center justify-center p-8 relative">
          <div className="text-center max-w-lg">
            <h2 className="text-4xl font-bold mb-6 text-glow">
              Ultimate Gaming <span className="text-red-500">Edge</span>
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Professional gaming enhancement tools designed for serious players. 
              Secure, undetected, and constantly updated.
            </p>

            <div className="grid grid-cols-1 gap-6">
              <div className="flex items-center space-x-4 p-4 bg-black/50 rounded-lg border border-red-500/30">
                <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center">
                  <Shield className="w-6 h-6 text-red-500" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold">Undetected</h3>
                  <p className="text-sm text-gray-400">Advanced anti-detection technology</p>
                </div>
              </div>

              <div className="flex items-center space-x-4 p-4 bg-black/50 rounded-lg border border-red-500/30">
                <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center">
                  <Gamepad2 className="w-6 h-6 text-red-500" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold">Premium Features</h3>
                  <p className="text-sm text-gray-400">Aimbot, ESP, and more gaming tools</p>
                </div>
              </div>

              <div className="flex items-center space-x-4 p-4 bg-black/50 rounded-lg border border-red-500/30">
                <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center">
                  <Zap className="w-6 h-6 text-red-500" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold">24/7 Support</h3>
                  <p className="text-sm text-gray-400">Round-the-clock assistance</p>
                </div>
              </div>
            </div>
          </div>

          {/* Floating elements */}
          <div className="absolute top-20 right-20 animate-float">
            <div className="w-4 h-4 bg-red-500 rounded-full opacity-60"></div>
          </div>
          <div className="absolute bottom-20 left-20 animate-float" style={{ animationDelay: '1s' }}>
            <div className="w-3 h-3 bg-red-700 rounded-full opacity-40"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
