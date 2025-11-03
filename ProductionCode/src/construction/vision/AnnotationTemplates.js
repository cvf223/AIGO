/**
 * 🎨 ANNOTATION TEMPLATES - Professional Annotation Presets
 * =========================================================
 * 
 * Predefined templates for different use cases:
 * - Monitoring: Technical details for system monitoring
 * - Investor: Clean, impressive for presentations
 * - Detailed: Everything visible for analysis
 * 
 * @author Elite Construction AI Syndicate
 * @version 1.0.0
 */

export const AnnotationTemplates = {
    /**
     * 🔍 MONITORING TEMPLATE - Technical Details
     */
    monitoring: {
        name: 'Monitoring Template',
        description: 'Technical details for system monitoring and debugging',
        
        // Layer visibility
        showConfidenceScores: true,
        showBoundingBoxes: true,
        showCalculations: true,
        showReasoningSteps: true,
        showThinkingProcess: false,     // Hide for cleaner view
        showErrors: true,
        showCompliance: true,
        showLegend: true,
        
        // Styling
        colorScheme: 'technical',
        fontSize: 'small',
        opacity: 0.7,
        
        // Export settings
        includeCompanyBranding: false,
        qualityLevel: 'standard',
        dpi: 150
    },
    
    /**
     * 💼 INVESTOR PRESENTATION TEMPLATE - Clean & Impressive
     */
    investorPresentation: {
        name: 'Investor Presentation',
        description: 'Clean, professional annotations for investor demonstrations',
        
        // Layer visibility
        showConfidenceScores: false,    // Hide technical details
        showBoundingBoxes: true,
        showCalculations: true,
        showReasoningSteps: true,
        showThinkingProcess: true,      // Show AI intelligence
        showErrors: false,              // Hide errors from investors
        showCompliance: true,
        showLegend: true,
        
        // Styling
        colorScheme: 'professional',
        fontSize: 'large',
        opacity: 0.85,
        
        // Export settings
        includeCompanyBranding: true,   // Add company logo
        qualityLevel: 'maximum',
        dpi: 300,                       // High resolution
        
        // Presentation features
        addExecutiveSummary: true,
        addPerformanceMetrics: true,
        highlightAICapabilities: true
    },
    
    /**
     * 📊 DETAILED ANALYSIS TEMPLATE - Everything Visible
     */
    detailedAnalysis: {
        name: 'Detailed Analysis',
        description: 'Complete transparency with all annotation layers visible',
        
        // Layer visibility
        showConfidenceScores: true,
        showBoundingBoxes: true,
        showCalculations: true,
        showReasoningSteps: true,
        showThinkingProcess: true,
        showErrors: true,
        showCompliance: true,
        showLegend: true,
        showAlternatives: true,         // Show alternative interpretations
        showUncertainties: true,        // Show uncertainty quantification
        
        // Styling
        colorScheme: 'detailed',
        fontSize: 'medium',
        opacity: 0.75,
        
        // Export settings
        includeCompanyBranding: false,
        qualityLevel: 'high',
        dpi: 200,
        
        // Analysis features
        showDebugInfo: true,
        showPerformanceMetrics: true,
        showModelVersions: true
    },
    
    /**
     * 🎓 TRAINING TEMPLATE - Educational
     */
    training: {
        name: 'Training Template',
        description: 'Educational annotations for training purposes',
        
        // Layer visibility
        showConfidenceScores: true,
        showBoundingBoxes: true,
        showCalculations: true,
        showReasoningSteps: true,
        showThinkingProcess: true,
        showErrors: true,
        showCompliance: true,
        showLegend: true,
        
        // Additional educational features
        showExplanations: true,
        showExamples: true,
        showReferences: true,
        
        // Styling
        colorScheme: 'educational',
        fontSize: 'medium',
        opacity: 0.8,
        
        // Export settings
        includeCompanyBranding: false,
        qualityLevel: 'standard',
        dpi: 150
    }
};

/**
 * Get template by name
 */
export function getTemplate(templateName) {
    return AnnotationTemplates[templateName] || AnnotationTemplates.detailedAnalysis;
}

/**
 * Get all available templates
 */
export function getAllTemplates() {
    return Object.keys(AnnotationTemplates).map(key => ({
        id: key,
        ...AnnotationTemplates[key]
    }));
}

/**
 * Create custom template
 */
export function createCustomTemplate(baseTemplate, overrides) {
    const base = getTemplate(baseTemplate);
    return {
        ...base,
        ...overrides,
        name: 'Custom Template',
        description: 'User-defined custom template'
    };
}

export default AnnotationTemplates;

