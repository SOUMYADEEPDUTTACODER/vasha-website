import { useState } from "react";
import { HistoryIcon, Download, Copy, CheckCheck, ExternalLink } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/use-toast";
import { AudioPlayer } from "./AudioPlayer";

export interface ChatResponse {
  id: string;
  text: string;
  timestamp: Date;
  language: string;
  audioUrl?: string;
}

interface ChatHistoryProps {
  responses: ChatResponse[];
}

export function ChatHistory({ responses }: ChatHistoryProps) {
  const [open, setOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    
    toast({
      description: "Response copied to clipboard",
    });
    
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

  const handleDownloadText = (text: string, id: string) => {
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `vasha-response-${id.substring(0, 8)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      description: "Response downloaded as text file",
    });
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="hover:bg-primary/10 transition-colors relative"
        >
          <HistoryIcon className="h-4 w-4" />
          {responses.length > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
              {responses.length}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md md:max-w-lg">
        <SheetHeader>
          <SheetTitle>Response History</SheetTitle>
        </SheetHeader>
        
        {responses.length === 0 ? (
          <div className="flex h-[70vh] items-center justify-center text-muted-foreground">
            No responses yet
          </div>
        ) : (
          <ScrollArea className="h-[calc(100vh-8rem)] pr-4">
            <div className="space-y-6 pt-4">
              {responses.map((response) => (
                <div 
                  key={response.id} 
                  className="rounded-lg border border-border/40 overflow-hidden"
                >
                  <div className="bg-card/50 p-3 flex justify-between items-center border-b border-border/40">
                    <div className="text-xs text-muted-foreground">
                      {response.timestamp.toLocaleString()} • {response.language}
                    </div>
                    <div className="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => handleCopyText(response.text, response.id)}
                      >
                        {copiedId === response.id ? (
                          <CheckCheck className="h-3.5 w-3.5 text-green-500" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => handleDownloadText(response.text, response.id)}
                      >
                        <Download className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                  
                  <Tabs defaultValue="text" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="text">Text</TabsTrigger>
                      <TabsTrigger value="audio" disabled={!response.audioUrl}>
                        Audio
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value="text" className="p-3">
                      <div className="text-sm whitespace-pre-wrap max-h-60 overflow-auto">
                        {response.text}
                      </div>
                    </TabsContent>
                    <TabsContent value="audio" className="p-3">
                      {response.audioUrl && (
                        <AudioPlayer 
                          audioUrl={response.audioUrl} 
                          fileName={`vasha-audio-${response.id.substring(0, 8)}.mp3`}
                        />
                      )}
                    </TabsContent>
                  </Tabs>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </SheetContent>
    </Sheet>
  );
}