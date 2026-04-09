function normalizeKeyword(keyword) {
  return String(keyword || "").trim().toLowerCase();
}

function generateKeywordTags(triggerKeyword) {
  const normalizedKeyword = normalizeKeyword(triggerKeyword);
  const tags = [];

  if (normalizedKeyword === "ราคา") {
    tags.push("price_interest");
  }

  if (normalizedKeyword === "สั่ง") {
    tags.push("purchase_intent");
  }

  return tags;
}

function generateQuantityTags(quantity) {
  const parsedQuantity = Number(quantity);

  if (!Number.isFinite(parsedQuantity) || parsedQuantity <= 0) {
    return [];
  }

  if (parsedQuantity >= 100) {
    return ["B2B"];
  }

  return ["B2C"];
}

function generateTags(lead) {
  if (!lead) {
    return [];
  }

  const tagSet = new Set();

  for (const tag of generateKeywordTags(lead.triggerKeyword)) {
    tagSet.add(tag);
  }

  for (const tag of generateQuantityTags(lead.quantity)) {
    tagSet.add(tag);
  }

  return Array.from(tagSet);
}

module.exports = {
  normalizeKeyword,
  generateKeywordTags,
  generateQuantityTags,
  generateTags,
};
