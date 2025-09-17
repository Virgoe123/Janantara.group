
"use client";

import { useActionState, useRef, useState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { addTestimonial, LoginState } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Star, Send, LoaderCircle, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

function StarRating({ rating, onRatingChange, error }: { rating: number; onRatingChange: (rating: number) => void; error?: string[] }) {
  const [hoverRating, setHoverRating] = useState(0);

  return (
    <div className="space-y-2">
      <Label>Your Rating</Label>
      <div className="flex items-center gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            onClick={() => onRatingChange(star)}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            className={cn(
              "h-8 w-8 cursor-pointer transition-all duration-200",
              (hoverRating || rating) >= star
                ? "text-yellow-400 fill-yellow-400"
                : "text-muted-foreground/50"
            )}
          />
        ))}
      </div>
       {error && <p className="text-sm font-medium text-destructive">{error[0]}</p>}
    </div>
  );
}

export default function ReviewForm() {
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const initialState: LoginState = { message: null, errors: {} };
  const [state, formAction] = useActionState(addTestimonial, initialState);
  const [showSuccess, setShowSuccess] = useState(false);
  const [rating, setRating] = useState(0);

  useEffect(() => {
    if (state?.success) {
      // Don't show toast on success, show the success message component instead
      formRef.current?.reset();
      setRating(0);
      setShowSuccess(true);
    } else if (state?.message && !state.success && Object.keys(state.errors || {}).length > 0) {
      toast({
        variant: "destructive",
        title: "Action Failed",
        description: "Please check the form for errors.",
      });
    }
  }, [state, toast]);

  if (showSuccess) {
    return (
        <div className="text-center py-12 space-y-4 flex flex-col items-center">
            <CheckCircle className="h-16 w-16 text-green-500"/>
            <h2 className="text-2xl font-bold font-headline">Thank You!</h2>
            <p className="text-muted-foreground max-w-md">{state?.message || "Your review has been published. We appreciate you taking the time to share your feedback."}</p>
            <Button variant="outline" onClick={() => setShowSuccess(false)}>Submit Another Review</Button>
        </div>
    )
  }

  function SubmitButton() {
    const { pending } = useFormStatus();
    return (
      <Button type="submit" disabled={pending} className="w-full text-lg">
        {pending ? (
          <>
            <LoaderCircle className="mr-2 h-5 w-5 animate-spin" />
            Submitting...
          </>
        ) : (
          <>
            <Send className="mr-2 h-5 w-5" />
            Send My Review
          </>
        )}
      </Button>
    );
  }

  return (
    <form action={formAction} ref={formRef} className="space-y-6">
      <input type="hidden" name="rating" value={rating} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <Input id="name" name="name" required />
          {state?.errors?.name && <p className="text-sm font-medium text-destructive">{state.errors.name[0]}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="title">Your Title / Company (Optional)</Label>
          <Input id="title" name="title" />
           {state?.errors?.title && <p className="text-sm font-medium text-destructive">{state.errors.title[0]}</p>}
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="quote">Your Review</Label>
        <Textarea id="quote" name="quote" required rows={5} />
        {state?.errors?.quote && <p className="text-sm font-medium text-destructive">{state.errors.quote[0]}</p>}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        <StarRating 
            rating={rating}
            onRatingChange={setRating} 
            error={state?.errors?.rating}
        />
        <div className="space-y-2">
          <Label htmlFor="avatar">Your Photo (Optional)</Label>
          <Input id="avatar" name="avatar" type="file" accept="image/*" className="file:text-foreground" />
          {state?.errors?.avatar && <p className="text-sm font-medium text-destructive">{state.errors.avatar[0]}</p>}
        </div>
      </div>
      <div className="pt-4">
        <SubmitButton />
      </div>
    </form>
  );
}
