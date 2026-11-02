const jwt = require('jsonwebtoken');

const generateToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

const getTodayString = () => {
  const d = new Date();
  return d.toISOString().split('T')[0]; // "YYYY-MM-DD"
};

const getTomorrowString = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
};

const isPastCutoff = (cutoffStr, pollDate) => {
  if (!cutoffStr) return false;
  const todayStr = getTodayString();
  // Only lock voting if poll date is strictly in the past
  if (pollDate && pollDate < todayStr) return true;
  return false;
};

const getMonthYear = (date = new Date()) => ({
  month: date.getMonth() + 1,
  year: date.getFullYear(),
});

module.exports = { generateToken, getTodayString, getTomorrowString, isPastCutoff, getMonthYear };
