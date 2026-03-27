import { Skeleton } from "@/components/ui/skeleton";

export default function ItinerarySkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Hero Skeleton */}
      <div className="rounded-[2rem] bg-slate-100 h-64 w-full p-8 flex flex-col justify-end gap-6">
        <div className="space-y-2">
          <Skeleton className="h-4 w-24 bg-slate-200" />
          <Skeleton className="h-12 w-3/4 bg-slate-200" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <Skeleton className="h-10 w-full bg-slate-200" />
          <Skeleton className="h-10 w-full bg-slate-200" />
          <Skeleton className="h-10 w-full bg-slate-200" />
          <Skeleton className="h-10 w-full bg-slate-200" />
        </div>
      </div>

      {/* List Skeleton */}
      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex justify-between items-center">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-24" />
        </div>
        {[...Array(3)].map((_, index) => (
          <div key={index} className="p-6 border-b border-slate-50 flex gap-4 items-center">
            <Skeleton className="h-12 w-12 rounded-2xl shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-3 w-64" />
            </div>
            <Skeleton className="h-8 w-20 rounded-lg hidden md:block" />
          </div>
        ))}
      </div>
    </div>
  );
}
