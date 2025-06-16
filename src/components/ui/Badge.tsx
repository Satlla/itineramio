import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-violet-600 text-white hover:bg-violet-700',
        secondary:
          'border-transparent bg-gray-100 text-gray-900 hover:bg-gray-200',
        destructive:
          'border-transparent bg-red-600 text-white hover:bg-red-700',
        outline: 'text-gray-900 border-gray-300',
        success:
          'border-transparent bg-green-100 text-green-800 hover:bg-green-200',
      },
      size: {
        default: 'px-2.5 py-0.5',
        sm: 'px-2 py-0.5 text-xs',
        lg: 'px-3 py-1 text-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, size }), className)} {...props} />
  )
}

export { Badge, badgeVariants }