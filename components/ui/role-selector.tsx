"use client"

import { useState } from 'react'
import { Check, ChevronDown, Home, Users, Globe } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

const roles = [
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
  {
    value: 'tourist',
    label: 'Visitante',
    description: 'Explora experiencias',
    icon: Globe,
  },
]

interface RoleSelectorProps {
  value?: string
  onValueChange: (value: string) => void
  name: string
}

export function RoleSelector({ value, onValueChange, name }: RoleSelectorProps) {
  const [open, setOpen] = useState(false)

  const selectedRole = roles.find((role) => role.value === value)

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700">Tipo de Usuario</label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between h-auto p-3"
          >
            {selectedRole ? (
              <div className="flex items-center space-x-3">
                <selectedRole.icon className="h-5 w-5 text-gray-500" />
                <div className="text-left">
                  <div className="font-medium">{selectedRole.label}</div>
                  <div className="text-sm text-gray-500">{selectedRole.description}</div>
                </div>
              </div>
            ) : (
              <span className="text-gray-500">Selecciona tu rol</span>
            )}
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command>
            <CommandEmpty>No se encontraron roles.</CommandEmpty>
            <CommandGroup>
              {roles && roles.length > 0 && roles.map((role) => (
                <CommandItem
                  key={role.value}
                  value={role.value}
                  onSelect={(currentValue) => {
                    onValueChange(currentValue)
                    setOpen(false)
                  }}
                  className="flex items-center space-x-3 p-3"
                >
                  {role.icon && <role.icon className="h-5 w-5 text-gray-500" />}
                  <div className="flex-1">
                    <div className="font-medium">{role.label}</div>
                    <div className="text-sm text-gray-500">{role.description}</div>
                  </div>
                  <Check
                    className={cn(
                      "ml-auto h-4 w-4",
                      value === role.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
      <input type="hidden" name={name} value={value || ''} />
    </div>
  )
}
