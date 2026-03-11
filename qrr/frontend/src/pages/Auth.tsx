import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, Mail, Lock, User, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PhoneInput } from "@/components/ui/phone-input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

const Auth = () => {
  const navigate = useNavigate();
  const { toast }          = useToast();
  const { signIn, signUp } = useAuth();
  const [loading, setLoading] = useState(false);

  const [loginData,  setLoginData]  = useState({ email: "", password: "" });
  const [signupData, setSignupData] = useState({ email: "", password: "", fullName: "", phone: "" });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signIn(loginData.email, loginData.password);
    setLoading(false);
    if (error) {
      toast({ title: "Login Failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Welcome back!" });
      navigate("/register");
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    const digits = signupData.phone.replace(/^\+91/, "");
    if (digits.length !== 10) {
      toast({ title: "Invalid Phone", description: "Please enter a valid 10-digit mobile number.", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { error } = await signUp(signupData.email, signupData.password, signupData.fullName, signupData.phone);
    setLoading(false);
    if (error) {
      toast({ title: "Signup Failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Account Created Successfully!" });
      navigate("/register");
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-12 lg:py-20 gradient-hero">
        <div className="container max-w-md">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-primary mb-4">
                <Shield className="w-8 h-8 text-primary-foreground" />
              </div>
              <h1 className="text-3xl font-bold text-foreground mb-2">EMERGENCY SAFETY QRR</h1>
              <p className="text-muted-foreground">Login or create your account</p>
            </div>

            <Card className="shadow-elevated border-0">
              <CardContent className="pt-6">
                <Tabs defaultValue="login">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="login">Login</TabsTrigger>
                    <TabsTrigger value="signup">Sign Up</TabsTrigger>
                  </TabsList>

                  {/* ── LOGIN ── */}
                  <TabsContent value="login">
                    <form onSubmit={handleLogin} className="space-y-4 mt-4">
                      <div className="space-y-2">
                        <Label htmlFor="login-email" className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-muted-foreground" /> Email
                        </Label>
                        <Input id="login-email" type="email" placeholder="you@example.com"
                          value={loginData.email} onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                          className="h-12" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="login-password" className="flex items-center gap-2">
                          <Lock className="w-4 h-4 text-muted-foreground" /> Password
                        </Label>
                        <Input id="login-password" type="password" placeholder="••••••••"
                          value={loginData.password} onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                          className="h-12" required />
                      </div>
                      <Button type="submit" variant="hero" size="xl" className="w-full" disabled={loading}>
                        {loading ? "Logging in..." : "Login"}
                      </Button>
                    </form>
                  </TabsContent>

                  {/* ── SIGNUP ── */}
                  <TabsContent value="signup">
                    <form onSubmit={handleSignup} className="space-y-4 mt-4">
                      <div className="space-y-2">
                        <Label htmlFor="signup-name" className="flex items-center gap-2">
                          <User className="w-4 h-4 text-muted-foreground" /> Full Name
                        </Label>
                        <Input id="signup-name" placeholder="Your full name"
                          value={signupData.fullName} onChange={(e) => setSignupData({ ...signupData, fullName: e.target.value })}
                          className="h-12" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="signup-phone" className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-muted-foreground" /> Phone
                        </Label>
                        <PhoneInput
                          id="signup-phone"
                          value={signupData.phone}
                          onChange={(v) => setSignupData({ ...signupData, phone: v })}
                          required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="signup-email" className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-muted-foreground" /> Email
                        </Label>
                        <Input id="signup-email" type="email" placeholder="you@example.com"
                          value={signupData.email} onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                          className="h-12" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="signup-password" className="flex items-center gap-2">
                          <Lock className="w-4 h-4 text-muted-foreground" /> Password
                        </Label>
                        <Input id="signup-password" type="password" placeholder="Min 6 characters"
                          value={signupData.password} onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                          className="h-12" required minLength={6} />
                      </div>
                      <Button type="submit" variant="hero" size="xl" className="w-full" disabled={loading}>
                        {loading ? "Creating account..." : "Create Account"}
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            <div className="text-center mt-4">
              <Link to="/dealer-login" className="text-sm text-primary hover:underline">Dealer Login →</Link>
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Auth;
