import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getAllGroupsByUser } from '@/lib/actions/user.action';
import Link from 'next/link';

// Client component
export async function UserGroups() {
  // const session = await auth();

  const data = await getAllGroupsByUser();
  console.log(data.data)

  return (
    <div className="flex justify-center items-center h-full p-10">
      <ScrollArea className="h-[400px] w-full">
        <div className="space-y-4">
          {data?.data?.length ? (
            data.data.map((group) => (
              <Card key={group.group.id}>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>{group.group.name}</CardTitle>
                  <span className="text-sm text-muted-foreground">
                    {new Date(group.group.createdAt).toLocaleDateString()}
                  </span>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm">
                        Your Balance: {group.balance}{' '}
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      <Link href={`/group/${group.group.id}`}>
                        <h2 className="text-sm font-medium">View Details</h2>
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <p>No groups found</p>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
