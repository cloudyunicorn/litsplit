// components/ExpenseList.tsx
"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {format} from "date-fns"

type ExpenseType = {
  id: string | undefined;
  amount: string; // Serialized as string
  description: string;
  createdAt: string;
  paidBy: {
    name: string;
    image?: string | null;
  };
};



export function ExpenseList({ expenses }: { expenses: ExpenseType[] }) {

  return (
    <ScrollArea className="h-[400px] w-full">
      <div className="space-y-4">
        {expenses.map((expense) => (
          <Card key={expense.id}>
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={expense.paidBy.image || ""} />
                  <AvatarFallback>
                    {expense.paidBy.name[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <CardTitle className="text-sm">{expense.paidBy.name}</CardTitle>
              </div>
              <span className="text-sm text-muted-foreground">
                {format(expense.createdAt, "dd MMM yyyy")}
              </span>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <p className="font-semibold">₹{expense.amount}</p>
                <p className="text-sm text-muted-foreground">
                  {expense.description}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </ScrollArea>
  );
}