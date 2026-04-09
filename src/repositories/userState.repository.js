const userStates = new Map();

function getUserState(userId) {
  return userStates.get(userId) || null;
}

function setUserState(userId, state) {
  userStates.set(userId, state);
  return state;
}

function clearUserState(userId) {
  userStates.delete(userId);
}

function hasUserState(userId) {
  return userStates.has(userId);
}

module.exports = {
  getUserState,
  setUserState,
  clearUserState,
  hasUserState,
};