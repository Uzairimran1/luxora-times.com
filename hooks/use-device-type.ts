"use client"

import { useState, useEffect } from "react"

interface DeviceType {
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
}

export function useDeviceType(): DeviceType {
  const [deviceType, setDeviceType] = useState<DeviceType>({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
  })

  useEffect(() => {
    const checkDeviceType = () => {
      const width = window.innerWidth
      setDeviceType({
        isMobile: width < 768,
        isTablet: width >= 768 && width < 1024,
        isDesktop: width >= 1024,
      })
    }

    // Initial check
    checkDeviceType()

    // Listen for window resize
    window.addEventListener("resize", checkDeviceType)

    // Cleanup
    return () => {
      window.removeEventListener("resize", checkDeviceType)
    }
  }, [])

  return deviceType
}
