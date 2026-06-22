const { calculateMedicineStatus } = require('../../../src/utils/helpers');

describe('calculateMedicineStatus', () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  it('returns Expired when expiry date is in the past', () => {
    const past = new Date(today);
    past.setDate(past.getDate() - 1);
    expect(calculateMedicineStatus(10, past)).toBe('Expired');
  });

  it('returns Out Of Stock when quantity is 0', () => {
    const future = new Date(today);
    future.setDate(future.getDate() + 30);
    expect(calculateMedicineStatus(0, future)).toBe('Out Of Stock');
  });

  it('returns Low Stock when quantity is less than 5', () => {
    const future = new Date(today);
    future.setDate(future.getDate() + 30);
    expect(calculateMedicineStatus(3, future)).toBe('Low Stock');
  });

  it('returns Available when quantity is 5 or more', () => {
    const future = new Date(today);
    future.setDate(future.getDate() + 30);
    expect(calculateMedicineStatus(5, future)).toBe('Available');
    expect(calculateMedicineStatus(100, future)).toBe('Available');
  });

  it('prioritizes Expired over stock status', () => {
    const past = new Date(today);
    past.setDate(past.getDate() - 1);
    expect(calculateMedicineStatus(10, past)).toBe('Expired');
  });
});
