import type { UUID, IAgentRuntime } from '../types';
import MemorySpine from '../memory/MemorySpine';
import PluginMesh from '../plugins/PluginMesh';

export interface ContractDeployment {
    id: string;
    name: string;
    version: string;
    contractAddress: string;
    deployer: string;
    chainId: number;
    deploymentTx: string;
    timestamp: number;
    status: 'pending' | 'deployed' | 'verified' | 'paused' | 'upgraded';
    bytecode: string;
    abi: any[];
    metadata: {
        purpose: string;
        criticality: 'low' | 'medium' | 'high' | 'critical';
        dependencies: string[];
        permissions: string[];
        upgradeability: 'immutable' | 'upgradeable' | 'proxy';
    };
}

export interface GovernanceProposal {
    id: string;
    type: 'upgrade' | 'parameter_change' | 'emergency_pause' | 'new_deployment' | 'permission_grant';
    title: string;
    description: string;
    proposer: string;
    target: string; // Contract address
    calldata: string;
    value: number;
    timestamp: number;
    status: 'pending' | 'active' | 'succeeded' | 'defeated' | 'executed' | 'cancelled';
    voting: {
        forVotes: number;
        againstVotes: number;
        abstainVotes: number;
        quorum: number;
        threshold: number;
        endTime: number;
    };
    execution: {
        executed: boolean;
        executionTx?: string;
        executionTime?: number;
    };
}

export interface UpgradeRequest {
    contractAddress: string;
    currentVersion: string;
    targetVersion: string;
    urgency: 'low' | 'medium' | 'high' | 'emergency';
    reason: string;
    newImplementation: string;
    migrationData?: any;
    riskAssessment: {
        level: 'low' | 'medium' | 'high';
        factors: string[];
        mitigations: string[];
    };
}

export interface SecurityAudit {
    contractAddress: string;
    version: string;
    auditor: string;
    timestamp: number;
    status: 'pending' | 'in_progress' | 'completed' | 'failed';
    findings: Array<{
        severity: 'info' | 'low' | 'medium' | 'high' | 'critical';
        category: string;
        title: string;
        description: string;
        recommendation: string;
        fixed: boolean;
    }>;
    score: number; // 0-100
    recommendation: 'approve' | 'conditional' | 'reject';
}

export interface ContractRegistry {
    contracts: Map<string, ContractDeployment>;
    proposals: Map<string, GovernanceProposal>;
    audits: Map<string, SecurityAudit>;
    permissions: Map<string, string[]>; // address -> permissions
}

/**
 * Smart Contract Ceiling - Autonomous Contract Management
 * 
 * 💡 WHY: Provides autonomous deployment, upgrading, and governance of smart
 * contracts with built-in security, risk management, and decision-making.
 * 
 * ⚙️ HOW: Implements contract lifecycle management, automated audits,
 * multi-sig governance, and emergency controls with agent coordination.
 */
export class SmartContractCeiling {
    private runtime: IAgentRuntime;
    private memory: MemorySpine;
    private plugins: PluginMesh;
    
    private readonly registry: ContractRegistry = {
        contracts: new Map(),
        proposals: new Map(),
        audits: new Map(),
        permissions: new Map()
    };
    
    private readonly governanceConfig = {
        quorumThreshold: 0.4, // 40% participation required
        approvalThreshold: 0.6, // 60% approval required
        votingPeriod: 7 * 24 * 60 * 60 * 1000, // 7 days
        timelockDelay: 2 * 24 * 60 * 60 * 1000, // 2 days
        emergencyPauseThreshold: 0.3 // 30% can trigger emergency pause
    };
    
    private readonly securityConfig = {
        mandatoryAuditFor: ['critical', 'high'],
        maxGasLimit: 8000000,
        maxValueTransfer: '1000000000000000000000', // 1000 ETH
        requiredConfirmations: 12,
        timeoutPeriod: 24 * 60 * 60 * 1000 // 24 hours
    };

    constructor(
        runtime: IAgentRuntime,
        memory: MemorySpine,
        plugins: PluginMesh
    ) {
        this.runtime = runtime;
        this.memory = memory;
        this.plugins = plugins;
        
        this.initializePermissions();
    }

    /**
     * Deploy new smart contract with autonomous validation
     */
    async deployContract(
        name: string,
        bytecode: string,
        abi: any[],
        constructorArgs: any[],
        metadata: ContractDeployment['metadata']
    ): Promise<ContractDeployment> {
        console.log(`Deploying contract: ${name}`);

        try {
            // Step 1: Pre-deployment validation
            await this.validateDeployment(name, bytecode, abi, metadata);
            
            // Step 2: Security analysis
            const securityAnalysis = await this.performSecurityAnalysis(bytecode, abi);
            
            // Step 3: Risk assessment
            const riskLevel = this.assessDeploymentRisk(metadata, securityAnalysis);
            
            // Step 4: Governance check (if high risk)
            if (riskLevel === 'high' || metadata.criticality === 'critical') {
                const proposalId = await this.createGovernanceProposal(
                    'new_deployment',
                    `Deploy ${name}`,
                    `Deploy new contract: ${name} with criticality: ${metadata.criticality}`,
                    '0x0000000000000000000000000000000000000000', // No target for new deployment
                    bytecode,
                    0
                );
                
                // Return pending deployment
                const deployment: ContractDeployment = {
                    id: `pending_${Date.now()}`,
                    name,
                    version: '1.0.0',
                    contractAddress: '',
                    deployer: this.runtime.agentId,
                    chainId: 1, // Default to mainnet
                    deploymentTx: '',
                    timestamp: Date.now(),
                    status: 'pending',
                    bytecode,
                    abi,
                    metadata
                };
                
                this.registry.contracts.set(deployment.id, deployment);
                await this.storeInMemory('deployment', deployment);
                
                console.log(`High-risk deployment requires governance approval: ${proposalId}`);
                return deployment;
            }
            
            // Step 5: Direct deployment for low-medium risk
            const deploymentResult = await this.executeDeployment(
                bytecode,
                abi,
                constructorArgs,
                metadata
            );
            
            // Step 6: Create deployment record
            const deployment: ContractDeployment = {
                id: deploymentResult.contractAddress,
                name,
                version: '1.0.0',
                contractAddress: deploymentResult.contractAddress,
                deployer: this.runtime.agentId,
                chainId: deploymentResult.chainId,
                deploymentTx: deploymentResult.transactionHash,
                timestamp: Date.now(),
                status: 'deployed',
                bytecode,
                abi,
                metadata
            };
            
            // Step 7: Register deployment
            this.registry.contracts.set(deployment.contractAddress, deployment);
            await this.storeInMemory('deployment', deployment);
            
            // Step 8: Schedule post-deployment verification
            await this.scheduleVerification(deployment);
            
            console.log(`Contract deployed successfully: ${deployment.contractAddress}`);
            return deployment;

        } catch (error) {
            console.error('Contract deployment failed:', error);
            throw error;
        }
    }

    /**
     * Propose contract upgrade through governance
     */
    async proposeUpgrade(request: UpgradeRequest): Promise<string> {
        console.log(`Proposing upgrade for contract: ${request.contractAddress}`);

        try {
            const contract = this.registry.contracts.get(request.contractAddress);
            if (!contract) {
                throw new Error('Contract not found in registry');
            }

            // Validate upgrade
            await this.validateUpgrade(request);
            
            // Assess upgrade risk
            const riskAssessment = await this.assessUpgradeRisk(request);
            
            // Create governance proposal
            const proposalId = await this.createGovernanceProposal(
                'upgrade',
                `Upgrade ${contract.name} to ${request.targetVersion}`,
                `Upgrade contract from ${request.currentVersion} to ${request.targetVersion}. Reason: ${request.reason}`,
                request.contractAddress,
                this.encodeUpgradeCall(request),
                0
            );
            
            // Store upgrade request
            await this.storeInMemory('upgrade_request', { 
                proposalId, 
                request,
                riskAssessment 
            });
            
            console.log(`Upgrade proposal created: ${proposalId}`);
            return proposalId;

        } catch (error) {
            console.error('Upgrade proposal failed:', error);
            throw error;
        }
    }

    /**
     * Emergency pause contract if security issue detected
     */
    async emergencyPause(
        contractAddress: string,
        reason: string,
        evidence: any
    ): Promise<string> {
        console.log(`Emergency pause requested for: ${contractAddress}`);

        try {
            const contract = this.registry.contracts.get(contractAddress);
            if (!contract) {
                throw new Error('Contract not found');
            }

            // Validate emergency conditions
            const isValidEmergency = await this.validateEmergencyConditions(
                contractAddress,
                reason,
                evidence
            );

            if (!isValidEmergency) {
                throw new Error('Emergency conditions not met');
            }

            // Execute emergency pause
            const pauseResult = await this.executePauseContract(contractAddress);
            
            // Update contract status
            contract.status = 'paused';
            this.registry.contracts.set(contractAddress, contract);
            
            // Create emergency proposal for review
            const proposalId = await this.createGovernanceProposal(
                'emergency_pause',
                `Emergency Pause: ${contract.name}`,
                `Emergency pause executed. Reason: ${reason}`,
                contractAddress,
                '0x',
                0
            );
            
            // Log emergency action
            await this.storeInMemory('emergency_action', {
                proposalId,
                contractAddress,
                reason,
                evidence,
                timestamp: Date.now(),
                executor: this.runtime.agentId
            });
            
            console.log(`Emergency pause executed: ${pauseResult.transactionHash}`);
            return pauseResult.transactionHash;

        } catch (error) {
            console.error('Emergency pause failed:', error);
            throw error;
        }
    }

    /**
     * Execute governance proposal after approval
     */
    async executeProposal(proposalId: string): Promise<string> {
        console.log(`Executing governance proposal: ${proposalId}`);

        try {
            const proposal = this.registry.proposals.get(proposalId);
            if (!proposal) {
                throw new Error('Proposal not found');
            }

            // Validate execution conditions
            await this.validateProposalExecution(proposal);
            
            // Execute based on proposal type
            let executionResult: any;
            
            switch (proposal.type) {
                case 'upgrade':
                    executionResult = await this.executeContractUpgrade(proposal);
                    break;
                case 'parameter_change':
                    executionResult = await this.executeParameterChange(proposal);
                    break;
                case 'new_deployment':
                    executionResult = await this.executeGovernanceDeployment(proposal);
                    break;
                case 'permission_grant':
                    executionResult = await this.executePermissionGrant(proposal);
                    break;
                default:
                    throw new Error(`Unsupported proposal type: ${proposal.type}`);
            }
            
            // Update proposal status
            proposal.status = 'executed';
            proposal.execution = {
                executed: true,
                executionTx: executionResult.transactionHash,
                executionTime: Date.now()
            };
            
            this.registry.proposals.set(proposalId, proposal);
            await this.storeInMemory('proposal_execution', proposal);
            
            console.log(`Proposal executed successfully: ${executionResult.transactionHash}`);
            return executionResult.transactionHash;

        } catch (error) {
            console.error('Proposal execution failed:', error);
            throw error;
        }
    }

    /**
     * Monitor contract health and trigger automated responses
     */
    async monitorContracts(): Promise<void> {
        console.log('Monitoring contract health...');

        try {
            for (const [address, contract] of this.registry.contracts) {
                if (contract.status !== 'deployed') continue;

                // Check contract health
                const healthStatus = await this.checkContractHealth(address);
                
                // Analyze for anomalies
                const anomalies = await this.detectAnomalies(address, healthStatus);
                
                // Take automated actions if needed
                if (anomalies.length > 0) {
                    await this.handleContractAnomalies(address, anomalies);
                }
                
                // Update monitoring metrics
                await this.updateMonitoringMetrics(address, healthStatus);
            }

        } catch (error) {
            console.error('Contract monitoring failed:', error);
        }
    }

    /**
     * Generate security audit for contract
     */
    async auditContract(contractAddress: string): Promise<SecurityAudit> {
        console.log(`Auditing contract: ${contractAddress}`);

        try {
            const contract = this.registry.contracts.get(contractAddress);
            if (!contract) {
                throw new Error('Contract not found');
            }

            // Initialize audit
            const audit: SecurityAudit = {
                contractAddress,
                version: contract.version,
                auditor: this.runtime.agentId,
                timestamp: Date.now(),
                status: 'in_progress',
                findings: [],
                score: 0,
                recommendation: 'approve'
            };

            // Perform static analysis
            const staticFindings = await this.performStaticAnalysis(contract.bytecode, contract.abi);
            audit.findings.push(...staticFindings);
            
            // Perform dynamic analysis
            const dynamicFindings = await this.performDynamicAnalysis(contractAddress);
            audit.findings.push(...dynamicFindings);
            
            // Analyze dependencies
            const dependencyFindings = await this.analyzeDependencies(contract);
            audit.findings.push(...dependencyFindings);
            
            // Calculate audit score
            audit.score = this.calculateAuditScore(audit.findings);
            audit.recommendation = this.determineAuditRecommendation(audit.score, audit.findings);
            audit.status = 'completed';
            
            // Store audit results
            this.registry.audits.set(`${contractAddress}_${audit.timestamp}`, audit);
            await this.storeInMemory('audit', audit);
            
            console.log(`Audit completed with score: ${audit.score}`);
            return audit;

        } catch (error) {
            console.error('Contract audit failed:', error);
            throw error;
        }
    }

    // Private implementation methods

    private async validateDeployment(
        name: string,
        bytecode: string,
        abi: any[],
        metadata: ContractDeployment['metadata']
    ): Promise<void> {
        // Validate bytecode
        if (!bytecode || bytecode.length < 10) {
            throw new Error('Invalid bytecode');
        }

        // Validate ABI
        if (!Array.isArray(abi)) {
            throw new Error('Invalid ABI format');
        }

        // Check for existing contract with same name
        for (const contract of this.registry.contracts.values()) {
            if (contract.name === name && contract.status === 'deployed') {
                throw new Error(`Contract with name ${name} already exists`);
            }
        }

        // Validate metadata
        if (!metadata.purpose || !metadata.criticality) {
            throw new Error('Incomplete metadata');
        }
    }

    private async performSecurityAnalysis(bytecode: string, abi: any[]): Promise<any> {
        // Simulate security analysis
        const findings = [];
        
        // Check for common vulnerabilities
        if (bytecode.includes('call')) {
            findings.push({ type: 'external_call', risk: 'medium' });
        }
        
        if (bytecode.includes('delegatecall')) {
            findings.push({ type: 'delegate_call', risk: 'high' });
        }

        return { findings, score: Math.max(100 - findings.length * 10, 0) };
    }

    private assessDeploymentRisk(
        metadata: ContractDeployment['metadata'],
        securityAnalysis: any
    ): 'low' | 'medium' | 'high' {
        let riskScore = 0;
        
        if (metadata.criticality === 'critical') riskScore += 3;
        else if (metadata.criticality === 'high') riskScore += 2;
        else if (metadata.criticality === 'medium') riskScore += 1;
        
        if (securityAnalysis.score < 80) riskScore += 2;
        else if (securityAnalysis.score < 90) riskScore += 1;
        
        if (metadata.upgradeability === 'immutable') riskScore += 1;
        
        if (riskScore >= 4) return 'high';
        if (riskScore >= 2) return 'medium';
        return 'low';
    }

    private async createGovernanceProposal(
        type: GovernanceProposal['type'],
        title: string,
        description: string,
        target: string,
        calldata: string,
        value: number
    ): Promise<string> {
        const proposalId = `prop_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        const proposal: GovernanceProposal = {
            id: proposalId,
            type,
            title,
            description,
            proposer: this.runtime.agentId,
            target,
            calldata,
            value,
            timestamp: Date.now(),
            status: 'active',
            voting: {
                forVotes: 0,
                againstVotes: 0,
                abstainVotes: 0,
                quorum: this.governanceConfig.quorumThreshold,
                threshold: this.governanceConfig.approvalThreshold,
                endTime: Date.now() + this.governanceConfig.votingPeriod
            },
            execution: {
                executed: false
            }
        };
        
        this.registry.proposals.set(proposalId, proposal);
        await this.storeInMemory('proposal', proposal);
        
        return proposalId;
    }

    private async executeDeployment(
        bytecode: string,
        abi: any[],
        constructorArgs: any[],
        metadata: ContractDeployment['metadata']
    ): Promise<any> {
        // Simulate contract deployment via EVM plugin
        const deployResult = await this.plugins.call('plugin-evm', 'deployContract', [
            {
                bytecode,
                abi,
                constructorArgs,
                gasLimit: this.securityConfig.maxGasLimit
            }
        ]);

        if (!deployResult.success) {
            throw new Error(`Deployment failed: ${deployResult.error}`);
        }

        return deployResult.data;
    }

    private async validateUpgrade(request: UpgradeRequest): Promise<void> {
        const contract = this.registry.contracts.get(request.contractAddress);
        if (!contract) {
            throw new Error('Contract not found');
        }

        if (contract.metadata.upgradeability === 'immutable') {
            throw new Error('Contract is not upgradeable');
        }

        // Validate version progression
        if (request.currentVersion !== contract.version) {
            throw new Error('Version mismatch');
        }
    }

    private async assessUpgradeRisk(request: UpgradeRequest): Promise<any> {
        let riskLevel = 'low';
        const factors = [];
        const mitigations = [];

        if (request.urgency === 'emergency') {
            riskLevel = 'high';
            factors.push('Emergency upgrade');
            mitigations.push('Emergency pause capability');
        }

        if (!request.migrationData) {
            factors.push('No migration data provided');
            mitigations.push('State validation checks');
        }

        return { level: riskLevel, factors, mitigations };
    }

    private encodeUpgradeCall(request: UpgradeRequest): string {
        // Simulate encoding upgrade function call
        return `0x${Buffer.from(JSON.stringify(request)).toString('hex')}`;
    }

    private async validateEmergencyConditions(
        contractAddress: string,
        reason: string,
        evidence: any
    ): Promise<boolean> {
        // Check if emergency pause is justified
        const urgentReasons = [
            'security_vulnerability',
            'exploit_detected',
            'oracle_manipulation',
            'reentrancy_attack'
        ];

        return urgentReasons.some(urgentReason => 
            reason.toLowerCase().includes(urgentReason)
        );
    }

    private async executePauseContract(contractAddress: string): Promise<any> {
        // Execute pause via EVM plugin
        const pauseResult = await this.plugins.call('plugin-evm', 'pauseContract', [
            {
                contractAddress,
                gasLimit: 100000
            }
        ]);

        if (!pauseResult.success) {
            throw new Error(`Pause failed: ${pauseResult.error}`);
        }

        return pauseResult.data;
    }

    private async validateProposalExecution(proposal: GovernanceProposal): Promise<void> {
        if (proposal.status !== 'succeeded') {
            throw new Error('Proposal not approved for execution');
        }

        if (proposal.voting.endTime > Date.now()) {
            throw new Error('Voting period not ended');
        }

        // Check timelock delay
        const timelockEnd = proposal.voting.endTime + this.governanceConfig.timelockDelay;
        if (Date.now() < timelockEnd) {
            throw new Error('Timelock delay not met');
        }
    }

    private async executeContractUpgrade(proposal: GovernanceProposal): Promise<any> {
        // Execute upgrade via EVM plugin
        return await this.plugins.call('plugin-evm', 'upgradeContract', [
            {
                target: proposal.target,
                calldata: proposal.calldata,
                value: proposal.value
            }
        ]);
    }

    private async executeParameterChange(proposal: GovernanceProposal): Promise<any> {
        // Execute parameter change
        return await this.plugins.call('plugin-evm', 'executeCall', [
            {
                target: proposal.target,
                calldata: proposal.calldata,
                value: proposal.value
            }
        ]);
    }

    private async executeGovernanceDeployment(proposal: GovernanceProposal): Promise<any> {
        // Execute governance-approved deployment
        const deployData = JSON.parse(Buffer.from(proposal.calldata.slice(2), 'hex').toString());
        return await this.executeDeployment(
            deployData.bytecode,
            deployData.abi,
            deployData.constructorArgs || [],
            deployData.metadata
        );
    }

    private async executePermissionGrant(proposal: GovernanceProposal): Promise<any> {
        // Grant permissions
        const permissionData = JSON.parse(Buffer.from(proposal.calldata.slice(2), 'hex').toString());
        this.registry.permissions.set(permissionData.address, permissionData.permissions);
        
        return { success: true, transactionHash: `perm_${Date.now()}` };
    }

    private async checkContractHealth(address: string): Promise<any> {
        // Check contract health metrics
        const healthResult = await this.plugins.call('plugin-evm', 'getContractHealth', [
            {
                contractAddress: address
            }
        ]);

        return healthResult.data || {
            gasUsage: Math.random() * 1000000,
            transactionCount: Math.floor(Math.random() * 100),
            errorRate: Math.random() * 0.1,
            lastActivity: Date.now() - Math.random() * 3600000
        };
    }

    private async detectAnomalies(address: string, healthStatus: any): Promise<any[]> {
        const anomalies = [];

        if (healthStatus.errorRate > 0.05) {
            anomalies.push({
                type: 'high_error_rate',
                severity: 'medium',
                value: healthStatus.errorRate
            });
        }

        if (healthStatus.gasUsage > this.securityConfig.maxGasLimit * 0.8) {
            anomalies.push({
                type: 'high_gas_usage',
                severity: 'low',
                value: healthStatus.gasUsage
            });
        }

        return anomalies;
    }

    private async handleContractAnomalies(address: string, anomalies: any[]): Promise<void> {
        for (const anomaly of anomalies) {
            if (anomaly.severity === 'high') {
                // Consider emergency pause
                await this.emergencyPause(
                    address,
                    `Anomaly detected: ${anomaly.type}`,
                    anomaly
                );
            } else {
                // Log and monitor
                await this.storeInMemory('anomaly', {
                    contractAddress: address,
                    anomaly,
                    timestamp: Date.now()
                });
            }
        }
    }

    private async updateMonitoringMetrics(address: string, healthStatus: any): Promise<void> {
        await this.storeInMemory('health_metrics', {
            contractAddress: address,
            metrics: healthStatus,
            timestamp: Date.now()
        });
    }

    private async performStaticAnalysis(bytecode: string, abi: any[]): Promise<any[]> {
        // Simulate static analysis findings
        const findings = [];
        
        if (bytecode.includes('selfdestruct')) {
            findings.push({
                severity: 'high',
                category: 'dangerous_function',
                title: 'Self-destruct capability',
                description: 'Contract can self-destruct',
                recommendation: 'Remove or restrict self-destruct',
                fixed: false
            });
        }

        return findings;
    }

    private async performDynamicAnalysis(contractAddress: string): Promise<any[]> {
        // Simulate dynamic analysis
        return [];
    }

    private async analyzeDependencies(contract: ContractDeployment): Promise<any[]> {
        // Analyze contract dependencies
        const findings = [];
        
        for (const dep of contract.metadata.dependencies) {
            if (!this.registry.contracts.has(dep)) {
                findings.push({
                    severity: 'medium',
                    category: 'dependency',
                    title: 'Missing dependency',
                    description: `Dependency not found: ${dep}`,
                    recommendation: 'Ensure dependency is deployed',
                    fixed: false
                });
            }
        }

        return findings;
    }

    private calculateAuditScore(findings: any[]): number {
        let score = 100;
        
        for (const finding of findings) {
            switch (finding.severity) {
                case 'critical': score -= 25; break;
                case 'high': score -= 15; break;
                case 'medium': score -= 10; break;
                case 'low': score -= 5; break;
                case 'info': score -= 1; break;
            }
        }

        return Math.max(score, 0);
    }

    private determineAuditRecommendation(
        score: number,
        findings: any[]
    ): 'approve' | 'conditional' | 'reject' {
        const criticalFindings = findings.filter(f => f.severity === 'critical').length;
        const highFindings = findings.filter(f => f.severity === 'high').length;

        if (criticalFindings > 0) return 'reject';
        if (score < 70 || highFindings > 2) return 'conditional';
        return 'approve';
    }

    private async scheduleVerification(deployment: ContractDeployment): Promise<void> {
        // Schedule contract verification
        setTimeout(async () => {
            try {
                const verifyResult = await this.plugins.call('plugin-evm', 'verifyContract', [
                    {
                        contractAddress: deployment.contractAddress,
                        sourcecode: deployment.bytecode,
                        abi: deployment.abi
                    }
                ]);

                if (verifyResult.success) {
                    deployment.status = 'verified';
                    this.registry.contracts.set(deployment.contractAddress, deployment);
                    await this.storeInMemory('verification', deployment);
                }
            } catch (error) {
                console.error('Contract verification failed:', error);
            }
        }, 5000); // 5 second delay
    }

    private async storeInMemory(type: string, data: any): Promise<void> {
        await this.memory.write({
            type: 'store',
            roomId: this.runtime.agentId,
            agentId: this.runtime.agentId,
            content: { type, data },
            timestamp: Date.now(),
            metadata: { 
                component: 'smart_contract_ceiling',
                action: type 
            }
        });
    }

    private initializePermissions(): void {
        // Initialize default permissions
        this.registry.permissions.set(this.runtime.agentId, [
            'deploy_contracts',
            'propose_upgrades',
            'emergency_pause',
            'audit_contracts'
        ]);
    }

    // Public getters for registry access
    public getContract(address: string): ContractDeployment | undefined {
        return this.registry.contracts.get(address);
    }

    public getProposal(id: string): GovernanceProposal | undefined {
        return this.registry.proposals.get(id);
    }

    public getAudit(contractAddress: string): SecurityAudit | undefined {
        const audits = Array.from(this.registry.audits.values());
        return audits.find(audit => 
            audit.contractAddress === contractAddress && audit.status === 'completed'
        );
    }

    public getAllContracts(): ContractDeployment[] {
        return Array.from(this.registry.contracts.values());
    }

    public getActiveProposals(): GovernanceProposal[] {
        return Array.from(this.registry.proposals.values())
            .filter(proposal => proposal.status === 'active');
    }
}

export default SmartContractCeiling; 