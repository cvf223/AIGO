/**
 * Adaptive Meta-Learning and Few-Shot Intelligence Engine - Part 2B
 * Basic Few-Shot Learning Coordinator
 * 
 * Elite meta-learning system for rapid adaptation and few-shot learning
 * Designed for top 1% AI and blockchain developer capabilities
 * 
 * Part 2B Features:
 * - Basic few-shot learning task coordination
 * - Support/query set management
 * - Simple episode generation
 * - Task sampling strategies
 * - Basic similarity computation
 */

import { 
  MetaLearningTask, 
  DataPoint,
  TaskType,
  FewShotLearningConfig
} from './adaptive-meta-learning-engine-part1';

export interface FewShotEpisode {
  episodeId: string;
  nWay: number;
  kShot: number;
  querySize: number;
  supportSet: ClassifiedDataPoint[];
  querySet: ClassifiedDataPoint[];
  classes: string[];
  difficulty: number;
  timestamp: Date;
}

export interface ClassifiedDataPoint extends DataPoint {
  classLabel: string;
  classIndex: number;
  confidence: number;
  isSupport: boolean;
}

export interface FewShotTask {
  taskId: string;
  episodes: FewShotEpisode[];
  totalClasses: number;
  averageDifficulty: number;
  domainType: string;
  adaptationTarget: string;
}

export interface SimilarityMetric {
  metricId: string;
  type: 'euclidean' | 'cosine' | 'manhattan' | 'learned' | 'adaptive';
  parameters: Map<string, number>;
  effectiveness: number;
  computationCost: number;
}

export interface TaskSampler {
  samplerId: string;
  strategy: 'random' | 'balanced' | 'curriculum' | 'difficulty_based' | 'similarity_based';
  parameters: SamplerParameters;
  performance: SamplerPerformance;
}

export interface SamplerParameters {
  batchSize: number;
  balanceRatio: number;
  difficultyProgression: number;
  similarityThreshold: number;
  diversityWeight: number;
}

export interface SamplerPerformance {
  episodesGenerated: number;
  averageQuality: number;
  diversityScore: number;
  balanceScore: number;
  efficiencyMetric: number;
}

export interface FewShotMetrics {
  totalEpisodes: number;
  averageAccuracy: number;
  adaptationSpeed: number;
  generalizationScore: number;
  supportSetUtilization: number;
  querySetPerformance: number;
}

export interface ClassPrototype {
  classLabel: string;
  classIndex: number;
  prototype: number[];
  supportExamples: DataPoint[];
  confidence: number;
  stability: number;
  updateCount: number;
}

/**
 * Basic Few-Shot Learning Coordinator - Part 2B
 * Handles few-shot learning task coordination and episode management
 */
export class BasicFewShotCoordinator {
  private fewShotTasks: Map<string, FewShotTask> = new Map();
  private activeEpisodes: Map<string, FewShotEpisode> = new Map();
  private similarityMetrics: Map<string, SimilarityMetric> = new Map();
  private taskSamplers: Map<string, TaskSampler> = new Map();
  
  private classPrototypes: Map<string, ClassPrototype> = new Map();
  private performanceMetrics: FewShotMetrics;
  private totalEpisodes: number = 0;

  constructor() {
    this.performanceMetrics = this.initializeMetrics();
    this.initializeSimilarityMetrics();
    this.initializeTaskSamplers();
    
    console.log('🎯 Basic Few-Shot Coordinator initialized');
  }

  /**
   * Create a new few-shot learning episode
   */
  async createFewShotEpisode(
    agentId: string,
    config: FewShotLearningConfig,
    availableData: DataPoint[],
    domainType: string
  ): Promise<FewShotEpisode> {
    console.log(`🎯 Creating ${config.nWay}-way ${config.kShot}-shot episode for agent ${agentId}...`);

    // Sample classes for this episode
    const selectedClasses = await this.sampleClasses(availableData, config.nWay);
    
    // Create support set
    const supportSet = await this.createSupportSet(availableData, selectedClasses, config.kShot);
    
    // Create query set
    const querySet = await this.createQuerySet(availableData, selectedClasses, config.querySize);
    
    const episode: FewShotEpisode = {
      episodeId: this.generateEpisodeId(),
      nWay: config.nWay,
      kShot: config.kShot,
      querySize: config.querySize,
      supportSet,
      querySet,
      classes: selectedClasses,
      difficulty: this.calculateEpisodeDifficulty(supportSet, querySet),
      timestamp: new Date()
    };

    this.activeEpisodes.set(episode.episodeId, episode);
    this.totalEpisodes++;

    console.log(`✅ Few-shot episode created: ${episode.episodeId} (difficulty: ${episode.difficulty.toFixed(2)})`);
    return episode;
  }

  /**
   * Generate multiple few-shot episodes for training
   */
  async generateFewShotBatch(
    agentId: string,
    config: FewShotLearningConfig,
    batchSize: number,
    availableData: DataPoint[],
    domainType: string
  ): Promise<FewShotEpisode[]> {
    console.log(`📦 Generating batch of ${batchSize} few-shot episodes...`);

    const episodes: FewShotEpisode[] = [];
    
    for (let i = 0; i < batchSize; i++) {
      const episode = await this.createFewShotEpisode(agentId, config, availableData, domainType);
      episodes.push(episode);
    }

    // Update performance metrics
    this.updatePerformanceMetrics(episodes);

    console.log(`✅ Generated ${episodes.length} few-shot episodes`);
    return episodes;
  }

  /**
   * Compute similarity between data points using selected metric
   */
  async computeSimilarity(
    dataPoint1: DataPoint,
    dataPoint2: DataPoint,
    metricType: string = 'euclidean'
  ): Promise<number> {
    const metric = this.similarityMetrics.get(metricType);
    if (!metric) {
      console.warn(`Unknown similarity metric: ${metricType}, using euclidean`);
      return this.computeEuclideanSimilarity(dataPoint1, dataPoint2);
    }

    switch (metric.type) {
      case 'euclidean':
        return this.computeEuclideanSimilarity(dataPoint1, dataPoint2);
      case 'cosine':
        return this.computeCosineSimilarity(dataPoint1, dataPoint2);
      case 'manhattan':
        return this.computeManhattanSimilarity(dataPoint1, dataPoint2);
      default:
        return this.computeEuclideanSimilarity(dataPoint1, dataPoint2);
    }
  }

  /**
   * Create and update class prototypes from support examples
   */
  async createClassPrototypes(
    supportSet: ClassifiedDataPoint[]
  ): Promise<Map<string, ClassPrototype>> {
    console.log(`🎨 Creating class prototypes from ${supportSet.length} support examples...`);

    const prototypes = new Map<string, ClassPrototype>();
    
    // Group support examples by class
    const classSets = this.groupByClass(supportSet);
    
    for (const [classLabel, examples] of classSets.entries()) {
      const prototype = await this.computeClassPrototype(classLabel, examples);
      prototypes.set(classLabel, prototype);
      
      // Update global prototype tracking
      this.classPrototypes.set(classLabel, prototype);
    }

    console.log(`✅ Created ${prototypes.size} class prototypes`);
    return prototypes;
  }

  /**
   * Evaluate episode performance using prototypical classification
   */
  async evaluateEpisodePerformance(
    episode: FewShotEpisode,
    prototypes: Map<string, ClassPrototype>
  ): Promise<EpisodeEvaluation> {
    console.log(`📊 Evaluating episode ${episode.episodeId} performance...`);

    let correctPredictions = 0;
    const predictions: ClassificationPrediction[] = [];
    
    for (const queryPoint of episode.querySet) {
      const prediction = await this.classifyQueryPoint(queryPoint, prototypes);
      predictions.push(prediction);
      
      if (prediction.predictedClass === queryPoint.classLabel) {
        correctPredictions++;
      }
    }

    const accuracy = correctPredictions / episode.querySet.length;
    const confidence = predictions.reduce((sum, p) => sum + p.confidence, 0) / predictions.length;
    
    const evaluation: EpisodeEvaluation = {
      episodeId: episode.episodeId,
      accuracy,
      confidence,
      correctPredictions,
      totalPredictions: episode.querySet.length,
      predictions,
      timestamp: new Date()
    };

    console.log(`✅ Episode evaluation completed - Accuracy: ${(accuracy * 100).toFixed(1)}%`);
    return evaluation;
  }

  /**
   * Sample optimal tasks using curriculum learning strategy
   */
  async sampleOptimalTasks(
    availableData: DataPoint[],
    currentDifficulty: number,
    numTasks: number,
    strategy: string = 'curriculum'
  ): Promise<DataPoint[][]> {
    console.log(`🎲 Sampling ${numTasks} optimal tasks using ${strategy} strategy...`);

    const sampler = this.taskSamplers.get(strategy) || this.taskSamplers.get('random')!;
    const taskSets: DataPoint[][] = [];

    for (let i = 0; i < numTasks; i++) {
      const taskData = await this.sampleTaskData(availableData, sampler, currentDifficulty);
      taskSets.push(taskData);
    }

    // Update sampler performance
    await this.updateSamplerPerformance(strategy, taskSets);

    console.log(`✅ Sampled ${taskSets.length} optimal tasks`);
    return taskSets;
  }

  /**
   * Get comprehensive few-shot system status
   */
  public getFewShotStatus(): FewShotStatus {
    return {
      totalEpisodes: this.totalEpisodes,
      activeEpisodes: this.activeEpisodes.size,
      availableMetrics: this.similarityMetrics.size,
      taskSamplers: this.taskSamplers.size,
      classPrototypes: this.classPrototypes.size,
      currentMetrics: this.performanceMetrics,
      systemHealth: this.performanceMetrics.averageAccuracy > 0.7 ? 'fewshot_elite' : 'fewshot_active'
    };
  }

  // Private implementation methods

  private initializeMetrics(): FewShotMetrics {
    return {
      totalEpisodes: 0,
      averageAccuracy: 0,
      adaptationSpeed: 0,
      generalizationScore: 0,
      supportSetUtilization: 0,
      querySetPerformance: 0
    };
  }

  private initializeSimilarityMetrics(): void {
    // Initialize basic similarity metrics
    const euclidean: SimilarityMetric = {
      metricId: 'euclidean_basic',
      type: 'euclidean',
      parameters: new Map([['normalized', 1]]),
      effectiveness: 0.7,
      computationCost: 0.1
    };

    const cosine: SimilarityMetric = {
      metricId: 'cosine_basic',
      type: 'cosine',
      parameters: new Map([['normalized', 1]]),
      effectiveness: 0.8,
      computationCost: 0.2
    };

    this.similarityMetrics.set('euclidean', euclidean);
    this.similarityMetrics.set('cosine', cosine);
  }

  private initializeTaskSamplers(): void {
    // Initialize basic task samplers
    const randomSampler: TaskSampler = {
      samplerId: 'random_sampler',
      strategy: 'random',
      parameters: {
        batchSize: 16,
        balanceRatio: 1.0,
        difficultyProgression: 0.1,
        similarityThreshold: 0.5,
        diversityWeight: 0.5
      },
      performance: {
        episodesGenerated: 0,
        averageQuality: 0.5,
        diversityScore: 0.8,
        balanceScore: 0.5,
        efficiencyMetric: 0.9
      }
    };

    const curriculumSampler: TaskSampler = {
      samplerId: 'curriculum_sampler',
      strategy: 'curriculum',
      parameters: {
        batchSize: 16,
        balanceRatio: 0.8,
        difficultyProgression: 0.2,
        similarityThreshold: 0.7,
        diversityWeight: 0.6
      },
      performance: {
        episodesGenerated: 0,
        averageQuality: 0.7,
        diversityScore: 0.6,
        balanceScore: 0.8,
        efficiencyMetric: 0.7
      }
    };

    this.taskSamplers.set('random', randomSampler);
    this.taskSamplers.set('curriculum', curriculumSampler);
  }

  private async sampleClasses(data: DataPoint[], nWay: number): Promise<string[]> {
    // Extract unique classes from data
    const allClasses = [...new Set(data.map(dp => this.extractClassLabel(dp)))];
    
    // Randomly sample nWay classes
    const shuffled = allClasses.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, nWay);
  }

  private async createSupportSet(
    data: DataPoint[],
    classes: string[],
    kShot: number
  ): Promise<ClassifiedDataPoint[]> {
    const supportSet: ClassifiedDataPoint[] = [];
    
    for (let i = 0; i < classes.length; i++) {
      const classLabel = classes[i];
      const classData = data.filter(dp => this.extractClassLabel(dp) === classLabel);
      
      // Sample kShot examples for this class
      const shuffled = classData.sort(() => Math.random() - 0.5);
      const sampled = shuffled.slice(0, kShot);
      
      sampled.forEach(dp => {
        supportSet.push({
          ...dp,
          classLabel,
          classIndex: i,
          confidence: 1.0, // Support examples have high confidence
          isSupport: true
        });
      });
    }
    
    return supportSet;
  }

  private async createQuerySet(
    data: DataPoint[],
    classes: string[],
    querySize: number
  ): Promise<ClassifiedDataPoint[]> {
    const querySet: ClassifiedDataPoint[] = [];
    const queriesPerClass = Math.floor(querySize / classes.length);
    
    for (let i = 0; i < classes.length; i++) {
      const classLabel = classes[i];
      const classData = data.filter(dp => this.extractClassLabel(dp) === classLabel);
      
      // Sample query examples for this class
      const shuffled = classData.sort(() => Math.random() - 0.5);
      const sampled = shuffled.slice(0, queriesPerClass);
      
      sampled.forEach(dp => {
        querySet.push({
          ...dp,
          classLabel,
          classIndex: i,
          confidence: 0.5, // Query examples start with neutral confidence
          isSupport: false
        });
      });
    }
    
    return querySet;
  }

  private calculateEpisodeDifficulty(
    supportSet: ClassifiedDataPoint[],
    querySet: ClassifiedDataPoint[]
  ): number {
    // Simple difficulty calculation based on data distribution
    const supportDiversity = this.calculateDataDiversity(supportSet);
    const queryDiversity = this.calculateDataDiversity(querySet);
    
    return (supportDiversity + queryDiversity) / 2;
  }

  private calculateDataDiversity(dataPoints: ClassifiedDataPoint[]): number {
    // Simplified diversity calculation
    const uniqueClasses = new Set(dataPoints.map(dp => dp.classLabel)).size;
    const totalPoints = dataPoints.length;
    
    return uniqueClasses / Math.max(totalPoints, 1);
  }

  private extractClassLabel(dataPoint: DataPoint): string {
    // Simple class label extraction
    if (typeof dataPoint.output === 'string') {
      return dataPoint.output;
    }
    
    if (typeof dataPoint.output === 'number') {
      return `class_${dataPoint.output}`;
    }
    
    return 'unknown_class';
  }

  private computeEuclideanSimilarity(dp1: DataPoint, dp2: DataPoint): number {
    const vec1 = this.vectorizeDataPoint(dp1);
    const vec2 = this.vectorizeDataPoint(dp2);
    
    let sum = 0;
    const minLength = Math.min(vec1.length, vec2.length);
    
    for (let i = 0; i < minLength; i++) {
      sum += Math.pow(vec1[i] - vec2[i], 2);
    }
    
    const distance = Math.sqrt(sum);
    return 1 / (1 + distance); // Convert distance to similarity
  }

  private computeCosineSimilarity(dp1: DataPoint, dp2: DataPoint): number {
    const vec1 = this.vectorizeDataPoint(dp1);
    const vec2 = this.vectorizeDataPoint(dp2);
    
    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;
    const minLength = Math.min(vec1.length, vec2.length);
    
    for (let i = 0; i < minLength; i++) {
      dotProduct += vec1[i] * vec2[i];
      norm1 += vec1[i] * vec1[i];
      norm2 += vec2[i] * vec2[i];
    }
    
    const denominator = Math.sqrt(norm1) * Math.sqrt(norm2);
    return denominator === 0 ? 0 : dotProduct / denominator;
  }

  private computeManhattanSimilarity(dp1: DataPoint, dp2: DataPoint): number {
    const vec1 = this.vectorizeDataPoint(dp1);
    const vec2 = this.vectorizeDataPoint(dp2);
    
    let sum = 0;
    const minLength = Math.min(vec1.length, vec2.length);
    
    for (let i = 0; i < minLength; i++) {
      sum += Math.abs(vec1[i] - vec2[i]);
    }
    
    return 1 / (1 + sum); // Convert distance to similarity
  }

  private vectorizeDataPoint(dataPoint: DataPoint): number[] {
    // Simple vectorization of data point
    if (Array.isArray(dataPoint.input)) {
      return dataPoint.input.map(x => typeof x === 'number' ? x : 0);
    }
    
    if (typeof dataPoint.input === 'number') {
      return [dataPoint.input];
    }
    
    if (typeof dataPoint.input === 'object' && dataPoint.input !== null) {
      return [Object.keys(dataPoint.input).length]; // Object size as feature
    }
    
    return [0]; // Default fallback
  }

  private groupByClass(dataPoints: ClassifiedDataPoint[]): Map<string, ClassifiedDataPoint[]> {
    const groups = new Map<string, ClassifiedDataPoint[]>();
    
    for (const dp of dataPoints) {
      if (!groups.has(dp.classLabel)) {
        groups.set(dp.classLabel, []);
      }
      groups.get(dp.classLabel)!.push(dp);
    }
    
    return groups;
  }

  private async computeClassPrototype(
    classLabel: string,
    examples: ClassifiedDataPoint[]
  ): Promise<ClassPrototype> {
    // Compute centroid of class examples
    const vectors = examples.map(ex => this.vectorizeDataPoint(ex));
    const dimensions = vectors[0]?.length || 1;
    const prototype = new Array(dimensions).fill(0);
    
    // Average all vectors
    for (const vector of vectors) {
      for (let i = 0; i < Math.min(dimensions, vector.length); i++) {
        prototype[i] += vector[i];
      }
    }
    
    // Normalize by number of examples
    for (let i = 0; i < dimensions; i++) {
      prototype[i] /= vectors.length;
    }
    
    return {
      classLabel,
      classIndex: examples[0]?.classIndex || 0,
      prototype,
      supportExamples: examples,
      confidence: examples.reduce((sum, ex) => sum + ex.confidence, 0) / examples.length,
      stability: this.calculatePrototypeStability(vectors),
      updateCount: 1
    };
  }

  private calculatePrototypeStability(vectors: number[][]): number {
    if (vectors.length < 2) return 1.0;
    
    // Calculate variance across vectors as stability measure
    const dimensions = vectors[0].length;
    let totalVariance = 0;
    
    for (let d = 0; d < dimensions; d++) {
      const values = vectors.map(v => v[d] || 0);
      const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
      const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
      totalVariance += variance;
    }
    
    return 1 / (1 + totalVariance); // Lower variance = higher stability
  }

  private async classifyQueryPoint(
    queryPoint: ClassifiedDataPoint,
    prototypes: Map<string, ClassPrototype>
  ): Promise<ClassificationPrediction> {
    const queryVector = this.vectorizeDataPoint(queryPoint);
    let bestClass = '';
    let maxSimilarity = -1;
    const classScores = new Map<string, number>();
    
    // Compare with all prototypes
    for (const [classLabel, prototype] of prototypes.entries()) {
      const similarity = this.computeVectorSimilarity(queryVector, prototype.prototype);
      classScores.set(classLabel, similarity);
      
      if (similarity > maxSimilarity) {
        maxSimilarity = similarity;
        bestClass = classLabel;
      }
    }
    
    return {
      queryPointId: queryPoint.id,
      trueClass: queryPoint.classLabel,
      predictedClass: bestClass,
      confidence: maxSimilarity,
      classScores,
      timestamp: new Date()
    };
  }

  private computeVectorSimilarity(vec1: number[], vec2: number[]): number {
    return this.computeEuclideanSimilarityVectors(vec1, vec2);
  }

  private computeEuclideanSimilarityVectors(vec1: number[], vec2: number[]): number {
    let sum = 0;
    const minLength = Math.min(vec1.length, vec2.length);
    
    for (let i = 0; i < minLength; i++) {
      sum += Math.pow(vec1[i] - vec2[i], 2);
    }
    
    const distance = Math.sqrt(sum);
    return 1 / (1 + distance);
  }

  private async sampleTaskData(
    availableData: DataPoint[],
    sampler: TaskSampler,
    currentDifficulty: number
  ): Promise<DataPoint[]> {
    // Simple task data sampling based on strategy
    const shuffled = [...availableData].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, sampler.parameters.batchSize);
  }

  private async updateSamplerPerformance(strategy: string, taskSets: DataPoint[][]): Promise<void> {
    const sampler = this.taskSamplers.get(strategy);
    if (sampler) {
      sampler.performance.episodesGenerated += taskSets.length;
      sampler.performance.averageQuality = this.calculateTaskSetQuality(taskSets);
    }
  }

  private calculateTaskSetQuality(taskSets: DataPoint[][]): number {
    // Simplified quality calculation
    return taskSets.reduce((sum, set) => sum + set.length, 0) / (taskSets.length * 16); // Normalized by expected size
  }

  private updatePerformanceMetrics(episodes: FewShotEpisode[]): void {
    this.performanceMetrics.totalEpisodes += episodes.length;
    
    // Update other metrics based on episodes
    const avgDifficulty = episodes.reduce((sum, ep) => sum + ep.difficulty, 0) / episodes.length;
    this.performanceMetrics.adaptationSpeed = 1 / (1 + avgDifficulty); // Inverse relationship
  }

  private generateEpisodeId(): string {
    return `fewshot_episode_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Supporting interfaces for Part 2B

interface EpisodeEvaluation {
  episodeId: string;
  accuracy: number;
  confidence: number;
  correctPredictions: number;
  totalPredictions: number;
  predictions: ClassificationPrediction[];
  timestamp: Date;
}

interface ClassificationPrediction {
  queryPointId: string;
  trueClass: string;
  predictedClass: string;
  confidence: number;
  classScores: Map<string, number>;
  timestamp: Date;
}

interface FewShotStatus {
  totalEpisodes: number;
  activeEpisodes: number;
  availableMetrics: number;
  taskSamplers: number;
  classPrototypes: number;
  currentMetrics: FewShotMetrics;
  systemHealth: 'fewshot_basic' | 'fewshot_active' | 'fewshot_elite';
}

// File ends here - Part 2B complete 