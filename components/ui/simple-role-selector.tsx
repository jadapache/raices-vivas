"use client"

import { Home, Users, Globe } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { useI18n } from '@/lib/i18n/context'

const roles = [
  {
    value: 'tourist',
    labelKey: 'roleselector.touristLabel',
    descriptionKey: 'roleselector.touristDescription',
    icon: Globe,
  },
  {
    value: 'host',
    labelKey: 'roleselector.hostLabel',
    descriptionKey: 'roleselector.hostDescription',
    icon: Home,
  },
  {
    value: 'coordinator',
    labelKey: 'roleselector.coordinatorLabel',
    descriptionKey: 'roleselector.coordinatorDescription',
    icon: Users,
  },
]

interface SimpleRoleSelectorProps {
  value?: string
  onValueChange: (value: string) => void
  name: string
}

export function SimpleRoleSelector({ value, onValueChange, name }: SimpleRoleSelectorProps) {
  const { t } = useI18n()

  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium text-gray-700">{t('roleselector.userTypeLabel')}</Label>
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
                <div className="font-medium text-gray-900">{t(role.labelKey)}</div>
                <div className="text-sm text-gray-500">{t(role.descriptionKey)}</div>
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