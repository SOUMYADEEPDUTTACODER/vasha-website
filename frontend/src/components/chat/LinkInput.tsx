import { useState } from "react";
import { Link2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";

interface LinkInputProps {
  onLinkSubmit: (url: string) => void;
}

export function LinkInput({ onLinkSubmit }: LinkInputProps) {
  const [open, setOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [enteredLink, setEnteredLink] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple URL validation (YouTube only)
    try {
      const url = new URL(linkUrl);
      if (url.protocol !== 'http:' && url.protocol !== 'https:') {
        throw new Error('Invalid protocol');
      }
      const host = url.hostname.toLowerCase();
      const isYouTube = host.includes('youtube.com') || host === 'youtu.be';
      if (!isYouTube) {
        throw new Error('NotYouTube');
      }
      
      onLinkSubmit(linkUrl);
      setEnteredLink(linkUrl);
      setLinkUrl("");
      setOpen(false);
      
    } catch (error) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid YouTube URL (http/https)",
        variant: "destructive",
      });
    }
  };

  const clearLink = () => {
    setEnteredLink(null);
  };

  return (
    <div>
      {!enteredLink ? (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="hover:bg-primary/10 transition-colors"
            >
              <Link2 className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Enter YouTube link</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                placeholder="https://www.youtube.com/watch?v=... or https://youtu.be/..."
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                className="w-full"
              />
              <div className="flex justify-end">
                <Button type="submit">Submit</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      ) : (
        <div className="flex items-center space-x-2 rounded-full bg-primary/10 px-3 py-1 text-xs">
          <span className="truncate max-w-[100px]">{enteredLink}</span>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={clearLink}
            className="h-4 w-4 rounded-full p-0 hover:bg-primary/20"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}
    </div>
  );
}