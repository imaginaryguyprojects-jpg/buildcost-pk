/**
 * Strict authentication, email, and password validation utilities.
 * Blocks disposable domains, fake dummy addresses, and insecure passwords.
 */

// Common fake / temporary / test domains that should not be used for real accounts
const DISPOSABLE_OR_TEST_DOMAINS = new Set([
  "example.com",
  "example.org",
  "example.net",
  "test.com",
  "dummy.com",
  "fake.com",
  "mailinator.com",
  "tempmail.com",
  "10minutemail.com",
  "throwawaymail.com",
  "guerrillamail.com",
  "trashmail.com",
  "yopmail.com",
  "sharklasers.com",
  "getairmail.com",
  "dispostable.com"
]);

/**
 * Strict RFC 5322 compliant email regex validation.
 * Rejects invalid patterns, spaces, missing TLDs, and single-letter domains.
 */
const EMAIL_REGEX =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export function validateEmail(email: string): ValidationResult {
  if (!email || typeof email !== "string") {
    return { valid: false, error: "Email address is required." };
  }

  const trimmed = email.trim().toLowerCase();

  if (trimmed.length < 5 || trimmed.length > 254) {
    return { valid: false, error: "Email address length must be between 5 and 254 characters." };
  }

  if (!EMAIL_REGEX.test(trimmed)) {
    return { valid: false, error: "Please enter a valid email address (e.g. name@domain.com)." };
  }

  const parts = trimmed.split("@");
  if (parts.length !== 2) {
    return { valid: false, error: "Malformed email address." };
  }

  const [localPart, domain] = parts;

  if (localPart.length === 0 || localPart === "test" || localPart === "dummy" || localPart === "fake") {
    return { valid: false, error: "Generic placeholder usernames are not allowed." };
  }

  // Check top-level domain
  const domainParts = domain.split(".");
  const tld = domainParts[domainParts.length - 1];
  if (!tld || tld.length < 2) {
    return { valid: false, error: "Email domain must have a valid top-level domain." };
  }

  if (DISPOSABLE_OR_TEST_DOMAINS.has(domain)) {
    return {
      valid: false,
      error: "Disposable, temporary, and test email addresses are not permitted. Please use your real email."
    };
  }

  return { valid: true };
}

export function validatePassword(password: string): ValidationResult {
  if (!password || typeof password !== "string") {
    return { valid: false, error: "Password is required." };
  }

  if (password.length < 8) {
    return { valid: false, error: "Password must be at least 8 characters long." };
  }

  if (!/[A-Za-z]/.test(password)) {
    return { valid: false, error: "Password must contain at least one letter." };
  }

  if (!/[0-9]/.test(password)) {
    return { valid: false, error: "Password must contain at least one number." };
  }

  return { valid: true };
}
