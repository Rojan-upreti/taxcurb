// Validation utility functions

export const validateEmail = (email) => {
  if (!email) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

export const validatePhone = (phone) => {
  if (!phone) return false;
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  // Check if it's exactly 10 digits
  return cleaned.length === 10;
};

export const validateZIP = (zip) => {
  if (!zip) return false;
  // Remove all non-digit characters
  const cleaned = zip.replace(/\D/g, '');
  // Check if it's exactly 5 digits
  return cleaned.length === 5;
};

export const formatPhone = (value) => {
  // Remove all non-digit characters
  const cleaned = value.replace(/\D/g, '');
  // Limit to 10 digits
  const limited = cleaned.slice(0, 10);
  
  // Format as (XXX) XXX-XXXX
  if (limited.length === 0) return '';
  if (limited.length <= 3) return `(${limited}`;
  if (limited.length <= 6) return `(${limited.slice(0, 3)}) ${limited.slice(3)}`;
  return `(${limited.slice(0, 3)}) ${limited.slice(3, 6)}-${limited.slice(6)}`;
};

export const formatZIP = (value) => {
  // Remove all non-digit characters
  const cleaned = value.replace(/\D/g, '');
  // Limit to 5 digits
  return cleaned.slice(0, 5);
};

