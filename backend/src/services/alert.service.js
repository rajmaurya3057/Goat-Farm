const Alert = require('../models/Alert');
const Medicine = require('../models/Medicine');
const Vaccination = require('../models/Vaccination');
const { buildListQuery } = require('../utils/queryBuilder');
const { buildPaginationMeta } = require('../utils/pagination');
const logger = require('../config/logger');

const SEVERITY_MAP = {
  LOW_STOCK: 'MEDIUM',
  MEDICINE_EXPIRING: 'HIGH',
  MEDICINE_EXPIRED: 'CRITICAL',
  VACCINATION_DUE: 'MEDIUM',
  VACCINATION_OVERDUE: 'CRITICAL',
};

const createAlertIfNotExists = async ({ type, title, description, referenceId, entityType }) => {
  const existing = await Alert.findOne({ type, referenceId, isRead: false });
  if (existing) return null;

  return Alert.create({
    type,
    title,
    description,
    severity: SEVERITY_MAP[type],
    referenceId,
    entityType,
  });
};

const generateMedicineAlerts = async () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const in30Days = new Date(today);
  in30Days.setDate(in30Days.getDate() + 30);

  const medicines = await Medicine.find({ isDeleted: false });

  for (const med of medicines) {
    const expiry = new Date(med.expiryDate);
    expiry.setHours(0, 0, 0, 0);

    if (expiry < today) {
      await createAlertIfNotExists({
        type: 'MEDICINE_EXPIRED',
        title: `Medicine Expired: ${med.name}`,
        description: `${med.name} (batch ${med.batchNumber || 'N/A'}) expired on ${expiry.toISOString().split('T')[0]}`,
        referenceId: med._id,
        entityType: 'Medicine',
      });
    } else if (expiry <= in30Days) {
      await createAlertIfNotExists({
        type: 'MEDICINE_EXPIRING',
        title: `Medicine Expiring Soon: ${med.name}`,
        description: `${med.name} expires on ${expiry.toISOString().split('T')[0]}`,
        referenceId: med._id,
        entityType: 'Medicine',
      });
    }

    if (med.quantity < 5 && med.quantity > 0) {
      await createAlertIfNotExists({
        type: 'LOW_STOCK',
        title: `Low Stock: ${med.name}`,
        description: `${med.name} has only ${med.quantity} ${med.unit || 'units'} remaining`,
        referenceId: med._id,
        entityType: 'Medicine',
      });
    }
  }
};

const generateVaccinationAlerts = async () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const in7Days = new Date(today);
  in7Days.setDate(in7Days.getDate() + 7);

  const vaccinations = await Vaccination.find({}).populate('goat', 'uidTag name isDeleted');

  for (const vac of vaccinations) {
    if (!vac.goat || vac.goat.isDeleted) continue;

    const due = new Date(vac.nextDueDate);
    due.setHours(0, 0, 0, 0);

    if (due < today) {
      await createAlertIfNotExists({
        type: 'VACCINATION_OVERDUE',
        title: `Vaccination Overdue: ${vac.vaccineName}`,
        description: `${vac.vaccineName} for goat ${vac.goat.uidTag} was due on ${due.toISOString().split('T')[0]}`,
        referenceId: vac._id,
        entityType: 'Vaccination',
      });
    } else if (due <= in7Days) {
      await createAlertIfNotExists({
        type: 'VACCINATION_DUE',
        title: `Vaccination Due: ${vac.vaccineName}`,
        description: `${vac.vaccineName} for goat ${vac.goat.uidTag} is due on ${due.toISOString().split('T')[0]}`,
        referenceId: vac._id,
        entityType: 'Vaccination',
      });
    }
  }
};

const runAlertGeneration = async () => {
  logger.info('Running alert generation');
  await generateMedicineAlerts();
  await generateVaccinationAlerts();
  logger.info('Alert generation completed');
};

const getAlerts = async (query) => {
  const { filter, sort, page, limit, skip } = buildListQuery(query, {
    filterFields: ['type', 'severity'],
    defaultSort: '-createdAt',
  });

  if (query.isRead !== undefined) {
    filter.isRead = query.isRead === 'true';
  }

  const [alerts, total] = await Promise.all([
    Alert.find(filter).sort(sort).skip(skip).limit(limit).lean(),
    Alert.countDocuments(filter),
  ]);

  return { alerts, meta: buildPaginationMeta(total, page, limit) };
};

const markAsRead = async (id) => {
  const alert = await Alert.findByIdAndUpdate(id, { isRead: true }, { new: true });
  if (!alert) {
    const err = new Error('Alert not found');
    err.statusCode = 404;
    throw err;
  }
  return alert;
};

const markAllAsRead = async () => {
  const result = await Alert.updateMany({ isRead: false }, { isRead: true });
  return { modifiedCount: result.modifiedCount };
};

module.exports = {
  runAlertGeneration,
  getAlerts,
  markAsRead,
  markAllAsRead,
};
