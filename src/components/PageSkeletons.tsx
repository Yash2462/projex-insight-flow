import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardHeader, CardContent } from "@/components/ui/card";

export const DashboardSkeleton = () => (
  <div className="min-h-screen bg-background md:ml-64 relative overflow-hidden">
    <div className="p-4 md:p-6 lg:p-10 max-w-7xl mx-auto space-y-10">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <Skeleton className="h-8 w-64 rounded-xl" />
          </div>
          <Skeleton className="h-4 w-48 rounded-lg ml-11" />
        </div>
        <Skeleton className="h-12 w-32 rounded-2xl" />
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="h-32 rounded-[2rem] border-primary/5">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-20 rounded-lg" />
              <Skeleton className="h-8 w-8 rounded-xl" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-12 rounded-lg mb-2" />
              <Skeleton className="h-3 w-24 rounded-full" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-12">
          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(2)].map((_, i) => (
              <Card key={i} className="h-[350px] rounded-[2rem] border-primary/5">
                <CardHeader className="space-y-2">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-3 w-24" />
                </CardHeader>
                <CardContent className="flex items-center justify-center h-48">
                  <Skeleton className="h-32 w-32 rounded-full" />
                </CardContent>
              </Card>
            ))}
          </div>
          {/* List Skeleton */}
          <div className="space-y-4">
            <Skeleton className="h-6 w-48" />
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-20 w-full rounded-2xl" />
            ))}
          </div>
        </div>
        <div className="space-y-6">
           <Skeleton className="h-[500px] w-full rounded-[2.5rem]" />
        </div>
      </div>
    </div>
  </div>
);

export const ProjectCardSkeleton = () => (
  <Card className="border-0 bg-muted/20 rounded-3xl h-[300px]">
    <CardHeader className="space-y-4">
      <Skeleton className="h-6 w-24 rounded-md" />
      <Skeleton className="h-8 w-48 rounded-lg" />
      <Skeleton className="h-4 w-full" />
    </CardHeader>
    <CardContent className="space-y-6">
      <Skeleton className="h-1.5 w-full rounded-full" />
      <div className="flex justify-between items-center">
        <div className="flex gap-4">
          <Skeleton className="h-4 w-10" />
          <Skeleton className="h-4 w-10" />
        </div>
        <div className="flex gap-2">
           <Skeleton className="h-8 w-8 rounded-xl" />
           <Skeleton className="h-8 w-8 rounded-xl" />
        </div>
      </div>
      <Skeleton className="h-10 w-full rounded-xl" />
    </CardContent>
  </Card>
);

export const ProjectsPageSkeleton = () => (
  <div className="min-h-screen bg-background md:ml-64 p-4 md:p-6 lg:p-8">
    <div className="max-w-7xl mx-auto space-y-10">
      <header className="flex justify-between items-end">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64 rounded-xl" />
          <Skeleton className="h-4 w-48 rounded-lg" />
        </div>
        <Skeleton className="h-12 w-32 rounded-xl" />
      </header>

      <div className="flex gap-4">
        <Skeleton className="h-12 flex-1 rounded-2xl" />
        <Skeleton className="h-12 w-32 rounded-2xl" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <ProjectCardSkeleton key={i} />
        ))}
      </div>
    </div>
  </div>
);

export const ProjectDetailsSkeleton = () => (
  <div className="min-h-screen bg-background flex flex-col md:ml-64">
    <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-primary/5 px-4 md:px-10 py-3 md:py-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6">
        <div className="flex items-center gap-3 md:gap-4">
          <Skeleton className="h-10 w-10 md:h-14 md:w-14 rounded-xl md:rounded-2xl" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-48 md:h-8 md:w-64" />
            <div className="flex gap-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-12" />
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <div className="flex -space-x-2 mr-3">
             {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-8 w-8 md:h-10 md:w-10 rounded-full border-2 border-background" />)}
          </div>
          <Skeleton className="h-10 w-24 rounded-xl hidden md:block" />
          <Skeleton className="h-10 w-24 rounded-xl hidden md:block" />
        </div>
      </div>
      <div className="max-w-7xl mx-auto mt-6 md:mt-10 overflow-x-auto no-scrollbar">
        <div className="flex gap-2 p-1 bg-muted/10 rounded-[1.25rem] w-max">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-9 w-24 rounded-xl" />
          ))}
        </div>
      </div>
    </header>
    <main className="flex-1 p-4 md:px-10 md:py-8 max-w-7xl mx-auto w-full">
      <div className="flex gap-6 overflow-hidden">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="min-w-[280px] md:min-w-[320px] space-y-4">
            <div className="flex justify-between items-center px-2">
               <Skeleton className="h-5 w-32" />
               <Skeleton className="h-8 w-8 rounded-lg" />
            </div>
            <Skeleton className="h-[500px] w-full rounded-[1.5rem]" />
          </div>
        ))}
      </div>
    </main>
  </div>
);

export const AnalyticsSkeleton = () => (
  <div className="min-h-screen bg-background md:ml-64 relative overflow-hidden">
    <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-10">
      <header className="flex items-center gap-5">
        <Skeleton className="h-14 w-14 rounded-2xl" />
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-3 w-40" />
        </div>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="border border-primary/5 rounded-3xl h-32">
            <CardContent className="p-6 space-y-4">
              <Skeleton className="h-8 w-8 rounded-xl" />
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {[...Array(2)].map((_, i) => (
          <Card key={i} className="border border-primary/5 rounded-3xl h-[400px]">
            <CardHeader className="space-y-2">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-3 w-24" />
            </CardHeader>
            <CardContent className="flex items-center justify-center h-64">
              <Skeleton className="h-48 w-48 rounded-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  </div>
);

export const AppLayoutSkeleton = () => (
  <div className="min-h-screen bg-background flex flex-col md:ml-64">
    <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-primary/5 px-4 md:px-10 py-3 md:py-8">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Skeleton className="h-12 w-12 rounded-2xl" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-3 w-32" />
          </div>
        </div>
      </div>
    </header>
    <main className="flex-1 p-6 lg:p-10 max-w-7xl mx-auto w-full">
      <Skeleton className="h-full w-full rounded-[2rem]" />
    </main>
  </div>
);
