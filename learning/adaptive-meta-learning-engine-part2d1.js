/**
 * Adaptive Meta-Learning Engine - Part 2D-1: Basic Domain Adaptation and Feature Alignment
 * 
 * This module implements the foundational components for cross-domain transfer learning,
 * focusing on domain representation, basic feature alignment, and domain similarity computation.
 * 
 * Elite Features:
 * - Domain representation and metadata management
 * - Basic feature transformation and alignment
 * - Domain distance metrics and similarity computation
 * - Feature mapping between different domains
 * - Foundation for advanced domain adaptation
 * 
 * Part of the elite-level adaptive meta-learning system designed for top 1% AI capabilities.
 */

import {
    MetaLearningTask,
    TaskType,
    DataPoint,
    MetaObjective,
    PerformanceMetrics,
    ConvergenceCriteria,
    InputModality,
    OutputModality,
    ComplexityLevel
} from './adaptive-meta-learning-engine-part1';

// ================================
// Domain Representation Interfaces
// ================================

/**
 * Represents a domain with its characteristics and metadata
 */
export interface Domain {
    id: string;
    name: string;
    description: string;
    type: DomainType;
    modality: InputModality[];
    complexity: ComplexityLevel;
    characteristics: DomainCharacteristics;
    metadata: DomainMetadata;
    featureSpace: FeatureSpace;
    statistics: DomainStatistics;
}

/**
 * Types of domains we can work with
 */
export enum DomainType {
    COMPUTER_VISION = 'computer_vision',
    NATURAL_LANGUAGE = 'natural_language',
    AUDIO_PROCESSING = 'audio_processing',
    BLOCKCHAIN = 'blockchain',
    NUMERICAL = 'numerical',
    MULTIMODAL = 'multimodal',
    TIME_SERIES = 'time_series',
    GRAPH = 'graph',
    TABULAR = 'tabular',
    REINFORCEMENT_LEARNING = 'reinforcement_learning'
}

/**
 * Characteristics that define a domain
 */
export interface DomainCharacteristics {
    dimensionality: number;
    sparsity: number; // 0-1 scale
    noise_level: number; // 0-1 scale
    temporal_dependency: boolean;
    spatial_structure: boolean;
    semantic_structure: boolean;
    distribution_type: DistributionType;
    feature_types: FeatureType[];
    invariances: InvarianceType[];
    typical_sample_size: number;
}

/**
 * Types of distributions common in domains
 */
export enum DistributionType {
    GAUSSIAN = 'gaussian',
    EXPONENTIAL = 'exponential',
    POWER_LAW = 'power_law',
    UNIFORM = 'uniform',
    CATEGORICAL = 'categorical',
    MULTIMODAL = 'multimodal',
    HEAVY_TAILED = 'heavy_tailed',
    SPARSE = 'sparse'
}

/**
 * Types of features in a domain
 */
export enum FeatureType {
    CONTINUOUS = 'continuous',
    DISCRETE = 'discrete',
    CATEGORICAL = 'categorical',
    BINARY = 'binary',
    ORDINAL = 'ordinal',
    EMBEDDING = 'embedding',
    STRUCTURED = 'structured',
    SEQUENTIAL = 'sequential'
}

/**
 * Types of invariances that might exist in a domain
 */
export enum InvarianceType {
    TRANSLATION = 'translation',
    ROTATION = 'rotation',
    SCALE = 'scale',
    PERMUTATION = 'permutation',
    TEMPORAL_SHIFT = 'temporal_shift',
    COLOR = 'color',
    ILLUMINATION = 'illumination',
    SEMANTIC = 'semantic'
}

/**
 * Metadata about a domain
 */
export interface DomainMetadata {
    creation_date: Date;
    last_updated: Date;
    source: string;
    tags: string[];
    related_domains: string[];
    adaptation_difficulty: number; // 0-1 scale
    known_good_sources: string[];
    known_challenging_aspects: string[];
    success_metrics: string[];
}

/**
 * Feature space representation for a domain
 */
export interface FeatureSpace {
    dimensions: number;
    feature_names: string[];
    feature_types: FeatureType[];
    feature_ranges: FeatureRange[];
    correlation_structure: number[][]; // correlation matrix
    principal_components?: PrincipalComponent[];
    embeddings?: DomainEmbedding[];
}

/**
 * Range information for features
 */
export interface FeatureRange {
    feature_name: string;
    min_value: number;
    max_value: number;
    mean_value: number;
    std_deviation: number;
    percentiles: number[]; // [5%, 25%, 50%, 75%, 95%]
}

/**
 * Principal component information
 */
export interface PrincipalComponent {
    component_id: number;
    explained_variance: number;
    cumulative_variance: number;
    loadings: number[];
}

/**
 * Domain embedding for similarity computation
 */
export interface DomainEmbedding {
    embedding_type: EmbeddingType;
    dimensions: number;
    vector: number[];
    quality_score: number; // 0-1 scale
}

/**
 * Types of embeddings we can use
 */
export enum EmbeddingType {
    TASK_EMBEDDING = 'task_embedding',
    FEATURE_EMBEDDING = 'feature_embedding',
    SEMANTIC_EMBEDDING = 'semantic_embedding',
    LEARNED_EMBEDDING = 'learned_embedding',
    PRETRAINED_EMBEDDING = 'pretrained_embedding'
}

/**
 * Statistical information about a domain
 */
export interface DomainStatistics {
    sample_count: number;
    feature_statistics: FeatureStatistics[];
    distribution_metrics: DistributionMetrics;
    quality_metrics: QualityMetrics;
    temporal_patterns?: TemporalPatterns;
}

/**
 * Statistics for individual features
 */
export interface FeatureStatistics {
    feature_name: string;
    missing_rate: number;
    uniqueness: number; // ratio of unique values
    skewness: number;
    kurtosis: number;
    entropy: number;
    mutual_information_with_target?: number;
}

/**
 * Metrics describing the distribution
 */
export interface DistributionMetrics {
    entropy: number;
    mutual_information: number[][];
    kolmogorov_complexity: number;
    effective_dimensionality: number;
    intrinsic_dimensionality: number;
}

/**
 * Quality metrics for the domain data
 */
export interface QualityMetrics {
    completeness: number; // 0-1 scale
    consistency: number; // 0-1 scale
    accuracy: number; // 0-1 scale
    timeliness: number; // 0-1 scale
    relevance: number; // 0-1 scale
    overall_quality: number; // 0-1 scale
}

/**
 * Temporal patterns if applicable
 */
export interface TemporalPatterns {
    seasonality: SeasonalityPattern[];
    trends: TrendPattern[];
    cycles: CyclePattern[];
    irregularities: IrregularityPattern[];
}

/**
 * Seasonality pattern information
 */
export interface SeasonalityPattern {
    period: number;
    strength: number; // 0-1 scale
    phase: number;
    confidence: number; // 0-1 scale
}

/**
 * Trend pattern information
 */
export interface TrendPattern {
    direction: 'increasing' | 'decreasing' | 'stable';
    strength: number; // 0-1 scale
    changepoints: number[];
    confidence: number; // 0-1 scale
}

/**
 * Cycle pattern information
 */
export interface CyclePattern {
    frequency: number;
    amplitude: number;
    phase: number;
    confidence: number; // 0-1 scale
}

/**
 * Irregularity pattern information
 */
export interface IrregularityPattern {
    anomaly_rate: number;
    volatility: number;
    outlier_threshold: number;
    typical_deviations: number[];
}

// ================================
// Domain Distance and Similarity
// ================================

/**
 * Metrics for measuring distance between domains
 */
export interface DomainDistance {
    distance_type: DistanceType;
    distance_value: number;
    confidence: number; // 0-1 scale
    components: DistanceComponent[];
    computation_time: number;
}

/**
 * Types of distance metrics
 */
export enum DistanceType {
    EUCLIDEAN = 'euclidean',
    COSINE = 'cosine',
    MANHATTAN = 'manhattan',
    KL_DIVERGENCE = 'kl_divergence',
    WASSERSTEIN = 'wasserstein',
    MAXIMUM_MEAN_DISCREPANCY = 'mmd',
    TASK_SIMILARITY = 'task_similarity',
    FEATURE_SIMILARITY = 'feature_similarity',
    STRUCTURAL_SIMILARITY = 'structural_similarity'
}

/**
 * Components that contribute to domain distance
 */
export interface DistanceComponent {
    component_name: string;
    component_weight: number;
    component_distance: number;
    description: string;
}

/**
 * Similarity metrics between domains
 */
export interface DomainSimilarity {
    similarity_score: number; // 0-1 scale
    similarity_type: SimilarityType;
    confidence: number; // 0-1 scale
    transferability_score: number; // 0-1 scale
    adaptation_difficulty: number; // 0-1 scale
    recommendations: TransferRecommendation[];
}

/**
 * Types of similarity metrics
 */
export enum SimilarityType {
    SEMANTIC_SIMILARITY = 'semantic',
    STRUCTURAL_SIMILARITY = 'structural',
    STATISTICAL_SIMILARITY = 'statistical',
    FUNCTIONAL_SIMILARITY = 'functional',
    TASK_SIMILARITY = 'task',
    OVERALL_SIMILARITY = 'overall'
}

/**
 * Recommendations for transfer learning
 */
export interface TransferRecommendation {
    recommendation_type: RecommendationType;
    confidence: number; // 0-1 scale
    description: string;
    expected_performance: number; // 0-1 scale
    transfer_strategy: string;
}

/**
 * Types of transfer recommendations
 */
export enum RecommendationType {
    DIRECT_TRANSFER = 'direct_transfer',
    FINE_TUNING = 'fine_tuning',
    FEATURE_EXTRACTION = 'feature_extraction',
    DOMAIN_ADAPTATION = 'domain_adaptation',
    PROGRESSIVE_TRANSFER = 'progressive_transfer',
    MULTI_TASK_LEARNING = 'multi_task_learning',
    NOT_RECOMMENDED = 'not_recommended'
}

// ================================
// Feature Alignment and Mapping
// ================================

/**
 * Feature alignment between domains
 */
export interface FeatureAlignment {
    source_domain: string;
    target_domain: string;
    alignment_type: AlignmentType;
    feature_mappings: FeatureMapping[];
    alignment_quality: number; // 0-1 scale
    transformation_matrix?: number[][];
    inverse_transformation?: number[][];
}

/**
 * Types of feature alignment
 */
export enum AlignmentType {
    LINEAR_TRANSFORMATION = 'linear',
    NONLINEAR_TRANSFORMATION = 'nonlinear',
    LEARNED_MAPPING = 'learned',
    CANONICAL_CORRELATION = 'canonical_correlation',
    MANIFOLD_ALIGNMENT = 'manifold',
    ADVERSARIAL_ALIGNMENT = 'adversarial'
}

/**
 * Mapping between features in different domains
 */
export interface FeatureMapping {
    source_features: string[];
    target_features: string[];
    mapping_type: MappingType;
    mapping_confidence: number; // 0-1 scale
    transformation_function?: string;
    learned_parameters?: number[];
}

/**
 * Types of feature mappings
 */
export enum MappingType {
    ONE_TO_ONE = 'one_to_one',
    ONE_TO_MANY = 'one_to_many',
    MANY_TO_ONE = 'many_to_one',
    MANY_TO_MANY = 'many_to_many',
    COMPOSITE = 'composite',
    LEARNED = 'learned'
}

/**
 * Feature transformation operation
 */
export interface FeatureTransformation {
    transformation_id: string;
    source_domain: string;
    target_domain: string;
    transformation_type: TransformationType;
    parameters: TransformationParameters;
    performance_metrics: TransformationMetrics;
    validation_results: ValidationResult[];
}

/**
 * Types of transformations
 */
export enum TransformationType {
    STANDARDIZATION = 'standardization',
    NORMALIZATION = 'normalization',
    PCA_PROJECTION = 'pca_projection',
    LINEAR_PROJECTION = 'linear_projection',
    KERNEL_MAPPING = 'kernel_mapping',
    NEURAL_EMBEDDING = 'neural_embedding',
    AUTOENCODER = 'autoencoder',
    VARIATIONAL_AUTOENCODER = 'vae'
}

/**
 * Parameters for transformations
 */
export interface TransformationParameters {
    parameter_name: string;
    parameter_value: any;
    parameter_type: 'number' | 'string' | 'boolean' | 'array' | 'object';
    description: string;
}

/**
 * Metrics for transformation quality
 */
export interface TransformationMetrics {
    reconstruction_error: number;
    information_preservation: number; // 0-1 scale
    computational_efficiency: number; // 0-1 scale
    stability: number; // 0-1 scale
    invertibility: number; // 0-1 scale
}

/**
 * Validation results for transformations
 */
export interface ValidationResult {
    validation_type: ValidationType;
    validation_score: number; // 0-1 scale
    cross_validation_scores: number[];
    confidence_interval: [number, number];
    statistical_significance: number;
}

/**
 * Types of validation
 */
export enum ValidationType {
    RECONSTRUCTION_QUALITY = 'reconstruction',
    DOWNSTREAM_TASK_PERFORMANCE = 'downstream_task',
    CROSS_DOMAIN_GENERALIZATION = 'cross_domain',
    SEMANTIC_PRESERVATION = 'semantic',
    STRUCTURAL_PRESERVATION = 'structural'
}

// ================================
// Basic Domain Adapter Implementation
// ================================

/**
 * Basic domain adapter for feature alignment and transformation
 */
export class BasicDomainAdapter {
    private domains: Map<string, Domain>;
    private domain_distances: Map<string, DomainDistance>;
    private feature_alignments: Map<string, FeatureAlignment>;
    private transformations: Map<string, FeatureTransformation>;
    private similarity_cache: Map<string, DomainSimilarity>;

    constructor() {
        this.domains = new Map();
        this.domain_distances = new Map();
        this.feature_alignments = new Map();
        this.transformations = new Map();
        this.similarity_cache = new Map();
    }

    /**
     * Register a new domain with the adapter
     */
    public registerDomain(domain: Domain): void {
        this.domains.set(domain.id, domain);
        
        // Clear related caches
        this.clearDomainCaches(domain.id);
    }

    /**
     * Compute distance between two domains
     */
    public computeDomainDistance(
        source_domain_id: string,
        target_domain_id: string,
        distance_type: DistanceType = DistanceType.EUCLIDEAN
    ): DomainDistance {
        const cache_key = `${source_domain_id}_${target_domain_id}_${distance_type}`;
        
        if (this.domain_distances.has(cache_key)) {
            return this.domain_distances.get(cache_key)!;
        }

        const source_domain = this.domains.get(source_domain_id);
        const target_domain = this.domains.get(target_domain_id);

        if (!source_domain || !target_domain) {
            throw new Error(`Domain not found: ${source_domain_id} or ${target_domain_id}`);
        }

        const start_time = Date.now();
        let distance_value: number;
        let components: DistanceComponent[] = [];

        switch (distance_type) {
            case DistanceType.EUCLIDEAN:
                distance_value = this.computeEuclideanDistance(source_domain, target_domain);
                components = this.getEuclideanComponents(source_domain, target_domain);
                break;
            
            case DistanceType.COSINE:
                distance_value = this.computeCosineDistance(source_domain, target_domain);
                components = this.getCosineComponents(source_domain, target_domain);
                break;
            
            case DistanceType.KL_DIVERGENCE:
                distance_value = this.computeKLDivergence(source_domain, target_domain);
                components = this.getKLComponents(source_domain, target_domain);
                break;
            
            default:
                distance_value = this.computeDefaultDistance(source_domain, target_domain);
                components = this.getDefaultComponents(source_domain, target_domain);
        }

        const domain_distance: DomainDistance = {
            distance_type,
            distance_value,
            confidence: this.computeDistanceConfidence(source_domain, target_domain, distance_type),
            components,
            computation_time: Date.now() - start_time
        };

        this.domain_distances.set(cache_key, domain_distance);
        return domain_distance;
    }

    /**
     * Compute similarity between two domains
     */
    public computeDomainSimilarity(
        source_domain_id: string,
        target_domain_id: string,
        similarity_type: SimilarityType = SimilarityType.OVERALL_SIMILARITY
    ): DomainSimilarity {
        const cache_key = `${source_domain_id}_${target_domain_id}_${similarity_type}`;
        
        if (this.similarity_cache.has(cache_key)) {
            return this.similarity_cache.get(cache_key)!;
        }

        const source_domain = this.domains.get(source_domain_id);
        const target_domain = this.domains.get(target_domain_id);

        if (!source_domain || !target_domain) {
            throw new Error(`Domain not found: ${source_domain_id} or ${target_domain_id}`);
        }

        const similarity_score = this.computeSimilarityScore(source_domain, target_domain, similarity_type);
        const transferability_score = this.computeTransferabilityScore(source_domain, target_domain);
        const adaptation_difficulty = this.computeAdaptationDifficulty(source_domain, target_domain);
        const recommendations = this.generateTransferRecommendations(source_domain, target_domain);

        const domain_similarity: DomainSimilarity = {
            similarity_score,
            similarity_type,
            confidence: this.computeSimilarityConfidence(source_domain, target_domain),
            transferability_score,
            adaptation_difficulty,
            recommendations
        };

        this.similarity_cache.set(cache_key, domain_similarity);
        return domain_similarity;
    }

    /**
     * Create feature alignment between two domains
     */
    public createFeatureAlignment(
        source_domain_id: string,
        target_domain_id: string,
        alignment_type: AlignmentType = AlignmentType.LINEAR_TRANSFORMATION
    ): FeatureAlignment {
        const alignment_key = `${source_domain_id}_${target_domain_id}_${alignment_type}`;
        
        if (this.feature_alignments.has(alignment_key)) {
            return this.feature_alignments.get(alignment_key)!;
        }

        const source_domain = this.domains.get(source_domain_id);
        const target_domain = this.domains.get(target_domain_id);

        if (!source_domain || !target_domain) {
            throw new Error(`Domain not found: ${source_domain_id} or ${target_domain_id}`);
        }

        const feature_mappings = this.computeFeatureMappings(source_domain, target_domain, alignment_type);
        const alignment_quality = this.computeAlignmentQuality(feature_mappings);
        const transformation_matrix = this.computeTransformationMatrix(source_domain, target_domain, alignment_type);

        const feature_alignment: FeatureAlignment = {
            source_domain: source_domain_id,
            target_domain: target_domain_id,
            alignment_type,
            feature_mappings,
            alignment_quality,
            transformation_matrix,
            inverse_transformation: transformation_matrix ? this.computeInverseTransformation(transformation_matrix) : undefined
        };

        this.feature_alignments.set(alignment_key, feature_alignment);
        return feature_alignment;
    }

    /**
     * Apply feature transformation
     */
    public applyFeatureTransformation(
        data: DataPoint[],
        transformation_id: string
    ): DataPoint[] {
        const transformation = this.transformations.get(transformation_id);
        
        if (!transformation) {
            throw new Error(`Transformation not found: ${transformation_id}`);
        }

        return data.map(dataPoint => this.transformDataPoint(dataPoint, transformation));
    }

    // ================================
    // Private Implementation Methods
    // ================================

    private computeEuclideanDistance(source: Domain, target: Domain): number {
        // Compute Euclidean distance based on domain characteristics
        const source_vector = this.domainToVector(source);
        const target_vector = this.domainToVector(target);
        
        let sum_squared_diff = 0;
        for (let i = 0; i < Math.min(source_vector.length, target_vector.length); i++) {
            sum_squared_diff += Math.pow(source_vector[i] - target_vector[i], 2);
        }
        
        return Math.sqrt(sum_squared_diff);
    }

    private computeCosineDistance(source: Domain, target: Domain): number {
        // Compute cosine distance between domain vectors
        const source_vector = this.domainToVector(source);
        const target_vector = this.domainToVector(target);
        
        const dot_product = source_vector.reduce((sum, val, i) => sum + val * target_vector[i], 0);
        const source_magnitude = Math.sqrt(source_vector.reduce((sum, val) => sum + val * val, 0));
        const target_magnitude = Math.sqrt(target_vector.reduce((sum, val) => sum + val * val, 0));
        
        const cosine_similarity = dot_product / (source_magnitude * target_magnitude);
        return 1 - cosine_similarity; // Convert to distance
    }

    private computeKLDivergence(source: Domain, target: Domain): number {
        // Simplified KL divergence computation
        // In practice, this would use actual probability distributions
        const source_stats = source.statistics.distribution_metrics;
        const target_stats = target.statistics.distribution_metrics;
        
        // Simplified approximation - in real implementation would use proper distributions
        return Math.abs(source_stats.entropy - target_stats.entropy) + 
               Math.abs(source_stats.mutual_information - target_stats.mutual_information);
    }

    private computeDefaultDistance(source: Domain, target: Domain): number {
        // Default distance combining multiple factors
        const euclidean = this.computeEuclideanDistance(source, target);
        const cosine = this.computeCosineDistance(source, target);
        
        return (euclidean + cosine) / 2;
    }

    private domainToVector(domain: Domain): number[] {
        // Convert domain characteristics to a numerical vector
        return [
            domain.characteristics.dimensionality / 1000, // Normalize
            domain.characteristics.sparsity,
            domain.characteristics.noise_level,
            domain.characteristics.temporal_dependency ? 1 : 0,
            domain.characteristics.spatial_structure ? 1 : 0,
            domain.characteristics.semantic_structure ? 1 : 0,
            domain.characteristics.typical_sample_size / 100000, // Normalize
            domain.statistics.quality_metrics.overall_quality,
            domain.statistics.distribution_metrics.effective_dimensionality / domain.characteristics.dimensionality,
            domain.metadata.adaptation_difficulty
        ];
    }

    private getEuclideanComponents(source: Domain, target: Domain): DistanceComponent[] {
        return [
            {
                component_name: 'dimensionality_diff',
                component_weight: 0.3,
                component_distance: Math.abs(source.characteristics.dimensionality - target.characteristics.dimensionality) / 1000,
                description: 'Difference in feature space dimensionality'
            },
            {
                component_name: 'complexity_diff',
                component_weight: 0.2,
                component_distance: Math.abs(this.complexityToNumber(source.characteristics.complexity) - 
                                           this.complexityToNumber(target.characteristics.complexity)),
                description: 'Difference in domain complexity'
            },
            {
                component_name: 'quality_diff',
                component_weight: 0.25,
                component_distance: Math.abs(source.statistics.quality_metrics.overall_quality - 
                                           target.statistics.quality_metrics.overall_quality),
                description: 'Difference in data quality metrics'
            },
            {
                component_name: 'structure_diff',
                component_weight: 0.25,
                component_distance: this.computeStructuralDifference(source, target),
                description: 'Difference in data structure and organization'
            }
        ];
    }

    private getCosineComponents(source: Domain, target: Domain): DistanceComponent[] {
        // Similar to Euclidean but focusing on angle between vectors
        return this.getEuclideanComponents(source, target);
    }

    private getKLComponents(source: Domain, target: Domain): DistanceComponent[] {
        return [
            {
                component_name: 'entropy_divergence',
                component_weight: 0.4,
                component_distance: Math.abs(source.statistics.distribution_metrics.entropy - 
                                           target.statistics.distribution_metrics.entropy),
                description: 'Divergence in entropy between domains'
            },
            {
                component_name: 'mutual_info_divergence',
                component_weight: 0.6,
                component_distance: Math.abs(source.statistics.distribution_metrics.mutual_information - 
                                           target.statistics.distribution_metrics.mutual_information),
                description: 'Divergence in mutual information'
            }
        ];
    }

    private getDefaultComponents(source: Domain, target: Domain): DistanceComponent[] {
        return this.getEuclideanComponents(source, target);
    }

    private computeDistanceConfidence(source: Domain, target: Domain, distance_type: DistanceType): number {
        // Confidence based on data quality and sample size
        const source_quality = source.statistics.quality_metrics.overall_quality;
        const target_quality = target.statistics.quality_metrics.overall_quality;
        const combined_quality = (source_quality + target_quality) / 2;
        
        const sample_size_factor = Math.min(1, 
            (source.statistics.sample_count + target.statistics.sample_count) / 2000);
        
        return combined_quality * sample_size_factor;
    }

    private computeSimilarityScore(source: Domain, target: Domain, similarity_type: SimilarityType): number {
        switch (similarity_type) {
            case SimilarityType.SEMANTIC_SIMILARITY:
                return this.computeSemanticSimilarity(source, target);
            case SimilarityType.STRUCTURAL_SIMILARITY:
                return this.computeStructuralSimilarity(source, target);
            case SimilarityType.STATISTICAL_SIMILARITY:
                return this.computeStatisticalSimilarity(source, target);
            default:
                return this.computeOverallSimilarity(source, target);
        }
    }

    private computeSemanticSimilarity(source: Domain, target: Domain): number {
        // Simplified semantic similarity based on domain types and modalities
        if (source.type === target.type) {
            const modality_overlap = source.modality.filter(m => target.modality.includes(m)).length;
            const total_modalities = new Set([...source.modality, ...target.modality]).size;
            return modality_overlap / total_modalities;
        }
        return 0.3; // Base similarity for different types
    }

    private computeStructuralSimilarity(source: Domain, target: Domain): number {
        const structural_features = [
            source.characteristics.temporal_dependency === target.characteristics.temporal_dependency ? 1 : 0,
            source.characteristics.spatial_structure === target.characteristics.spatial_structure ? 1 : 0,
            source.characteristics.semantic_structure === target.characteristics.semantic_structure ? 1 : 0,
            1 - Math.abs(source.characteristics.sparsity - target.characteristics.sparsity),
            1 - Math.abs(source.characteristics.noise_level - target.characteristics.noise_level)
        ];
        
        return structural_features.reduce((sum, val) => sum + val, 0) / structural_features.length;
    }

    private computeStatisticalSimilarity(source: Domain, target: Domain): number {
        const stat_sim = 1 - Math.abs(source.statistics.distribution_metrics.entropy - 
                                     target.statistics.distribution_metrics.entropy) / 10; // Normalize
        return Math.max(0, Math.min(1, stat_sim));
    }

    private computeOverallSimilarity(source: Domain, target: Domain): number {
        const semantic = this.computeSemanticSimilarity(source, target);
        const structural = this.computeStructuralSimilarity(source, target);
        const statistical = this.computeStatisticalSimilarity(source, target);
        
        return (semantic * 0.4 + structural * 0.35 + statistical * 0.25);
    }

    private computeTransferabilityScore(source: Domain, target: Domain): number {
        const similarity = this.computeOverallSimilarity(source, target);
        const quality_factor = (source.statistics.quality_metrics.overall_quality + 
                               target.statistics.quality_metrics.overall_quality) / 2;
        const complexity_diff = Math.abs(this.complexityToNumber(source.characteristics.complexity) - 
                                        this.complexityToNumber(target.characteristics.complexity));
        
        return similarity * quality_factor * (1 - complexity_diff / 4); // Normalize complexity diff
    }

    private computeAdaptationDifficulty(source: Domain, target: Domain): number {
        const distance = this.computeDefaultDistance(source, target);
        const complexity_diff = Math.abs(this.complexityToNumber(source.characteristics.complexity) - 
                                        this.complexityToNumber(target.characteristics.complexity));
        const dimensionality_ratio = Math.abs(Math.log(source.characteristics.dimensionality / 
                                             target.characteristics.dimensionality));
        
        return Math.min(1, (distance + complexity_diff + dimensionality_ratio) / 3);
    }

    private generateTransferRecommendations(source: Domain, target: Domain): TransferRecommendation[] {
        const similarity = this.computeOverallSimilarity(source, target);
        const transferability = this.computeTransferabilityScore(source, target);
        const recommendations: TransferRecommendation[] = [];

        if (transferability > 0.8) {
            recommendations.push({
                recommendation_type: RecommendationType.DIRECT_TRANSFER,
                confidence: transferability,
                description: 'High similarity allows direct transfer with minimal adaptation',
                expected_performance: transferability,
                transfer_strategy: 'Direct model transfer with fine-tuning on target data'
            });
        } else if (transferability > 0.6) {
            recommendations.push({
                recommendation_type: RecommendationType.FINE_TUNING,
                confidence: transferability,
                description: 'Moderate similarity suggests fine-tuning approach',
                expected_performance: transferability * 0.9,
                transfer_strategy: 'Transfer pre-trained features with target-specific fine-tuning'
            });
        } else if (transferability > 0.4) {
            recommendations.push({
                recommendation_type: RecommendationType.DOMAIN_ADAPTATION,
                confidence: transferability,
                description: 'Domain adaptation techniques recommended',
                expected_performance: transferability * 0.8,
                transfer_strategy: 'Use domain adaptation methods to align feature distributions'
            });
        } else {
            recommendations.push({
                recommendation_type: RecommendationType.NOT_RECOMMENDED,
                confidence: 1 - transferability,
                description: 'Low similarity makes transfer challenging',
                expected_performance: transferability * 0.5,
                transfer_strategy: 'Consider alternative approaches or more similar source domains'
            });
        }

        return recommendations;
    }

    private computeSimilarityConfidence(source: Domain, target: Domain): number {
        return this.computeDistanceConfidence(source, target, DistanceType.EUCLIDEAN);
    }

    private computeFeatureMappings(source: Domain, target: Domain, alignment_type: AlignmentType): FeatureMapping[] {
        const mappings: FeatureMapping[] = [];
        
        // Simplified mapping based on feature names and types
        for (let i = 0; i < Math.min(source.featureSpace.feature_names.length, 
                                     target.featureSpace.feature_names.length); i++) {
            mappings.push({
                source_features: [source.featureSpace.feature_names[i]],
                target_features: [target.featureSpace.feature_names[i]],
                mapping_type: MappingType.ONE_TO_ONE,
                mapping_confidence: this.computeMappingConfidence(
                    source.featureSpace.feature_types[i],
                    target.featureSpace.feature_types[i]
                )
            });
        }
        
        return mappings;
    }

    private computeMappingConfidence(source_type: FeatureType, target_type: FeatureType): number {
        if (source_type === target_type) return 0.9;
        if (this.areCompatibleTypes(source_type, target_type)) return 0.7;
        return 0.3;
    }

    private areCompatibleTypes(type1: FeatureType, type2: FeatureType): boolean {
        const compatible_groups = [
            [FeatureType.CONTINUOUS, FeatureType.DISCRETE],
            [FeatureType.CATEGORICAL, FeatureType.ORDINAL],
            [FeatureType.BINARY, FeatureType.CATEGORICAL]
        ];
        
        return compatible_groups.some(group => 
            group.includes(type1) && group.includes(type2)
        );
    }

    private computeAlignmentQuality(mappings: FeatureMapping[]): number {
        if (mappings.length === 0) return 0;
        
        const avg_confidence = mappings.reduce((sum, mapping) => 
            sum + mapping.mapping_confidence, 0) / mappings.length;
        
        return avg_confidence;
    }

    private computeTransformationMatrix(source: Domain, target: Domain, alignment_type: AlignmentType): number[][] | undefined {
        if (alignment_type !== AlignmentType.LINEAR_TRANSFORMATION) {
            return undefined;
        }
        
        // Simplified linear transformation matrix
        const source_dim = source.featureSpace.dimensions;
        const target_dim = target.featureSpace.dimensions;
        
        const matrix: number[][] = [];
        for (let i = 0; i < target_dim; i++) {
            matrix[i] = [];
            for (let j = 0; j < source_dim; j++) {
                // Initialize with identity-like transformation
                matrix[i][j] = (i === j) ? 1 : 0;
            }
        }
        
        return matrix;
    }

    private computeInverseTransformation(matrix: number[][]): number[][] {
        // Simplified inverse computation - in practice would use proper matrix inversion
        const rows = matrix.length;
        const cols = matrix[0].length;
        
        if (rows !== cols) {
            // For non-square matrices, use pseudo-inverse approximation
            return matrix[0].map((_, i) => matrix.map(row => row[i])); // Transpose as approximation
        }
        
        // For square matrices, return transpose as simplified inverse
        return matrix[0].map((_, i) => matrix.map(row => row[i]));
    }

    private transformDataPoint(dataPoint: DataPoint, transformation: FeatureTransformation): DataPoint {
        // Apply transformation to data point
        // This is a simplified implementation
        return {
            ...dataPoint,
            metadata: {
                ...dataPoint.metadata,
                transformation_applied: transformation.transformation_id
            }
        };
    }

    private complexityToNumber(complexity: ComplexityLevel): number {
        const complexity_map = {
            [ComplexityLevel.SIMPLE]: 1,
            [ComplexityLevel.MODERATE]: 2,
            [ComplexityLevel.COMPLEX]: 3,
            [ComplexityLevel.EXPERT]: 4,
            [ComplexityLevel.ELITE]: 5
        };
        return complexity_map[complexity] || 3;
    }

    private computeStructuralDifference(source: Domain, target: Domain): number {
        const structural_features = [
            Math.abs(Number(source.characteristics.temporal_dependency) - Number(target.characteristics.temporal_dependency)),
            Math.abs(Number(source.characteristics.spatial_structure) - Number(target.characteristics.spatial_structure)),
            Math.abs(Number(source.characteristics.semantic_structure) - Number(target.characteristics.semantic_structure)),
            Math.abs(source.characteristics.sparsity - target.characteristics.sparsity),
            Math.abs(source.characteristics.noise_level - target.characteristics.noise_level)
        ];
        
        return structural_features.reduce((sum, val) => sum + val, 0) / structural_features.length;
    }

    private clearDomainCaches(domain_id: string): void {
        // Clear caches related to this domain
        const keys_to_delete: string[] = [];
        
        this.domain_distances.forEach((_, key) => {
            if (key.includes(domain_id)) {
                keys_to_delete.push(key);
            }
        });
        
        this.similarity_cache.forEach((_, key) => {
            if (key.includes(domain_id)) {
                keys_to_delete.push(key);
            }
        });
        
        keys_to_delete.forEach(key => {
            this.domain_distances.delete(key);
            this.similarity_cache.delete(key);
        });
    }

    /**
     * Get system health and performance metrics
     */
    public getSystemHealth(): {
        registered_domains: number;
        cached_distances: number;
        cached_similarities: number;
        cached_alignments: number;
        cached_transformations: number;
        system_status: 'healthy' | 'warning' | 'error';
        recommendations: string[];
    } {
        const recommendations: string[] = [];
        let status: 'healthy' | 'warning' | 'error' = 'healthy';

        if (this.domains.size === 0) {
            recommendations.push('No domains registered - system cannot perform adaptations');
            status = 'warning';
        }

        if (this.domains.size > 0 && this.domain_distances.size === 0) {
            recommendations.push('Consider pre-computing domain distances for better performance');
        }

        if (this.domains.size > 100) {
            recommendations.push('Large number of domains - consider implementing domain clustering');
            status = 'warning';
        }

        return {
            registered_domains: this.domains.size,
            cached_distances: this.domain_distances.size,
            cached_similarities: this.similarity_cache.size,
            cached_alignments: this.feature_alignments.size,
            cached_transformations: this.transformations.size,
            system_status: status,
            recommendations
        };
    }
} 