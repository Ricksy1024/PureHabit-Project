"use client"

import { MeshGradient } from "@paper-design/shaders-react"
import type React from "react"
import { useEffect, useRef, useState } from "react"

interface ShaderBackgroundProps {
  children: React.ReactNode
  isDarkMode?: boolean
}

export function ShaderBackground({ children, isDarkMode = false }: ShaderBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isActive, setIsActive] = useState(false)

  useEffect(() => {
    const handleMouseEnter = () => setIsActive(true)
    const handleMouseLeave = () => setIsActive(false)

    const container = containerRef.current
    if (container) {
      container.addEventListener("mouseenter", handleMouseEnter)
      container.addEventListener("mouseleave", handleMouseLeave)
    }

    return () => {
      if (container) {
        container.removeEventListener("mouseenter", handleMouseEnter)
        container.removeEventListener("mouseleave", handleMouseLeave)
      }
    }
  }, [])

  return (
    <div ref={containerRef} className="min-h-screen w-full relative overflow-hidden">
      {/* SVG Filters */}
      <svg className="absolute inset-0 w-0 h-0">
        <defs>
          <filter id="glass-effect" x="-50%" y="-50%" width="200%" height="200%">
            <feTurbulence baseFrequency="0.005" numOctaves="1" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="0.3" />
            <feColorMatrix
              type="matrix"
              values="1 0 0 0 0.02
                      0 1 0 0 0.02
                      0 0 1 0 0.05
                      0 0 0 0.9 0"
              result="tint"
            />
          </filter>
          <filter id="gooey-filter" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9"
              result="gooey"
            />
            <feComposite in="SourceGraphic" in2="gooey" operator="atop" />
          </filter>
        </defs>
      </svg>

      {/* Background Shaders - Colors adjusted to match the warm dashboard theme */}
      <MeshGradient
        className="absolute inset-0 w-full h-full transition-opacity duration-1000"
        colors={isDarkMode 
          ? ["#1A1514", "#2A2421", "#4A2C24", "#1A1514", "#2A2421"] 
          : ["#FDF8F3", "#EADCCF", "#D0705B", "#E8DCD1", "#FAF5F0"]}
        speed={0.15}
        style={{ backgroundColor: isDarkMode ? "#1A1514" : "#EADCCF", transition: "background-color 1s ease" }}
      />
      <MeshGradient
        className="absolute inset-0 w-full h-full opacity-20 transition-opacity duration-1000"
        colors={isDarkMode
          ? ["#ffffff", "#2A2421", "#D0705B", "#ffffff"]
          : ["#ffffff", "#EADCCF", "#D0705B", "#ffffff"]}
        speed={0.1}
        wireframe="true"
        style={{ backgroundColor: "transparent" }}
      />

      {children}
    </div>
  )
}
