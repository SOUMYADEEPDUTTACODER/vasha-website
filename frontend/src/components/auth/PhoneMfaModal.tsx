import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { useAuth } from "@/context/AuthContext";

export function PhoneMfaModal() {
  const [open, setOpen] = useState(false);
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const { signInWithGoogleAndEnrollPhone } = useAuth();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">Continue with Google + Phone</Button>
      </DialogTrigger>
      <DialogContent>
        <div className="space-y-3">
          <Input placeholder="+15551234567" value={phone} onChange={(e) => setPhone(e.target.value)} />
          <Input placeholder="6-digit code" value={code} onChange={(e) => setCode(e.target.value)} />
          <Button
            className="w-full"
            onClick={async () => {
              await signInWithGoogleAndEnrollPhone(
                async () => phone,
                async () => code
              );
              setOpen(false);
            }}
          >
            Verify & Continue
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
