export interface PasswordValidation {
  isValid: boolean
  score: number
  feedback: string[]
}

export function validatePassword(password: string): PasswordValidation {
  const feedback: string[] = []
  let score = 0

  if (!password) {
    return {
      isValid: false,
      score: 0,
      feedback: ['La contraseña es requerida']
    }
  }

  // Length check
  if (password.length < 8) {
    feedback.push('Debe tener al menos 8 caracteres')
  } else {
    score += 1
  }

  // Uppercase check
  if (!/[A-Z]/.test(password)) {
    feedback.push('Debe incluir al menos una letra mayúscula')
  } else {
    score += 1
  }

  // Lowercase check
  if (!/[a-z]/.test(password)) {
    feedback.push('Debe incluir al menos una letra minúscula')
  } else {
    score += 1
  }

  // Number check
  if (!/\d/.test(password)) {
    feedback.push('Debe incluir al menos un número')
  } else {
    score += 1
  }

  // Special character check
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    feedback.push('Debe incluir al menos un carácter especial')
  }

  // Additional length bonus
  if (password.length >= 12) {
    score += 1
  }

  const isValid = score >= 3 && password.length >= 8

  return {
    isValid,
    score: Math.min(score, 4),
    feedback
  }
}


export function getPasswordStrengthColor(score: number): string {
  switch (score) {
    case 0:
    case 1:
      return "bg-red-500"
    case 2:
      return "bg-orange-500"
    case 3:
      return "bg-yellow-500"
    case 4:
      return "bg-green-500"
    case 5:
      return "bg-green-600"
    default:
      return "bg-red-500"
  }
}
