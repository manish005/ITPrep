import * as React from "react";

const Skeleton = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div">
>(({ className, ...props }, ref) => (
  <div className={cn("animate-pulse rounded-md bg-muted", className)} ref={ref} {...props} />
));
Skeleton.displayName = "Skeleton";

function cn(...classes: (string | false | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

export { Skeleton };