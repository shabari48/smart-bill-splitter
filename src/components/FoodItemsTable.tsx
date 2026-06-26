import React from 'react';
import type { FoodItem } from '../types';
import { formatINR } from '../utils/currency';

interface Props {
  items: FoodItem[];
  onChange: (items: FoodItem[]) => void;
}

let nextId = 1;
function genId(): string {
  return `food_${Date.now()}_${nextId++}`;
}

export default function FoodItemsTable({ items, onChange }: Props) {
  const addItem = () => {
    onChange([...items, { id: genId(), name: '', quantity: 1, pricePerUnit: 0, basePrice: 0 }]);
  };

  const removeItem = (id: string) => {
    onChange(items.filter((item) => item.id !== id));
  };

  const updateItem = (id: string, field: keyof FoodItem, value: string | number) => {
    onChange(
      items.map((item) => {
        if (item.id !== id) return item;
        const updated = {
          ...item,
          [field]: field === 'name' ? value : parseFloat(value as string) || 0
        };
        // Recompute basePrice if pricePerUnit or quantity changes
        if (field === 'pricePerUnit' || field === 'quantity') {
          const qty = updated.quantity;
          const ppu = updated.pricePerUnit !== undefined ? updated.pricePerUnit : (updated.quantity ? updated.basePrice / updated.quantity : 0);
          updated.basePrice = qty * ppu;
          updated.pricePerUnit = ppu;
        }
        return updated;
      })
    );
  };

  const totalBase = items.reduce((sum, item) => sum + item.basePrice, 0);

  return (
    <div className="glass-card p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-5">
        <h2 className="section-title">
          <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/40">
            <svg className="w-4 h-4 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
            </svg>
          </span>
          Food Items
          {items.length > 0 && (
            <span className="badge-warning">{items.length}</span>
          )}
        </h2>
        <button onClick={addItem} className="btn-primary flex items-center gap-1.5">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add Item
        </button>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-10 text-surface-400 dark:text-surface-500">
          <svg className="w-12 h-12 mx-auto mb-3 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
          </svg>
          <p className="text-sm font-medium">No food items added yet</p>
          <p className="text-xs mt-1">Click "Add Item" to get started</p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-surface-200 dark:border-surface-700">
                  <th className="table-header w-2/5">Food Item</th>
                  <th className="table-header w-1/5 text-right">Price/Unit</th>
                  <th className="table-header w-1/6 text-center">Qty</th>
                  <th className="table-header w-1/5 text-right">Amount</th>
                  <th className="table-header w-16 text-center"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100 dark:divide-surface-800">
                {items.map((item) => {
                  const ppu = item.pricePerUnit !== undefined ? item.pricePerUnit : (item.quantity ? item.basePrice / item.quantity : item.basePrice);
                  return (
                    <tr key={item.id} className="group hover:bg-surface-50 dark:hover:bg-surface-800/40 transition-colors">
                      <td className="table-cell">
                        <input
                          type="text"
                          className="input-field"
                          placeholder="Item name"
                          value={item.name}
                          onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                        />
                      </td>
                      <td className="table-cell text-right">
                        <div className="relative inline-block w-full">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400 text-sm">₹</span>
                          <input
                            type="number"
                            className="input-field pl-7 text-right"
                            placeholder="0.00"
                            value={ppu || ''}
                            onChange={(e) => updateItem(item.id, 'pricePerUnit', e.target.value)}
                          />
                        </div>
                      </td>
                      <td className="table-cell text-center">
                        <input
                          type="number"
                          className="input-field text-center w-20 mx-auto"
                          min="1"
                          value={item.quantity || ''}
                          onChange={(e) => updateItem(item.id, 'quantity', e.target.value)}
                        />
                      </td>
                      <td className="table-cell text-right">
                        <div className="relative inline-block w-full">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400 text-sm">₹</span>
                          <input
                            type="text"
                            className="input-field pl-7 text-right bg-surface-100 dark:bg-surface-800/60 font-semibold cursor-not-allowed text-surface-500"
                            readOnly
                            value={item.basePrice ? item.basePrice.toFixed(2) : '0.00'}
                          />
                        </div>
                      </td>
                      <td className="table-cell text-center">
                        <button
                          onClick={() => removeItem(item.id)}
                          className="opacity-0 group-hover:opacity-100 btn-danger transition-all"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="sm:hidden space-y-3">
            {items.map((item, index) => {
              const ppu = item.pricePerUnit !== undefined ? item.pricePerUnit : (item.quantity ? item.basePrice / item.quantity : item.basePrice);
              return (
                <div key={item.id} className="bg-surface-50 dark:bg-surface-900/40 rounded-xl p-4 border border-surface-200 dark:border-surface-700">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-surface-400 uppercase">Item #{index + 1}</span>
                    <button onClick={() => removeItem(item.id)} className="btn-danger">
                      Remove
                    </button>
                  </div>
                  <input
                    type="text"
                    className="input-field mb-2"
                    placeholder="Item name"
                    value={item.name}
                    onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                  />
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-xs text-surface-400 mb-1 block">Price/Unit</label>
                      <div className="relative">
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-surface-400 text-xs">₹</span>
                        <input
                          type="number"
                          className="input-field pl-5 text-sm"
                          placeholder="0.00"
                          value={ppu || ''}
                          onChange={(e) => updateItem(item.id, 'pricePerUnit', e.target.value)}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-surface-400 mb-1 block">Qty</label>
                      <input
                        type="number"
                        className="input-field text-center text-sm"
                        min="1"
                        value={item.quantity || ''}
                        onChange={(e) => updateItem(item.id, 'quantity', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-surface-400 mb-1 block">Amount</label>
                      <div className="relative">
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-surface-400 text-xs">₹</span>
                        <input
                          type="text"
                          className="input-field pl-5 text-sm bg-surface-100 dark:bg-surface-800/60 font-semibold cursor-not-allowed text-surface-500"
                          readOnly
                          value={item.basePrice ? item.basePrice.toFixed(2) : '0.00'}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Total */}
          <div className="mt-4 pt-3 border-t border-surface-200 dark:border-surface-700 flex justify-end">
            <div className="bg-amber-50/60 dark:bg-amber-950/30 rounded-xl px-4 py-2.5 flex items-center gap-3">
              <span className="text-xs font-medium text-amber-600 dark:text-amber-400 uppercase tracking-wider">Total Base</span>
              <span className="text-sm font-bold text-amber-700 dark:text-amber-300 font-mono">{formatINR(totalBase)}</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
