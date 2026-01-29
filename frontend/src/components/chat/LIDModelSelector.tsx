import { Languages } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface LIDModelSelectorProps {
  selectedLIDModel: string;
  onLIDModelChange: (model: string) => void;
}

const lidModels = [
  { value: "whisper", label: "Whisper", description: "OpenAI Whisper LID" },
  { value: "facebook_mms", label: "Facebook MMS", description: "Odia Specific LID" },
];

export function LIDModelSelector({
  selectedLIDModel,
  onLIDModelChange,
}: LIDModelSelectorProps) {
  return (
    <div className="flex items-center gap-2">
      <Languages className="h-4 w-4" />
      <div className="flex items-center space-x-2">
        <Select value={selectedLIDModel} onValueChange={onLIDModelChange}>
          <SelectTrigger className="w-[140px] h-8 text-xs">
            <SelectValue placeholder="Select LID model" />
          </SelectTrigger>
          <SelectContent>
            {lidModels.map((model) => (
              <SelectItem key={model.value} value={model.value} className="text-xs">
                <div className="flex flex-col">
                  <span className="font-medium">{model.label}</span>
                  <span className="text-xs text-muted-foreground">
                    {model.description}
                  </span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

