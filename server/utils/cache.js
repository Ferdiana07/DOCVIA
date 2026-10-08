const entries = new Map();

const get = (key) => {
  const item = entries.get(key);
  if (!item) return undefined;
  if (item.expiresAt <= Date.now()) {
    entries.delete(key);
    return undefined;
  }
  return item.value;
};

const set = (key, value, ttlMs = 60000) => entries.set(key, { value, expiresAt: Date.now() + ttlMs });
const delByPrefix = (prefix) => [...entries.keys()].forEach((key) => key.startsWith(prefix) && entries.delete(key));
const clear = () => entries.clear();

module.exports = { get, set, delByPrefix, clear };
