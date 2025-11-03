import { Globe } from "lucide-react";

export const languages = {
  // --- Indic languages ---
  'as': 'Assamese',
  'bn': 'Bengali',
  'brx': 'Bodo',
  'doi': 'Dogri',
  'gu': 'Gujarati',
  'hi': 'Hindi',
  'kn': 'Kannada',
  'kas_Arab': 'Kashmiri (Arabic)',
  'kas_Deva': 'Kashmiri (Devanagari)',
  'gom': 'Konkani',
  'mai': 'Maithili',
  'ml': 'Malayalam',
  'mr': 'Marathi',
  'mni_Beng': 'Manipuri (Bengali)',
  'mni_Mtei': 'Manipuri (Meitei)',
  'npi': 'Nepali',
  'or': 'Odia',
  'pa': 'Punjabi',
  'sa': 'Sanskrit',
  'sat': 'Santali',
  'snd_Arab': 'Sindhi (Arabic)',
  'snd_Deva': 'Sindhi (Devanagari)',
  'ta': 'Tamil',
  'te': 'Telugu',
  'ur': 'Urdu',

  // --- Global languages ---
  'en': 'English',
  'es': 'Spanish',
  'fr': 'French',
  'de': 'German',
  'it': 'Italian',
  'pt': 'Portuguese',
  'ru': 'Russian',
  'zh': 'Chinese (Simplified)',
  'ja': 'Japanese',
  'ko': 'Korean',
  'ar': 'Arabic',
  'fa': 'Persian',
  'tr': 'Turkish',
  'id': 'Indonesian',
};

interface LanguageSelectorProps {
  selectedLanguage: string;
  onLanguageChange: (language: string) => void;
}

export function LanguageSelector({ selectedLanguage, onLanguageChange }: LanguageSelectorProps) {
  return (
    <div className="flex items-center gap-2">
      <Globe className="h-4 w-4" />
      <select
        value={selectedLanguage}
        onChange={e => onLanguageChange(e.target.value)}
        className="border rounded px-2 py-1"
        style={{ color: "#000" }} // Set text color to black for the selected value
      >
        <option value="" disabled style={{ color: "#000" }}>Select language</option>
        {Object.entries(languages).map(([code, name]) => (
          <option key={code} value={code} style={{ color: "#000" }}>
            {name}
          </option>
        ))}
      </select>
    </div>
  );
}
