import { db } from '../db';
import type { Transaction } from '@/types';

/**
 * Service to handle all Transaction-related database operations.
 * Separates IndexedDB business logic from UI components.
 */
export const TransactionService = {
  /**
   * Fetch all transactions sorted by createdAt descending
   */
  async getAll(): Promise<Transaction[]> {
    return await db.transactions.orderBy('createdAt').reverse().toArray();
  },

  /**
   * Add a new transaction
   */
  async create(data: Omit<Transaction, 'id'>): Promise<number> {
    return await db.transactions.add(data as Transaction);
  },

  /**
   * Update an existing transaction safely
   */
  async update(id: number, data: Partial<Omit<Transaction, 'id'>>): Promise<number> {
    return await db.transactions.update(id, data);
  },

  /**
   * Delete a transaction by id
   */
  async remove(id: number): Promise<void> {
    await db.transactions.delete(id);
  },

  /**
   * Bulk insert transactions (used for seeding)
   */
  async bulkCreate(data: Omit<Transaction, 'id'>[]): Promise<void> {
    await db.transactions.bulkAdd(data as Transaction[]);
  },

  /**
   * Clear all transactions
   */
  async clearAll(): Promise<void> {
    await db.transactions.clear();
  }
};
