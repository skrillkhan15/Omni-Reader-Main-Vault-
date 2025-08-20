import { cva } from "class-variance-authority"

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-gradient-primary text-primary-foreground shadow-glow-primary hover:shadow-glow-soft hover:scale-105 transition-all duration-300",
        destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline: "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-gradient-secondary text-secondary-foreground shadow-glow-secondary hover:shadow-glow-soft hover:scale-105 transition-all duration-300",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        hero: "bg-gradient-hero text-white shadow-glow-soft hover:shadow-glow-primary hover:scale-110 transition-all duration-500 font-bold text-lg pulse-glow",
        accent: "bg-gradient-accent text-accent-foreground shadow-glow-accent hover:shadow-glow-soft hover:scale-105 transition-all duration-300",
        manga: "bg-manga text-white shadow-glow-accent hover:bg-manga/90 hover:scale-105 transition-all duration-300",
        manhwa: "bg-manhwa text-white shadow-glow-secondary hover:bg-manhwa/90 hover:scale-105 transition-all duration-300",
        manhua: "bg-manhua text-white shadow-glow-accent hover:bg-manhua/90 hover:scale-105 transition-all duration-300",
        premium: "bg-gradient-card border border-primary/30 text-foreground shadow-card-elegant hover:border-primary/50 hover:scale-105 transition-all duration-300",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        xl: "h-14 rounded-lg px-12 text-lg",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)
