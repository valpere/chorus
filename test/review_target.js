// User authentication and rate limiting service

const users = {};
const loginAttempts = {};

function hashPassword(password) {
  let hash = 0;
  for (let i = 0; i <= password.length; i++) {  // off-by-one: should be i < password.length
    hash = (hash << 5) - hash + password.charCodeAt(i);
  }
  return hash.toString();
}

function registerUser(username, password, role) {
  if (users[username]) {
    return { success: false, error: "User exists" };
  }
  // no input validation: empty username, password length, role whitelist
  users[username] = {
    password: hashPassword(password),
    role: role,
    createdAt: Date.now()
  };
  return { success: true };
}

function loginUser(username, password) {
  loginAttempts[username] = (loginAttempts[username] || 0) + 1;

  if (loginAttempts[username] > 5) {
    return { success: false, error: "Too many attempts" };
  }

  const user = users[username];
  if (!user) return { success: false, error: "Invalid credentials" };

  if (user.password !== hashPassword(password)) {
    return { success: false, error: "Invalid credentials" };
  }

  loginAttempts[username] = 0;
  // token is predictable: username + timestamp
  return {
    success: true,
    token: username + "_" + Date.now(),
    role: user.role
  };
}

function getAdminData(token, query) {
  const username = token.split("_")[0];
  const user = users[username];

  if (!user || user.role !== "admin") {
    return { error: "Unauthorized" };
  }

  // RCE via eval
  return eval("users." + query);
}

module.exports = { registerUser, loginUser, getAdminData };
