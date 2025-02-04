import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function GroupPageSkeleton() {
  return (
    <div className="container mx-auto p-4">
      {/* Header Section with Title, Balance and Add Button */}
      <div className="flex justify-between items-center gap-4">
        <Skeleton className="h-8 w-[200px]" /> {/* Group Name */}
        <Skeleton className="h-10 w-[120px]" /> {/* Group Balance */}
        <Skeleton className="h-10 w-[120px]" /> {/* Add Expense Button */}
      </div>

      {/* Member Balance Section */}
      <div className="mt-4">
        <Skeleton className="h-[200px] w-full rounded-lg" />
      </div>

      {/* Expense List Section */}
      <ScrollArea className="h-[400px] w-full mt-6">
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-8 w-8 rounded-full" /> {/* Avatar */}
                  <Skeleton className="h-5 w-[100px]" /> {/* Name */}
                </div>
                <Skeleton className="h-5 w-[100px]" /> {/* Date */}
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <Skeleton className="h-5 w-[80px]" /> {/* Amount */}
                  <Skeleton className="h-5 w-[200px]" /> {/* Description */}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}