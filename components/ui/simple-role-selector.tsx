"use client"

import { Home, Users, Globe } from 'lucide-react'
import { Label } from '@/components/ui/label'

const roles = [
  {
    value: 'tourist',
    label: 'Visitante',
    description: 'Explora experiencias',
    icon: Globe,
  },
  {
    value: 'host',
    label: 'Anfitrión',
    description: 'Crea experiencias',
    icon: Home,
  },
  {
    value: 'coordinator',
    label: 'Coordinador',
    description: 'Revisa experiencias',
    icon: Users,
  },
]

interface SimpleRoleSelectorProps {
  value?: string
  onValueChange: (value: string) => void
  name: string
}

export function SimpleRoleSelector({ value, onValueChange, name }: SimpleRoleSelectorProps) {
  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium text-gray-700">Tipo de Usuario</Label>
      <div className="space-y-2">
        {roles.map((role) => {
          const IconComponent = role.icon
          return (
            <label
              key={role.value}
              className={`flex items-center space-x-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                value === role.value
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <input
                type="radio"
                name={name}
                value={role.value}
                checked={value === role.value}
                onChange={(e) => onValueChange(e.target.value)}
                className="sr-only"
              />
              <IconComponent className="h-5 w-5 text-gray-500" />
              <div className="flex-1">
                <div className="font-medium text-gray-900">{role.label}</div>
                <div className="text-sm text-gray-500">{role.description}</div>
              </div>
              <div className={`w-4 h-4 rounded-full border-2 ${
                value === role.value
                  ? 'border-blue-500 bg-blue-500'
                  : 'border-gray-300'
              }`}>
                {value === role.value && (
                  <div className="w-full h-full rounded-full bg-white scale-50"></div>
                )}
              </div>
            </label>
          )
        })}
      </div>
    </div>
  )
}
