import { useState } from "react";
import { MessageSquare, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/components/ui/use-toast";
import { API_BASE_URL } from "@/config/api";

export function FeedbackButton() {
    const { username } = useAuth();
    const [open, setOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [rating, setRating] = useState(0);
    const [message, setMessage] = useState("");
    const [email, setEmail] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!message) {
            toast({
                title: "Message required",
                description: "Please enter your feedback message.",
                variant: "destructive",
            });
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await fetch(`${API_BASE_URL}/feedback`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    username: username || "Anonymous",
                    email: email || "Not provided",
                    message,
                    rating: rating > 0 ? `${rating}/5` : "N/A",
                }),
            });

            if (!response.ok) throw new Error("Failed to submit feedback");

            toast({
                title: "Feedback sent!",
                description: "Thank you for helping us improve Vasha AI.",
            });
            setOpen(false);
            setMessage("");
            setRating(0);
            setEmail("");
        } catch (error) {
            toast({
                title: "Error",
                description: "Something went wrong. Please try again later.",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <div className="fixed right-0 top-1/2 -translate-y-1/2 z-50">
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <button
                            className="bg-emerald-600 text-white px-2 py-6 rounded-l-xl shadow-2xl flex flex-col items-center gap-2 hover:bg-emerald-700 transition-all border-l border-y border-white/20 backdrop-blur-sm group"
                        >
                            <MessageSquare className="h-5 w-5 mb-1 group-hover:scale-110 transition-transform" />
                            <span
                                className="font-bold tracking-widest text-[10px] uppercase"
                                style={{ writingMode: 'vertical-rl' }}
                            >
                                Feedback
                            </span>
                        </button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px] rounded-3xl">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-bold text-center bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                                Share Your Feedback
                            </DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Your Email (Optional)</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="email@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="bg-muted/50 border-none rounded-xl h-12 focus:ring-2 focus:ring-emerald-500"
                                />
                            </div>

                            <div className="space-y-3">
                                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground text-center block">How would you rate us?</Label>
                                <div className="flex justify-center gap-3 pt-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setRating(star)}
                                            className={`p-1 transition-all duration-200 hover:scale-125 ${rating >= star ? "text-yellow-400 fill-yellow-400 drop-shadow-md" : "text-slate-300"
                                                }`}
                                        >
                                            <Star className={`h-8 w-8 ${rating >= star ? "fill-current" : ""}`} />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="message" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Your Message</Label>
                                <Textarea
                                    id="message"
                                    placeholder="Tell us about your experience..."
                                    className="min-h-[120px] bg-muted/50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 p-4 resize-none"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    required
                                />
                            </div>

                            <DialogFooter>
                                <Button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold h-14 rounded-2xl shadow-lg transform active:scale-[0.98] transition-all"
                                >
                                    {isSubmitting ? "Sending..." : "Submit Feedback"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </>
    );
}
