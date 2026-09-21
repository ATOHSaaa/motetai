export interface SiteConfig {
  domain: string;
  origin: string;
  basePath: string;
}

export declare const siteEnv: SiteConfig;
export declare function getSiteUrl(config?: SiteConfig): string;
