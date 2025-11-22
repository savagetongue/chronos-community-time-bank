import { cn } from "@/lib/utils"
interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "card" | "line" | "avatar";
}
function Skeleton({
  className,
  variant = "default",
  ...props
}: SkeletonProps) {
  const variants = {
    default: "rounded-md",
    card: "w-full h-48 rounded-lg",
    line: "h-4 w-full rounded",
    avatar: "h-10 w-10 rounded-full",
  };
  return (
    <div
      className={cn(
        "animate-pulse bg-muted/50",
        variants[variant],
        className
      )}
      {...props}
    />
  )
}
export { Skeleton }