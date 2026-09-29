import React, { useMemo, useState, useCallback } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import type { BillDetails, FoodItem, Person, FoodAssignment, CalculationResult } from './types';
import { calculateBillSplit, generateSettlementText, generateCSV } from './utils/calculator';
import { generatePDF } from './utils/pdfGenerator';
import BillDetailsForm from './components/BillDetailsForm';
import FoodItemsTable from './components/FoodItemsTable';
import PeopleTable from './components/PeopleTable';
import FoodAssignmentSection from './components/FoodAssignment';
import GSTBreakdown from './components/GSTBreakdown';
import SettlementTable from './components/SettlementTable';
import SummaryCards from './components/SummaryCards';

const defaultBill: BillDetails = {
  restaurantName: '',
  gstPercentage: 5,
  roundOff: 0,
};

function App() {
  const [darkMode, setDarkMode] = useLocalStorage('sbs-dark-mode', false);
  const [bill, setBill] = useLocalStorage<BillDetails>('sbs-bill', defaultBill);
  const [foodItems, setFoodItems] = useLocalStorage<FoodItem[]>('sbs-food-items', []);
  const [people, setPeople] = useLocalStorage<Person[]>('sbs-people', []);
  const [assignments, setAssignments] = useLocalStorage<FoodAssignment[]>('sbs-assignments', []);
  const [showResults, setShowResults] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState('');

  // Apply dark mode class to html
  React.useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Calculate results
  const result: CalculationResult | null = useMemo(() => {
    if (foodItems.length === 0 || people.length === 0 || assignments.length === 0) {
      return null;
    }
    try {
      return calculateBillSplit(bill, foodItems, people, assignments);
    } catch {
      return null;
    }
  }, [bill, foodItems, people, assignments]);

  const canCalculate = foodItems.length > 0 && people.length > 0 && assignments.length > 0;

  const handleReset = useCallback(() => {
    if (window.confirm('Are you sure you want to reset all data? This cannot be undone.')) {
      setBill(defaultBill);
      setFoodItems([]);
      setPeople([]);
      setAssignments([]);
      setShowResults(false);
    }
  }, [setBill, setFoodItems, setPeople, setAssignments]);

  const handleCopy = useCallback(() => {
    if (!result) return;
    const text = generateSettlementText(result, bill);
    navigator.clipboard.writeText(text).then(() => {
      setCopyFeedback('Copied!');
      setTimeout(() => setCopyFeedback(''), 2000);
    }).catch(() => {
      setCopyFeedback('Failed to copy');
      setTimeout(() => setCopyFeedback(''), 2000);
    });
  }, [result, bill]);

  const handleExportCSV = useCallback(() => {
    if (!result) return;
    const csv = generateCSV(result, bill);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bill-split${bill.restaurantName ? '-' + bill.restaurantName.replace(/\s+/g, '-').toLowerCase() : ''}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [result, bill]);

  const handleExportPDF = useCallback(() => {
    if (!result) return;
    generatePDF(result, bill);
  }, [result, bill]);

  // Clean up assignments when food items or people change
  const handleFoodItemsChange = useCallback((items: FoodItem[]) => {
    setFoodItems(items);
    // Remove assignments for deleted items
    const itemIds = new Set(items.map(i => i.id));
    setAssignments(prev => prev.filter(a => itemIds.has(a.foodItemId)));
  }, [setFoodItems, setAssignments]);

  const handlePeopleChange = useCallback((p: Person[]) => {
    setPeople(p);
    // Remove deleted people from assignments
    const personIds = new Set(p.map(person => person.id));
    setAssignments(prev =>
      prev.map(a => ({
        ...a,
        personIds: a.personIds.filter(id => personIds.has(id)),
      })).filter(a => a.personIds.length > 0)
    );
  }, [setPeople, setAssignments]);

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950">
      {/* Background decoration */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-500/5 dark:bg-primary-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 -left-40 w-96 h-96 bg-accent-500/5 dark:bg-accent-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-cyan-500/5 dark:bg-cyan-500/10 rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-30 backdrop-blur-xl bg-white/70 dark:bg-surface-950/70 border-b border-surface-200/60 dark:border-surface-800/60">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-lg shadow-lg shadow-primary-500/20">
              💸
            </div>
            <div>
              <h1 className="text-lg font-bold text-surface-900 dark:text-surface-100 tracking-tight">
                Smart Bill Splitter
              </h1>
              <p className="text-[10px] text-surface-400 dark:text-surface-500 font-medium tracking-wide uppercase">
                Fair splits with coupons & GST
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Dark mode toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="w-9 h-9 rounded-xl bg-surface-100 dark:bg-surface-800 hover:bg-surface-200 dark:hover:bg-surface-700 flex items-center justify-center transition-all"
              title={darkMode ? 'Light mode' : 'Dark mode'}
            >
              {darkMode ? (
                <svg className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z" />
                </svg>
              ) : (
                <svg className="w-4 h-4 text-surface-600" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98 10.503 10.503 0 01-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 01.818.162z" clipRule="evenodd" />
                </svg>
              )}
            </button>

            {/* Reset */}
            <button
              onClick={handleReset}
              className="w-9 h-9 rounded-xl bg-surface-100 dark:bg-surface-800 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-500 flex items-center justify-center transition-all text-surface-500"
              title="Reset all data"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="relative max-w-4xl mx-auto px-4 py-6 space-y-5">
        {/* Input sections */}
        <BillDetailsForm bill={bill} foodItems={foodItems} onChange={setBill} />
        <FoodItemsTable items={foodItems} onChange={handleFoodItemsChange} />
        <PeopleTable people={people} onChange={handlePeopleChange} />
        <FoodAssignmentSection
          foodItems={foodItems}
          people={people}
          assignments={assignments}
          onChange={setAssignments}
        />

        {/* Calculate button */}
        {canCalculate && (
          <div className="flex justify-center pt-2">
            <button
              onClick={() => setShowResults(true)}
              className="btn-success text-base px-8 py-3 flex items-center gap-2 shadow-lg shadow-emerald-500/20"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 15.75V18m-7.5-6.75h.008v.008H8.25v-.008zm0 2.25h.008v.008H8.25V13.5zm0 2.25h.008v.008H8.25v-.008zm0 2.25h.008v.008H8.25V18zm2.498-6.75h.007v.008h-.007v-.008zm0 2.25h.007v.008h-.007V13.5zm0 2.25h.007v.008h-.007v-.008zm0 2.25h.007v.008h-.007V18zm2.504-6.75h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V13.5zm0 2.25h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V18zm2.498-6.75h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V13.5zM8.25 6h7.5v2.25h-7.5V6zM12 2.25c-1.892 0-3.758.11-5.593.322C5.307 2.7 4.5 3.65 4.5 4.757V19.5a2.25 2.25 0 002.25 2.25h10.5a2.25 2.25 0 002.25-2.25V4.757c0-1.108-.806-2.057-1.907-2.185A48.507 48.507 0 0012 2.25z" />
              </svg>
              Calculate Split
            </button>
          </div>
        )}

        {/* Results sections */}
        {showResults && result && (
          <div className="space-y-5 animate-slide-up">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-surface-800 dark:text-surface-100">
                Results
              </h2>
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={handleCopy}
                  className="btn-secondary flex items-center gap-1.5"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9.75a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
                  </svg>
                  {copyFeedback || 'Copy'}
                </button>
                <button
                  onClick={handleExportCSV}
                  className="btn-secondary flex items-center gap-1.5"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                  </svg>
                  Export CSV
                </button>
                <button
                  onClick={handleExportPDF}
                  className="btn-primary flex items-center gap-1.5"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download PDF
                </button>
              </div>
            </div>

            <SummaryCards result={result} bill={bill} />
            <GSTBreakdown breakdown={result.itemGSTBreakdown} totalGST={result.totalGST} />
            <SettlementTable result={result} />
          </div>
        )}

        {/* Auto-show results when everything is filled */}
        {!showResults && result && canCalculate && (
          <div className="text-center py-4">
            <p className="text-sm text-surface-400 dark:text-surface-500">
              All data entered. Click "Calculate Split" to see results.
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="relative mt-12 border-t border-surface-200/60 dark:border-surface-800/60">
        <div className="max-w-4xl mx-auto px-4 py-4 text-center">
          <p className="text-xs text-surface-400 dark:text-surface-500">
            Smart Bill Splitter • Split bills fairly with GST & coupon support
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
