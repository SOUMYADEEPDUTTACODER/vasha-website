import { useState, useEffect } from "react";
import { Cpu, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { asrService, Model } from "@/services/asrService";

interface ModelSelectorProps {
  selectedModel: string;
  onModelChange: (model: string) => void;
  selectedWhisperSize: string;
  onWhisperSizeChange: (size: string) => void;
  selectedDecoding: string;
  onDecodingChange: (decoding: string) => void;
}

const whisperSizes = [
  { value: "tiny", label: "Tiny (39 MB)" },
  { value: "base", label: "Base (74 MB)" },
  { value: "small", label: "Small (244 MB)" },
  { value: "medium", label: "Medium (769 MB)" },
  { value: "large", label: "Large (1550 MB)" },
];

const decodingStrategies = [
  { value: "ctc", label: "CTC (Connectionist Temporal Classification)" },
  { value: "rnnt", label: "RNN-T (Recurrent Neural Network Transducer)" },
];

export function ModelSelector({
  selectedModel,
  onModelChange,
  selectedWhisperSize,
  onWhisperSizeChange,
  selectedDecoding,
  onDecodingChange,
}: ModelSelectorProps) {
  const [models, setModels] = useState<Model[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchModels = async () => {
      try {
        const response = await asrService.getModels();
        setModels(response.models);
      } catch (error) {
        console.error("Failed to fetch models:", error);
        toast({
          title: "Failed to load models",
          description: "Using default models. Some features may not work.",
          variant: "destructive",
        });
        // Set default models as fallback
        setModels([
          {
            id: "whisper",
            name: "Whisper",
            description: "OpenAI's Whisper model",
            supports_fallback: false,
          },
          {
            id: "faster_whisper",
            name: "Faster Whisper",
            description: "Optimized Whisper implementation",
            supports_fallback: false,
          },
          {
            id: "ai4bharat",
            name: "AI4Bharat Indic Conformer",
            description: "Multilingual ASR for Indic languages",
            supports_fallback: true,
            fallback_to: "whisper",
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchModels();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <Cpu className="h-4 w-4" />
        <div className="flex items-center space-x-2">
          <Loader2 className="h-3 w-3 animate-spin" />
          <span className="text-xs text-muted-foreground">Loading models...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 font-sans">
      <Cpu className="h-4 w-4 text-primary" />
      <div className="flex items-center space-x-2">
        <Select value={selectedModel} onValueChange={onModelChange}>
          <SelectTrigger className="w-[160px] h-9 text-sm font-semibold bg-gradient-to-r from-white/5 to-white/3 backdrop-blur-sm rounded-md shadow-lg">
            <SelectValue placeholder="Select model" />
          </SelectTrigger>
          <SelectContent>
            {models.map((model) => (
              <SelectItem key={model.id} value={model.id} className="text-sm">
                <div className="flex flex-col">
                  <span className="font-semibold">{model.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {model.description}
                  </span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {selectedModel === "whisper" || selectedModel === "faster_whisper" ? (
          <Select value={selectedWhisperSize} onValueChange={onWhisperSizeChange}>
            <SelectTrigger className="w-[120px] h-9 text-sm font-semibold bg-gradient-to-r from-white/5 to-white/3 backdrop-blur-sm rounded-md shadow-md">
              <SelectValue placeholder="Size" />
            </SelectTrigger>
            <SelectContent>
              {whisperSizes.map((size) => (
                <SelectItem key={size.value} value={size.value} className="text-sm">
                  {size.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : null}

        {selectedModel === "ai4bharat" ? (
          <Select value={selectedDecoding} onValueChange={onDecodingChange}>
            <SelectTrigger className="w-[100px] h-9 text-sm font-semibold bg-gradient-to-r from-white/5 to-white/3 backdrop-blur-sm rounded-md shadow-md">
              <SelectValue placeholder="Decode" />
            </SelectTrigger>
            <SelectContent>
              {decodingStrategies.map((strategy) => (
                <SelectItem key={strategy.value} value={strategy.value} className="text-sm">
                  {strategy.value.toUpperCase()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : null}
      </div>
    </div>
  );
}
