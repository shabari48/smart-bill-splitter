import React, { useState, useRef, useEffect } from 'react';
import type { FoodItem, Person, FoodAssignment } from '../types';

interface Props {
  foodItems: FoodItem[];
  people: Person[];
  assignments: FoodAssignment[];
  onChange: (assignments: FoodAssignment[]) => void;
}

function MultiSelect({
  people,
  selectedIds,
  onToggle,
}: {
  people: Person[];
  selectedIds: string[];
  onToggle: (personId: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const selectedNames = people
    .filter((p) => selectedIds.includes(p.id))
    .map((p) => p.name || 'Unnamed');

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="input-field text-left flex items-center justify-between gap-2 min-h-[42px]"
      >
        <div className="flex-1 flex flex-wrap gap-1">
          {selectedNames.length === 0 ? (
            <span className="text-surface-400 dark:text-surface-500 text-sm">Select people...</span>
          ) : (
            selectedNames.map((name, i) => (
              <span key={i} className="badge-primary text-[10px]">
                {name}
              </span>
            ))
          )}
        </div>
        <svg
          className={`w-4 h-4 text-surface-400 flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute z-20 mt-1 w-full bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl shadow-lg py-1 animate-slide-down max-h-48 overflow-y-auto">
          {people.map((person) => (
            <label
              key={person.id}
              className="flex items-center gap-3 px-3 py-2 hover:bg-surface-50 dark:hover:bg-surface-700/50 cursor-pointer transition-colors"
            >
              <input
                type="checkbox"
                checked={selectedIds.includes(person.id)}
                onChange={() => onToggle(person.id)}
                className="w-4 h-4 rounded border-surface-300 dark:border-surface-600 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm text-surface-700 dark:text-surface-300">
                {person.name || 'Unnamed'}
              </span>
              {person.hasCoupon && (
                <span className="badge-success text-[10px] ml-auto">🎟️</span>
              )}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

export default function FoodAssignmentSection({ foodItems, people, assignments, onChange }: Props) {
  const getAssignment = (foodItemId: string): string[] => {
    const found = assignments.find((a) => a.foodItemId === foodItemId);
    return found ? found.personIds : [];
  };

  const togglePerson = (foodItemId: string, personId: string) => {
    const existing = assignments.find((a) => a.foodItemId === foodItemId);
    let newAssignments: FoodAssignment[];

    if (existing) {
      const newPersonIds = existing.personIds.includes(personId)
        ? existing.personIds.filter((id) => id !== personId)
        : [...existing.personIds, personId];

      if (newPersonIds.length === 0) {
        newAssignments = assignments.filter((a) => a.foodItemId !== foodItemId);
      } else {
        newAssignments = assignments.map((a) =>
          a.foodItemId === foodItemId ? { ...a, personIds: newPersonIds } : a
        );
      }
    } else {
      newAssignments = [...assignments, { foodItemId, personIds: [personId] }];
    }

    onChange(newAssignments);
  };

  const assignAll = (foodItemId: string) => {
    const allIds = people.map((p) => p.id);
    const existing = assignments.find((a) => a.foodItemId === foodItemId);

    if (existing) {
      onChange(
        assignments.map((a) =>
          a.foodItemId === foodItemId ? { ...a, personIds: allIds } : a
        )
      );
    } else {
      onChange([...assignments, { foodItemId, personIds: allIds }]);
    }
  };

  if (foodItems.length === 0 || people.length === 0) {
    return (
      <div className="glass-card p-6 animate-fade-in">
        <h2 className="section-title mb-5">
          <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-cyan-100 dark:bg-cyan-900/40">
            <svg className="w-4 h-4 text-cyan-600 dark:text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
            </svg>
          </span>
          Food Assignment
        </h2>
        <div className="text-center py-8 text-surface-400 dark:text-surface-500">
          <p className="text-sm">Add food items and people first to assign food.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card p-6 animate-fade-in">
      <h2 className="section-title mb-5">
        <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-cyan-100 dark:bg-cyan-900/40">
          <svg className="w-4 h-4 text-cyan-600 dark:text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
          </svg>
        </span>
        Food Assignment
      </h2>

      <p className="text-xs text-surface-500 dark:text-surface-400 mb-4">
        Assign each food item to the people who consumed it. Shared items will be split equally.
      </p>

      <div className="space-y-3">
        {foodItems.map((item) => (
          <div
            key={item.id}
            className="bg-surface-50 dark:bg-surface-900/40 rounded-xl p-4 border border-surface-200 dark:border-surface-700"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-surface-700 dark:text-surface-200">
                  {item.name || 'Unnamed Item'}
                </span>
                <span className="text-xs text-surface-400 font-mono">₹{item.basePrice}</span>
              </div>
              <button
                onClick={() => assignAll(item.id)}
                className="text-xs text-primary-600 dark:text-primary-400 hover:text-primary-500 font-medium transition-colors"
              >
                Select All
              </button>
            </div>
            <MultiSelect
              people={people}
              selectedIds={getAssignment(item.id)}
              onToggle={(personId) => togglePerson(item.id, personId)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
