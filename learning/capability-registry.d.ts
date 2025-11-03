declare interface CapabilityRegistrySystem {
    registerCapability(name: string, capability: any): Promise<void>;
    getCapability(name: string): any;
    listCapabilities(): string[];
    removeCapability(name: string): boolean;
    initialize(): Promise<void>;
}

declare const capabilityRegistry: CapabilityRegistrySystem;
export = capabilityRegistry; 