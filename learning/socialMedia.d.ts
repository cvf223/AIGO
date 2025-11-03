export interface SocialMediaCapabilities {
    telegram: (options: any) => Promise<any>;
    discord: (options: any) => Promise<any>;
    twitter: (options: any) => Promise<any>;
    memeTrends: (options: any) => Promise<any>;
    scamDetection: (options: any) => Promise<any>;
}

declare const socialMediaCapabilities: SocialMediaCapabilities;
export = socialMediaCapabilities; 