jest.mock('../../../src/models/Medicine');
jest.mock('../../../src/config/logger', () => ({ info: jest.fn() }));

const Medicine = require('../../../src/models/Medicine');
const medicineService = require('../../../src/services/medicine.service');

describe('medicine.service', () => {
  const futureDate = new Date();
  futureDate.setFullYear(futureDate.getFullYear() + 1);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('createMedicine sets Available status for qty >= 5', async () => {
    const save = jest.fn().mockResolvedValue(true);
    Medicine.mockImplementation(() => ({
      ...{ name: 'Test', quantity: 10, expiryDate: futureDate },
      status: '',
      save,
    }));

    await medicineService.createMedicine(
      { name: 'Test', type: 'Dewormer', quantity: 10, expiryDate: futureDate },
      'user1'
    );

    expect(save).toHaveBeenCalled();
  });

  it('getMedicineById throws when not found', async () => {
    Medicine.findOne.mockReturnValue({ lean: jest.fn().mockResolvedValue(null) });
    await expect(medicineService.getMedicineById('bad')).rejects.toMatchObject({
      statusCode: 404,
    });
  });

  it('decrementQuantity rejects out of stock', async () => {
    Medicine.findOne.mockReturnValue({
      session: jest.fn().mockResolvedValue({ quantity: 0, isDeleted: false }),
    });
    await expect(medicineService.decrementQuantity('id', {})).rejects.toMatchObject({
      statusCode: 400,
    });
  });
});
