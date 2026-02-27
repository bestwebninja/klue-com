type CategoryStyle = {
  /** CSS color string (e.g. `hsl(var(--cat-home))`) */
  color: string;
  /** Emoji icon for map markers */
  icon: string;
};

const DEFAULT_STYLE: CategoryStyle = {
  color: 'hsl(var(--primary))',
  icon: '•',
};

// NOTE: We intentionally return CSS-variable-backed HSL strings so the map styling
// stays consistent with the app theme tokens.
export function getCategoryStyle(categoryName: string | null | undefined): CategoryStyle {
  if (!categoryName) return DEFAULT_STYLE;
  const name = categoryName.toLowerCase();

  // Main buckets
  if (name.includes('home diy') || name.includes('renovation') || name.includes('builder') || name.includes('handyman')) {
    return { color: 'hsl(var(--cat-home))', icon: '🛠️' };
  }
  if (name.includes('commercial') || name.includes('shopfitting') || name.includes('maintenance')) {
    return { color: 'hsl(var(--cat-commercial))', icon: '🏢' };
  }
  if (name.includes('events') || name.includes('catering') || name.includes('wedding') || name.includes('dj') || name.includes('photography')) {
    return { color: 'hsl(var(--cat-events))', icon: '🎉' };
  }
  if (name.includes('health') || name.includes('fitness') || name.includes('massage') || name.includes('therapy')) {
    return { color: 'hsl(var(--cat-health))', icon: '💪' };
  }
  if (name.includes('agriculture') || name.includes('moving') || name.includes('transport') || name.includes('courier') || name.includes('movers')) {
    return { color: 'hsl(var(--cat-transport))', icon: '🚚' };
  }
  if (name.includes('pets') || name.includes('dog') || name.includes('cat') || name.includes('pet')) {
    return { color: 'hsl(var(--cat-pets))', icon: '🐾' };
  }
  if (name.includes('business') || name.includes('account') || name.includes('consult')) {
    return { color: 'hsl(var(--cat-business))', icon: '📊' };
  }
  if (name.includes('it') || name.includes('software') || name.includes('web') || name.includes('seo') || name.includes('hosting') || name.includes('computer')) {
    return { color: 'hsl(var(--cat-it))', icon: '💻' };
  }
  if (name.includes('legal') || name.includes('attorney') || name.includes('law')) {
    return { color: 'hsl(var(--cat-legal))', icon: '⚖️' };
  }
  if (name.includes('lessons') || name.includes('tutor') || name.includes('language') || name.includes('academic')) {
    return { color: 'hsl(var(--cat-lessons))', icon: '📚' };
  }

  return DEFAULT_STYLE;
}
