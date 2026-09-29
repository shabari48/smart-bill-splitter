import type {
  BillDetails,
  FoodItem,
  Person,
  FoodAssignment,
  ItemGSTBreakdown,
  PersonConsumption,
  CouponSummary,
  SettlementEntry,
  CalculationResult,
} from '../types';

export function computeTotalGST(foodItems: FoodItem[], bill: BillDetails): number {
  return foodItems.reduce((sum, item) => sum + (item.basePrice * (bill.gstPercentage || 0) / 100), 0);
}

export function computeActualPayment(foodItems: FoodItem[], bill: BillDetails): number {
  const baseTotal = foodItems.reduce((sum, item) => sum + item.basePrice, 0);
  const gst = computeTotalGST(foodItems, bill);
  return baseTotal + gst + (bill.roundOff || 0);
}

export function computeItemGSTBreakdown(
  foodItems: FoodItem[],
  bill: BillDetails
): ItemGSTBreakdown[] {
  return foodItems.map((item) => {
    const itemGST = item.basePrice * ((bill.gstPercentage || 0) / 100);
    return {
      itemId: item.id,
      itemName: item.name || 'Unnamed',
      basePrice: item.basePrice,
      gst: itemGST,
      finalCost: item.basePrice + itemGST,
    };
  });
}

/**
 * Compute each person's raw consumption cost based on food assignments.
 */
export function computePersonConsumption(
  foodItems: FoodItem[],
  people: Person[],
  assignments: FoodAssignment[],
  gstBreakdown: ItemGSTBreakdown[]
): PersonConsumption[] {
  const gstMap = new Map(gstBreakdown.map((g) => [g.itemId, g]));

  return people.map((person) => {
    const items: { itemName: string; share: number }[] = [];
    let totalCost = 0;

    for (const assignment of assignments) {
      if (assignment.personIds.includes(person.id)) {
        const gstInfo = gstMap.get(assignment.foodItemId);
        const foodItem = foodItems.find((f) => f.id === assignment.foodItemId);
        if (gstInfo && foodItem) {
          const shareCount = assignment.personIds.length;
          const share = gstInfo.finalCost / shareCount;

          items.push({
            itemName: foodItem.name || 'Unnamed',
            share,
          });
          totalCost += share;
        }
      }
    }

    return {
      personId: person.id,
      personName: person.name || 'Unnamed',
      items,
      totalCost,
    };
  });
}

/**
 * Apply coupon deductions in two passes:
 *
 * Pass 1: Apply each person's own coupon.
 * Pass 2: Distribute leftover coupon amounts among eligible people.
 */
export function applyCoupons(
  people: Person[],
  personConsumptions: PersonConsumption[]
): { settlement: SettlementEntry[]; couponSummary: CouponSummary[]; totalCouponsUsed: number } {
  // Use raw consumption costs directly (no round-off distribution)
  const adjustedCosts = new Map(personConsumptions.map((p) => [p.personId, p.totalCost]));

  // --- First pass: apply own coupons ---
  const firstPass: {
    personId: string;
    personName: string;
    rawCost: number;
    payable: number;
    couponUsed: number;
    unusedCoupon: number;
    hasCoupon: boolean;
    couponValue: number;
  }[] = [];

  let leftoverCoupon = 0;

  for (const person of people) {
    const rawCost = adjustedCosts.get(person.id) || 0;

    const entry = {
      personId: person.id,
      personName: person.name || 'Unnamed',
      rawCost,
      payable: rawCost,
      couponUsed: 0,
      unusedCoupon: 0,
      hasCoupon: person.hasCoupon,
      couponValue: person.hasCoupon ? person.couponValue : 0,
    };

    if (person.hasCoupon && person.couponValue > 0) {
      if (rawCost <= person.couponValue) {
        entry.couponUsed = rawCost;
        entry.unusedCoupon = person.couponValue - rawCost;
        entry.payable = 0;
        leftoverCoupon += entry.unusedCoupon;
      } else {
        entry.couponUsed = person.couponValue;
        entry.unusedCoupon = 0;
        entry.payable = rawCost - person.couponValue;
      }
    }

    firstPass.push(entry);
  }

  // --- Second pass: distribute leftover coupons ---
  let remaining = leftoverCoupon;
  const extraDeductions = new Map<string, number>();
  firstPass.forEach((e) => extraDeductions.set(e.personId, 0));

  while (remaining > 0.01) {
    const eligible = firstPass.filter((e) => e.payable - (extraDeductions.get(e.personId) || 0) > 0.01);

    if (eligible.length === 0) break;

    const perPerson = remaining / eligible.length;
    let newRemaining = 0;

    for (const entry of eligible) {
      const currentPayable = entry.payable - (extraDeductions.get(entry.personId) || 0);
      const deduction = Math.min(perPerson, currentPayable);
      extraDeductions.set(entry.personId, (extraDeductions.get(entry.personId) || 0) + deduction);

      if (perPerson > currentPayable) {
        newRemaining += perPerson - currentPayable;
      }
    }

    remaining = newRemaining;
  }

  // Build settlement
  const settlement: SettlementEntry[] = firstPass.map((entry) => {
    const extra = extraDeductions.get(entry.personId) || 0;
    return {
      personId: entry.personId,
      personName: entry.personName,
      rawCost: entry.rawCost,
      couponDeduction: entry.couponUsed,
      extraDeduction: extra,
      finalPayable: Math.max(0, entry.payable - extra),
    };
  });

  // Build coupon summary
  const totalExtraUsed = Array.from(extraDeductions.values()).reduce((a, b) => a + b, 0);
  const couponSummary: CouponSummary[] = firstPass.map((entry) => ({
    personId: entry.personId,
    personName: entry.personName,
    hasCoupon: entry.hasCoupon,
    couponValue: entry.couponValue,
    couponUsed: entry.couponUsed,
    unusedCoupon: Math.max(0, entry.unusedCoupon - (entry.unusedCoupon > 0 ? (totalExtraUsed * entry.unusedCoupon / leftoverCoupon) : 0)),
  }));

  const totalCouponsUsed = settlement.reduce((sum, s) => sum + s.couponDeduction + s.extraDeduction, 0);

  return { settlement, couponSummary, totalCouponsUsed };
}

/**
 * Main calculation function that orchestrates all computations.
 */
export function calculateBillSplit(
  bill: BillDetails,
  foodItems: FoodItem[],
  people: Person[],
  assignments: FoodAssignment[]
): CalculationResult {
  const totalGST = computeTotalGST(foodItems, bill);
  const actualRestaurantPayment = computeActualPayment(foodItems, bill);

  // Step 1: GST breakdown per item
  const itemGSTBreakdown = computeItemGSTBreakdown(foodItems, bill);

  // Step 2: Person consumption
  const personConsumption = computePersonConsumption(foodItems, people, assignments, itemGSTBreakdown);

  // Step 3: Apply coupons
  const { settlement, couponSummary, totalCouponsUsed } = applyCoupons(
    people,
    personConsumption
  );

  // Step 4: Calculate totals
  const totalCollected = settlement.reduce((sum, s) => sum + s.finalPayable, 0);
  const isBalanced = Math.abs(actualRestaurantPayment - totalCollected - totalCouponsUsed - (bill.roundOff || 0)) < 0.5;

  return {
    itemGSTBreakdown,
    personConsumption,
    couponSummary,
    settlement,
    totalGST,
    totalCouponsUsed,
    actualRestaurantPayment,
    totalCollected,
    isBalanced,
  };
}

export function generateSettlementText(
  result: CalculationResult,
  bill: BillDetails
): string {
  const lines: string[] = [];

  if (bill.restaurantName) {
    lines.push(`🧾 Bill Split — ${bill.restaurantName}`);
  } else {
    lines.push('🧾 Bill Split Summary');
  }
  lines.push('─'.repeat(30));

  for (const entry of result.settlement) {
    lines.push(`${entry.personName} → ₹${entry.finalPayable.toFixed(2)}`);
  }

  lines.push('─'.repeat(30));
  lines.push(`Grand Total: ₹${result.actualRestaurantPayment.toFixed(2)}`);

  return lines.join('\n');
}

export function generateCSV(
  result: CalculationResult,
  bill: BillDetails
): string {
  const headers = ['Person', 'Raw Cost', 'Coupon Deduction', 'Extra Deduction', 'Final Payable'];
  const rows = result.settlement.map((s) => [
    s.personName,
    s.rawCost.toFixed(2),
    s.couponDeduction.toFixed(2),
    s.extraDeduction.toFixed(2),
    s.finalPayable.toFixed(2),
  ]);

  const csvLines = [
    bill.restaurantName ? `Bill Split - ${bill.restaurantName}` : 'Bill Split Summary',
    '',
    headers.join(','),
    ...rows.map((r) => r.join(',')),
    '',
    `Grand Total,${result.actualRestaurantPayment.toFixed(2)}`,
  ];

  return csvLines.join('\n');
}
