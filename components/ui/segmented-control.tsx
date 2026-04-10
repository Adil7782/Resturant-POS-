import * as React from 'react'
import * as ToggleGroupPrimitive from '@radix-ui/react-toggle-group'

const SegmentedControl = React.forwardRef<
  React.ElementRef<typeof ToggleGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Root> & {
    options?: Array<{ value: string; label: string }>
  }
>(({ className, options, ...props }, ref) => (
  <ToggleGroupPrimitive.Root
    ref={ref}
    className="inline-flex h-10 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground"
    {...props}
  >
    {options?.map((option) => (
      <ToggleGroupPrimitive.Item
        key={option.value}
        value={option.value}
        className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ring-offset-background transition-all hover:bg-muted-foreground/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-background data-[state=on]:text-foreground data-[state=on]:shadow-sm"
      >
        {option.label}
      </ToggleGroupPrimitive.Item>
    ))}
  </ToggleGroupPrimitive.Root>
))
SegmentedControl.displayName = ToggleGroupPrimitive.Root.displayName

export { SegmentedControl }
