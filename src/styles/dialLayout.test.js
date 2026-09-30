import { DIAL_LABEL_ANGLES_DEG } from '../styles/knob-styles';

describe('dial label layout', () => {
  it('spaces six labels evenly from 12 o\'clock to 4 o\'clock', () => {
    expect(DIAL_LABEL_ANGLES_DEG).toEqual([0, 24, 48, 72, 96, 120]);

    const steps = DIAL_LABEL_ANGLES_DEG.slice(1).map(
      (angle, index) => angle - DIAL_LABEL_ANGLES_DEG[index]
    );
    expect(steps.every((step) => step === 24)).toBe(true);
  });
});
