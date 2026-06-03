import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, EyeOff, Mail, Lock, User } from "lucide-react";
import axios from "axios";

import { authAPI } from "@/services/authService";

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords don't match!");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await authAPI.signup({
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
      });

      // If backend returns token on signup
      if (res.data?.token) {
        localStorage.setItem("token", res.data.token);
        navigate("/dashboard");
      } else {
        navigate("/login"); // fallback: redirect to login after signup
      }
    } catch (err: any) {
      console.error("Signup error:", err);
      setError(err.response?.data?.message || "Signup failed. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleGoogleSignup = () => {
    window.location.href = `${API_URL}/oauth2/authorization/google`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-hero p-4">
      <Card className="w-full max-w-md shadow-elegant border-0 rounded-[2rem] overflow-hidden">
        <div className="bg-gradient-primary h-1.5 w-full" />
        <CardHeader className="space-y-1 text-center pt-8">
          <div className="flex justify-center mb-4">
            <div className="w-14 h-14 bg-gradient-primary rounded-2xl flex items-center justify-center shadow-glow animate-floating">
              <span className="text-white font-black text-2xl">P</span>
            </div>
          </div>
          <CardTitle className="text-3xl font-black tracking-tight animate-in fade-in slide-in-from-top-4 duration-700 delay-100 fill-mode-backwards">Create account</CardTitle>
          <CardDescription className="font-medium opacity-60 animate-in fade-in slide-in-from-top-4 duration-700 delay-200 fill-mode-backwards">
            Join the ProjeX network and start your first project
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 md:p-8 pt-4">
          <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
            {error && (
              <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-bold text-center animate-in fade-in zoom-in-95">
                {error}
              </div>
            )}

            <div className="space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300 fill-mode-backwards">
              <Label htmlFor="fullName" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Full Name</Label>
              <div className="relative group">
                <User className="absolute left-4 top-3.5 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  id="fullName"
                  type="text"
                  placeholder="John Doe"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange("fullName", e.target.value)}
                  className="pl-11 h-11 glass-input rounded-xl font-bold"
                  required
                />
              </div>
            </div>

            <div className="space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-400 fill-mode-backwards">
              <Label htmlFor="email" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Email</Label>
              <div className="relative group">
                <Mail className="absolute left-4 top-3.5 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className="pl-11 h-11 glass-input rounded-xl font-bold"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500 fill-mode-backwards">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Password</Label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-3.5 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Minimum 6 chars"
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    className="pl-11 pr-10 h-11 glass-input rounded-xl font-bold text-xs"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1 h-9 w-9 hover:bg-transparent text-muted-foreground"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Confirm</Label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-3.5 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                    className="pl-11 pr-10 h-11 glass-input rounded-xl font-bold text-xs"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1 h-9 w-9 hover:bg-transparent text-muted-foreground"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2 py-1 animate-in fade-in duration-700 delay-600 fill-mode-backwards">
              <input type="checkbox" id="terms" className="rounded border-primary/20 bg-muted/20" required />
              <Label htmlFor="terms" className="text-[10px] font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Agree to{" "}
                <Link to="/terms" className="text-primary hover:underline font-bold">
                  Terms
                </Link>{" "}
                and{" "}
                <Link to="/privacy" className="text-primary hover:underline font-bold">
                  Privacy
                </Link>
              </Label>
            </div>

            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-700 fill-mode-backwards">
              <Button type="submit" className="w-full h-12 text-sm font-black rounded-xl transition-all active:scale-[0.98] shadow-glow" variant="hero" disabled={isLoading}>
                {isLoading ? "CREATING ACCOUNT..." : "CREATE ACCOUNT"}
              </Button>
            </div>

            <div className="relative py-2 animate-in fade-in duration-700 delay-&lsqb;800ms&rsqb; fill-mode-backwards">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-primary/5" />
              </div>
              <div className="relative flex justify-center text-[10px] font-black uppercase tracking-[0.2em]">
                <span className="bg-card px-4 text-muted-foreground/40">Neural Bridge</span>
              </div>
            </div>

            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-&lsqb;900ms&rsqb; fill-mode-backwards">
              <Button variant="outline" type="button" className="w-full h-11 rounded-xl border-primary/5 bg-primary/5 hover:bg-primary/10 transition-all font-bold text-xs" onClick={handleGoogleSignup}>
                <svg className="mr-3 h-4 w-4" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Identity Sync (Google)
              </Button>
            </div>
          </form>

          <div className="mt-6 text-center text-xs animate-in fade-in duration-700 delay-&lsqb;1000ms&rsqb; fill-mode-backwards">
            <span className="text-muted-foreground font-medium">Already have an account? </span>
            <Link to="/login" className="text-primary hover:underline font-black uppercase tracking-widest ml-1">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Signup;
