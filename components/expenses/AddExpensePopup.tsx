'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useSession } from 'next-auth/react';
import { createExpense } from '@/lib/actions/user.action';
import { useRouter } from 'next/navigation';
import { useToast } from "@/hooks/use-toast";

export function AddExpensePopup({
  groupId,
  members,
}: {
  groupId: string;
  members: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [splitType, setSplitType] = useState<'EQUAL' | 'PERCENTAGE' | 'EXACT'>(
    'EQUAL'
  );
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [percentages, setPercentages] = useState<number[]>(
    new Array(members.length).fill(0)
  );
  const [exactAmounts, setExactAmounts] = useState<number[]>(
    new Array(members.length).fill(0)
  );

  const { data: session } = useSession();

  const handlePercentageChange = (index: number, value: string) => {
    const newPercentages = [...percentages];
    newPercentages[index] = value ? parseFloat(value) : 0;
    setPercentages(newPercentages);
  };

  const handleExactAmountChange = (index: number, value: string) => {
    const newExactAmounts = [...exactAmounts];
    newExactAmounts[index] = value ? parseFloat(value) : 0;
    setExactAmounts(newExactAmounts);
  };

  const calculateSplits = () => {
    const totalAmount = parseFloat(amount);
    switch (splitType) {
      case 'EQUAL':
        if (members.length === 0) return [];
        const equalShare = totalAmount / members.length;
        return members.map((member) => ({
          userId: member.id,
          amount: parseFloat(equalShare.toFixed(2)),
        }));

      case 'PERCENTAGE': {
        if (percentages.length !== members.length) {
          throw new Error('Invalid percentage data');
        }

        const sumPercentages = percentages.reduce((sum, p) => sum + p, 0);
        if (sumPercentages !== 100) {
          throw new Error('Percentages must add up to 100%');
        }

        return members.map((member, index) => ({
          userId: member.id,
          amount: parseFloat(
            ((percentages[index] / 100) * totalAmount).toFixed(2)
          ),
        }));
      }

      case 'EXACT': {
        if (exactAmounts.length !== members.length) {
          throw new Error('Invalid exact amount data');
        }

        const sumExactAmounts = exactAmounts.reduce((sum, amt) => sum + amt, 0);
        if (sumExactAmounts !== totalAmount) {
          throw new Error('Exact amounts must sum up to total amount');
        }

        return members.map((member, index) => ({
          userId: member.id,
          amount: parseFloat(exactAmounts[index].toFixed(2)),
        }));
      }

      default:
        throw new Error('Invalid split type');
    }
  };

  const {toast} = useToast();

  useEffect(() => {
    if (!open) {
      setAmount("");
      setDescription("");
      setSplitType("EQUAL");
    }
  }, [open]);

  const handleSubmit = async () => {
    if (!session?.user?.id) {
      return alert('User not authenticated');
    }

    try {
      const splits = calculateSplits();
      if (!splits) return;

      const response = await createExpense({
        groupId: groupId,
        amount: parseFloat(amount),
        description,
        paidById: session.user.id,
        splitType,
        splits,
      });

      if (response.success) {
        toast({description: 'Expense added successfully', title: 'success'});
        router.refresh(); // 🔥 Ensure page refreshes to show updated balances
      } else {
        toast({description: response.message, title: 'error'});
      }

      setOpen(false);
    } catch (error) {
      alert(
        error instanceof Error ? error.message : 'Failed to create expense'
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Add Expense</Button>
      </DialogTrigger>
      <DialogContent className="fixed top-[30%] left-1/2 w-full px-4 transform -translate-x-1/2 md:top-1/2 md:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Expense</DialogTitle>
          <DialogDescription>
            Fill in the details to add a new expense.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Amount</Label>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          <div>
            <Label>Description</Label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div>
            <Label>Split Type</Label>
            <Select
              onValueChange={(value: 'EQUAL' | 'PERCENTAGE' | 'EXACT') =>
                setSplitType(value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select split type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="EQUAL">Equal</SelectItem>
                <SelectItem value="PERCENTAGE">Percentage</SelectItem>
                <SelectItem value="EXACT">Exact Amounts</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Render split inputs based on selected type */}
          {splitType === 'PERCENTAGE' && (
            <div className="space-y-2">
              {members.map((member, index) => (
                <div key={member.id} className="flex items-center gap-2">
                  <Label>{member.name}</Label>
                  <Input
                    type="number"
                    placeholder="Percentage"
                    value={percentages[index] || ''}
                    onChange={(e) =>
                      handlePercentageChange(index, e.target.value)
                    }
                  />
                </div>
              ))}
            </div>
          )}

          {splitType === 'EXACT' && (
            <div className="space-y-2">
              {members.map((member, index) => (
                <div key={member.id} className="flex items-center gap-2">
                  <Label>{member.name}</Label>
                  <Input
                    type="number"
                    placeholder="Exact Amount"
                    value={exactAmounts[index] || ''}
                    onChange={(e) =>
                      handleExactAmountChange(index, e.target.value)
                    }
                  />
                </div>
              ))}
            </div>
          )}

          <Button onClick={handleSubmit}>Add Expense</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
