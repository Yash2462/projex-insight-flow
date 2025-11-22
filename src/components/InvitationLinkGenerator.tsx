import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Copy, 
  Check, 
  Mail, 
  Users, 
  ExternalLink,
  Send,
  Loader2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface InvitationLinkGeneratorProps {
  projectId: number;
  projectName: string;
  onSendInvitation: (email: string, inviteLink: string) => Promise<void>;
}

const InvitationLinkGenerator = ({ 
  projectId, 
  projectName, 
  onSendInvitation 
}: InvitationLinkGeneratorProps) => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState(`You've been invited to join the "${projectName}" project on ProjeX!`);
  const [inviteToken, setInviteToken] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [sending, setSending] = useState(false);
  const { toast } = useToast();

  // Generate a mock token for demonstration (in real app, this would come from backend)
  const generateInviteToken = () => {
    const token = `${projectId}-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
    setInviteToken(token);
    return token;
  };

  const generateInviteLink = (token?: string) => {
    const currentToken = token || inviteToken || generateInviteToken();
    const baseUrl = window.location.origin;
    return `${baseUrl}/accept_invitation?token=${currentToken}`;
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
      
      toast({
        title: "Link copied!",
        description: "Invitation link has been copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Unable to copy link to clipboard",
        variant: "destructive",
      });
    }
  };

  const handleSendInvitation = async () => {
    if (!email.trim()) {
      toast({
        title: "Error",
        description: "Please enter an email address",
        variant: "destructive",
      });
      return;
    }

    setSending(true);
    try {
      const token = generateInviteToken();
      const inviteLink = generateInviteLink(token);
      await onSendInvitation(email, inviteLink);
      
      toast({
        title: "Invitation sent!",
        description: `Invitation has been sent to ${email}`,
      });
      
      setEmail('');
    } catch (error) {
      toast({
        title: "Failed to send invitation",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  const handleGenerateLink = () => {
    generateInviteToken();
  };

  const inviteLink = inviteToken ? generateInviteLink() : '';

  return (
    <div className="space-y-6">
      {/* Quick Invite Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            Send Email Invitation
          </CardTitle>
          <CardDescription>
            Send a direct invitation email to team members
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="invite-email">Email Address</Label>
            <Input
              id="invite-email"
              type="email"
              placeholder="colleague@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="invite-message">Invitation Message</Label>
            <Textarea
              id="invite-message"
              placeholder="Add a personal message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              className="focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <Button 
            onClick={handleSendInvitation}
            disabled={sending || !email.trim()}
            className="w-full"
            variant="hero"
          >
            {sending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Sending Invitation...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Send Invitation
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Link Generator Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ExternalLink className="h-5 w-5 text-primary" />
            Generate Invitation Link
          </CardTitle>
          <CardDescription>
            Create a shareable link for project invitations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!inviteLink ? (
            <Button onClick={handleGenerateLink} variant="outline" className="w-full">
              <Users className="h-4 w-4 mr-2" />
              Generate Invitation Link
            </Button>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Label>Invitation Link</Label>
                <Badge variant="secondary" className="text-xs">
                  {projectName}
                </Badge>
              </div>
              
              <div className="flex gap-2">
                <Input
                  value={inviteLink}
                  readOnly
                  className="font-mono text-sm bg-muted/30"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => copyToClipboard(inviteLink)}
                  className="flex-shrink-0"
                >
                  {copiedLink ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>

              <div className="bg-muted/30 rounded-lg p-4 space-y-2">
                <h4 className="font-medium text-sm">How to use this link:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Share this link with anyone you want to invite</li>
                  <li>• Recipients can click the link to join the project</li>
                  <li>• Link includes project details and access permissions</li>
                  <li>• Recipients may need to sign up if they don't have an account</li>
                </ul>
              </div>

              <Button 
                onClick={handleGenerateLink} 
                variant="outline" 
                size="sm"
              >
                Generate New Link
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Email Preview */}
      {inviteLink && email && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Email Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-muted/30 rounded-lg p-4 text-sm space-y-2">
              <div><strong>To:</strong> {email}</div>
              <div><strong>Subject:</strong> Invitation to join "{projectName}" project</div>
              <div className="pt-2 border-t">
                <p>{message}</p>
                <p className="mt-3">
                  <strong>Click here to join:</strong>{' '}
                  <a href={inviteLink} className="text-primary underline break-all">
                    {inviteLink}
                  </a>
                </p>
                <p className="mt-2 text-muted-foreground text-xs">
                  Sent from ProjeX Project Management
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default InvitationLinkGenerator;
