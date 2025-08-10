"use client"

import { Progress } from "@/components/ui/progress"
import { validatePassword, getPasswordStrengthText, getPasswordStrengthColor } from "@/lib/password-validation"

interface PasswordStrengthProps {
  password: string
}

export function PasswordStrength({ password }: PasswordStrengthProps) {
  if (!password || password.length === 0) return null
  
  const strength = validatePassword(password)
  
  if (!strength || !Array.isArray(strength.feedback)) return null

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-600">Fortaleza de la contraseña:</span>
        <span className="text-sm font-medium">{getPasswordStrengthText(strength.score)}</span>
      </div>
      <Progress 
        value={(strength.score / 5) * 100} 
        className="h-2"
      />
      {strength.feedback && strength.feedback.length > 0 && (
        <ul className="text-xs text-red-600 space-y-1">
          {strength.feedback.map((item, index) => (
            <li key={index}>• {item}</li>
          ))}
        </ul>
      )}
    </div>
  )
}
