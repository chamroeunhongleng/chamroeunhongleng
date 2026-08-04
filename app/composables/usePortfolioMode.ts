import { PORTFOLIO_MODES, type PortfolioMode } from '~~/shared/schemas/index'

/**
 * The active content mode, baked in at build time from
 * NUXT_PUBLIC_PORTFOLIO_MODE (see .env.example).
 */
export function usePortfolioMode(): PortfolioMode {
  const raw = useRuntimeConfig().public.portfolioMode
  return PORTFOLIO_MODES.includes(raw as PortfolioMode) ? (raw as PortfolioMode) : 'review'
}
