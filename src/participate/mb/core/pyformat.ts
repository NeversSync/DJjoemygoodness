/** Python f-string `{x:.Nf}`: round-half-even on exact ties, keeps "-0". */
export function pyFixed(x: number, digits: number): string {
  const scaled = x * 10 ** digits;
  if (Math.abs(scaled % 1) === 0.5) {
    const lo = Math.floor(scaled);
    const even = lo % 2 === 0 ? lo : lo + 1;
    return (even / 10 ** digits).toFixed(digits);
  }
  const s = x.toFixed(digits);
  return Object.is(x, -0) && !s.startsWith("-") ? `-${s}` : s;
}

/** Python `repr(float)` for values the Python engine always holds as floats. */
export const pyFloat = (x: number): string => (Number.isInteger(x) ? `${x}.0` : String(x));
