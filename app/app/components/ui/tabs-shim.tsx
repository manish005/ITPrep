import { cn } from "@/lib/utils";

const Tabs = ({ className, children, ...props }: React.ComponentPropsWithoutRef<"div">) => (
  <div className={cn("flex", className)} {...props}>{children}</div>
);

const TabsList = ({ className, children, ...props }: React.ComponentPropsWithoutRef<"div">) => (
  <div className={cn("inline-flex h-10 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground", className)} {...props}>{children}</div>
);

const TabsTrigger = ({ className, children, ...props }: React.ComponentPropsWithoutRef<"button">) => (
  <button className={cn("inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm", className)} {...props}>{children}</button>
);

export { Tabs, TabsList, TabsTrigger };