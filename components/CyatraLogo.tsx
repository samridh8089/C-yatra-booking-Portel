import React from "react";
import Image from "next/image";

interface CyatraLogoProps {
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
}

export function CyatraLogo({
  className = "h-11 w-auto",
  width = 180,
  height = 90,
  priority = false,
}: CyatraLogoProps) {
  return (
    <div className={`relative flex items-center shrink-0 ${className}`}>
      <Image
        src="/images/c-yatra-logo.png"
        alt="C-Yatra - Your Partner in Every Destination"
        width={width}
        height={height}
        priority={priority}
        className="w-auto h-full max-h-full object-contain select-none"
      />
    </div>
  );
}
