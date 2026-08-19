import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
  AlertCircle
} from "lucide-react"
import { Toaster as Sonner, type ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      richColors
      closeButton
      duration={4500}
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-5 text-emerald-600" />,
        info: <InfoIcon className="size-5 text-blue-600" />,
        warning: <TriangleAlertIcon className="size-5 text-amber-600" />,
        error: <AlertCircle className="size-5 text-red-600" />,
        loading: <Loader2Icon className="size-5 animate-spin text-amber-600" />,
      }}
      toastOptions={{
        classNames: {
          toast: 'group toast rounded-2xl p-4 shadow-2xl border text-sm font-medium transition-all duration-300 pointer-events-auto',
          error: 'bg-red-50 text-red-950 border-red-300 shadow-red-200/50 font-semibold !text-red-900',
          success: 'bg-emerald-50 text-emerald-950 border-emerald-300 shadow-emerald-200/50 font-semibold !text-emerald-900',
          warning: 'bg-amber-50 text-amber-950 border-amber-300 shadow-amber-200/50 font-semibold !text-amber-900',
          info: 'bg-blue-50 text-blue-950 border-blue-300 shadow-blue-200/50 font-semibold !text-blue-900',
          title: 'font-bold text-sm tracking-tight',
          description: 'text-xs opacity-90 mt-0.5',
          closeButton: '!bg-white !text-stone-700 !border-stone-200 !shadow-sm hover:!bg-stone-100',
        },
      }}
      {...props}
    />
  )
}

export { Toaster }

