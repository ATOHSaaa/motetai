/** GA4 / Clarity / Search Console（環境変数または .env.production で設定） */
export const analyticsConfig = {
  gaMeasurementId: import.meta.env.PUBLIC_GA_MEASUREMENT_ID ?? '',
  clarityProjectId: import.meta.env.PUBLIC_CLARITY_PROJECT_ID ?? '',
  googleSiteVerification: import.meta.env.PUBLIC_GOOGLE_SITE_VERIFICATION ?? '',
} as const;

export function hasAnalytics(): boolean {
  return Boolean(analyticsConfig.gaMeasurementId || analyticsConfig.clarityProjectId);
}
