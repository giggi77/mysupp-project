interface CircularProgressProps {
  current: number
  total: number
}

export function CircularProgress({ current, total }: CircularProgressProps) {
  const percentage = (current / total) * 100
  const radius = 45
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (percentage / 100) * circumference

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
        {/* Background circle */}
        <circle
          className="text-gray-200 stroke-current"
          strokeWidth="8"
          fill="transparent"
          r={radius}
          cx="50"
          cy="50"
        />
        {/* Progress circle */}
        <circle
          className="text-red-500 stroke-current"
          strokeWidth="8"
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
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl font-bold">{current}/{total}</div>
          <div className="text-sm">dávek</div>
        </div>
      </div>
    </div>
  )
}

