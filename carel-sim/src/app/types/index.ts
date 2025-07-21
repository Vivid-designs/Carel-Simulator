// shared TS interfaces

export interface Item {
  id: number;
  description: string;
  rate: number;
  quantity: number;
}

export interface Person {
  id: number;
  name: string;
  color: string;
  tipPercentage: number;
}

export type Assignments = Record<
  number,            // itemId
  Record<number, number> // personId → quantity
>;

export interface PerPersonDetail {
  items: { desc: string; qty: number; total: number }[];
  subtotal: number;
  tip: number;
  total: number;
}

export type PerPersonMap = Record<number, PerPersonDetail>;
