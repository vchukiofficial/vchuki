import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-shimmer bg-gradient-to-r from-transparent via-background/20 to-transparent bg-[length:200%_100%] bg-[position:200%_0] border rounded-xl",
        className
      )}
      {...props}
    />
  )
}

const Shimmer = Skeleton

function SkeletonCircle({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <Skeleton 
      className={cn("h-4 w-4 rounded-full", className)}
      {...props}
    />
  )
}

function SkeletonText({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <Skeleton 
      className={cn("h-4 rounded bg-muted", className)}
      {...props}
    />
  )
}

function SkeletonImage({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <Skeleton 
      className={cn("aspect-[4/5] rounded-xl", className)}
      {...props}
    />
  )
}

export { Skeleton, Shimmer, SkeletonCircle, SkeletonText, SkeletonImage } 
