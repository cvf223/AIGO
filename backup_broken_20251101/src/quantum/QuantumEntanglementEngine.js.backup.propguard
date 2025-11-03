/**
 * 🔗 QUANTUM ENTANGLEMENT ENGINE
 * ==============================
 * General-purpose quantum entanglement management system that creates, maintains,
 * and orchestrates entanglements across all quantum systems in the syndicate.
 * This is the core entanglement infrastructure that connects quantum states
 * across different systems, enabling non-local correlations and quantum communication.
 * 
 * Core capabilities:
 * - Bell state creation and management
 * - GHZ state for multi-party entanglement
 * - Entanglement swapping and teleportation
 * - Entanglement purification and distillation
 * - Non-local correlation discovery
 * - Cross-system entanglement orchestration
 */

import { EventEmitter } from 'events';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';

export class QuantumEntanglementEngine extends EventEmitter {
    constructor(config = {}) {
        super();
        
        console.log('🔗 Initializing Quantum Entanglement Engine...');
        
        // Configuration
        this.config = {
            // Entanglement parameters
            maxEntanglements: config.maxEntanglements || 10000,
            minEntanglementStrength: config.minEntanglementStrength || 0.5,
            targetFidelity: config.targetFidelity || 0.95,
            entanglementDecayRate: config.entanglementDecayRate || 0.001,
            
            // Bell state configuration
            bellStateTypes: config.bellStateTypes || ['Phi+', 'Phi-', 'Psi+', 'Psi-'],
            defaultBellState: config.defaultBellState || 'Phi+',
            
            // GHZ state configuration
            maxGHZParties: config.maxGHZParties || 10,
            ghzFidelityThreshold: config.ghzFidelityThreshold || 0.8,
            
            // Entanglement operations
            swappingEnabled: config.swappingEnabled !== false,
            purificationEnabled: config.purificationEnabled !== false,
            distillationEnabled: config.distillationEnabled !== false,
            teleportationEnabled: config.teleportationEnabled !== false,
            
            // Non-local correlations
            correlationThreshold: config.correlationThreshold || 0.7,
            maxCorrelationDistance: config.maxCorrelationDistance || 5,
            correlationDiscoveryRate: config.correlationDiscoveryRate || 1000, // ms
            
            // Performance settings
            parallelOperations: config.parallelOperations !== false,
            batchProcessing: config.batchProcessing !== false,
            compressionEnabled: config.compressionEnabled !== false,
            
            // Monitoring
            monitoringInterval: config.monitoringInterval || 1000,
            metricsRetention: config.metricsRetention || 1000
        };
        
        // Entanglement registry
        this.entanglements = new Map(); // ID → Entanglement
        this.systemEntanglements = new Map(); // System ID → Set of Entanglement IDs
        this.bellPairs = new Map(); // Bell Pair ID → Bell State
        this.ghzStates = new Map(); // GHZ ID → GHZ State
        
        // Non-local correlations
        this.correlations = new Map(); // Correlation ID → Correlation Data
        this.correlationMatrix = new Map(); // System ID → Map<System ID, Correlation>
        
        // Entanglement network
        this.entanglementNetwork = {
            nodes: new Map(), // Node ID → Node Data
            edges: new Map(), // Edge ID → Edge Data (entanglement)
            clusters: new Map(), // Cluster ID → Set of Node IDs
            topology: 'mesh' // Network topology type
        };
        
        // Performance metrics
        this.metrics = {
            totalEntanglements: 0,
            activeEntanglements: 0,
            bellPairsCreated: 0,
            ghzStatesCreated: 0,
            swappingOperations: 0,
            purificationOperations: 0,
            teleportations: 0,
            correlationsDiscovered: 0,
            averageFidelity: 1.0,
            networkDensity: 0
        };
        
        // Quantum state
        this.quantumState = {
            globalEntanglement: 0,
            entanglementEntropy: 0,
            mutualInformation: new Map(),
            quantumDiscord: 0,
            concurrence: new Map()
        };
        
        // Monitoring
        this.monitoringInterval = null;
        this.correlationDiscoveryInterval = null;
        this.isInitialized = false;
    }
    
    /**
     * Initialize the entanglement engine
     */
    async initialize() {
        if (this.isInitialized) return;
        
        console.log('⚛️ Initializing quantum entanglement systems...');
        
        // Initialize entanglement network
        await this.initializeEntanglementNetwork();
        
        // Start monitoring
        this.startMonitoring();
        
        // Start correlation discovery
        if (this.config.correlationDiscoveryRate > 0) {
            this.startCorrelationDiscovery();
        }
        
        this.isInitialized = true;
        console.log('✅ Quantum Entanglement Engine initialized');
        
        this.emit('initialized', {
            config: this.config,
            metrics: this.metrics
        });
    }
    
    /**
     * Create entanglement between two systems
     */
    async createEntanglement(system1Id, system2Id, options = {}) {
        // Check entanglement limit
        if (this.entanglements.size >= this.config.maxEntanglements) {
            throw new Error(`Maximum entanglement limit (${this.config.maxEntanglements}) reached`);
        }
        
        const entanglementId = options.id || uuidv4();
        const type = options.type || 'bell';
        
        // Create entanglement structure
        const entanglement = {
            id: entanglementId,
            type,
            systems: [system1Id, system2Id],
            strength: options.strength || 1.0,
            fidelity: options.fidelity || 1.0,
            bellState: null,
            createdAt: Date.now(),
            lastMeasurement: null,
            measurements: [],
            metadata: options.metadata || {},
            decayed: false
        };
        
        // Create Bell state if specified
        if (type === 'bell' || type === 'EPR') {
            entanglement.bellState = await this.createBellPair(
                system1Id, 
                system2Id,
                options.bellType || this.config.defaultBellState
            );
        }
        
        // Store entanglement
        this.entanglements.set(entanglementId, entanglement);
        
        // Update system registry
        if (!this.systemEntanglements.has(system1Id)) {
            this.systemEntanglements.set(system1Id, new Set());
        }
        if (!this.systemEntanglements.has(system2Id)) {
            this.systemEntanglements.set(system2Id, new Set());
        }
        this.systemEntanglements.get(system1Id).add(entanglementId);
        this.systemEntanglements.get(system2Id).add(entanglementId);
        
        // Add to network
        await this.addToEntanglementNetwork(entanglement);
        
        // Update metrics
        this.metrics.totalEntanglements++;
        this.metrics.activeEntanglements++;
        await this.updateQuantumState();
        
        // Emit creation event
        this.emit('entanglement_created', {
            id: entanglementId,
            systems: [system1Id, system2Id],
            type,
            strength: entanglement.strength
        });
        
        return entanglement;
    }
    
    /**
     * Create Bell pair
     */
    async createBellPair(system1Id, system2Id, bellType = 'Phi+') {
        const bellPairId = uuidv4();
        
        const bellStates = {
            'Phi+': { 
                state: '|00⟩ + |11⟩',
                coefficients: [1/Math.sqrt(2), 0, 0, 1/Math.sqrt(2)]
            },
            'Phi-': {
                state: '|00⟩ - |11⟩',
                coefficients: [1/Math.sqrt(2), 0, 0, -1/Math.sqrt(2)]
            },
            'Psi+': {
                state: '|01⟩ + |10⟩',
                coefficients: [0, 1/Math.sqrt(2), 1/Math.sqrt(2), 0]
            },
            'Psi-': {
                state: '|01⟩ - |10⟩',
                coefficients: [0, 1/Math.sqrt(2), -1/Math.sqrt(2), 0]
            }
        };
        
        const bellPair = {
            id: bellPairId,
            type: bellType,
            state: bellStates[bellType].state,
            coefficients: bellStates[bellType].coefficients,
            systems: [system1Id, system2Id],
            fidelity: 1.0,
            createdAt: Date.now()
        };
        
        this.bellPairs.set(bellPairId, bellPair);
        this.metrics.bellPairsCreated++;
        
        // Emit Bell pair creation
        this.emit('bell_pair_created', {
            id: bellPairId,
            type: bellType,
            systems: [system1Id, system2Id]
        });
        
        return bellPair;
    }
    
    /**
     * Create GHZ state for multi-party entanglement
     */
    async createGHZState(systemIds, options = {}) {
        if (systemIds.length < 3) {
            throw new Error('GHZ state requires at least 3 systems');
        }
        
        if (systemIds.length > this.config.maxGHZParties) {
            throw new Error(`GHZ state limited to ${this.config.maxGHZParties} parties`);
        }
        
        const ghzId = options.id || uuidv4();
        
        // Create GHZ state
        const ghzState = {
            id: ghzId,
            systems: systemIds,
            parties: systemIds.length,
            state: `|${'0'.repeat(systemIds.length)}⟩ + |${'1'.repeat(systemIds.length)}⟩`,
            amplitude: 1 / Math.sqrt(2),
            fidelity: options.fidelity || 1.0,
            createdAt: Date.now(),
            measurements: [],
            metadata: options.metadata || {}
        };
        
        // Store GHZ state
        this.ghzStates.set(ghzId, ghzState);
        
        // Create pairwise entanglements for the GHZ state
        for (let i = 0; i < systemIds.length - 1; i++) {
            for (let j = i + 1; j < systemIds.length; j++) {
                await this.createEntanglement(systemIds[i], systemIds[j], {
                    type: 'ghz_component',
                    metadata: { ghzId }
                });
            }
        }
        
        // Update metrics
        this.metrics.ghzStatesCreated++;
        
        // Emit GHZ creation
        this.emit('ghz_state_created', {
            id: ghzId,
            parties: systemIds.length,
            systems: systemIds
        });
        
        return ghzState;
    }
    
    /**
     * Perform entanglement swapping
     */
    async swapEntanglement(entanglement1Id, entanglement2Id) {
        if (!this.config.swappingEnabled) {
            throw new Error('Entanglement swapping is disabled');
        }
        
        const ent1 = this.entanglements.get(entanglement1Id);
        const ent2 = this.entanglements.get(entanglement2Id);
        
        if (!ent1 || !ent2) {
            throw new Error('Both entanglements must exist');
        }
        
        // Find common system
        const common = ent1.systems.find(s => ent2.systems.includes(s));
        if (!common) {
            throw new Error('Entanglements must share a common system');
        }
        
        // Get outer systems
        const outer1 = ent1.systems.find(s => s !== common);
        const outer2 = ent2.systems.find(s => s !== common);
        
        // Perform Bell measurement on common system
        const measurement = await this.performBellMeasurement(common, {
            entanglement1: entanglement1Id,
            entanglement2: entanglement2Id
        });
        
        // Create new entanglement between outer systems
        const swappedEntanglement = await this.createEntanglement(outer1, outer2, {
            type: 'swapped',
            metadata: {
                source1: entanglement1Id,
                source2: entanglement2Id,
                measurement
            }
        });
        
        // Update original entanglements
        ent1.swapped = true;
        ent2.swapped = true;
        
        // Update metrics
        this.metrics.swappingOperations++;
        
        // Emit swapping event
        this.emit('entanglement_swapped', {
            original1: entanglement1Id,
            original2: entanglement2Id,
            swapped: swappedEntanglement.id,
            systems: [outer1, outer2]
        });
        
        return swappedEntanglement;
    }
    
    /**
     * 🎯 PERFORM ENTANGLEMENT SWAPPING (API Compatibility Alias)
     * =========================================================
     * DEEP INTEGRATION: Alias for existing swapEntanglement() method
     */
    async performEntanglementSwapping(entanglement1Id, entanglement2Id) {
        console.log(`   ⚛️ Performing entanglement swapping between ${entanglement1Id} and ${entanglement2Id}`);
        
        // Use existing sophisticated swapEntanglement implementation
        const result = await this.swapEntanglement(entanglement1Id, entanglement2Id);
        
        console.log(`   ✅ Entanglement swapping complete: new entanglement ${result.id}`);
        
        return {
            ...result,
            newEntanglement: result.id,
            success: true
        };
    }
    
    /**
     * Purify entanglement
     */
    async purifyEntanglement(entanglementId, options = {}) {
        if (!this.config.purificationEnabled) {
            throw new Error('Entanglement purification is disabled');
        }
        
        const entanglement = this.entanglements.get(entanglementId);
        if (!entanglement) {
            throw new Error(`Entanglement ${entanglementId} not found`);
        }
        
        // Simulate purification protocol
        const rounds = options.rounds || 3;
        let fidelity = entanglement.fidelity;
        
        for (let round = 0; round < rounds; round++) {
            // Each round increases fidelity
            const improvement = (this.config.targetFidelity - fidelity) * 0.3;
            fidelity = Math.min(this.config.targetFidelity, fidelity + improvement);
        }
        
        // Update entanglement
        entanglement.fidelity = fidelity;
        entanglement.purified = true;
        entanglement.purificationRounds = rounds;
        
        // Update metrics
        this.metrics.purificationOperations++;
        
        // Emit purification event
        this.emit('entanglement_purified', {
            id: entanglementId,
            fidelity,
            rounds
        });
        
        return entanglement;
    }
    
    /**
     * Perform quantum teleportation
     */
    async teleport(stateId, fromSystem, toSystem, entanglementId) {
        if (!this.config.teleportationEnabled) {
            throw new Error('Quantum teleportation is disabled');
        }
        
        const entanglement = this.entanglements.get(entanglementId);
        if (!entanglement) {
            throw new Error(`Entanglement ${entanglementId} not found`);
        }
        
        // Verify systems are entangled
        if (!entanglement.systems.includes(fromSystem) || !entanglement.systems.includes(toSystem)) {
            throw new Error('Systems must be entangled for teleportation');
        }
        
        // Perform Bell measurement at source
        const measurement = await this.performBellMeasurement(fromSystem, {
            stateId,
            entanglementId
        });
        
        // Apply corrections at destination based on measurement
        const corrections = this.calculateTeleportationCorrections(measurement);
        
        // Create teleportation record
        const teleportation = {
            id: uuidv4(),
            stateId,
            from: fromSystem,
            to: toSystem,
            entanglementId,
            measurement,
            corrections,
            timestamp: Date.now(),
            fidelity: entanglement.fidelity * 0.95 // Small fidelity loss
        };
        
        // Update metrics
        this.metrics.teleportations++;
        
        // Emit teleportation event
        this.emit('quantum_teleportation', teleportation);
        
        return teleportation;
    }
    
    /**
     * Discover non-local correlations
     */
    async discoverCorrelations() {
        const correlations = [];
        
        // Check all pairs of entangled systems
        for (const [id1, entanglement1] of this.entanglements) {
            for (const [id2, entanglement2] of this.entanglements) {
                if (id1 >= id2) continue; // Avoid duplicates
                
                // Check for indirect correlations
                const correlation = await this.calculateCorrelation(entanglement1, entanglement2);
                
                if (correlation.strength > this.config.correlationThreshold) {
                    const correlationId = uuidv4();
                    const correlationData = {
                        id: correlationId,
                        entanglements: [id1, id2],
                        strength: correlation.strength,
                        type: correlation.type,
                        systems: [...new Set([...entanglement1.systems, ...entanglement2.systems])],
                        discoveredAt: Date.now()
                    };
                    
                    this.correlations.set(correlationId, correlationData);
                    correlations.push(correlationData);
                }
            }
        }
        
        // Update correlation matrix
        await this.updateCorrelationMatrix();
        
        // Update metrics
        this.metrics.correlationsDiscovered += correlations.length;
        
        // Emit discovery event
        if (correlations.length > 0) {
            this.emit('correlations_discovered', {
                count: correlations.length,
                correlations
            });
        }
        
        return correlations;
    }
    
    /**
     * Calculate correlation between entanglements
     */
    async calculateCorrelation(entanglement1, entanglement2) {
        // Check for shared systems (direct correlation)
        const sharedSystems = entanglement1.systems.filter(s => 
            entanglement2.systems.includes(s)
        );
        
        if (sharedSystems.length > 0) {
            return {
                strength: 0.9,
                type: 'direct',
                sharedSystems
            };
        }
        
        // Check for indirect correlations through network
        const path = await this.findEntanglementPath(
            entanglement1.systems[0],
            entanglement2.systems[0]
        );
        
        if (path && path.length <= this.config.maxCorrelationDistance) {
            const strength = Math.max(0, 1 - path.length * 0.1);
            return {
                strength,
                type: 'indirect',
                path
            };
        }
        
        return { strength: 0, type: 'none' };
    }
    
    /**
     * Measure entanglement
     */
    async measureEntanglement(entanglementId, options = {}) {
        const entanglement = this.entanglements.get(entanglementId);
        if (!entanglement) {
            throw new Error(`Entanglement ${entanglementId} not found`);
        }
        
        // Perform measurement
        const measurement = {
            id: uuidv4(),
            entanglementId,
            timestamp: Date.now(),
            basis: options.basis || 'computational',
            outcome: Math.random() < 0.5 ? '0' : '1', // Simplified
            fidelity: entanglement.fidelity,
            correlations: []
        };
        
        // Calculate correlations with other measurements
        if (entanglement.measurements.length > 0) {
            const lastMeasurement = entanglement.measurements[entanglement.measurements.length - 1];
            const correlation = measurement.outcome === lastMeasurement.outcome ? 1 : -1;
            measurement.correlations.push({
                withMeasurement: lastMeasurement.id,
                correlation
            });
        }
        
        // Store measurement
        entanglement.measurements.push(measurement);
        entanglement.lastMeasurement = Date.now();
        
        // Emit measurement event
        this.emit('entanglement_measured', {
            entanglementId,
            measurement
        });
        
        return measurement;
    }
    
    /**
     * Initialize entanglement network
     */
    async initializeEntanglementNetwork() {
        console.log('🌐 Initializing entanglement network...');
        
        // Set network topology
        this.entanglementNetwork.topology = 'mesh'; // Can be: mesh, star, ring, tree
        
        console.log(`   Network topology: ${this.entanglementNetwork.topology}`);
    }
    
    /**
     * Add entanglement to network
     */
    async addToEntanglementNetwork(entanglement) {
        // Add nodes if not present
        for (const systemId of entanglement.systems) {
            if (!this.entanglementNetwork.nodes.has(systemId)) {
                this.entanglementNetwork.nodes.set(systemId, {
                    id: systemId,
                    connections: new Set(),
                    entanglements: new Set()
                });
            }
            this.entanglementNetwork.nodes.get(systemId).entanglements.add(entanglement.id);
        }
        
        // Add edge
        const edgeId = `${entanglement.systems[0]}-${entanglement.systems[1]}`;
        this.entanglementNetwork.edges.set(edgeId, {
            id: edgeId,
            entanglementId: entanglement.id,
            systems: entanglement.systems,
            strength: entanglement.strength
        });
        
        // Update connections
        const node1 = this.entanglementNetwork.nodes.get(entanglement.systems[0]);
        const node2 = this.entanglementNetwork.nodes.get(entanglement.systems[1]);
        node1.connections.add(entanglement.systems[1]);
        node2.connections.add(entanglement.systems[0]);
        
        // Update network density
        this.updateNetworkDensity();
    }
    
    /**
     * Find entanglement path between systems
     */
    async findEntanglementPath(fromSystem, toSystem) {
        const visited = new Set();
        const queue = [[fromSystem]];
        
        while (queue.length > 0) {
            const path = queue.shift();
            const current = path[path.length - 1];
            
            if (current === toSystem) {
                return path;
            }
            
            if (visited.has(current)) continue;
            visited.add(current);
            
            const node = this.entanglementNetwork.nodes.get(current);
            if (node) {
                for (const connection of node.connections) {
                    if (!visited.has(connection)) {
                        queue.push([...path, connection]);
                    }
                }
            }
        }
        
        return null;
    }
    
    /**
     * Perform Bell measurement
     */
    async performBellMeasurement(systemId, options = {}) {
        // Simplified Bell measurement
        const outcomes = ['00', '01', '10', '11'];
        const outcome = outcomes[Math.floor(Math.random() * 4)];
        
        return {
            systemId,
            outcome,
            basis: 'Bell',
            timestamp: Date.now(),
            metadata: options
        };
    }
    
    /**
     * Calculate teleportation corrections
     */
    calculateTeleportationCorrections(measurement) {
        const corrections = {
            '00': { X: false, Z: false },
            '01': { X: true, Z: false },
            '10': { X: false, Z: true },
            '11': { X: true, Z: true }
        };
        
        return corrections[measurement.outcome] || corrections['00'];
    }
    
    /**
     * Update correlation matrix
     */
    async updateCorrelationMatrix() {
        // Build correlation matrix between all systems
        for (const [id, node] of this.entanglementNetwork.nodes) {
            if (!this.correlationMatrix.has(id)) {
                this.correlationMatrix.set(id, new Map());
            }
            
            for (const connection of node.connections) {
                // Calculate correlation strength based on entanglements
                const strength = await this.calculateSystemCorrelation(id, connection);
                this.correlationMatrix.get(id).set(connection, strength);
            }
        }
    }
    
    /**
     * Calculate correlation between systems
     */
    async calculateSystemCorrelation(system1, system2) {
        let totalStrength = 0;
        let count = 0;
        
        // Find all entanglements between these systems
        const entanglements1 = this.systemEntanglements.get(system1) || new Set();
        const entanglements2 = this.systemEntanglements.get(system2) || new Set();
        
        for (const entId of entanglements1) {
            const ent = this.entanglements.get(entId);
            if (ent && ent.systems.includes(system2)) {
                totalStrength += ent.strength * ent.fidelity;
                count++;
            }
        }
        
        return count > 0 ? totalStrength / count : 0;
    }
    
    /**
     * Update network density
     */
    updateNetworkDensity() {
        const nodeCount = this.entanglementNetwork.nodes.size;
        if (nodeCount < 2) {
            this.metrics.networkDensity = 0;
            return;
        }
        
        const edgeCount = this.entanglementNetwork.edges.size;
        const maxEdges = (nodeCount * (nodeCount - 1)) / 2;
        this.metrics.networkDensity = edgeCount / maxEdges;
    }
    
    /**
     * Update quantum state metrics
     */
    async updateQuantumState() {
        // Calculate global entanglement
        let totalEntanglement = 0;
        for (const [id, ent] of this.entanglements) {
            if (!ent.decayed) {
                totalEntanglement += ent.strength * ent.fidelity;
            }
        }
        this.quantumState.globalEntanglement = totalEntanglement / Math.max(1, this.metrics.activeEntanglements);
        
        // Calculate entanglement entropy
        this.quantumState.entanglementEntropy = -this.quantumState.globalEntanglement * 
            Math.log2(Math.max(0.001, this.quantumState.globalEntanglement));
        
        // Update average fidelity
        let totalFidelity = 0;
        let count = 0;
        for (const [id, ent] of this.entanglements) {
            if (!ent.decayed) {
                totalFidelity += ent.fidelity;
                count++;
            }
        }
        this.metrics.averageFidelity = count > 0 ? totalFidelity / count : 1.0;
    }
    
    /**
     * Apply entanglement decay
     */
    async applyDecay() {
        const now = Date.now();
        
        for (const [id, entanglement] of this.entanglements) {
            if (entanglement.decayed) continue;
            
            const age = now - entanglement.createdAt;
            const decayFactor = Math.exp(-this.config.entanglementDecayRate * age / 1000);
            
            entanglement.strength *= decayFactor;
            entanglement.fidelity *= decayFactor;
            
            // Mark as decayed if too weak
            if (entanglement.strength < this.config.minEntanglementStrength) {
                entanglement.decayed = true;
                this.metrics.activeEntanglements--;
                
                this.emit('entanglement_decayed', {
                    id,
                    finalStrength: entanglement.strength
                });
            }
        }
        
        await this.updateQuantumState();
    }
    
    /**
     * Start monitoring
     */
    startMonitoring() {
        this.monitoringInterval = setInterval(async () => {
            // Apply decay
            await this.applyDecay();
            
            // Update quantum state
            await this.updateQuantumState();
            
            // Clean up decayed entanglements
            const decayedCount = Array.from(this.entanglements.values())
                .filter(e => e.decayed).length;
            
            if (decayedCount > 100) {
                this.cleanupDecayedEntanglements();
            }
        }, this.config.monitoringInterval);
    }
    
    /**
     * Start correlation discovery
     */
    startCorrelationDiscovery() {
        this.correlationDiscoveryInterval = setInterval(async () => {
            await this.discoverCorrelations();
        }, this.config.correlationDiscoveryRate);
    }
    
    /**
     * Cleanup decayed entanglements
     */
    cleanupDecayedEntanglements() {
        const toRemove = [];
        
        for (const [id, ent] of this.entanglements) {
            if (ent.decayed && Date.now() - ent.createdAt > 60000) {
                toRemove.push(id);
            }
        }
        
        for (const id of toRemove) {
            const ent = this.entanglements.get(id);
            // Remove from system registry
            for (const systemId of ent.systems) {
                const systemEnts = this.systemEntanglements.get(systemId);
                if (systemEnts) {
                    systemEnts.delete(id);
                }
            }
            this.entanglements.delete(id);
        }
        
        console.log(`🧹 Cleaned up ${toRemove.length} decayed entanglements`);
    }
    
    /**
     * Get entanglement
     */
    getEntanglement(entanglementId) {
        return this.entanglements.get(entanglementId);
    }
    
    /**
     * Get system entanglements
     */
    getSystemEntanglements(systemId) {
        const entanglementIds = this.systemEntanglements.get(systemId) || new Set();
        const entanglements = [];
        
        for (const id of entanglementIds) {
            const ent = this.entanglements.get(id);
            if (ent && !ent.decayed) {
                entanglements.push(ent);
            }
        }
        
        return entanglements;
    }
    
    /**
     * Get metrics
     */
    getMetrics() {
        return {
            ...this.metrics,
            quantumState: this.quantumState,
            networkNodes: this.entanglementNetwork.nodes.size,
            networkEdges: this.entanglementNetwork.edges.size,
            bellPairs: this.bellPairs.size,
            ghzStates: this.ghzStates.size,
            correlations: this.correlations.size
        };
    }
    
    /**
     * Get state for persistence
     */
    getState() {
        return {
            config: this.config,
            entanglements: Array.from(this.entanglements.entries()),
            systemEntanglements: Array.from(this.systemEntanglements.entries()).map(([id, ents]) =>
                [id, Array.from(ents)]
            ),
            bellPairs: Array.from(this.bellPairs.entries()),
            ghzStates: Array.from(this.ghzStates.entries()),
            correlations: Array.from(this.correlations.entries()),
            metrics: this.metrics,
            quantumState: this.quantumState
        };
    }
    
    /**
     * Restore state from persistence
     */
    setState(state) {
        if (state.config) {
            Object.assign(this.config, state.config);
        }
        if (state.entanglements) {
            this.entanglements = new Map(state.entanglements);
        }
        if (state.systemEntanglements) {
            this.systemEntanglements = new Map(state.systemEntanglements.map(([id, ents]) =>
                [id, new Set(ents)]
            ));
        }
        if (state.bellPairs) {
            this.bellPairs = new Map(state.bellPairs);
        }
        if (state.ghzStates) {
            this.ghzStates = new Map(state.ghzStates);
        }
        if (state.correlations) {
            this.correlations = new Map(state.correlations);
        }
        if (state.metrics) {
            Object.assign(this.metrics, state.metrics);
        }
        if (state.quantumState) {
            Object.assign(this.quantumState, state.quantumState);
        }
    }
    
    /**
     * Cleanup
     */
    destroy() {
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
        }
        if (this.correlationDiscoveryInterval) {
            clearInterval(this.correlationDiscoveryInterval);
        }
        this.removeAllListeners();
        this.entanglements.clear();
        this.systemEntanglements.clear();
        this.bellPairs.clear();
        this.ghzStates.clear();
        this.correlations.clear();
    }
}

export default QuantumEntanglementEngine;
