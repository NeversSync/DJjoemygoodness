import { DIAL_LABEL_ANGLES_DEG } from '../styles/knob-styles';

describe('dial label layout', () => {
  it('spaces five labels evenly from 12 o\'clock to 4 o\'clock', () => {
    expect(DIAL_LABEL_ANGLES_DEG).toEqual([0, 30, 60, 90, 120]);

    const steps = DIAL_LABEL_ANGLES_DEG.slice(1).map(
      (angle, index) => angle - DIAL_LABEL_ANGLES_DEG[index]
    );
    expect(steps.every((step) => step === 30)).toBe(true);
  });
});
