function isValidQuantity(text) {
  if (!text) return false;

  const trimmed = text.trim();

  if (!/^\d+$/.test(trimmed)) {
    return false;
  }

  const quantity = Number(trimmed);

  return quantity > 0;
}

module.exports = {
  isValidQuantity,
};