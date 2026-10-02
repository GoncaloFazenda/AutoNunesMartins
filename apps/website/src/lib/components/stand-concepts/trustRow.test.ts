import { describe, expect, it } from 'vitest';
import { trustRowSizes } from './trustRow';

describe('shared horizontal service row reservation', () => {
  it('reserves enough for every card, including when the shorter one opens first', () => {
    const cards = [{ closed: 250, reveal: 136 }, { closed: 250, reveal: 111 }, { closed: 276, reveal: 124 }];
    const result = trustRowSizes(cards);
    expect(result).toEqual({ closed: 276, expanded: 400 });
    for (const card of cards) expect(result.expanded).toBeGreaterThanOrEqual(card.closed + card.reveal);
  });
  it('does not add excess space by summing maxima from different cards', () => {
    expect(trustRowSizes([{ closed: 300, reveal: 50 }, { closed: 200, reveal: 100 }])).toEqual({ closed: 300, expanded: 350 });
  });
  it('is independent of selection order and expanded transition progress', () => {
    const cards = [{ closed: 230.25, reveal: 130.5 }, { closed: 245.75, reveal: 96.25 }, { closed: 210, reveal: 142 }];
    expect(trustRowSizes(cards)).toEqual(trustRowSizes([...cards].reverse()));
    expect(trustRowSizes(cards).expanded).toBe(360.75);
  });
  it('recalculates for wrapping and fonts without a fixed maximum', () => {
    expect(trustRowSizes([{ closed: 280, reveal: 560 }]).expanded).toBe(840);
    expect(trustRowSizes([{ closed: 225, reveal: 130 }]).expanded).toBe(355);
  });
  it('handles an empty row', () => {
    expect(trustRowSizes([])).toEqual({ closed: 0, expanded: 0 });
  });
});
