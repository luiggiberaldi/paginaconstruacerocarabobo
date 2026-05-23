import { useState, useEffect, useRef } from 'react';

interface StatItemProps {
  target: number;
  label: string;
  isPercentage?: boolean;
}

function StatItem({ target, label, isPercentage = false }: StatItemProps) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const animated = useRef(false);

  useEffect(() => {
    let active = true;
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !animated.current) {
          animated.current = true;
          let start = 0;
          const duration = 1800; // milliseconds
          const startTime = performance.now();

          const animate = (currentTime: number) => {
            if (!active) return;
            const elapsedTime = currentTime - startTime;
            const progress = Math.min(elapsedTime / duration, 1);

            // Easing function (easeOutQuad)
            const easeProgress = progress * (2 - progress);
            const currentCount = Math.floor(easeProgress * target);

            setCount(currentCount);

            if (progress < 1) {
              requestAnimationFrame(animate);
            } else {
              setCount(target);
            }
          };

          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(element);

    return () => {
      active = false;
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [target]);

  const formattedValue = count.toLocaleString('es-ES') + (isPercentage ? '%' : '+');

  return (
    <div ref={ref} className="stats-item">
      <div className="stats-num">{formattedValue}</div>
      <div className="stats-label">{label}</div>
    </div>
  );
}

export function Stats() {
  return (
    <section className="container" style={{ position: 'relative', zIndex: 30 }}>
      <div className="stats-bar reveal active">
        <div className="stats-bar-grid">
          <StatItem target={9447} label="Comunidad Digital" />
          <StatItem target={12500} label="Toneladas Despachadas" />
          <StatItem target={150} label="Obras Civiles Abastecidas" />
          <StatItem target={100} label="% Eficiencia Entrega" isPercentage={true} />
        </div>
      </div>
    </section>
  );
}
