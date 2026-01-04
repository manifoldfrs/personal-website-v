"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { motion } from "framer-motion"

export function CustomCursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isHovering, setIsHovering] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  // Use refs to store mouse position for RAF updates
  const mousePosRef = useRef({ x: 0, y: 0 })
  const isVisibleRef = useRef(false)
  const animationIdRef = useRef<number>(0)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mousePosRef.current = { x: e.clientX, y: e.clientY }
      isVisibleRef.current = true
    }

    const handleMouseLeave = () => {
      isVisibleRef.current = false
    }

    const handleHoverStart = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (target.closest("a, button, [data-cursor-hover]")) {
        setIsHovering(true)
      }
    }

    const handleHoverEnd = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (target.closest("a, button, [data-cursor-hover]")) {
        setIsHovering(false)
      }
    }

    // RAF-based position updates for smooth performance
    const updateCursor = () => {
      setPosition({ x: mousePosRef.current.x, y: mousePosRef.current.y })
      setIsVisible(isVisibleRef.current)
      animationIdRef.current = requestAnimationFrame(updateCursor)
    }

    // Use passive event listeners for better scroll performance
    window.addEventListener("mousemove", handleMouseMove, { passive: true })
    document.addEventListener("mouseleave", handleMouseLeave)
    document.addEventListener("mouseover", handleHoverStart, { passive: true })
    document.addEventListener("mouseout", handleHoverEnd, { passive: true })

    // Start RAF loop
    animationIdRef.current = requestAnimationFrame(updateCursor)

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseleave", handleMouseLeave)
      document.removeEventListener("mouseover", handleHoverStart)
      document.removeEventListener("mouseout", handleHoverEnd)
      cancelAnimationFrame(animationIdRef.current)
    }
  }, [])

  return (
    <>
      {/* Main cursor dot - gold tinted */}
      <motion.div
        className="fixed top-0 left-0 w-3 h-3 bg-accent rounded-full pointer-events-none z-[10000] mix-blend-difference"
        animate={{
          x: position.x - 6,
          y: position.y - 6,
          scale: isHovering ? 0 : 5,
          opacity: isVisible ? 1 : 0,
        }}
        transition={{ type: "spring", stiffness: 500, damping: 28, mass: 0.5 }}
      />
      {/* Hover ring */}
      <motion.div
        className="fixed top-0 left-0 w-12 h-12 border border-accent rounded-full pointer-events-none z-[10000] mix-blend-difference"
        animate={{
          x: position.x - 24,
          y: position.y - 24,
          scale: isHovering ? 1 : 0,
          opacity: isVisible ? 1 : 0,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 20, mass: 0.8 }}
      />
    </>
  )
}
