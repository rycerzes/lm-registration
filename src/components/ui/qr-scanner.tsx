"use client";

import { useZxing } from "react-zxing";

interface QRScannerProps {
  onScan: (decodedText: string) => void;
  onError?: (error: unknown) => void;
  isScanning: boolean;
}

export function QRScanner({ onScan, onError, isScanning }: QRScannerProps) {
  const { ref } = useZxing({
    onDecodeResult(result) {
      onScan(result.getText());
    },
    onError,
    paused: !isScanning,
  });

  return (
    <div className="relative w-full max-w-[300px] mx-auto aspect-square">
      <video ref={ref} className="w-full h-full rounded-lg object-cover" />
      <div className="absolute inset-0 border-2 border-primary/50 rounded-lg pointer-events-none">
        <div className="absolute inset-12 border-2 border-primary animate-pulse rounded" />
      </div>
    </div>
  );
}
