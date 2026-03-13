"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { getInitials } from "@/lib/utils";

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string | null;
  alt?: string;
  name?: string;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-14 w-14 text-base",
};

function Avatar({
  src,
  alt,
  name,
  size = "md",
  className,
  ...props
}: AvatarProps) {
  const [imgError, setImgError] = React.useState(false);
  const showFallback = !src || imgError;

  return (
    <div
      className={cn(
        "relative flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary-100 font-medium text-primary-700",
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {showFallback ? (
        <span>{name ? getInitials(name) : "?"}</span>
      ) : (
        <img
          src={src}
          alt={alt || name || "Avatar"}
          onError={() => setImgError(true)}
          className="h-full w-full object-cover"
        />
      )}
    </div>
  );
}

export { Avatar };
