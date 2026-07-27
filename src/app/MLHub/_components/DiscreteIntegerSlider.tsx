import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Slider from '@mui/material/Slider';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

type Props = {
  max: number;
  sliderMin?: number;
  min: number;
  value?: number;
  onChange: (value: number) => void;
};

type Mark = NonNullable<
  Extract<React.ComponentProps<typeof Slider>['marks'], readonly unknown[]>
>[number];

export default function DiscreteIntegerSlider({
  max,
  sliderMin: rawSliderMin,
  min,
  value, // 2. Destructure value
  onChange,
}: Props) {
  const sliderMin = Math.min(rawSliderMin ?? 0, min);
  const safeMin = Math.min(Math.max(min, sliderMin), max);

  // Default marks generator, defined as a closure inside the component so it
  // captures `sliderMin`, `min`, and `max` directly from props. A mark at every
  // integer in `[sliderMin, max]`. Tall ticks + numeric labels at the endpoints
  // and every multiple of 5; short unlabeled ticks everywhere else. Marks in
  // `[sliderMin, min)` are dimmed (lower opacity + disabled color) to signal
  // that those values are not selectable, even though the rail extends there.
  const buildMarks = (): Mark[] => {
    const marks: Mark[] = [];

    for (let v = sliderMin; v <= max; v++) {
      const isSelectable = v >= min;
      const isEndpoint = v === sliderMin || v === max;
      const isMultipleOf5 = v % 5 === 0;
      const isTall = isEndpoint || isMultipleOf5;

      marks.push({
        value: v,
        label: (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              opacity: isSelectable ? 1 : 0.35,
              color: isSelectable ? 'text.secondary' : 'text.disabled',
            }}
          >
            {/* Mark Tick Line */}
            <Box
              sx={{
                width: 2,
                height: isTall ? 22 : 12,
                bgcolor: 'currentColor',
                borderRadius: 0.5,
              }}
            />

            {/* Mark Label Number (Rendered unconditionally for all marks) */}
            <Box
              component="span"
              sx={{
                fontSize: '0.75rem',
                color: 'currentColor',
                mt: 0.5,
                fontVariantNumeric: 'tabular-nums',
                fontWeight: 500,
                lineHeight: 1,
                // Fades out short marks slightly so the main increments stand out
                opacity: isTall ? 1 : 0.5,
              }}
            >
              {v}
            </Box>
          </Box>
        ),
      });
    }
    return marks;
  };
  const marks = useMemo(buildMarks, [sliderMin, max, min]);

  const [valueState, setValueState] = useState<number>(value ?? safeMin);

  // 3. Keep internal local state aligned when the parent form forces a value shift
  useEffect(() => {
    if (value !== undefined) {
      setValueState(value);
    }
  }, [value]);

  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  const handleChange = useCallback(
    (_event: React.SyntheticEvent | Event, newValue: number | number[]) => {
      let next = Array.isArray(newValue) ? newValue[0] : newValue;
      next = Math.max(next, min);
      setValueState(next); // Updates layout frame immediately
      onChangeRef.current(next);
    },
    [min]
  );

  return (
    <Paper
      elevation={0}
      sx={{
        width: '100%',
        maxWidth: 640,
      }}
    >
      <Slider
        value={valueState} // 4. Bind directly to your updated tracking state
        min={sliderMin}
        max={max}
        step={1}
        marks={marks}
        valueLabelDisplay="off"
        onChange={handleChange}
        getAriaValueText={(v) => `${v}`}
        color="primary"
      />
    </Paper>
  );
}
