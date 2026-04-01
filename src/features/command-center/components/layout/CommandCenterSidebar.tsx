import { Link } from "react-router-dom";

const items = ["Today", "Pipeline", "Analytics", "AI Agents", "Compliance", "Integrations", "Settings"];

export function CommandCenterSidebar({ basePath }: { basePath: string }) {
  return <aside className="border-r p-3 min-w-44"><nav className="space-y-2">{items.map((item) => <Link key={item} className="block text-sm hover:underline" to={`${basePath}`}>{item}</Link>)}</nav></aside>;
}
