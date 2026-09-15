import * as React from "react";
import { cn } from "@/lib/utils";

const Separator = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div">
>(({ className, ...props }, ref) => (
  <div className={cn("shrink-0 bg-border", className)} ref={ref} {...props} />
));
Separator.displayName = "Separator";

export { Separator };