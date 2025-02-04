'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { X, UserPlus } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UserSearch, User } from '@/components/UserSearch';
import { addGroupMember, removeGroupMember } from '@/lib/actions/user.action';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useToast } from '@/hooks/use-toast';

interface ManageGroupMembersProps {
  groupId: string;
  creatorId: string;
  currentMembers: {
    user: User;
    balance: number;
  }[];
}

export function ManageGroupMembers({
  groupId,
  creatorId,
  currentMembers,
}: ManageGroupMembersProps) {
  const [open, setOpen] = useState(false);
  const [members, setMembers] = useState(currentMembers);
  const router = useRouter();
  const { data: session } = useSession();
  const { toast } = useToast();

  if (session?.user?.id !== creatorId) {
    return null;
  }

  const handleAddMember = async (user: User) => {
    try {
      const response = await addGroupMember(groupId, user.email);
      if (response.success) {
        setMembers((prev) => [...prev, { user, balance: 0 }]);
        toast({title: "Success" ,description:`Added ${user.name} to the group`});
        setOpen(false);
        router.refresh();
      } else {
        toast({title:"Error",description:response.message});
      }
    } catch {
      toast({title: "Error" ,description:'Failed to add member'});
    }
  };

  const handleRemoveMember = async (userId: string) => {
    try {
      const response = await removeGroupMember(groupId, userId);
      if (response.success) {
        setMembers((prev) =>
          prev.filter((member) => member.user.id !== userId)
        );
        toast({title: "Success" ,description:`Member removed from the group`});
        setOpen(false);
        router.refresh();
      } else {
        toast({title:"Error",description:response.message});
      }
    } catch {
      toast({title: "Error" ,description:'Failed to remove member'});
    }
  };

  return (
    <div className="mt-4">
      <Button variant="outline" onClick={() => setOpen(true)} className="gap-2">
        <UserPlus className="h-4 w-4" />
        Manage Members
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Manage Group Members</DialogTitle>
            <DialogDescription>
              Add or remove members from this group.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Add New Member
              </label>
              <UserSearch
                mode="select"
                onSelectUser={handleAddMember}
                excludeUsers={members.map((m) => m.user)}
                label="Search users to add"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Current Members
              </label>
              <div className="space-y-2">
                {members.map(({ user, balance }) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-2 rounded-md border"
                  >
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.image || ''} />
                        <AvatarFallback>
                          {user.name[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{user.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {user.email}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-sm ${
                          balance >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {balance.toFixed(2)}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveMember(user.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
