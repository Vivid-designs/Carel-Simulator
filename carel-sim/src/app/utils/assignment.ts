import { Assignments, Item, Person, PerPersonMap } from "@/app/types";

// Sum of assigned qty for an item
export function getUnassignedQty(item: Item, assignments: Assignments): number {
  const assigned = Object.values(assignments[item.id] || {}).reduce((sum, q) => sum + q, 0);
  return item.quantity - assigned;
}

// Builds per-person breakdown
export function calculatePerPerson(
  people: Person[],
  items: Item[],
  assignments: Assignments
): PerPersonMap {
  const result: PerPersonMap = {};

  people.forEach(person => {
    let subtotal = 0;
    const itemsArr = items
      .map(item => {
        const qty = assignments[item.id]?.[person.id] || 0;
        if (qty > 0) {
          const total = qty * item.rate;
          subtotal += total;
          return { desc: item.description, qty, total };
        }
        return null;
      })
      .filter(Boolean) as { desc: string; qty: number; total: number }[];

    const tip = parseFloat(((subtotal * (person.tipPercentage / 100)) || 0).toFixed(2));
    result[person.id] = { items: itemsArr, subtotal, tip, total: subtotal + tip };
  });

  return result;
}
