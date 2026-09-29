import React from 'react';
import type { BillDetails, FoodItem } from '../types';
import { formatINR } from '../utils/currency';
import { computeTotalGST, computeActualPayment } from '../utils/calculator';

interface Props {
  bill: BillDetails;
  foodItems: FoodItem[];
  onChange: (bill: BillDetails) => void;
}

export default function BillDetailsForm({ bill, foodItems, onChange }: Props) {
  const totalGST = computeTotalGST(foodItems, bill);
  const actualPayment = computeActualPayment(foodItems, bill);

  const [roundOffStr, setRoundOffStr] = React.useState(bill.roundOff ? bill.roundOff.toString() : '');
  const [gstStr, setGstStr] = React.useState(bill.gstPercentage !== undefined ? bill.gstPercentage.toString() : '5');

  React.useEffect(() => {
    const parsedLocal = parseFloat(roundOffStr) || 0;
    const parsedProp = bill.roundOff || 0;
    if (parsedLocal !== parsedProp) {
       setRoundOffStr(parsedProp === 0 ? '' : parsedProp.toString());
    }
  }, [bill.roundOff]);

  React.useEffect(() => {
    const parsedLocal = parseFloat(gstStr) || 0;
    const parsedProp = bill.gstPercentage ?? 5;
    if (parsedLocal !== parsedProp) {
       setGstStr(parsedProp.toString());
    }
  }, [bill.gstPercentage]);

  const handleChange = (field: keyof BillDetails, value: string) => {
    if (field === 'restaurantName') {
      onChange({ ...bill, [field]: value });
    }
  };

  const handleRoundOffChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setRoundOffStr(val);
    const parsed = parseFloat(val);
    onChange({ ...bill, roundOff: isNaN(parsed) ? 0 : parsed });
  };

  const handleGstChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setGstStr(val);
    const parsed = parseFloat(val);
    onChange({ ...bill, gstPercentage: isNaN(parsed) ? 0 : parsed });
  };

  return (
    <div className="glass-card p-6 animate-fade-in">
      <h2 className="section-title mb-5">
        <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary-100 dark:bg-primary-900/40">
          <svg className="w-4 h-4 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
          </svg>
        </span>
        Bill Details
      </h2>

      <div className="space-y-4">
        {/* Restaurant Name */}
        <div>
          <label className="block text-xs font-medium text-surface-500 dark:text-surface-400 mb-1.5 uppercase tracking-wider">
            Restaurant Name
            <span className="text-surface-400 dark:text-surface-500 font-normal normal-case tracking-normal ml-1">(optional)</span>
          </label>
          <input
            type="text"
            className="input-field"
            placeholder="e.g., Saravana Bhavan"
            value={bill.restaurantName}
            onChange={(e) => handleChange('restaurantName', e.target.value)}
          />
        </div>

        {/* Amount fields in grid */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-surface-500 dark:text-surface-400 mb-1.5 uppercase tracking-wider">
              GST %
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400 text-sm">%</span>
              <input
                type="number"
                className="input-field pl-7"
                placeholder="5"
                value={gstStr}
                onChange={handleGstChange}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-surface-500 dark:text-surface-400 mb-1.5 uppercase tracking-wider">
              Round Off (+/-)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400 text-sm">₹</span>
              <input
                type="number"
                step="any"
                className="input-field pl-7"
                placeholder="0.00"
                value={roundOffStr}
                onChange={handleRoundOffChange}
              />
            </div>
          </div>
        </div>

        {/* Computed Values */}
        <div className="mt-4 pt-4 border-t border-surface-200 dark:border-surface-700">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center justify-between bg-primary-50/60 dark:bg-primary-950/30 rounded-xl px-4 py-3">
              <span className="text-xs font-medium text-primary-600 dark:text-primary-400 uppercase tracking-wider">Total GST</span>
              <span className="text-sm font-bold text-primary-700 dark:text-primary-300 font-mono">
                {formatINR(totalGST)}
              </span>
            </div>
            <div className="flex items-center justify-between bg-emerald-50/60 dark:bg-emerald-950/30 rounded-xl px-4 py-3">
              <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Grand Total</span>
              <span className="text-sm font-bold text-emerald-700 dark:text-emerald-300 font-mono">
                {formatINR(actualPayment)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
