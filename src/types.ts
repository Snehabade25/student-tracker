export type Category = 'Food' | 'Transport' | 'Study' | 'Entertainment' | 'Other';

export interface Expense {
  id: string;
  title: string;
  amount: number;
  category: Category;
  date: string;
}

export interface UserStats {
  totalSpent: number;
  budget: number;
  points: number;
  level: number;
}
