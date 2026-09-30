import { defaultLayoutForWidth, PARTICIPATE_SESSION_KEY } from './session';

describe('participate public defaults', () => {
  it('picks preview layout at tablet widths and auto on desktop', () => {
    expect(defaultLayoutForWidth(1280)).toBe('preview');
    expect(defaultLayoutForWidth(800)).toBe('preview');
    expect(defaultLayoutForWidth(1281)).toBe('auto');
  });

  it('uses a participate-specific session key', () => {
    expect(PARTICIPATE_SESSION_KEY).toContain('participate');
    expect(PARTICIPATE_SESSION_KEY).not.toBe('eemb.session.v1');
  });
});
