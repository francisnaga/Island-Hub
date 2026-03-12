import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

type BadgeType = "blue" | "gold" | "none"

interface VerificationBadgeProps {
  type: BadgeType
  className?: string
  iconSize?: number
}

export function VerificationBadge({ type, className, iconSize = 10 }: VerificationBadgeProps) {
  if (type === "none") return null

  const isGold = type === "gold"

  return (
    <div
      className={cn(
        "relative flex items-center justify-center rounded-full inline-flex align-middle ml-1",
        isGold ? "bg-[#FFD700]" : "bg-[#1DA1F2]", // Assuming standard solid blue for check
        isGold ? "p-[2px]" : "", // Slightly different padding/shape based on the reference if needed. For now, solid circle.
        className
      )}
      style={{
        width: isGold ? '18px' : '16px',
        height: isGold ? '18px' : '16px',
        clipPath: isGold ? 'polygon(50% 0%, 61% 16%, 80% 16%, 85% 34%, 100% 50%, 85% 66%, 80% 84%, 61% 84%, 50% 100%, 39% 84%, 20% 84%, 15% 66%, 0% 50%, 15% 34%, 20% 16%, 39% 16%)' : 'circle(50% at 50% 50%)'
      }}
    >
      <Check
        size={iconSize}
        strokeWidth={4}
        className="text-white"
      />
    </div>
  )
}
