import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ArrowLeft, 
  Mail, 
  Lock, 
  ShieldCheck, 
  Send, 
  KeyRound,
  Loader2,
  Zap,
  CheckCircle2
} from "lucide-react";
import { authAPI } from "@/services/api";
import { useToast } from "@/hooks/use-toast";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [step, setStep] = useState(1); // 1: Email, 2: OTP & New Password
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    try {
      await authAPI.sendOtp(email);
      toast({
        title: "OTP Sent",
        description: "Please check your email for the verification code.",
      });
      setStep(2);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to send OTP. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await authAPI.resetPassword({ email, otp, newPassword });
      toast({
        title: "Success",
        description: "Your password has been reset successfully.",
      });
      navigate("/login");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to reset password. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center p-6 relative overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[10%] -left-[5%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[100px] animate-pulse" />
        <div className="absolute bottom-[10%] -right-[5%] w-[30%] h-[40%] rounded-full bg-purple-500/5 blur-[100px]" />
      </div>

      <Link to="/" className="flex items-center gap-3 group mb-8">
        <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center shadow-glow group-hover:scale-105 transition-all duration-500 group-hover:rotate-6">
          <Zap className="text-white h-5 w-5 fill-current" />
        </div>
        <div className="flex flex-col">
          <span className="text-xl font-black tracking-tighter text-foreground leading-none">PROJEX</span>
          <span className="text-[10px] font-bold text-primary tracking-widest uppercase mt-0.5">Insight Flow</span>
        </div>
      </Link>

      <Card className="w-full max-w-md border-primary/5 shadow-2xl rounded-[2.5rem] bg-card/60 backdrop-blur-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-purple-600" />
        
        <CardHeader className="space-y-2 pt-8">
          <CardTitle className="text-2xl font-black tracking-tight flex items-center gap-3">
            {step === 1 ? (
              <>
                <KeyRound className="h-6 w-6 text-primary" />
                Recover Account
              </>
            ) : (
              <>
                <ShieldCheck className="h-6 w-6 text-primary" />
                Reset Security
              </>
            )}
          </CardTitle>
          <CardDescription className="text-muted-foreground font-medium">
            {step === 1 
              ? "Enter your email to receive a verification code." 
              : "Verify your identity and set a new secure password."}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6 pb-8">
          {step === 1 ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs font-black uppercase tracking-widest opacity-60 ml-1">Work Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-10 h-12 bg-muted/20 border-primary/5 font-bold rounded-xl focus-visible:ring-primary/20"
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 rounded-2xl bg-primary text-primary-foreground font-black uppercase tracking-widest text-[10px] shadow-glow hover:opacity-90 transition-all active:scale-95"
                disabled={isLoading || !email}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                Request Transmission
              </Button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-4">
               <div className="space-y-2">
                <Label htmlFor="otp" className="text-xs font-black uppercase tracking-widest opacity-60 ml-1">Verification Code</Label>
                <div className="relative">
                  <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="otp"
                    placeholder="Enter 6-digit code"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                    className="pl-10 h-12 bg-muted/20 border-primary/5 font-bold rounded-xl focus-visible:ring-primary/20 tracking-[0.5em] text-center"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword" className="text-xs font-black uppercase tracking-widest opacity-60 ml-1">New Security Protocol (Password)</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="newPassword"
                    type="password"
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    className="pl-10 h-12 bg-muted/20 border-primary/5 font-bold rounded-xl focus-visible:ring-primary/20"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-xs font-black uppercase tracking-widest opacity-60 ml-1">Verify Protocol</Label>
                <div className="relative">
                  <CheckCircle2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="pl-10 h-12 bg-muted/20 border-primary/5 font-bold rounded-xl focus-visible:ring-primary/20"
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 rounded-2xl bg-primary text-primary-foreground font-black uppercase tracking-widest text-[10px] shadow-glow hover:opacity-90 transition-all active:scale-95"
                disabled={isLoading || !otp || !newPassword}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Lock className="h-4 w-4 mr-2" />
                )}
                Update Security Credentials
              </Button>
              
              <button 
                type="button"
                onClick={() => setStep(1)}
                className="w-full text-center text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors"
              >
                Resend code to {email}
              </button>
            </form>
          )}

          <div className="pt-4 border-t border-primary/5 text-center">
            <Link
              to="/login"
              className="inline-flex items-center text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft className="h-3 w-3 mr-2" />
              Abort and return to login
            </Link>
          </div>
        </CardContent>
      </Card>
      
      <p className="mt-8 text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-30">
        &copy; 2026 PROJEX SYSTEMS. ALL RECOVERIES ENCRYPTED.
      </p>
    </div>
  );
};

export default ForgotPassword;
