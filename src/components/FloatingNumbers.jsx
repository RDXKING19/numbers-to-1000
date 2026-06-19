import { useMemo } from 'react';

const NICE_NUMS = [100,200,300,400,500,600,700,800,900,1000,125,345,678,512,999,250,750,438,816,573];
const COUNT = 20;

export default function FloatingNumbers() {
  const numbers = useMemo(() =>
    Array.from({ length: COUNT }, (_, i) => ({
      value:    NICE_NUMS[i % NICE_NUMS.length],
      left:     `${Math.random() * 95}%`,
      delay:    `${Math.random() * 18}s`,
      duration: `${15 + Math.random() * 12}s`,
      size:     `${2 + Math.random() * 2}rem`,
    })), []);

  return (
    <div className="floating-numbers">
      {numbers.map((n, i) => (
        <span
          key={i}
          className="floating-number"
          style={{
            left:              n.left,
            animationDelay:    n.delay,
            animationDuration: n.duration,
            fontSize:          n.size,
          }}
        >
          {n.value}
        </span>
      ))}
    </div>
  );
}
