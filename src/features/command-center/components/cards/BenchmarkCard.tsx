import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
export function BenchmarkCard({ metric }: { metric: string }) { return <Card><CardHeader><CardTitle className="text-sm">Benchmark</CardTitle></CardHeader><CardContent>{metric}</CardContent></Card>; }
