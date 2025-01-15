export function CircularProgress({ percentage }: { percentage: number }) {
  const radius = 45
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (percentage / 100) * circumference

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
        {/* Pozadí kruhu */}
        <circle
          className="text-muted stroke-current"
          strokeWidth="4"
          fill="transparent"
          r={radius}
          cx="50"
          cy="50"
        />
        {/* Progres */}
        <circle
          className="text-green-500 stroke-current"
          strokeWidth="4"
          strokeLinecap="round"
          fill="transparent"
          r={radius}
          cx="50"
          cy="50"
          style={{
            strokeDasharray: circumference,
            strokeDashoffset: offset,
            transition: 'stroke-dashoffset 0.5s ease'
          }}
        />
      </svg>
      <div className="absolute text-3xl font-bold">
        {percentage}%
      </div>
    </div>
  )
}

