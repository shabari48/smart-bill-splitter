import React from 'react';
import type { Person } from '../types';

interface Props {
  people: Person[];
  onChange: (people: Person[]) => void;
}

let nextId = 1;
function genId(): string {
  return `person_${Date.now()}_${nextId++}`;
}

export default function PeopleTable({ people, onChange }: Props) {
  const addPerson = () => {
    onChange([...people, { id: genId(), name: '', hasCoupon: false, couponValue: 0 }]);
  };

  const removePerson = (id: string) => {
    onChange(people.filter((p) => p.id !== id));
  };

  const updatePerson = (id: string, field: keyof Person, value: string | number | boolean) => {
    onChange(
      people.map((p) => {
        if (p.id !== id) return p;
        if (field === 'hasCoupon') {
          return { ...p, hasCoupon: value as boolean, couponValue: value ? (p.couponValue > 0 ? p.couponValue : 75) : 0 };
        }
        if (field === 'couponValue') {
          return { ...p, couponValue: parseFloat(value as string) || 0 };
        }
        return { ...p, [field]: value };
      })
    );
  };

  return (
    <div className="glass-card p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-5">
        <h2 className="section-title">
          <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-violet-100 dark:bg-violet-900/40">
            <svg className="w-4 h-4 text-violet-600 dark:text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
            </svg>
          </span>
          People
          {people.length > 0 && (
            <span className="badge-primary">{people.length}</span>
          )}
        </h2>
        <button onClick={addPerson} className="btn-primary flex items-center gap-1.5">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add Person
        </button>
      </div>

      {people.length === 0 ? (
        <div className="text-center py-10 text-surface-400 dark:text-surface-500">
          <svg className="w-12 h-12 mx-auto mb-3 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
          </svg>
          <p className="text-sm font-medium">No people added yet</p>
          <p className="text-xs mt-1">Click "Add Person" to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {people.map((person, index) => (
            <div
              key={person.id}
              className="group bg-surface-50 dark:bg-surface-900/40 rounded-xl p-3 border border-surface-200 dark:border-surface-700 hover:border-primary-200 dark:hover:border-primary-800/60 transition-all duration-200 flex flex-col justify-between"
            >
              <div className="flex items-start gap-3">
                {/* Avatar */}
                <div className="flex-shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center text-white font-bold text-sm mt-0.5">
                  {person.name ? person.name[0].toUpperCase() : (index + 1)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-3">
                    <input
                      type="text"
                      className="input-field flex-1 !py-1.5 !text-sm"
                      placeholder="Person name"
                      value={person.name}
                      onChange={(e) => updatePerson(person.id, 'name', e.target.value)}
                    />
                    <button
                      onClick={() => removePerson(person.id)}
                      className="opacity-0 group-hover:opacity-100 sm:opacity-0 max-sm:opacity-100 btn-danger transition-all flex-shrink-0 !p-1.5"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>

                  {/* Coupon toggle and value */}
                  <div className="flex flex-col gap-2">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <div className="relative">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={person.hasCoupon}
                          onChange={(e) => updatePerson(person.id, 'hasCoupon', e.target.checked)}
                        />
                        <div className="w-8 h-4 bg-surface-300 dark:bg-surface-600 peer-checked:bg-primary-500 rounded-full transition-colors"></div>
                        <div className="absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full shadow-md peer-checked:translate-x-4 transition-transform"></div>
                      </div>
                      <span className="text-xs font-medium text-surface-500 dark:text-surface-400">Has Coupon</span>
                    </label>

                    {person.hasCoupon && (
                      <div className="relative animate-scale-in">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-surface-400 text-xs">₹</span>
                        <input
                          type="number"
                          className="input-field pl-6 w-full !py-1 !text-sm"
                          placeholder="Coupon value"
                          value={person.couponValue || ''}
                          onChange={(e) => updatePerson(person.id, 'couponValue', e.target.value)}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
