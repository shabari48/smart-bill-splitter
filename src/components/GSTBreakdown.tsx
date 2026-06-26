import React from 'react';
import type { ItemGSTBreakdown } from '../types';
import { formatINR } from '../utils/currency';

interface Props {
  breakdown: ItemGSTBreakdown[];
  totalGST: number;
}

export default function GSTBreakdown({ breakdown, totalGST }: Props) {
  if (breakdown.length === 0) return null;

  const totalBase = breakdown.reduce((sum, item) => sum + item.basePrice, 0);
  const totalFinal = breakdown.reduce((sum, item) => sum + item.finalCost, 0);

  return (
    <div className="glass-card p-6 animate-slide-up">
      <h2 className="section-title mb-5">
        <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/40">
          <svg className="w-4 h-4 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
          </svg>
        </span>
        Item-wise GST Breakdown
      </h2>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-surface-200 dark:border-surface-700">
              <th className="table-header">Item</th>
              <th className="table-header text-right">Base Price</th>
              <th className="table-header text-right">GST</th>
              <th className="table-header text-right">Final Cost</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-100 dark:divide-surface-800">
            {breakdown.map((item) => (
              <tr key={item.itemId} className="hover:bg-surface-50 dark:hover:bg-surface-800/40 transition-colors">
                <td className="table-cell font-medium text-surface-800 dark:text-surface-200">{item.itemName}</td>
                <td className="table-cell text-right font-mono text-sm">{formatINR(item.basePrice)}</td>
                <td className="table-cell text-right font-mono text-sm text-primary-600 dark:text-primary-400">{formatINR(item.gst)}</td>
                <td className="table-cell text-right font-mono text-sm font-semibold">{formatINR(item.finalCost)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-surface-300 dark:border-surface-600 bg-surface-50/50 dark:bg-surface-800/30">
              <td className="table-cell font-bold text-surface-800 dark:text-surface-200">Total</td>
              <td className="table-cell text-right font-mono font-bold">{formatINR(totalBase)}</td>
              <td className="table-cell text-right font-mono font-bold text-primary-600 dark:text-primary-400">{formatINR(totalGST)}</td>
              <td className="table-cell text-right font-mono font-bold">{formatINR(totalFinal)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
