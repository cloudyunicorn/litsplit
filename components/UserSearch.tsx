"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getAllUsers } from "@/lib/actions/user.action";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { useDebounce } from "@/hooks/use-debounce";
import { useRouter } from "next/navigation";

export interface User {
  id: string;
  name: string;
  email: string;
  image?: string | null;
}

interface UserSearchProps {
  mode: "profile" | "select";
  onSelectUser?: (user: User) => void;
  excludeUsers?: User[];
  label?: string;
  className?: string;
}

export function UserSearch({ 
  mode,
  onSelectUser, 
  excludeUsers = [], 
  label = "Search Users", 
  className = "" 
}: UserSearchProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const debouncedSearch = useDebounce(searchTerm, 300);

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setFilteredUsers([]);
      return;
    }

    setIsLoading(true);
    try {
      const users = await getAllUsers();
      const filtered = users.filter(user => 
        (user.name.toLowerCase().includes(query.toLowerCase()) ||
        user.email.toLowerCase().includes(query.toLowerCase())) &&
        !excludeUsers?.some(excluded => excluded.id === user.id)
      );
      setFilteredUsers(filtered);
    } catch (error) {
      console.error("Error searching users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    handleSearch(debouncedSearch);
  }, [debouncedSearch]);

  const handleUserClick = (user: User) => {
    if (mode === "profile") {
      router.push(`/user/${user.id}`);
    } else {
      onSelectUser?.(user);
      setSearchTerm("");
      setFilteredUsers([]);
    }
  };

  return (
    <div className={className}>
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={label}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {searchTerm && (
          <Card className="absolute mt-2 w-full z-10">
            <ScrollArea className="max-h-[300px]">
              {isLoading ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  Loading...
                </div>
              ) : filteredUsers.length > 0 ? (
                <div className="p-2">
                  {filteredUsers.map((user) => (
                    <div
                      key={user.id}
                      onClick={() => handleUserClick(user)}
                      className="flex items-center gap-3 p-2 hover:bg-accent rounded-md cursor-pointer"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.image || ""} />
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
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  No users found
                </div>
              )}
            </ScrollArea>
          </Card>
        )}
      </div>
    </div>
  );
}