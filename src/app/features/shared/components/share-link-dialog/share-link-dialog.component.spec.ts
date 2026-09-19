import { buildTrackLink } from './share-link-dialog.component';

describe('buildTrackLink', () => {
  const origin = 'https://gpssoftware.in';

  it('takes the key from the id query param', () => {
    expect(buildTrackLink('/track?id=ABC123', origin)).toBe('https://gpssoftware.in/#/track/ABC123');
  });

  it('falls back to the last path segment', () => {
    expect(buildTrackLink('/oT/XYZ789', origin)).toBe('https://gpssoftware.in/#/track/XYZ789');
  });

  it('accepts an absolute url', () => {
    expect(buildTrackLink('https://gpsvts.in/track?id=K1', origin)).toBe('https://gpssoftware.in/#/track/K1');
  });
});
