import { computeApplicationScore, computeProposalQualityScore } from './applicationScoring';

describe('application scoring', () => {
  test('proposal quality rewards length and links', () => {
    expect(computeProposalQualityScore('short', [])).toBeGreaterThanOrEqual(0);
    expect(computeProposalQualityScore('a'.repeat(900), [])).toBeGreaterThan(50);
    expect(computeProposalQualityScore('a'.repeat(900), ['https://github.com/x'])).toBeGreaterThan(
      computeProposalQualityScore('a'.repeat(900), [])
    );
  });

  test('overall score is weighted and bounded', () => {
    const s1 = computeApplicationScore({
      completionRate: 100,
      skillMatch: 100,
      pastRatings: 5,
      proposalQuality: 100,
    });
    expect(s1).toBeGreaterThanOrEqual(99);

    const s2 = computeApplicationScore({
      completionRate: 0,
      skillMatch: 0,
      pastRatings: 0,
      proposalQuality: 0,
    });
    expect(s2).toBe(0);
  });
});

