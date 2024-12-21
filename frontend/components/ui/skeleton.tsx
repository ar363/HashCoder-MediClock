import { cn } from "@/lib/utils";

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-primary/10", className)}
      {...props}
    />
  );
}

function SkeletonCard() {
  return (
    <div className="flex flex-col space-y-3 w-full">
      <Skeleton className="h-[180px] w-full rounded-xl" />
    </div>
  );
}

export { Skeleton, SkeletonCard };
