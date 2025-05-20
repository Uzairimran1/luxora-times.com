/**
 * API Rate Limiter
 *
 * This utility manages API request rates to prevent exceeding limits.
 * It implements:
 * - Token bucket algorithm for rate limiting
 * - Dynamic throttling based on remaining quota
 * - Request queuing when approaching limits
 */

export interface RateLimitConfig {
  maxRequestsPerDay: number
  resetIntervalHours: number
  minRequestInterval: number // minimum ms between requests
  maxRequestInterval: number // maximum ms between requests when throttling
}

export interface RateLimiterState {
  remainingRequests: number
  nextResetTime: number
  lastRequestTime: number
  isThrottling: boolean
  currentDelay: number
}

export class ApiRateLimiter {
  private config: RateLimitConfig
  private state: RateLimiterState
  private storageKey: string

  constructor(apiName: string, config: RateLimitConfig) {
    this.config = config
    this.storageKey = `api-rate-limiter-${apiName}`

    // Initialize state
    this.state = this.loadState() || {
      remainingRequests: config.maxRequestsPerDay,
      nextResetTime: Date.now() + config.resetIntervalHours * 60 * 60 * 1000,
      lastRequestTime: 0,
      isThrottling: false,
      currentDelay: config.minRequestInterval,
    }

    // Check if reset time has passed
    this.checkAndResetQuota()
  }

  private loadState(): RateLimiterState | null {
    if (typeof window === "undefined") return null

    try {
      const savedState = localStorage.getItem(this.storageKey)
      return savedState ? JSON.parse(savedState) : null
    } catch (error) {
      console.error("Error loading rate limiter state:", error)
      return null
    }
  }

  private saveState(): void {
    if (typeof window === "undefined") return

    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.state))
    } catch (error) {
      console.error("Error saving rate limiter state:", error)
    }
  }

  private checkAndResetQuota(): void {
    if (Date.now() >= this.state.nextResetTime) {
      this.state.remainingRequests = this.config.maxRequestsPerDay
      this.state.nextResetTime = Date.now() + this.config.resetIntervalHours * 60 * 60 * 1000
      this.state.isThrottling = false
      this.state.currentDelay = this.config.minRequestInterval
      this.saveState()
    }
  }

  private updateThrottling(): void {
    // Calculate how much of the quota we've used (as a percentage)
    const quotaUsedPercentage = 1 - this.state.remainingRequests / this.config.maxRequestsPerDay

    // Start throttling when we've used 70% of our quota
    if (quotaUsedPercentage > 0.7) {
      this.state.isThrottling = true

      // Dynamically increase delay as we approach the limit
      // At 70% usage: minimal throttling
      // At 100% usage: maximum throttling
      const throttleIntensity = Math.min(1, (quotaUsedPercentage - 0.7) / 0.3)
      this.state.currentDelay =
        this.config.minRequestInterval +
        throttleIntensity * (this.config.maxRequestInterval - this.config.minRequestInterval)
    } else {
      this.state.isThrottling = false
      this.state.currentDelay = this.config.minRequestInterval
    }
  }

  public async acquirePermission(): Promise<boolean> {
    this.checkAndResetQuota()

    if (this.state.remainingRequests <= 0) {
      console.warn("API rate limit exceeded. No requests remaining until reset.")
      return false
    }

    // Calculate time to wait before making the next request
    const timeToWait = Math.max(0, this.state.lastRequestTime + this.state.currentDelay - Date.now())

    if (timeToWait > 0) {
      await new Promise((resolve) => setTimeout(resolve, timeToWait))
    }

    // Update state
    this.state.remainingRequests--
    this.state.lastRequestTime = Date.now()
    this.updateThrottling()
    this.saveState()

    return true
  }

  public getState(): RateLimiterState {
    this.checkAndResetQuota()
    return { ...this.state }
  }

  public getRemainingRequests(): number {
    this.checkAndResetQuota()
    return this.state.remainingRequests
  }

  public getNextResetTime(): Date {
    return new Date(this.state.nextResetTime)
  }

  public getIsThrottling(): boolean {
    return this.state.isThrottling
  }

  public getCurrentDelay(): number {
    return this.state.currentDelay
  }
}
