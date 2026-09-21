<script lang="ts">
  let { variant = 'orbit' }: { variant?: 'orbit' | 'flux' } = $props();
  function render(canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const preference = matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0,
      visible = true;
    const draw = () => {
      frame = 0;
      if (!visible) return;
      const bounds = canvas.getBoundingClientRect();
      const width = bounds.width,
        height = bounds.height;
      const dpr = Math.min(devicePixelRatio, 1.5);
      if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) {
        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);
      const turn = preference.matches ? 0.3 : 0.3 + window.scrollY * 0.00035;
      const radius = Math.min(width * 0.43, height * 0.6);
      const project = (x: number, y: number, z: number) => {
        const rx = x * Math.cos(turn) - z * Math.sin(turn);
        const rz = x * Math.sin(turn) + z * Math.cos(turn);
        const ry = y * 0.73 - rz * 0.45;
        const perspective = 850 / (850 + rz * 0.65);
        return [width / 2 + rx * perspective, height / 2 + ry * perspective];
      };
      for (let ring = 0; ring < 8; ring++) {
        ctx.beginPath();
        ctx.strokeStyle =
          variant === 'orbit'
            ? `rgba(255,255,255,${ring === 3 ? 0.19 : 0.045})`
            : 'rgba(15,15,17,.055)';
        ctx.lineWidth = 0.8;
        for (let step = 0; step <= 100; step++) {
          const angle = (step / 100) * Math.PI * 2;
          const latitude = (ring / 7 - 0.5) * Math.PI * 0.8;
          const p = project(
            Math.cos(angle) * radius * Math.cos(latitude),
            Math.sin(latitude) * radius,
            Math.sin(angle) * radius * Math.cos(latitude),
          );
          if (step === 0) ctx.moveTo(p[0] ?? 0, p[1] ?? 0);
          else ctx.lineTo(p[0] ?? 0, p[1] ?? 0);
        }
        ctx.stroke();
      }
      for (let dot = 0; dot < 6; dot++) {
        const angle = (dot / 6) * Math.PI * 2;
        const p = project(Math.cos(angle) * radius, 0, Math.sin(angle) * radius);
        ctx.beginPath();
        ctx.arc(p[0] ?? 0, p[1] ?? 0, dot === 1 ? 3 : 1.5, 0, Math.PI * 2);
        ctx.fillStyle = dot === 1 ? '#e30613' : '#888';
        ctx.fill();
      }
    };
    const schedule = () => {
      if (!frame && visible) frame = requestAnimationFrame(draw);
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = !!entry?.isIntersecting;
      schedule();
    });
    observer.observe(canvas);
    const resize = new ResizeObserver(schedule);
    resize.observe(canvas);
    window.addEventListener('scroll', schedule, { passive: true });
    preference.addEventListener('change', schedule);
    schedule();
    return {
      destroy() {
        cancelAnimationFrame(frame);
        observer.disconnect();
        resize.disconnect();
        window.removeEventListener('scroll', schedule);
        preference.removeEventListener('change', schedule);
      },
    };
  }
</script>

<canvas use:render aria-hidden="true"></canvas>

<style>
  canvas {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
  }
</style>
