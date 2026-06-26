import React from 'react';
import type { CalculationResult } from '../types';
import { formatINR } from '../utils/currency';

interface Props {
  result: CalculationResult;
}

export default function SettlementTable({ result }: Props) {
  const { personConsumption, couponSummary, settlement } = result;

  return (
    <div className="space-y-6">
      {/* Person-wise Consumption */}
      <div className="glass-card p-6 animate-slide-up">
        <h2 className="section-title mb-5">
          <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/40">
            <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
          </span>
          Person-wise Consumption
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-surface-200 dark:border-surface-700">
                <th className="table-header">Person</th>
                <th className="table-header">Food Items</th>
                <th className="table-header text-right">Food Cost</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100 dark:divide-surface-800">
              {personConsumption.map((pc) => (
                <tr key={pc.personId} className="hover:bg-surface-50 dark:hover:bg-surface-800/40 transition-colors">
                  <td className="table-cell">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                        {pc.personName[0]?.toUpperCase() || '?'}
                      </div>
                      <span className="font-medium text-surface-800 dark:text-surface-200">{pc.personName}</span>
                    </div>
                  </td>
                  <td className="table-cell">
                    <div className="flex flex-wrap gap-1">
                      {pc.items.map((item, i) => (
                        <span key={i} className="badge-primary text-[10px]">
                          {item.itemName}
                        </span>
                      ))}
                      {pc.items.length === 0 && (
                        <span className="text-xs text-surface-400">No items assigned</span>
                      )}
                    </div>
                  </td>
                  <td className="table-cell text-right font-mono font-semibold">{formatINR(pc.totalCost)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Coupon Summary */}
      {couponSummary.some((cs) => cs.hasCoupon) && (
        <div className="glass-card p-6 animate-slide-up">
          <h2 className="section-title mb-5">
            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/40">
              🎟️
            </span>
            Coupon Summary
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-surface-200 dark:border-surface-700">
                  <th className="table-header">Person</th>
                  <th className="table-header text-right">Coupon Value</th>
                  <th className="table-header text-right">Coupon Used</th>
                  <th className="table-header text-right">Unused</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100 dark:divide-surface-800">
                {couponSummary
                  .filter((cs) => cs.hasCoupon)
                  .map((cs) => (
                    <tr key={cs.personId} className="hover:bg-surface-50 dark:hover:bg-surface-800/40 transition-colors">
                      <td className="table-cell font-medium text-surface-800 dark:text-surface-200">{cs.personName}</td>
                      <td className="table-cell text-right font-mono">{formatINR(cs.couponValue)}</td>
                      <td className="table-cell text-right font-mono text-emerald-600 dark:text-emerald-400">{formatINR(cs.couponUsed)}</td>
                      <td className="table-cell text-right font-mono text-amber-600 dark:text-amber-400">
                        {cs.unusedCoupon > 0.01 ? formatINR(cs.unusedCoupon) : '—'}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Final Settlement */}
      <div className="glass-card p-6 animate-slide-up">
        <h2 className="section-title mb-5">
          <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/40">
            <svg className="w-4 h-4 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </span>
          Final Settlement
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-surface-200 dark:border-surface-700">
                <th className="table-header">Person</th>
                <th className="table-header text-right">Raw Cost</th>
                <th className="table-header text-right">Coupon Ded.</th>
                <th className="table-header text-right">Extra Ded.</th>
                <th className="table-header text-right">Final Payable</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100 dark:divide-surface-800">
              {settlement.map((entry) => (
                <tr key={entry.personId} className="hover:bg-surface-50 dark:hover:bg-surface-800/40 transition-colors">
                  <td className="table-cell">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-400 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                        {entry.personName[0]?.toUpperCase() || '?'}
                      </div>
                      <span className="font-medium text-surface-800 dark:text-surface-200">{entry.personName}</span>
                    </div>
                  </td>
                  <td className="table-cell text-right font-mono text-sm">{formatINR(entry.rawCost)}</td>
                  <td className="table-cell text-right font-mono text-sm text-red-500 dark:text-red-400">
                    {entry.couponDeduction > 0 ? `-${formatINR(entry.couponDeduction)}` : '—'}
                  </td>
                  <td className="table-cell text-right font-mono text-sm text-amber-500 dark:text-amber-400">
                    {entry.extraDeduction > 0.01 ? `-${formatINR(entry.extraDeduction)}` : '—'}
                  </td>
                  <td className="table-cell text-right">
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-base">
                      {formatINR(entry.finalPayable)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
