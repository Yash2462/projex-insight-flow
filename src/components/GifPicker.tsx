import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Search, AlertCircle, Loader2 } from 'lucide-react';

interface TenorGif {
  id: string;
  media_formats: {
    tinygif: {
      url: string;
    };
    gif: {
      url: string;
    };
  };
  content_description: string;
}

interface GifPickerProps {
  onSelect: (url: string) => void;
}

const GifPicker = ({ onSelect }: GifPickerProps) => {
  const [search, setSearch] = useState('');
  const [gifs, setGifs] = useState<TenorGif[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  // Tenor API Key (Public for demo/dev, ideally should be in .env)
  const TENOR_API_KEY = "LIVDSRZULEUE"; // Standard public test key

  const fetchGifs = async (query: string) => {
    setLoading(true);
    setError(false);
    try {
      const endpoint = query 
        ? `https://tenor.googleapis.com/v2/search?q=${query}&key=${TENOR_API_KEY}&limit=12`
        : `https://tenor.googleapis.com/v2/featured?key=${TENOR_API_KEY}&limit=12`;
      
      const response = await fetch(endpoint);
      const data = await response.json();
      
      if (data.results) {
        setGifs(data.results);
      } else {
        setError(true);
      }
    } catch (err) {
      console.error("Tenor API Error:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchGifs(search);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  return (
    <div className="bg-card border border-primary/10 rounded-3xl p-4 w-[310px] shadow-2xl space-y-4 animate-in fade-in zoom-in duration-300">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground opacity-40" />
        <Input
          placeholder="Search GIFs (via Tenor)..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 h-10 rounded-xl bg-muted/20 border-primary/5 text-xs font-bold focus:ring-primary/20"
        />
      </div>
      
      <div className="h-[300px] overflow-y-auto no-scrollbar rounded-xl relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm z-10">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        )}

        {error ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-4 space-y-2">
            <AlertCircle className="h-8 w-8 text-destructive opacity-40" />
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">
              Media Search Unavailable
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {gifs.map((gif) => (
              <button
                key={gif.id}
                onClick={() => onSelect(gif.media_formats.gif.url)}
                className="group relative aspect-square rounded-lg overflow-hidden border border-primary/5 hover:border-primary/20 transition-all bg-muted/10"
              >
                <img
                  src={gif.media_formats.tinygif.url}
                  alt={gif.content_description}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  loading="lazy"
                />
              </button>
            ))}
          </div>
        )}
        
        {!loading && !error && gifs.length === 0 && (
          <div className="flex items-center justify-center h-full opacity-20">
            <p className="text-[10px] font-black uppercase">No Results</p>
          </div>
        )}
      </div>
      
      <div className="flex items-center justify-between px-1">
        <span className="text-[8px] font-black uppercase opacity-20 tracking-widest">Powered by Tenor</span>
        <div className="flex gap-1">
           <div className="w-1 h-1 rounded-full bg-primary/20" />
           <div className="w-1 h-1 rounded-full bg-primary/40" />
           <div className="w-1 h-1 rounded-full bg-primary/20" />
        </div>
      </div>
    </div>
  );
};

export default GifPicker;
