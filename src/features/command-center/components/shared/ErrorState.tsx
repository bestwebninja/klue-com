import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function ErrorState({ title, message }: { title: string; message: string }) {
  return <Alert variant="destructive"><AlertTitle>{title}</AlertTitle><AlertDescription>{message}</AlertDescription></Alert>;
}
