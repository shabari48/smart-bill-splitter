import React from 'react';
import type { CalculationResult, BillDetails } from '../types';
import { formatINR } from '../utils/currency';

interface Props {
  result: CalculationResult;
  bill: BillDetails;
}

function SummaryCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  color: string;
}) {
  const colorClasses: Record<string, string> = {
    primary: 'from-primary-500 to-primary-600 shadow-primary-500/20',
    emerald: 'from-emerald-500 to-emerald-600 shadow-emerald-500/20',
    amber: 'from-amber-500 to-amber-600 shadow-amber-500/20',
    cyan: 'from-cyan-500 to-cyan-600 shadow-cyan-500/20',
    violet: 'from-violet-500 to-violet-600 shadow-violet-500/20',
  };

  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${colorClasses[color] || colorClasses.primary} p-5 text-white shadow-lg`}
    >
      <div className="absolute -top-4 -right-4 w-20 h-20 bg-white/10 rounded-full"></div>
      <div className="absolute -bottom-6 -right-6 w-28 h-28 bg-white/5 rounded-full"></div>
      <div className="relative">
        <div className="flex items-center gap-2 mb-2 opacity-90">
          {icon}
          <span className="text-xs font-semibold uppercase tracking-wider">{label}</span>
        </div>
        <p className="text-2xl font-bold font-mono tracking-tight">{value}</p>
      </div>
    </div>
  );
}

export default function SummaryCards({ result, bill }: Props) {
  return (
    <div className="space-y-4 animate-slide-up">
      <h2 className="section-title">
        <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary-100 dark:bg-primary-900/40">
          <svg className="w-4 h-4 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
          </svg>
        </span>
        Summary
      </h2>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        <SummaryCard
          label="Grand Total"
          value={formatINR(bill.grandTotal)}
          color="primary"
          icon={
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <SummaryCard
          label="Coupons Used"
          value={formatINR(result.totalCouponsUsed)}
          color="amber"
          icon={<span className="text-sm">🎟️</span>}
        />
        <SummaryCard
          label="Restaurant Paid"
          value={formatINR(result.actualRestaurantPayment)}
          color="emerald"
          icon={
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
            </svg>
          }
        />
        <SummaryCard
          label="Total Collected"
          value={formatINR(result.totalCollected)}
          color="cyan"
          icon={
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
            </svg>
          }
        />
        <div className="col-span-2 lg:col-span-2">
          <div
            className={`rounded-2xl p-5 border-2 ${
              result.isBalanced
                ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-700'
                : 'bg-red-50 dark:bg-red-950/30 border-red-300 dark:border-red-700'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${
                  result.isBalanced
                    ? 'bg-emerald-100 dark:bg-emerald-900/40'
                    : 'bg-red-100 dark:bg-red-900/40'
                }`}
              >
                {result.isBalanced ? '✅' : '⚠️'}
              </div>
              <div>
                <p
                  className={`font-bold text-lg ${
                    result.isBalanced
                      ? 'text-emerald-700 dark:text-emerald-300'
                      : 'text-red-700 dark:text-red-300'
                  }`}
                >
                  {result.isBalanced ? 'Balanced' : 'Unbalanced'}
                </p>
                <p
                  className={`text-xs ${
                    result.isBalanced
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-red-600 dark:text-red-400'
                  }`}
                >
                  {result.isBalanced
                    ? 'Collected + Coupons = Restaurant Payment'
                    : `Difference: ${formatINR(Math.abs(result.actualRestaurantPayment - result.totalCollected - result.totalCouponsUsed))}`}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
