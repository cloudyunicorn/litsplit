'use server';

import {
  createGroupSchema,
  signInFormSchema,
  signUpFormSchema,
} from '../validators';
import { auth, signIn, signOut } from '@/auth';
import { prisma } from '@/db/prisma';
import { hashSync } from 'bcrypt-ts-edge';
import { isRedirectError } from 'next/dist/client/components/redirect-error';
import { formatError, serializeDecimal, serializeRecord } from '../utils';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { revalidatePath } from "next/cache";

type CreateGroupForm = z.infer<typeof createGroupSchema>;

// Sign in the user with credentials
export async function signInWithCredentials(
  prevState: unknown,
  formData: FormData
) {
  try {
    const user = signInFormSchema.parse({
      email: formData.get('email'),
      password: formData.get('password'),
    });

    await signIn('credentials', user);

    return { success: true, message: 'Signed in successfully' };
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }
    return { success: false, message: 'Invalid email or password' };
  }
}

// Sign user out
export async function signOutUser() {
  await signOut({ redirectTo: '/' });
}

// Sign up user
export async function signUpUser(prevState: unknown, formData: FormData) {
  try {
    const user = signUpFormSchema.parse({
      name: formData.get('name'),
      email: formData.get('email'),
      password: formData.get('password'),
      confirmPassword: formData.get('confirmPassword'),
    });

    const plainPassword = user.password;

    user.password = await hashSync(user.password);

    await prisma.user.create({
      data: {
        name: user.name,
        email: user.email,
        password: user.password,
      },
    });

    await signIn('credentials', {
      email: user.email,
      password: plainPassword,
    });

    return { success: true, message: 'User registered successfully' };
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }
    return { success: false, message: formatError(error) };
  }
}

export async function getAllUsers() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
    },
    orderBy: { name: 'asc' },
  });

  // Return only the fields we need, properly serialized
  return users.map(user => ({
    id: user.id,
    name: user.name,
    email: user.email,
    image: user.image,
  }));
}

export async function getUserById(id: string) {
  return await prisma.user.findFirst({
    where: { id: id },
  });
}

export async function getGroupById(id: string) {
  const group = await prisma.group.findFirst({
    where: { id },
    include: {
      userGroups: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              totalBalance: true,
            },
          },
        },
      },
      expenses: {
        include: {
          paidBy: {
            select: {
              name: true,
              image: true,
            },
          },
          splits: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          debts: {
            include: {
              creditor: {
                select: {
                  id: true,
                  name: true,
                },
              },
              debtor: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      },
    }, // Include userGroups
  });

  if (!group) return null;

  return serializeRecord({
    ...group,
    expenses: group.expenses.map((expense) => ({
      ...expense,
      amount: serializeDecimal(expense.amount), // Convert Decimal to Number
      splits: expense.splits.map((split) => ({
        ...split,
        amount: serializeDecimal(split.amount), // Convert Decimal to Number
        user: {
          id: split.user.id,
          name: split.user.name,
        },
      })),
      debts: expense.debts.map((debt) => ({
        id: debt.id,
        amount: serializeDecimal(debt.amount), // Convert Decimal to Number
        settled: debt.settled,
        creditor: {
          id: debt.creditor.id,
          name: debt.creditor.name,
        },
        debtor: {
          id: debt.debtor.id,
          name: debt.debtor.name,
        },
      })),
    })),
    userGroups: group.userGroups.map((userGroup) => ({
      ...userGroup,
      balance: serializeDecimal(userGroup.balance), // Convert Decimal to Number
      user: {
        id: userGroup.user.id,
        name: userGroup.user.name,
      },
    })),
  });
}

export async function createGroup(
  prevState: unknown,
  formData: FormData
): Promise<{ success: boolean; message: string; data?: unknown }> {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return { success: false, message: 'Not authenticated' };
    }

    // Parse form data safely
    const rawData = {
      name: (formData.get('name') as string) || '',
      memberEmails: JSON.parse(
        (formData.get('memberEmails') as string) || '[]'
      ),
    };

    // Validate using Zod
    const validatedData: CreateGroupForm = createGroupSchema.parse(rawData);

    // Get current user ID
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!currentUser) {
      return { success: false, message: 'User not found' };
    }

    // Transaction to create group and manage members
    const result = await prisma.$transaction(async (tx) => {
      const newGroup = await tx.group.create({
        data: {
          name: validatedData.name,
          userGroups: {
            create: [{ userId: currentUser.id }],
          },
        },
        include: { userGroups: true },
      });

      // Remove duplicates and exclude self
      const cleanEmails = [...new Set(validatedData.memberEmails)].filter(
        (email) => email !== session?.user?.email
      );

      // Find existing users
      const existingUsers = await tx.user.findMany({
        where: { email: { in: cleanEmails } },
        select: { id: true, email: true },
      });

      // Add existing users to the group
      await tx.userGroup.createMany({
        data: existingUsers.map((user) => ({
          userId: user.id,
          groupId: newGroup.id,
          balance: 0,
        })),
      });

      // Identify new emails (users not in DB)
      const existingEmails = existingUsers.map((user) => user.email);
      const newEmails = cleanEmails.filter(
        (email) => !existingEmails.includes(email)
      );

      // Create invitations for new emails
      await tx.invitation.createMany({
        data: newEmails.map((email) => ({
          email,
          groupId: newGroup.id,
          senderId: currentUser.id,
          status: 'PENDING',
        })),
      });

      return newGroup;
    });

    return {
      success: true,
      message: `Group '${result.name}' created successfully!`,
      data: {
        ...result,
        userGroups: result.userGroups.map((ug) => ({
          ...ug,
          balance: ug.balance.toString(), // Convert Decimal
        })),
      },
    };
  } catch (error) {
    if (isRedirectError(error)) throw error;
    return {
      success: false,
      message: formatError(error),
      data: null,
    };
  }
}

export async function isCurrentUserGroupCreator(groupId: string, currentUserId: string) {
  // Retrieve the group along with its userGroups ordered by createdAt ascending.
  const group = await prisma.group.findUnique({
    where: { id: groupId },
    include: {
      userGroups: {
        orderBy: { createdAt: "asc" },
        take: 1, // only need the first one (creator)
        select: { userId: true },
      },
    },
  });
  if (!group || group.userGroups.length === 0) return false;
  const creatorUserId = group.userGroups[0].userId;
  return creatorUserId === currentUserId;
}

export async function getGroupWithMembers(groupId: string) {
  const group = await prisma.group.findUnique({
    where: { 
      id: groupId,
      isDeleted: false 
    },
    include: {
      userGroups: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true
            }
          }
        }
      }
    }
  });

  return group;
}

export async function addGroupMember(groupId: string, memberEmail: string) {
  try {
    const session = await auth();
    if (!session?.user || !session.user.id) {
      return {
        success: false,
        message: "You must be logged in to manage group members"
      };
    }

    const isCreator = await isCurrentUserGroupCreator(groupId, session.user.id!);
    if (!isCreator) {
      return {
        success: false,
        message: "Only the group creator can add members",
      };
    }

    // Check if user exists
    const userToAdd = await prisma.user.findUnique({
      where: { email: memberEmail }
    });

    if (!userToAdd) {
      return {
        success: false,
        message: "User not found"
      };
    }

    // Check if user is already a member
    const existingMember = await prisma.userGroup.findUnique({
      where: {
        userId_groupId: {
          userId: userToAdd.id,
          groupId: groupId
        }
      }
    });

    if (existingMember) {
      return {
        success: false,
        message: "User is already a member of this group"
      };
    }

    // Add member to group
    await prisma.userGroup.create({
      data: {
        userId: userToAdd.id,
        groupId: groupId,
        balance: 0
      }
    });

    revalidatePath(`/group/${groupId}`);

    return {
      success: true,
      message: "Member added successfully"
    };
  } catch (error) {
    console.error("Error adding group member:", error);
    return {
      success: false,
      message: "Failed to add member to group"
    };
  }
}

export async function removeGroupMember(groupId: string, userId: string) {
  try {
    const session = await auth();
    if (!session?.user || !session.user.id) {
      return {
        success: false,
        message: "You must be logged in to manage group members"
      };
    }

    const isCreator = await isCurrentUserGroupCreator(groupId, session.user.id!);
    if (!isCreator) {
      return {
        success: false,
        message: "Only the group creator can remove members",
      };
    }

    // Check if group exists and get member count
    const groupMembers = await prisma.userGroup.count({
      where: { groupId }
    });

    if (groupMembers <= 1) {
      return {
        success: false,
        message: "Cannot remove the last member from the group"
      };
    }

    // Check if user has any unsettled debts in the group
    const hasUnsettledDebts = await prisma.debt.findFirst({
      where: {
        groupId,
        OR: [
          { creditorId: userId },
          { debtorId: userId }
        ],
        settled: false
      }
    });

    if (hasUnsettledDebts) {
      return {
        success: false,
        message: "Cannot remove member with unsettled debts"
      };
    }

    // Remove member from group
    await prisma.userGroup.delete({
      where: {
        userId_groupId: {
          userId,
          groupId
        }
      }
    });

    revalidatePath(`/group/${groupId}`);

    return {
      success: true,
      message: "Member removed successfully"
    };
  } catch (error) {
    console.error("Error removing group member:", error);
    return {
      success: false,
      message: "Failed to remove member from group"
    };
  }
}

// export async function getAllGroupsByUser() {
//   const session = await auth();
//   if (!session?.user?.email) return [];

//   return await prisma.userGroup.findMany({
//     where: { userId: session.user.id },
//     include: {
//       group: {
//         select: {
//           id: true,
//           name: true,
//           createdAt: true,
//           currency: true
//         }
//       }
//     },
//   });
// }

export async function getAllGroupsByUser() {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return {
        success: false,
        message: 'Not authenticated',
        data: null,
      };
    }

    // First get raw results from Prisma
    const rawGroups = await prisma.userGroup.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        group: {
          include: {
            userGroups: {
              select: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
              },
            },
            expenses: {
              take: 3,
              orderBy: {
                createdAt: 'desc',
              },
            },
          },
        },
      },
    });

    // Manually transform Decimal values to strings
    const groups = rawGroups.map((userGroup) => ({
      ...userGroup,
      balance: userGroup.balance.toString(),
      group: {
        ...userGroup.group,
        expenses: userGroup.group.expenses.map((expense) => ({
          ...expense,
          amount: expense.amount.toString(),
        })),
      },
    }));

    return {
      success: true,
      message: 'Groups fetched successfully',
      data: groups,
    };
  } catch (error) {
    return {
      success: false,
      message: formatError(error),
      data: null,
    };
  }
}

export async function createExpense({
  groupId,
  amount,
  description,
  paidById,
  splitType,
  splits,
}: {
  groupId: string;
  amount: number;
  description: string;
  paidById: string;
  splitType: 'EQUAL' | 'PERCENTAGE' | 'EXACT';
  splits: { userId: string; amount: number }[];
}) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return { success: false, message: 'Not authenticated' };
    }

    if (!groupId || !paidById) {
      throw new Error('groupId and paidById are required');
    }

    return await prisma.$transaction(async (tx) => {
      // Adjust splits to account for rounding errors
      const totalAmount = new Prisma.Decimal(amount);
      const adjustedSplits = [...splits];
      
      if (splitType === 'EQUAL' || splitType === 'PERCENTAGE') {
        const splitSum = splits.reduce((sum, split) => 
          sum.plus(new Prisma.Decimal(split.amount)), 
          new Prisma.Decimal(0)
        );
        
        const difference = totalAmount.minus(splitSum);
        
        if (!difference.equals(0)) {
          // Add the difference to the last split
          const lastSplit = adjustedSplits[adjustedSplits.length - 1];
          adjustedSplits[adjustedSplits.length - 1] = {
            ...lastSplit,
            amount: new Prisma.Decimal(lastSplit.amount).plus(difference).toNumber()
          };
        }
      }

      // Create the expense with splits
      const expense = await tx.expense.create({
        data: {
          amount: totalAmount,
          description,
          paidById,
          groupId,
          splitType,
          splits: {
            create: adjustedSplits.map((split) => ({
              userId: split.userId,
              amount: new Prisma.Decimal(split.amount),
            })),
          },
        },
        include: {
          splits: true,
          paidBy: true,
        },
      });

      // Create debt records for each split (except for the payer)
      const debtsToCreate = adjustedSplits
        .filter(split => split.userId !== paidById) // Exclude the payer
        .map(split => ({
          amount: new Prisma.Decimal(split.amount),
          creditorId: paidById, // The person who paid
          debtorId: split.userId, // The person who owes
          expenseId: expense.id,
          groupId,
          settled: false,
        }));

      if (debtsToCreate.length > 0) {
        await tx.debt.createMany({
          data: debtsToCreate,
        });
      }

      // Update user group balances
      await Promise.all(
        adjustedSplits.map(async (split) => {
          return tx.userGroup.update({
            where: {
              userId_groupId: {
                userId: split.userId,
                groupId,
              },
            },
            data: {
              balance: {
                decrement: new Prisma.Decimal(split.amount),
              },
            },
          });
        })
      );

      // Update payer's balance
      await tx.userGroup.update({
        where: {
          userId_groupId: {
            userId: paidById,
            groupId,
          },
        },
        data: {
          balance: {
            increment: totalAmount,
          },
        },
      });

      const sanitizedExpense = JSON.parse(JSON.stringify(expense));

      return {
        success: true,
        message: 'Expense created successfully',
        data: sanitizedExpense,
      };
    });
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to create expense',
      data: null,
    };
  }
}
