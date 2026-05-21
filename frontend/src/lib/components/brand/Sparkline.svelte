<script lang="ts">
  interface Props {
    values: number[];
    width?: number;
    height?: number;
    stroke?: string;
    fill?: string;
    strokeWidth?: number;
  }

  let {
    values,
    width = 120,
    height = 36,
    stroke = 'var(--color-red)',
    fill = 'color-mix(in oklab, var(--color-red) 15%, transparent)',
    strokeWidth = 1.6,
  }: Props = $props();

  const path = $derived.by(() => {
    if (values.length === 0) return { line: '', area: '' };
    const max = Math.max(...values);
    const min = Math.min(...values);
    const range = max - min || 1;
    const stepX = width / Math.max(values.length - 1, 1);

    const points = values.map((v, i) => {
      const x = i * stepX;
      const y = height - ((v - min) / range) * (height - 4) - 2;
      return [x, y] as const;
    });

    const line = points.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`).join(' ');
    const area = `${line} L${(width).toFixed(2)},${height} L0,${height} Z`;

    return { line, area };
  });
</script>

<svg
  viewBox="0 0 {width} {height}"
  width={width}
  height={height}
  aria-hidden="true"
  class="block"
>
  <path d={path.area} fill={fill} />
  <path
    d={path.line}
    fill="none"
    stroke={stroke}
    stroke-width={strokeWidth}
    stroke-linecap="round"
    stroke-linejoin="round"
  />
</svg>
