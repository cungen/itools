import { useMemo } from "react"

export interface EnvironmentState {
  isExtension: boolean
  isWeb: boolean
}

/**
 * Hook to detect whether the application is running in a Chrome extension context
 * or a web browser context.
 *
 * @returns EnvironmentState with isExtension and isWeb boolean flags
 */
export const useEnvironment = (): EnvironmentState => {
  return useMemo(() => {
    // Check if Chrome extension APIs are available
    const isExtension =
      typeof chrome !== "undefined" &&
      chrome.runtime !== undefined &&
      chrome.runtime.id !== undefined

    return {
      isExtension,
      isWeb: !isExtension,
    }
  }, [])
}

