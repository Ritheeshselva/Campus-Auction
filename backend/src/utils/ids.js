function createId(prefix) {
  const randomPart = Math.random().toString(36).slice(2, 9);
  return `${prefix}_${randomPart}`;
}

function timestamp() {
  return new Date().toISOString();
}

module.exports = { createId, timestamp };
