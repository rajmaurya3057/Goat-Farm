jest.mock('../../../src/models/Alert');
jest.mock('../../../src/models/Medicine');
jest.mock('../../../src/models/Vaccination');
jest.mock('../../../src/config/logger', () => ({
  info: jest.fn(),
}));

const Alert = require('../../../src/models/Alert');
const Medicine = require('../../../src/models/Medicine');
const Vaccination = require('../../../src/models/Vaccination');
const alertService = require('../../../src/services/alert.service');

describe('alert.service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('markAsRead updates alert', async () => {
    Alert.findByIdAndUpdate.mockResolvedValue({ _id: '1', isRead: true });
    const result = await alertService.markAsRead('1');
    expect(result.isRead).toBe(true);
  });

  it('markAsRead throws when not found', async () => {
    Alert.findByIdAndUpdate.mockResolvedValue(null);
    await expect(alertService.markAsRead('bad')).rejects.toMatchObject({ statusCode: 404 });
  });

  it('markAllAsRead updates unread alerts', async () => {
    Alert.updateMany.mockResolvedValue({ modifiedCount: 3 });
    const result = await alertService.markAllAsRead();
    expect(result.modifiedCount).toBe(3);
  });

  it('runAlertGeneration skips duplicate alerts', async () => {
    Medicine.find.mockResolvedValue([
      {
        _id: 'm1',
        name: 'Med',
        quantity: 3,
        expiryDate: new Date(Date.now() + 86400000 * 60),
        batchNumber: 'B1',
        unit: 'Bottle',
      },
    ]);
    Vaccination.find.mockReturnValue({
      populate: jest.fn().mockResolvedValue([]),
    });
    Alert.findOne.mockResolvedValue({ _id: 'existing' });

    await alertService.runAlertGeneration();
    expect(Alert.create).not.toHaveBeenCalled();
  });
});
