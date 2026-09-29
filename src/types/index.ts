export interface FoodItem {
  id: string;
  name: string;
  quantity: number;
  pricePerUnit: number;
  basePrice: number;
}

export interface Person {
  id: string;
  name: string;
  hasCoupon: boolean;
  couponValue: number;
}

export interface FoodAssignment {
  foodItemId: string;
  personIds: string[];
}

export interface BillDetails {
  restaurantName: string;
  gstPercentage: number;
  roundOff: number;
}

export interface ItemGSTBreakdown {
  itemId: string;
  itemName: string;
  basePrice: number;
  gst: number;
  finalCost: number;
}

export interface PersonConsumption {
  personId: string;
  personName: string;
  items: { itemName: string; share: number }[];
  totalCost: number;
}

export interface CouponSummary {
  personId: string;
  personName: string;
  hasCoupon: boolean;
  couponValue: number;
  couponUsed: number;
  unusedCoupon: number;
}

export interface SettlementEntry {
  personId: string;
  personName: string;
  rawCost: number;
  couponDeduction: number;
  extraDeduction: number;
  finalPayable: number;
}

export interface CalculationResult {
  itemGSTBreakdown: ItemGSTBreakdown[];
  personConsumption: PersonConsumption[];
  couponSummary: CouponSummary[];
  settlement: SettlementEntry[];
  totalGST: number;
  totalCouponsUsed: number;
  actualRestaurantPayment: number;
  totalCollected: number;
  isBalanced: boolean;
}

export interface AppState {
  billDetails: BillDetails;
  foodItems: FoodItem[];
  people: Person[];
  assignments: FoodAssignment[];
}
