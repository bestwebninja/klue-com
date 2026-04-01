import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
export function QuickActionCard({ label, description }: { label: string; description: string }) { return <Card><CardContent className="pt-6"><p className="font-medium">{label}</p><p className="text-sm mb-3">{description}</p><Button size="sm">Run</Button></CardContent></Card>; }
