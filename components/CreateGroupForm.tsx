"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { X, Plus } from "lucide-react";
import { createGroupSchema } from "@/lib/validators";
import { createGroup } from "@/lib/actions/user.action";
import { useRouter } from "next/navigation";
import { User, UserSearch } from "./UserSearch";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

export function CreateGroupDialog() {
  const [open, setOpen] = useState(false);
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    resolver: zodResolver(createGroupSchema),
    defaultValues: {
      name: "",
      memberEmails: [] as string[],
    },
  });

  const router = useRouter();
  const memberEmails = watch("memberEmails") || [];
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);

  const addUser = (user: User) => {
    if (memberEmails.includes(user.email)) return;
    setValue("memberEmails", [...memberEmails, user.email]);
    setSelectedUsers([...selectedUsers, user]);
  };

  // Remove user from the list
  const removeUser = (email: string) => {
    setValue(
      "memberEmails",
      memberEmails.filter((e) => e !== email)
    );
    setSelectedUsers(selectedUsers.filter((user) => user.email !== email));
  };

  // Handle form submission
  const onSubmit = async (data: { name: string; memberEmails: string[] }) => {
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("memberEmails", JSON.stringify(data.memberEmails));

    const response = await createGroup(null, formData);
    if (response.success) {
      alert("Group created successfully!");
      router.refresh();
      setOpen(false);
      reset();
      setSelectedUsers([]); // Clear selected users
    } else {
      alert(`Error: ${response.message}`);
    }
  };


  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Create Group
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create a Group</DialogTitle>
          <DialogDescription>
            Create a new group to split expenses with friends.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Group Name Input */}
          <div>
            <label className="block text-sm font-medium">Group Name</label>
            <Input {...register("name")} placeholder="Enter group name" />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
            )}
          </div>

          {/* Search and Select Users */}
          <div>
            <label className="block text-sm font-medium">Add Members</label>
            <UserSearch mode="select" onSelectUser={addUser} excludeUsers={selectedUsers} />
          </div>

          {/* Display Added Members */}
          {selectedUsers.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {selectedUsers.map((user) => (
                <Badge key={user.id} className="flex items-center space-x-2 p-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={user.image || ""} />
                    <AvatarFallback>{user.name[0].toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <span>{user.name}</span>
                  <X
                    className="cursor-pointer w-4 h-4 ml-2"
                    onClick={() => removeUser(user.email)}
                  />
                </Badge>
              ))}
            </div>
          )}

          {/* Submit Button */}
          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? "Creating..." : "Create Group"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}