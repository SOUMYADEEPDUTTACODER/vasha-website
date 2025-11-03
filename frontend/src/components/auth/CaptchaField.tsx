import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { RefreshCw } from 'lucide-react';

interface CaptchaFieldProps {
  value: string;
  onChange: (value: string) => void;
  onValidChange: (isValid: boolean) => void;
}

export const CaptchaField: React.FC<CaptchaFieldProps> = ({
  value,
  onChange,
  onValidChange
}) => {
  const [captchaText, setCaptchaText] = useState('');
  const [userInput, setUserInput] = useState('');

  const generateCaptcha = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaText(result);
    setUserInput('');
    onChange('');
    onValidChange(false);
  };

  useEffect(() => {
    generateCaptcha();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value.toUpperCase();
    setUserInput(input);
    onChange(input);
    onValidChange(input === captchaText);
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="captcha">Captcha Verification</Label>
      <div className="flex items-center space-x-3">
        <div className="flex-1">
          <div className="bg-muted p-3 rounded border text-center font-mono text-lg tracking-widest select-none">
            {captchaText}
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={generateCaptcha}
          className="shrink-0"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>
      <Input
        id="captcha"
        type="text"
        placeholder="Enter the code above"
        value={userInput}
        onChange={handleInputChange}
        className="uppercase tracking-widest"
        maxLength={6}
      />
      <p className="text-xs text-muted-foreground">
        Please enter the 6-character code shown above to verify you're human.
      </p>
    </div>
  );
};
