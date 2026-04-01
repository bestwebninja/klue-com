import { Card, CardContent } from "@/components/ui/card";
export function AlertCard({ title, detail }: { title: string; detail: string }) { return <Card><CardContent className="pt-6"><p className="font-medium">{title}</p><p className="text-sm text-muted-foreground">{detail}</p></CardContent></Card>; }
