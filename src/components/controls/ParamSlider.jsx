import * as Slider from '@radix-ui/react-slider'

export function ParamSlider({
  label,
  value,
  min,
  max,
  step = 1,
  unit = '',
  onChange,
  formatValue,
}) {
  const displayValue = formatValue ? formatValue(value) : `${value}${unit}`

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-baseline">
        <label className="text-sm text-slate-600">{label}</label>
        <span className="text-sm font-mono font-medium text-slate-800">
          {displayValue}
        </span>
      </div>
      <Slider.Root
        className="relative flex items-center select-none touch-none w-full h-5"
        value={[value]}
        min={min}
        max={max}
        step={step}
        onValueChange={([v]) => onChange(v)}
      >
        <Slider.Track className="slider-track relative grow">
          <Slider.Range className="slider-range absolute h-full" />
        </Slider.Track>
        <Slider.Thumb className="slider-thumb" aria-label={label} />
      </Slider.Root>
    </div>
  )
}
