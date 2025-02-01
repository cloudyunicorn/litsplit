// components/GroupBalance.tsx

"use client";

import React from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface GroupBalanceProps {
  userId: string;
  userGroups: {
    userId: string;
    balance: string; // Assuming balance is a stringified decimal
  }[];
}

export const GroupBalance: React.FC<GroupBalanceProps> = ({ userId, userGroups }) => {
  // Find the user's balance in the group
  const userGroup = userGroups.find((ug) => ug.userId === userId);

  if (!userGroup) {
    return null; // User is not part of the group
  }

  const balance = parseFloat(userGroup.balance);
  const absoluteBalance = Math.abs(balance).toLocaleString('en-IN', {
    maximumFractionDigits: 2,
  });

  let balanceText = '';
  let balanceClass = '';

  if (balance > 0) {
    balanceText = `You are owed ₹${absoluteBalance}`;
    balanceClass = 'text-green-600';
  } else if (balance < 0) {
    balanceText = `You owe ₹${absoluteBalance}`;
    balanceClass = 'text-red-600';
  } else {
    balanceText = 'You are settled up';
    balanceClass = 'text-gray-500';
  }

  return (
    <Card className="p-4 mb-4">
      <div className="text-center">
        <span className={cn('text-xl font-semibold', balanceClass)}>
          {balanceText}
        </span>
      </div>
    </Card>
  );
};
