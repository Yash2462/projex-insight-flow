import React from "react";

interface CommentRendererProps {
  content: string;
}

const CommentRenderer = ({ content }: CommentRendererProps) => {
  // Regex to find URLs
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  
  // Split content by whitespace and analyze each part
  const parts = content.split(/(\s+)/);

  const isImageUrl = (url: string) => {
    return url.match(/\.(jpeg|jpg|gif|png|webp|svg)$/) != null || url.includes('giphy.com/media/') || url.includes('tenor.com/view/');
  };

  return (
    <div className="space-y-3">
      <div className="whitespace-pre-wrap break-words">
        {parts.map((part, i) => {
          if (part.match(urlRegex)) {
            return (
              <a 
                key={i} 
                href={part} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-primary hover:underline transition-all"
              >
                {part}
              </a>
            );
          }
          return <span key={i}>{part}</span>;
        })}
      </div>
      
      {/* Inline Image/GIF Previews */}
      <div className="flex flex-wrap gap-3">
        {content.match(urlRegex)?.map((url, i) => {
          if (isImageUrl(url)) {
            return (
              <div key={i} className="relative group max-w-sm rounded-2xl overflow-hidden border border-primary/10 shadow-sm transition-all hover:border-primary/30">
                <img 
                  src={url} 
                  alt="comment attachment" 
                  className="max-h-[300px] w-auto object-contain bg-muted/20"
                  onError={(e) => (e.currentTarget.style.display = 'none')}
                />
              </div>
            );
          }
          return null;
        })}
      </div>
    </div>
  );
};

export default CommentRenderer;
