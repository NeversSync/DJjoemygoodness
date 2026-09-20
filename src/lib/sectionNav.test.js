import {
  hashFromHref,
  labelFromKnobEvent,
  scrollToSection,
} from './sectionNav';

describe('sectionNav', () => {
  describe('hashFromHref', () => {
    it('extracts the fragment from a path hash', () => {
      expect(hashFromHref('/#about')).toBe('about');
      expect(hashFromHref('/#side-projects')).toBe('side-projects');
    });

    it('returns empty string when there is no hash', () => {
      expect(hashFromHref('/past-experience')).toBe('');
      expect(hashFromHref('')).toBe('');
      expect(hashFromHref(null)).toBe('');
    });
  });

  describe('labelFromKnobEvent', () => {
    it('prefers the nested h3 label on the current target', () => {
      const h3 = { textContent: '  ABOUT  ' };
      const event = {
        currentTarget: {
          querySelector: (selector) => (selector === 'h3' ? h3 : null),
        },
        target: { textContent: 'ABOUT' },
      };

      expect(labelFromKnobEvent(event)).toBe('ABOUT');
    });

    it('falls back to the event target text', () => {
      const event = {
        currentTarget: {
          querySelector: () => null,
        },
        target: { textContent: ' MUSIC ' },
      };

      expect(labelFromKnobEvent(event)).toBe('MUSIC');
    });
  });

  describe('scrollToSection', () => {
    it('scrolls to the section with a sticky-header offset', () => {
      const scrollTo = jest.fn();
      const getElementById = jest.fn(() => ({
        getBoundingClientRect: () => ({ top: 500 }),
      }));

      const found = scrollToSection('about', {
        headerOffset: 110,
        scrollTo,
        getElementById,
        getScrollY: () => 0,
      });

      expect(found).toBe(true);
      expect(getElementById).toHaveBeenCalledWith('about');
      expect(scrollTo).toHaveBeenCalledWith({
        top: 390,
        behavior: 'smooth',
      });
    });

    it('returns false and does not scroll when the section is missing', () => {
      const scrollTo = jest.fn();

      const found = scrollToSection('missing', {
        scrollTo,
        getElementById: () => null,
      });

      expect(found).toBe(false);
      expect(scrollTo).not.toHaveBeenCalled();
    });

    it('clamps negative scroll positions to zero', () => {
      const scrollTo = jest.fn();

      scrollToSection('home', {
        headerOffset: 110,
        scrollTo,
        getElementById: () => ({
          getBoundingClientRect: () => ({ top: 40 }),
        }),
        getScrollY: () => 0,
      });

      expect(scrollTo).toHaveBeenCalledWith({
        top: 0,
        behavior: 'smooth',
      });
    });
  });
});
