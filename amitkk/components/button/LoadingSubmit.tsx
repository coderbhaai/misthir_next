import { Button } from "@amitkk/components/button/button";
import { Loader2 } from "lucide-react";

interface SubmitButtonProps {
  title: string;
  loading: boolean;
}

export function SubmitButton({title, loading}: SubmitButtonProps) {
  return (
    <Button type="submit" disabled={loading}>{loading && ( <Loader2 className="mr-2 h-4 w-4 animate-spin" /> )} {title}</Button>
  );
}