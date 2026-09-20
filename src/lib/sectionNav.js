export const DEFAULT_HEADER_OFFSET = 110;

export function labelFromKnobEvent(event) {
  const anchor = event.currentTarget;
  return (
    (anchor?.querySelector && anchor.querySelector('h3')?.textContent) ||
    event.target?.textContent ||
    ''
  ).trim();
}

export function hashFromHref(href) {
  if (!href || typeof href !== 'string') {
    return '';
  }
  const parts = href.split('#');
  return parts.length > 1 ? parts[parts.length - 1] : '';
}

/**
 * Smooth-scroll to a section by id, accounting for the sticky header.
 * Returns true when a matching element was found.
 */
export function scrollToSection(
  hash,
  {
    headerOffset = DEFAULT_HEADER_OFFSET,
    scrollTo = typeof window !== 'undefined'
      ? window.scrollTo.bind(window)
      : () => {},
    getElementById = typeof document !== 'undefined'
      ? document.getElementById.bind(document)
      : () => null,
    getScrollY = typeof window !== 'undefined' ? () => window.scrollY : () => 0,
  } = {}
) {
  if (!hash) {
    return false;
  }

  const el = getElementById(hash);
  if (!el) {
    return false;
  }

  const top = el.getBoundingClientRect().top + getScrollY() - headerOffset;
  scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
  return true;
}
