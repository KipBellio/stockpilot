export const validateEmail = (email) => {
  // Standard Regex for email validation
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
};

export const validatePassword = (password) => {
  if (password.length < 6) return "Password must be at least 6 characters.";
  return null;
};