"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { createGroupSchema } from "@/lib/validators";
import { createGroup } from "@/lib/actions/user.action";
import { useRouter } from "next/navigation";

// Define the form schema based on Zod validation

export default function CreateGroupForm() {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(createGroupSchema),
    defaultValues: {
      name: "",
      memberEmails: [] as string[],
    },
  });

  const router = useRouter()

  const [emailInput, setEmailInput] = useState("");
  const memberEmails = watch("memberEmails") || [];

  // Add email to the member list
  const addMemberEmail = () => {
    if (!emailInput.trim()) return;
    if (memberEmails.includes(emailInput.trim())) return;
    setValue("memberEmails", [...memberEmails, emailInput.trim()]);
    setEmailInput("");
  };

  // Remove email from the member list
  const removeMember = (email: string) => {
    setValue(
      "memberEmails",
      memberEmails.filter((e) => e !== email)
    );
  };

  // Handle form submission
  const onSubmit = async (data: { name: string; memberEmails: string[] }) => {
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("memberEmails", JSON.stringify(data.memberEmails));

    const response = await createGroup(null, formData);
    if (response.success) {
      alert("Group created successfully!");
      router.refresh()
    } else {
      alert(`Error: ${response.message}`);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto p-6 shadow-lg">
      <CardContent>
        <h2 className="text-xl font-semibold mb-4">Create a Group</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Group Name Input */}
          <div>
            <label className="block text-sm font-medium">Group Name</label>
            <Input {...register("name")} placeholder="Enter group name" />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
            )}
          </div>

          {/* Member Emails Input */}
          <div>
            <label className="block text-sm font-medium">Add Members</label>
            <div className="flex space-x-2">
              <Input
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="Enter email"
              />
              <Button type="button" onClick={addMemberEmail}>
                Add
              </Button>
            </div>
            {errors.memberEmails && (
              <p className="text-red-500 text-xs mt-1">
                {errors.memberEmails.message}
              </p>
            )}
          </div>

          {/* Display Added Members */}
          <div className="flex flex-wrap gap-2 mt-2">
            {memberEmails.map((email, index) => (
              <Badge key={index} className="flex items-center space-x-2">
                <span>{email}</span>
                <X
                  className="cursor-pointer w-4 h-4"
                  onClick={() => removeMember(email)}
                />
              </Badge>
            ))}
          </div>

          {/* Submit Button */}
          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? "Creating..." : "Create Group"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
