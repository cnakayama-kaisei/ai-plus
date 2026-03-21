/**
 * Secure password generator for student accounts
 */

/**
 * Generate a secure random password
 * @param length - Password length (default: random between 12-16)
 * @returns Generated password
 */
export function generateSecurePassword(length?: number): string {
  // Random length between 12-16 if not specified
  const passwordLength = length || Math.floor(Math.random() * 5) + 12

  // Character sets
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const lowercase = 'abcdefghijklmnopqrstuvwxyz'
  const numbers = '0123456789'
  const allChars = uppercase + lowercase + numbers

  // Ensure at least one of each type
  const password: string[] = [
    uppercase[Math.floor(Math.random() * uppercase.length)],
    lowercase[Math.floor(Math.random() * lowercase.length)],
    numbers[Math.floor(Math.random() * numbers.length)],
  ]

  // Fill remaining characters
  for (let i = password.length; i < passwordLength; i++) {
    password.push(allChars[Math.floor(Math.random() * allChars.length)])
  }

  // Shuffle the password array
  for (let i = password.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[password[i], password[j]] = [password[j], password[i]]
  }

  return password.join('')
}

/**
 * Generate a secure password without ambiguous characters
 * Excludes: 0, O, I, l, 1 (commonly confused)
 * @param length - Password length (default: 16)
 * @returns Generated password
 */
export function generateSecurePasswordWithoutAmbiguous(length: number = 16): string {
  // Character sets excluding ambiguous characters
  const uppercase = 'ABCDEFGHJKLMNPQRSTUVWXYZ' // Removed: I, O
  const lowercase = 'abcdefghijkmnopqrstuvwxyz' // Removed: l
  const numbers = '23456789' // Removed: 0, 1
  const allChars = uppercase + lowercase + numbers

  // Ensure at least one of each type
  const password: string[] = [
    uppercase[Math.floor(Math.random() * uppercase.length)],
    lowercase[Math.floor(Math.random() * lowercase.length)],
    numbers[Math.floor(Math.random() * numbers.length)],
  ]

  // Fill remaining characters
  for (let i = password.length; i < length; i++) {
    password.push(allChars[Math.floor(Math.random() * allChars.length)])
  }

  // Shuffle the password array
  for (let i = password.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[password[i], password[j]] = [password[j], password[i]]
  }

  return password.join('')
}

/**
 * Validate password strength
 * @param password - Password to validate
 * @returns True if password meets requirements
 */
export function isPasswordStrong(password: string): boolean {
  if (password.length < 8) {
    return false
  }

  const hasUppercase = /[A-Z]/.test(password)
  const hasLowercase = /[a-z]/.test(password)
  const hasNumber = /[0-9]/.test(password)

  return hasUppercase && hasLowercase && hasNumber
}
