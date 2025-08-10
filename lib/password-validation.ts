export interface PasswordStrength {
  score: number
  feedback: string[]
  isValid: boolean
}

export function validatePassword(password: string): PasswordStrength {
  const feedback: string[] = []
  let score = 0

  if (!password) {
    return {
      score: 0,
      feedback: [],
      isValid: false
    }
  }

  // Length check
  if (password.length >= 8) {
    score += 1
  } else {
    feedback.push("La contraseña debe tener al menos 8 caracteres")
  }

  // Uppercase check
  if (/[A-Z]/.test(password)) {
    score += 1
  } else {
    feedback.push("Incluye al menos una letra mayúscula")
  }

  // Lowercase check
  if (/[a-z]/.test(password)) {
    score += 1
  } else {
    feedback.push("Incluye al menos una letra minúscula")
  }

  // Number check
  if (/\d/.test(password)) {
    score += 1
  } else {
    feedback.push("Incluye al menos un número")
  }

  // Special character check
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    score += 1
  } else {
    feedback.push("Incluye al menos un carácter especial")
  }

  return {
    score,
    feedback,
    isValid: score >= 4
  }
}

export function getPasswordStrengthText(score: number): string {
  switch (score) {
    case 0:
    case 1:
      return "Muy débil"
    case 2:
      return "Débil"
    case 3:
      return "Regular"
    case 4:
      return "Fuerte"
    case 5:
      return "Muy fuerte"
    default:
      return "Muy débil"
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
