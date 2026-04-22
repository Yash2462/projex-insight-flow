import React, { Component, ErrorInfo, ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-6">
           <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-destructive/5 rounded-full blur-[120px] -z-10 translate-x-1/2 -translate-y-1/2" />
           
          <Card className="max-w-md w-full border-0 shadow-2xl bg-card rounded-[2.5rem] overflow-hidden">
             <div className="bg-destructive h-2 w-full" />
            <CardHeader className="pt-8 text-center">
              <div className="mx-auto p-4 bg-destructive/10 rounded-2xl w-fit mb-4">
                <AlertTriangle className="h-8 w-8 text-destructive" />
              </div>
              <CardTitle className="text-2xl font-black tracking-tight">Something went wrong</CardTitle>
            </CardHeader>
            <CardContent className="p-8 pt-0 space-y-6 text-center">
              <p className="text-muted-foreground font-medium text-sm">
                The application encountered an unexpected error. Don't worry, your data is safe.
              </p>
              
              {process.env.NODE_ENV === 'development' && (
                <div className="p-4 bg-muted/50 rounded-xl text-left overflow-auto max-h-40">
                  <p className="text-[10px] font-mono text-destructive break-all">{this.state.error?.toString()}</p>
                </div>
              )}

              <div className="flex flex-col gap-3">
                <Button 
                  onClick={() => window.location.reload()} 
                  className="w-full bg-primary text-primary-foreground font-bold rounded-xl h-12 shadow-glow"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reload Application
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={() => window.location.href = '/dashboard'}
                  className="w-full font-bold rounded-xl h-12 hover:bg-primary/5 text-primary"
                >
                  <Home className="h-4 w-4 mr-2" />
                  Return Home
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.children;
  }
}

export default ErrorBoundary;
