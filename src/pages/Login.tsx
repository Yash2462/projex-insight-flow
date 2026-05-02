import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Eye, EyeOff, Mail, Lock, Loader2 } from "lucide-react";
import { authAPI } from "@/services/authService";
import { API_URL } from "@/services/client";

const formSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
});

type FormValues = z.infer<typeof formSchema>;

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await authAPI.login(values);
      const { token } = res.data;

      localStorage.setItem("token", token);

      const pendingInvitationToken = localStorage.getItem('pendingInvitationToken');
      if (pendingInvitationToken) {
        localStorage.removeItem('pendingInvitationToken');
        navigate(`/accept_invitation?token=${pendingInvitationToken}`);
        return;
      }

      const urlParams = new URLSearchParams(window.location.search);
      const redirectUrl = urlParams.get('redirect');
      
      if (redirectUrl) {
        navigate(redirectUrl);
      } else {
        navigate("/dashboard");
      }
    } catch (err: any) {
      console.error("Login error:", err);
      setError(
        err.response?.data?.message || "Invalid email or password. Try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${API_URL}/oauth2/authorization/google`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-hero p-4">
      <Card className="w-full max-w-md shadow-elegant border-0 rounded-[2rem] overflow-hidden">
        <div className="bg-gradient-primary h-1.5 w-full" />
        <CardHeader className="space-y-1 text-center pt-8">
          <div className="flex justify-center mb-4">
            <div className="w-14 h-14 bg-gradient-primary rounded-2xl flex items-center justify-center shadow-glow rotate-3">
              <span className="text-white font-black text-2xl">P</span>
            </div>
          </div>
          <CardTitle className="text-3xl font-black tracking-tight">Welcome back</CardTitle>
          <CardDescription className="font-medium opacity-60">
            Sign in to your ProjeX account to continue
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8 pt-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Email</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-4 top-3.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="john@example.com"
                          className="pl-11 h-11 bg-muted/20 border-primary/5 rounded-xl font-bold"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between ml-1">
                      <FormLabel className="text-xs font-black uppercase tracking-widest text-muted-foreground">Password</FormLabel>
                      <Link
                        to="/forgot-password"
                        className="text-xs font-bold text-primary hover:underline"
                      >
                        Forgot password?
                      </Link>
                    </div>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-4 top-3.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          className="pl-11 pr-11 h-11 bg-muted/20 border-primary/5 rounded-xl font-bold"
                          {...field}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-1 top-1 h-9 w-9 hover:bg-transparent text-muted-foreground"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {error && (
                <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-bold text-center animate-in fade-in zoom-in-95">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-12 text-sm font-black rounded-xl transition-all active:scale-[0.98]"
                variant="hero"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    AUTHENTICATING...
                  </>
                ) : (
                  "SIGN IN TO HUB"
                )}
              </Button>

              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-primary/5" />
                </div>
                <div className="relative flex justify-center text-[10px] font-black uppercase tracking-[0.2em]">
                  <span className="bg-card px-4 text-muted-foreground/40">
                    Neural Bridge
                  </span>
                </div>
              </div>

              <Button
                variant="outline"
                type="button"
                className="w-full h-11 rounded-xl border-primary/5 bg-primary/5 hover:bg-primary/10 transition-all font-bold text-xs"
                onClick={handleGoogleLogin}
              >
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
            </form>
          </Form>

          <div className="mt-8 text-center text-xs">
            <span className="text-muted-foreground font-medium">
              Don't have an account?{" "}
            </span>
            <Link
              to="/signup"
              className="text-primary hover:underline font-black uppercase tracking-widest ml-1"
            >
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
