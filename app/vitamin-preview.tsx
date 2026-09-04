'use client';

import { FigmaLanding } from './figma-landing';

export function VitaminPreview({
  signedInName,
}: {
  signedInName: string | null;
}) {
  return <FigmaLanding signedInName={signedInName} />;
}
