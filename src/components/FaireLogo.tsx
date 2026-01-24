'use client';

import Image from 'next/image';
import { useState } from 'react';

export function FaireLogo() {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return null;
  }

  return (
    <Image
      src="/images/faire-logo.png"
      alt="Faire"
      width={24}
      height={24}
      className="object-contain"
      onError={() => setHasError(true)}
    />
  );
}
