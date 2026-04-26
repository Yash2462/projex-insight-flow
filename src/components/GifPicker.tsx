import React, { useState } from 'react';
import { GiphyFetch } from '@giphy/js-fetch-api';
import { Grid } from '@giphy/react-components';
import { Input } from '@/components/ui/input';
import { Search, X } from 'lucide-react';

const gf = new GiphyFetch('sX7SOfmS0Auy8qIsCHZA9W6mO6N87t97'); // Public Beta Key

interface GifPickerProps {
  onSelect: (url: string) => void;
}

const GifPicker = ({ onSelect }: GifPickerProps) => {
  const [search, setSearch] = useState('');

  const fetchGifs = (offset: number) => {
    if (search) {
      return gf.search(search, { offset, limit: 10 });
    }
    return gf.trending({ offset, limit: 10 });
  };

  return (
    <div className="bg-card border border-primary/10 rounded-3xl p-4 w-[300px] shadow-2xl space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground opacity-40" />
        <Input
          placeholder="Search GIPHY..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 h-10 rounded-xl bg-muted/20 border-primary/5 text-xs font-bold"
        />
      </div>
      
      <div className="h-[300px] overflow-y-auto scrollbar-hide rounded-xl">
        <Grid
          key={search}
          width={268}
          columns={2}
          fetchGifs={fetchGifs}
          onGifClick={(gif, e) => {
            e.preventDefault();
            // Use downsized_medium for better compatibility and loading speed
            onSelect(gif.images.downsized_medium.url);
          }}
          gutter={6}
        />
      </div>
      <div className="flex justify-center">
        <img src="https://micro-frontends.org/giphy-logo.png" alt="Powered by GIPHY" className="h-3 opacity-30" />
      </div>
    </div>
  );
};

export default GifPicker;
