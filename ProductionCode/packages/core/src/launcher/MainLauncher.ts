import { ProductionSystem, ProductionSystemFactory } from '../production/ProductionSystem';
import type { IAgentRuntime } from '../types';

export interface LauncherConfig {
  environment: 'development' | 'staging' | 'production';
  runtime_config: RuntimeConfig;
  startup_options: StartupOptions;
  feature_flags: FeatureFlags;
}

export interface RuntimeConfig {
  agent_id: string;
  server_url: string;
  database_url: string;
  cache_url: string;
  api_keys: Record<string, string>;
  model_config: ModelConfig;
}

export interface ModelConfig {
  primary_model: string;
  fallback_model?: string;
  temperature: number;
  max_tokens: number;
  embedding_model: string;
}

export interface StartupOptions {
  auto_start_agents: boolean;
  enable_monitoring: boolean;
  enable_learning: boolean;
  enable_trading: boolean;
  enable_defi: boolean;
  enable_development: boolean;
  log_level: 'debug' | 'info' | 'warn' | 'error';
}

export interface FeatureFlags {
  experimental_features: boolean;
  rl_training: boolean;
  smart_contracts: boolean;
  social_media_walls: boolean;
  advanced_orchestration: boolean;
}

export interface LauncherStatus {
  status: 'initializing' | 'starting' | 'running' | 'stopping' | 'stopped' | 'error';
  start_time?: Date;
  uptime_seconds: number;
  production_system_status: any;
  error_message?: string;
  last_health_check: Date;
}

/**
 * Main Launcher - Entry point for the autonomous agent ecosystem
 * 
 * 💡 WHY: Provides a unified entry point that orchestrates the complete
 * initialization and management of the entire autonomous agent ecosystem,
 * from core infrastructure to pillar agents and supporting systems.
 * 
 * ⚙️ HOW: Uses environment-specific configuration, staged initialization,
 * comprehensive monitoring, and graceful shutdown to ensure reliable
 * operation across development, staging, and production environments.
 */
export class MainLauncher {
  private config: LauncherConfig;
  private runtime: IAgentRuntime | null = null;
  private productionSystem: ProductionSystem | null = null;
  private status: LauncherStatus;
  private statusCheckInterval: NodeJS.Timeout | null = null;

  constructor(config: LauncherConfig) {
    this.config = config;
    this.status = {
      status: 'initializing',
      uptime_seconds: 0,
      production_system_status: null,
      last_health_check: new Date()
    };
    
    console.log(`🚀 Main Launcher initialized for ${config.environment} environment`);
  }

  async launch(): Promise<void> {
    console.log('🎯 Starting autonomous agent ecosystem launch sequence...');
    
    try {
      this.status.status = 'starting';
      this.status.start_time = new Date();
      
      // Phase 1: Initialize Runtime
      console.log('📋 Phase 1: Initializing agent runtime...');
      await this.initializeRuntime();
      
      // Phase 2: Create Production System
      console.log('🏗️ Phase 2: Creating production system...');
      await this.createProductionSystem();
      
      // Phase 3: Initialize Production System
      console.log('⚡ Phase 3: Initializing production system...');
      await this.productionSystem!.initialize();
      
      // Phase 4: Start Monitoring
      console.log('📊 Phase 4: Starting system monitoring...');
      await this.startSystemMonitoring();
      
      // Phase 5: Verify System Health
      console.log('🏥 Phase 5: Verifying system health...');
      await this.verifySystemHealth();
      
      this.status.status = 'running';
      
      console.log('✅ Autonomous agent ecosystem successfully launched!');
      console.log(`🌟 Environment: ${this.config.environment}`);
      console.log(`🤖 Agents: Infrastructure, Trading, DeFi, Dev Swarm`);
      console.log(`🔧 Features: ${this.getEnabledFeatures().join(', ')}`);
      console.log(`🎭 Orchestration: Advanced multi-agent coordination`);
      
      // Setup graceful shutdown handlers
      this.setupShutdownHandlers();
      
    } catch (error) {
      this.status.status = 'error';
      this.status.error_message = error instanceof Error ? error.message : String(error);
      console.error('❌ Failed to launch autonomous agent ecosystem:', error);
      throw error;
    }
  }

  async shutdown(): Promise<void> {
    console.log('🛑 Initiating graceful shutdown of autonomous agent ecosystem...');
    
    try {
      this.status.status = 'stopping';
      
      // Stop monitoring
      if (this.statusCheckInterval) {
        clearInterval(this.statusCheckInterval);
        this.statusCheckInterval = null;
      }
      
      // Shutdown production system
      if (this.productionSystem) {
        console.log('🏗️ Shutting down production system...');
        await this.productionSystem.shutdown();
        this.productionSystem = null;
      }
      
      // Cleanup runtime
      if (this.runtime) {
        console.log('🔧 Cleaning up runtime...');
        // Runtime cleanup would go here
        this.runtime = null;
      }
      
      this.status.status = 'stopped';
      console.log('✅ Autonomous agent ecosystem shutdown complete');
      
    } catch (error) {
      console.error('❌ Error during shutdown:', error);
      throw error;
    }
  }

  getStatus(): LauncherStatus {
    if (this.status.start_time) {
      this.status.uptime_seconds = Math.floor((Date.now() - this.status.start_time.getTime()) / 1000);
    }
    
    if (this.productionSystem) {
      this.status.production_system_status = this.productionSystem.getSystemStatus();
    }
    
    return { ...this.status };
  }

  async executeAgentTask(agentId: string, task: any): Promise<any> {
    if (!this.productionSystem) {
      throw new Error('Production system not initialized');
    }
    
    if (this.status.status !== 'running') {
      throw new Error(`System not ready. Current status: ${this.status.status}`);
    }
    
    return await this.productionSystem.executeTask(agentId, task);
  }

  private async initializeRuntime(): Promise<void> {
    console.log('🔧 Initializing agent runtime...');
    
    // Create mock runtime for now - in real implementation would initialize proper runtime
    this.runtime = {
      agentId: this.config.runtime_config.agent_id,
      serverUrl: this.config.runtime_config.server_url,
      databaseAdapter: {} as any, // Mock database adapter
      token: this.config.runtime_config.api_keys.openai || '',
      character: {
        name: 'Autonomous Agent System',
        modelProvider: this.config.runtime_config.model_config.primary_model as any,
        settings: {
          temperature: this.config.runtime_config.model_config.temperature,
          maxTokens: this.config.runtime_config.model_config.max_tokens
        }
      } as any,
      modelProvider: this.config.runtime_config.model_config.primary_model as any,
      cacheManager: {} as any, // Mock cache manager
      providers: [],
      actions: [],
      evaluators: [],
      plugins: []
    } as any;
    
    console.log('✅ Agent runtime initialized');
  }

  private async createProductionSystem(): Promise<void> {
    console.log('🏗️ Creating production system...');
    
    if (!this.runtime) {
      throw new Error('Runtime not initialized');
    }
    
    // Create production system based on environment
    switch (this.config.environment) {
      case 'development':
        this.productionSystem = ProductionSystemFactory.createDevelopmentSystem(this.runtime);
        break;
      case 'staging':
        this.productionSystem = ProductionSystemFactory.createStagingSystem(this.runtime);
        break;
      case 'production':
        this.productionSystem = ProductionSystemFactory.createProductionSystem(this.runtime);
        break;
      default:
        throw new Error(`Unknown environment: ${this.config.environment}`);
    }
    
    console.log(`✅ Production system created for ${this.config.environment} environment`);
  }

  private async startSystemMonitoring(): Promise<void> {
    console.log('📊 Starting system monitoring...');
    
    // Start status checking (every 30 seconds)
    this.statusCheckInterval = setInterval(() => {
      this.updateSystemStatus();
    }, 30000);
    
    // Initial status update
    await this.updateSystemStatus();
    
    console.log('✅ System monitoring started');
  }

  private async updateSystemStatus(): Promise<void> {
    try {
      this.status.last_health_check = new Date();
      
      if (this.productionSystem) {
        const systemHealth = this.productionSystem.getSystemStatus();
        this.status.production_system_status = systemHealth;
        
        // Log system status periodically
        if (systemHealth.overall_status !== 'healthy') {
          console.warn(`⚠️ System status: ${systemHealth.overall_status}`);
          if (systemHealth.alerts.length > 0) {
            console.warn(`🚨 Active alerts: ${systemHealth.alerts.length}`);
          }
        }
      }
      
    } catch (error) {
      console.error('❌ Failed to update system status:', error);
    }
  }

  private async verifySystemHealth(): Promise<void> {
    console.log('🏥 Verifying system health...');
    
    if (!this.productionSystem) {
      throw new Error('Production system not available for health check');
    }
    
    const systemHealth = this.productionSystem.getSystemStatus();
    
    if (systemHealth.overall_status === 'critical') {
      throw new Error('System health check failed - critical status detected');
    }
    
    if (systemHealth.overall_status === 'degraded') {
      console.warn('⚠️ System is running in degraded mode');
    }
    
    console.log(`✅ System health verified: ${systemHealth.overall_status}`);
  }

  private getEnabledFeatures(): string[] {
    const features: string[] = [];
    
    if (this.config.startup_options.enable_monitoring) features.push('Monitoring');
    if (this.config.startup_options.enable_learning) features.push('Learning');
    if (this.config.startup_options.enable_trading) features.push('Trading');
    if (this.config.startup_options.enable_defi) features.push('DeFi');
    if (this.config.startup_options.enable_development) features.push('Development');
    if (this.config.feature_flags.rl_training) features.push('RL Training');
    if (this.config.feature_flags.smart_contracts) features.push('Smart Contracts');
    if (this.config.feature_flags.social_media_walls) features.push('Social Media');
    if (this.config.feature_flags.advanced_orchestration) features.push('Orchestration');
    
    return features;
  }

  private setupShutdownHandlers(): void {
    // Handle SIGINT (Ctrl+C)
    process.on('SIGINT', async () => {
      console.log('\n🛑 Received SIGINT - initiating graceful shutdown...');
      try {
        await this.shutdown();
        process.exit(0);
      } catch (error) {
        console.error('❌ Error during graceful shutdown:', error);
        process.exit(1);
      }
    });

    // Handle SIGTERM
    process.on('SIGTERM', async () => {
      console.log('\n🛑 Received SIGTERM - initiating graceful shutdown...');
      try {
        await this.shutdown();
        process.exit(0);
      } catch (error) {
        console.error('❌ Error during graceful shutdown:', error);
        process.exit(1);
      }
    });

    // Handle uncaught exceptions
    process.on('uncaughtException', async (error) => {
      console.error('❌ Uncaught exception:', error);
      try {
        await this.shutdown();
      } catch (shutdownError) {
        console.error('❌ Error during emergency shutdown:', shutdownError);
      }
      process.exit(1);
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', async (reason, promise) => {
      console.error('❌ Unhandled promise rejection at:', promise, 'reason:', reason);
      try {
        await this.shutdown();
      } catch (shutdownError) {
        console.error('❌ Error during emergency shutdown:', shutdownError);
      }
      process.exit(1);
    });
  }
}

/**
 * Configuration Factory for different environments
 */
export class LauncherConfigFactory {
  static createDevelopmentConfig(): LauncherConfig {
    return {
      environment: 'development',
      runtime_config: {
        agent_id: 'dev-main-agent',
        server_url: 'http://localhost:3000',
        database_url: 'file:./dev-database.db',
        cache_url: 'redis://localhost:6379',
        api_keys: {
          openai: process.env.OPENAI_API_KEY || '',
          anthropic: process.env.ANTHROPIC_API_KEY || '',
          deepseek: process.env.DEEPSEEK_API_KEY || ''
        },
        model_config: {
          primary_model: 'gpt-4',
          fallback_model: 'gpt-3.5-turbo',
          temperature: 0.7,
          max_tokens: 4096,
          embedding_model: 'text-embedding-ada-002'
        }
      },
      startup_options: {
        auto_start_agents: true,
        enable_monitoring: true,
        enable_learning: true,
        enable_trading: false, // Disabled in dev for safety
        enable_defi: false, // Disabled in dev for safety
        enable_development: true,
        log_level: 'debug'
      },
      feature_flags: {
        experimental_features: true,
        rl_training: true,
        smart_contracts: false,
        social_media_walls: true,
        advanced_orchestration: true
      }
    };
  }

  static createStagingConfig(): LauncherConfig {
    return {
      environment: 'staging',
      runtime_config: {
        agent_id: 'staging-main-agent',
        server_url: 'https://staging-api.example.com',
        database_url: process.env.STAGING_DATABASE_URL || '',
        cache_url: process.env.STAGING_REDIS_URL || '',
        api_keys: {
          openai: process.env.OPENAI_API_KEY || '',
          anthropic: process.env.ANTHROPIC_API_KEY || '',
          deepseek: process.env.DEEPSEEK_API_KEY || ''
        },
        model_config: {
          primary_model: 'gpt-4',
          fallback_model: 'gpt-3.5-turbo',
          temperature: 0.6,
          max_tokens: 4096,
          embedding_model: 'text-embedding-ada-002'
        }
      },
      startup_options: {
        auto_start_agents: true,
        enable_monitoring: true,
        enable_learning: true,
        enable_trading: true, // Enable with caution
        enable_defi: true, // Enable with caution
        enable_development: true,
        log_level: 'info'
      },
      feature_flags: {
        experimental_features: false,
        rl_training: true,
        smart_contracts: true,
        social_media_walls: true,
        advanced_orchestration: true
      }
    };
  }

  static createProductionConfig(): LauncherConfig {
    return {
      environment: 'production',
      runtime_config: {
        agent_id: 'prod-main-agent',
        server_url: 'https://api.example.com',
        database_url: process.env.PRODUCTION_DATABASE_URL || '',
        cache_url: process.env.PRODUCTION_REDIS_URL || '',
        api_keys: {
          openai: process.env.OPENAI_API_KEY || '',
          anthropic: process.env.ANTHROPIC_API_KEY || '',
          deepseek: process.env.DEEPSEEK_API_KEY || ''
        },
        model_config: {
          primary_model: 'gpt-4',
          fallback_model: 'gpt-3.5-turbo',
          temperature: 0.5,
          max_tokens: 4096,
          embedding_model: 'text-embedding-ada-002'
        }
      },
      startup_options: {
        auto_start_agents: true,
        enable_monitoring: true,
        enable_learning: true,
        enable_trading: true,
        enable_defi: true,
        enable_development: false, // Disabled in production
        log_level: 'warn'
      },
      feature_flags: {
        experimental_features: false,
        rl_training: false, // Disabled in production for stability
        smart_contracts: true,
        social_media_walls: true,
        advanced_orchestration: true
      }
    };
  }
} 