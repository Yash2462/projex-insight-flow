import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  XCircle, 
  Loader2, 
  ArrowRight, 
  Users,
  Folder,
  Mail
} from 'lucide-react';
import { projectAPI } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

const AcceptInvitation = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'pending' | 'success' | 'error' | 'invalid'>('pending');
  const [projectInfo, setProjectInfo] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setStatus('invalid');
      setErrorMessage('Invalid invitation link - missing token');
      return;
    }

    handleAcceptInvitation();
  }, [token]);

  const handleAcceptInvitation = async () => {
    if (!token) return;

    setLoading(true);
    try {
      const response = await projectAPI.acceptInvitation(token);
      
      if (response.data) {
        setProjectInfo(response.data.project || response.data);
        setStatus('success');
        
        toast({
          title: "Success!",
          description: "You have successfully joined the project",
        });

        // Auto-redirect to the project after 3 seconds
        setTimeout(() => {
          // Check if user is logged in by looking for auth token
          const authToken = localStorage.getItem('token');
          
          if (!authToken) {
            // Redirect to login with return URL
            const projectId = response.data.project?.id || response.data.projectId;
            navigate(`/login?redirect=/projects/${projectId || ''}&invited=true`);
          } else {
            const projectId = response.data.project?.id || response.data.projectId;
            if (projectId) {
              navigate(`/projects/${projectId}`);
            } else {
              navigate('/dashboard');
            }
          }
        }, 3000);
      }
    } catch (error: any) {
      console.error('Failed to accept invitation:', error);
      
      setStatus('error');
      let errorMsg = 'Failed to accept invitation. The link may be invalid or expired.';
      
      // Handle specific error scenarios
      if (error?.response?.status === 401) {
        errorMsg = 'Authentication required. Please sign in to accept this invitation.';
        // Store the current invitation token for after login
        localStorage.setItem('pendingInvitationToken', token);
        navigate('/login?invited=true&reason=expired');
        return;
      } else if (error?.response?.status === 404) {
        errorMsg = 'This invitation link is invalid or has expired.';
      } else if (error?.response?.status === 409) {
        errorMsg = 'You are already a member of this project.';
      } else if (error?.response?.data?.message) {
        errorMsg = error.response.data.message;
      } else if (error?.message) {
        errorMsg = error.message;
      }
      
      setErrorMessage(errorMsg);
      
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const retryAcceptInvitation = () => {
    setStatus('pending');
    setErrorMessage('');
    handleAcceptInvitation();
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-hero p-4">
        <Card className="w-full max-w-md shadow-elegant">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 bg-destructive/10 rounded-xl flex items-center justify-center">
                <XCircle className="h-6 w-6 text-destructive" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-destructive">Invalid Invitation</CardTitle>
            <CardDescription>
              This invitation link is invalid or malformed
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-6">
              The invitation link you clicked is missing required information. Please check the link and try again.
            </p>
            <Link to="/dashboard">
              <Button variant="outline" className="w-full">
                Go to Dashboard
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-hero p-4">
      <Card className="w-full max-w-md shadow-elegant">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              status === 'success' 
                ? 'bg-green-500/10' 
                : status === 'error' 
                ? 'bg-destructive/10' 
                : 'bg-primary/10'
            }`}>
              {loading || status === 'pending' ? (
                <Loader2 className="h-6 w-6 text-primary animate-spin" />
              ) : status === 'success' ? (
                <CheckCircle className="h-6 w-6 text-green-500" />
              ) : (
                <XCircle className="h-6 w-6 text-destructive" />
              )}
            </div>
          </div>
          
          <CardTitle className="text-2xl font-bold">
            {status === 'pending' && 'Processing Invitation'}
            {status === 'success' && 'Welcome to the Team!'}
            {status === 'error' && 'Invitation Failed'}
          </CardTitle>
          
          <CardDescription>
            {status === 'pending' && 'We\'re adding you to the project...'}
            {status === 'success' && projectInfo && `You've joined ${projectInfo.name}`}
            {status === 'error' && 'There was an issue with your invitation'}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {status === 'pending' && (
            <div className="text-center">
              <p className="text-muted-foreground">
                Please wait while we process your invitation...
              </p>
            </div>
          )}

          {status === 'success' && projectInfo && (
            <>
              <div className="bg-muted/30 rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Folder className="h-4 w-4 text-primary" />
                  <span className="font-medium">{projectInfo.name}</span>
                </div>
                {projectInfo.description && (
                  <p className="text-sm text-muted-foreground">
                    {projectInfo.description}
                  </p>
                )}
                {projectInfo.category && (
                  <Badge variant="secondary">{projectInfo.category}</Badge>
                )}
                {projectInfo.teamSize && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>{projectInfo.teamSize} team members</span>
                  </div>
                )}
              </div>
              
              <div className="text-center">
                {localStorage.getItem('token') ? (
                  <>
                    <p className="text-sm text-muted-foreground mb-4">
                      You will be redirected to the project in a few seconds...
                    </p>
                    <div className="flex gap-2">
                      <Link 
                        to={projectInfo.id ? `/projects/${projectInfo.id}` : '/dashboard'} 
                        className="flex-1"
                      >
                        <Button variant="hero" className="w-full">
                          Go to Project
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      </Link>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-sm text-muted-foreground mb-4">
                      Please sign in to access your project
                    </p>
                    <div className="flex gap-2">
                      <Link 
                        to={`/login?redirect=/projects/${projectInfo.id || projectInfo.projectId || ''}&invited=true`}
                        className="flex-1"
                      >
                        <Button variant="hero" className="w-full">
                          Sign In to Continue
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      </Link>
                    </div>
                  </>
                )}
              </div>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <XCircle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-destructive">Error</p>
                    <p className="text-sm text-destructive/80 mt-1">
                      {errorMessage}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2">
                {errorMessage.includes('Authentication required') || errorMessage.includes('sign in') ? (
                  // Show sign in option for authentication errors
                  <>
                    <Link to="/login" className="flex-1">
                      <Button variant="hero" className="w-full">
                        Sign In
                      </Button>
                    </Link>
                    <Link to="/signup" className="flex-1">
                      <Button variant="outline" className="w-full">
                        Sign Up
                      </Button>
                    </Link>
                  </>
                ) : (
                  // Show retry option for other errors
                  <>
                    <Button 
                      variant="outline" 
                      onClick={retryAcceptInvitation}
                      className="flex-1"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Retrying...
                        </>
                      ) : (
                        'Try Again'
                      )}
                    </Button>
                    <Link to="/dashboard" className="flex-1">
                      <Button variant="outline" className="w-full">
                        Go to Dashboard
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </>
          )}

          <div className="text-center pt-4 border-t">
            <p className="text-xs text-muted-foreground">
              Don't have an account? <Link to="/signup" className="text-primary hover:underline">Sign up</Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AcceptInvitation;
