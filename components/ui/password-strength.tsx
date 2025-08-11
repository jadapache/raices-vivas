"use client"

import { validatePassword } from '@/lib/password-validation'

interface PasswordStrengthProps {
  password: string
}

export function PasswordStrength({ password }: PasswordStrengthProps) {
  if (!password) return null

  const validation = validatePassword(password)
  const { score, feedback } = validation

  const getStrengthColor = (score: number) => {
    switch (score) {
      case 0:
      case 1:
        return 'bg-red-500'
      case 2:
        return 'bg-yellow-500'
      case 3:
        return 'bg-blue-500'
      case 4:
        return 'bg-green-500'
      default:
        return 'bg-gray-300'
    }
  }

  const getStrengthText = (score: number) => {
    switch (score) {
      case 0:
      case 1:
        return 'Muy débil'
      case 2:
        return 'Débil'
      case 3:
        return 'Buena'
      case 4:
        return 'Fuerte'
      default:
        return ''
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-2">
        <div className="flex-1 bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${getStrengthColor(score)}`}
            style={{ width: `${(score / 4) * 100}%` }}
          />
        </div>
        <span className="text-sm text-gray-600 min-w-[60px]">
          {getStrengthText(score)}
        </span>
      </div>
      
      {feedback.length > 0 && (
        <ul className="text-xs text-gray-500 space-y-1">
          {feedback.map((item, index) => (
            <li key={index}>• {item}</li>
          ))}
        </ul>
      )}
    </div>
  )
}
