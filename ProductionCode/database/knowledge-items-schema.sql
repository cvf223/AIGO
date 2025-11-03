-- 🧠 COMPREHENSIVE KNOWLEDGE ACQUISITION SCHEMA
-- ===============================================
-- Database schema for storing ALL knowledge items from EVERY acquisition source
-- Supports sophisticated knowledge acquisition, validation, and retrieval

-- Main table for knowledge items from ALL sources
CREATE TABLE IF NOT EXISTS knowledge_items (
    id VARCHAR(255) PRIMARY KEY,
    
    -- Core classification
    type VARCHAR(100) NOT NULL, -- 'newsletter_insight', 'video_analysis', 'social_sentiment', 'price_verification', 'web_research', 'competitor_analysis', etc.
    source VARCHAR(100) NOT NULL, -- 'newsletter', 'youtube', 'twitter', 'telegram', 'discord', 'web_search', 'coingecko', 'moralis', etc.
    sub_source VARCHAR(100), -- Specific source details (e.g., 'finematics' for YouTube, 'defi_pulse' for newsletter)
    
    -- Content
    title VARCHAR(500) NOT NULL,
    content TEXT NOT NULL,
    key_points JSONB DEFAULT '[]', -- Array of key points extracted
    
    -- Quality metrics
    importance DECIMAL(3,2) NOT NULL DEFAULT 0.5, -- 0.0 to 1.0
    confidence DECIMAL(3,2) NOT NULL DEFAULT 0.5, -- 0.0 to 1.0
    relevance_score DECIMAL(3,2) DEFAULT 0.5, -- 0.0 to 1.0
    credibility_score DECIMAL(3,2) DEFAULT 0.5, -- 0.0 to 1.0
    
    -- Validation and cross-referencing
    validation_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'validated', 'cross_referenced', 'flagged', 'rejected'
    validation_sources JSONB DEFAULT '[]', -- Array of sources that validated this item
    cross_references JSONB DEFAULT '[]', -- Array of related knowledge item IDs
    
    -- Timestamps
    extraction_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    validation_timestamp TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Comprehensive metadata for ALL source types
    metadata JSONB DEFAULT '{}' -- Flexible metadata storage for source-specific data
);

-- Comprehensive indexes for ALL knowledge sources
CREATE INDEX IF NOT EXISTS idx_knowledge_items_type ON knowledge_items (type);
CREATE INDEX IF NOT EXISTS idx_knowledge_items_source ON knowledge_items (source);
CREATE INDEX IF NOT EXISTS idx_knowledge_items_sub_source ON knowledge_items (sub_source);
CREATE INDEX IF NOT EXISTS idx_knowledge_items_importance ON knowledge_items (importance DESC);
CREATE INDEX IF NOT EXISTS idx_knowledge_items_confidence ON knowledge_items (confidence DESC);
CREATE INDEX IF NOT EXISTS idx_knowledge_items_relevance ON knowledge_items (relevance_score DESC);
CREATE INDEX IF NOT EXISTS idx_knowledge_items_credibility ON knowledge_items (credibility_score DESC);
CREATE INDEX IF NOT EXISTS idx_knowledge_items_validation_status ON knowledge_items (validation_status);
CREATE INDEX IF NOT EXISTS idx_knowledge_items_timestamp ON knowledge_items (extraction_timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_knowledge_items_validation_timestamp ON knowledge_items (validation_timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_knowledge_items_content_search ON knowledge_items USING gin(to_tsvector('english', content));
CREATE INDEX IF NOT EXISTS idx_knowledge_items_metadata ON knowledge_items USING gin(metadata);
CREATE INDEX IF NOT EXISTS idx_knowledge_items_key_points ON knowledge_items USING gin(key_points);
CREATE INDEX IF NOT EXISTS idx_knowledge_items_validation_sources ON knowledge_items USING gin(validation_sources);
CREATE INDEX IF NOT EXISTS idx_knowledge_items_cross_references ON knowledge_items USING gin(cross_references);

-- Composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_knowledge_items_source_type ON knowledge_items (source, type);
CREATE INDEX IF NOT EXISTS idx_knowledge_items_high_quality ON knowledge_items (importance DESC, confidence DESC) WHERE importance > 0.7 AND confidence > 0.7;
CREATE INDEX IF NOT EXISTS idx_knowledge_items_recent_validated ON knowledge_items (validation_timestamp DESC) WHERE validation_status = 'validated';

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_knowledge_items_updated_at 
    BEFORE UPDATE ON knowledge_items 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- SOURCE-SPECIFIC TABLES FOR DETAILED DATA
-- ==========================================

-- Social sentiment tracking across platforms
CREATE TABLE IF NOT EXISTS social_sentiment_data (
    id SERIAL PRIMARY KEY,
    knowledge_item_id VARCHAR(255) REFERENCES knowledge_items(id) ON DELETE CASCADE,
    platform VARCHAR(50) NOT NULL, -- 'twitter', 'telegram', 'discord', 'reddit'
    sentiment_score DECIMAL(3,2) NOT NULL, -- -1.0 to 1.0 (negative to positive)
    volume VARCHAR(20) NOT NULL, -- 'low', 'medium', 'high'
    keywords JSONB DEFAULT '[]', -- Keywords that triggered this sentiment
    data_points INTEGER DEFAULT 0, -- Number of posts/messages analyzed
    engagement_metrics JSONB DEFAULT '{}', -- Platform-specific engagement data
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_social_sentiment_platform ON social_sentiment_data (platform);
CREATE INDEX IF NOT EXISTS idx_social_sentiment_score ON social_sentiment_data (sentiment_score);
CREATE INDEX IF NOT EXISTS idx_social_sentiment_timestamp ON social_sentiment_data (timestamp DESC);

-- Price verification results from multiple APIs
CREATE TABLE IF NOT EXISTS price_verification_data (
    id SERIAL PRIMARY KEY,
    knowledge_item_id VARCHAR(255) REFERENCES knowledge_items(id) ON DELETE CASCADE,
    api_source VARCHAR(50) NOT NULL, -- 'coingecko', 'coinmarketcap', 'moralis', 'birdeye'
    tokens JSONB NOT NULL, -- Array of tokens verified
    price_data JSONB NOT NULL, -- Actual price data from API
    verification_status VARCHAR(20) NOT NULL, -- 'verified', 'discrepancy', 'failed'
    confidence_level DECIMAL(3,2) NOT NULL, -- 0.0 to 1.0
    arbitrage_opportunities JSONB DEFAULT '[]', -- Detected opportunities
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_price_verification_api ON price_verification_data (api_source);
CREATE INDEX IF NOT EXISTS idx_price_verification_status ON price_verification_data (verification_status);
CREATE INDEX IF NOT EXISTS idx_price_verification_tokens ON price_verification_data USING gin(tokens);
CREATE INDEX IF NOT EXISTS idx_price_verification_timestamp ON price_verification_data (timestamp DESC);

-- Web search and research results
CREATE TABLE IF NOT EXISTS web_search_data (
    id SERIAL PRIMARY KEY,
    knowledge_item_id VARCHAR(255) REFERENCES knowledge_items(id) ON DELETE CASCADE,
    search_api VARCHAR(50) NOT NULL, -- 'google_search', 'tavily', 'puppeteer_scrape'
    search_query TEXT NOT NULL,
    results_count INTEGER DEFAULT 0,
    top_results JSONB DEFAULT '[]', -- Top search results with URLs and snippets
    sentiment_analysis JSONB DEFAULT '{}', -- Sentiment analysis of results
    credibility_scores JSONB DEFAULT '[]', -- Per-result credibility scores
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_web_search_api ON web_search_data (search_api);
CREATE INDEX IF NOT EXISTS idx_web_search_query ON web_search_data USING gin(to_tsvector('english', search_query));
CREATE INDEX IF NOT EXISTS idx_web_search_timestamp ON web_search_data (timestamp DESC);

-- Competitor analysis and market intelligence
CREATE TABLE IF NOT EXISTS competitor_analysis_data (
    id SERIAL PRIMARY KEY,
    knowledge_item_id VARCHAR(255) REFERENCES knowledge_items(id) ON DELETE CASCADE,
    competitor_type VARCHAR(50) NOT NULL, -- 'arbitrage_bot', 'mev_searcher', 'trading_firm', 'protocol'
    competitor_id VARCHAR(100), -- Identifier for the competitor
    analysis_type VARCHAR(50) NOT NULL, -- 'strategy', 'performance', 'opportunity', 'threat'
    findings JSONB NOT NULL, -- Detailed analysis findings
    impact_assessment JSONB DEFAULT '{}', -- Impact on our operations
    recommended_actions JSONB DEFAULT '[]', -- Suggested responses
    confidence_level DECIMAL(3,2) NOT NULL, -- 0.0 to 1.0
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_competitor_analysis_type ON competitor_analysis_data (competitor_type);
CREATE INDEX IF NOT EXISTS idx_competitor_analysis_analysis ON competitor_analysis_data (analysis_type);
CREATE INDEX IF NOT EXISTS idx_competitor_analysis_confidence ON competitor_analysis_data (confidence_level DESC);
CREATE INDEX IF NOT EXISTS idx_competitor_analysis_timestamp ON competitor_analysis_data (timestamp DESC);

-- Cross-validation tracking between sources
CREATE TABLE IF NOT EXISTS cross_validation_results (
    id SERIAL PRIMARY KEY,
    primary_knowledge_item_id VARCHAR(255) REFERENCES knowledge_items(id) ON DELETE CASCADE,
    validating_knowledge_item_id VARCHAR(255) REFERENCES knowledge_items(id) ON DELETE CASCADE,
    validation_type VARCHAR(50) NOT NULL, -- 'confirms', 'contradicts', 'supplements', 'questions'
    agreement_score DECIMAL(3,2) NOT NULL, -- 0.0 to 1.0 (how much they agree)
    validation_details JSONB DEFAULT '{}', -- Detailed validation analysis
    automated_validation BOOLEAN DEFAULT true, -- Whether this was automated or manual
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_cross_validation_primary ON cross_validation_results (primary_knowledge_item_id);
CREATE INDEX IF NOT EXISTS idx_cross_validation_validating ON cross_validation_results (validating_knowledge_item_id);
CREATE INDEX IF NOT EXISTS idx_cross_validation_type ON cross_validation_results (validation_type);
CREATE INDEX IF NOT EXISTS idx_cross_validation_score ON cross_validation_results (agreement_score DESC);

-- Source reliability tracking over time
CREATE TABLE IF NOT EXISTS source_reliability_tracking (
    id SERIAL PRIMARY KEY,
    source VARCHAR(100) NOT NULL,
    sub_source VARCHAR(100),
    reliability_score DECIMAL(3,2) NOT NULL, -- 0.0 to 1.0
    total_items INTEGER DEFAULT 0,
    validated_items INTEGER DEFAULT 0,
    contradicted_items INTEGER DEFAULT 0,
    flagged_items INTEGER DEFAULT 0,
    red_flag_status BOOLEAN DEFAULT false, -- Sources marked as unreliable
    last_assessment TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    assessment_history JSONB DEFAULT '[]' -- Historical reliability scores
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_source_reliability_unique ON source_reliability_tracking (source, COALESCE(sub_source, ''));
CREATE INDEX IF NOT EXISTS idx_source_reliability_score ON source_reliability_tracking (reliability_score DESC);
CREATE INDEX IF NOT EXISTS idx_source_reliability_red_flag ON source_reliability_tracking (red_flag_status, reliability_score DESC);

-- ==========================================
-- COMPREHENSIVE VIEWS FOR ALL KNOWLEDGE SOURCES
-- ==========================================

-- View for high-importance knowledge items (all sources)
CREATE OR REPLACE VIEW high_importance_knowledge AS
SELECT 
    id,
    type,
    source,
    sub_source,
    title,
    content,
    key_points,
    importance,
    confidence,
    relevance_score,
    credibility_score,
    validation_status,
    extraction_timestamp,
    validation_timestamp,
    metadata
FROM knowledge_items 
WHERE importance > 0.7 AND confidence > 0.6
ORDER BY importance DESC, confidence DESC, extraction_timestamp DESC;

-- View for recent knowledge items (all sources)
CREATE OR REPLACE VIEW recent_knowledge AS
SELECT 
    id,
    type,
    source,
    sub_source,
    title,
    content,
    key_points,
    importance,
    confidence,
    relevance_score,
    credibility_score,
    validation_status,
    extraction_timestamp,
    validation_timestamp,
    metadata
FROM knowledge_items 
WHERE extraction_timestamp > NOW() - INTERVAL '7 days'
ORDER BY extraction_timestamp DESC;

-- View for validated knowledge items
CREATE OR REPLACE VIEW validated_knowledge AS
SELECT 
    ki.*,
    COUNT(cvr.id) as validation_count,
    AVG(cvr.agreement_score) as avg_agreement_score
FROM knowledge_items ki
LEFT JOIN cross_validation_results cvr ON ki.id = cvr.primary_knowledge_item_id
WHERE ki.validation_status = 'validated'
GROUP BY ki.id
ORDER BY ki.importance DESC, avg_agreement_score DESC;

-- View for social sentiment summary
CREATE OR REPLACE VIEW social_sentiment_summary AS
SELECT 
    ki.id,
    ki.title,
    ki.source,
    ki.extraction_timestamp,
    COUNT(ssd.id) as platform_count,
    AVG(ssd.sentiment_score) as avg_sentiment,
    SUM(ssd.data_points) as total_data_points,
    JSON_AGG(
        JSON_BUILD_OBJECT(
            'platform', ssd.platform,
            'sentiment', ssd.sentiment_score,
            'volume', ssd.volume,
            'data_points', ssd.data_points
        )
    ) as platform_sentiments
FROM knowledge_items ki
JOIN social_sentiment_data ssd ON ki.id = ssd.knowledge_item_id
WHERE ki.type = 'social_sentiment'
GROUP BY ki.id, ki.title, ki.source, ki.extraction_timestamp
ORDER BY ki.extraction_timestamp DESC;

-- View for price verification summary
CREATE OR REPLACE VIEW price_verification_summary AS
SELECT 
    ki.id,
    ki.title,
    ki.extraction_timestamp,
    COUNT(pvd.id) as api_count,
    COUNT(pvd.id) FILTER (WHERE pvd.verification_status = 'verified') as verified_count,
    COUNT(pvd.id) FILTER (WHERE pvd.verification_status = 'discrepancy') as discrepancy_count,
    AVG(pvd.confidence_level) as avg_confidence,
    JSON_AGG(
        JSON_BUILD_OBJECT(
            'api', pvd.api_source,
            'status', pvd.verification_status,
            'confidence', pvd.confidence_level,
            'tokens', pvd.tokens
        )
    ) as verification_details
FROM knowledge_items ki
JOIN price_verification_data pvd ON ki.id = pvd.knowledge_item_id
WHERE ki.type = 'price_verification'
GROUP BY ki.id, ki.title, ki.extraction_timestamp
ORDER BY ki.extraction_timestamp DESC;

-- View for source reliability dashboard
CREATE OR REPLACE VIEW source_reliability_dashboard AS
SELECT 
    srt.source,
    srt.sub_source,
    srt.reliability_score,
    srt.total_items,
    srt.validated_items,
    srt.contradicted_items,
    srt.flagged_items,
    srt.red_flag_status,
    srt.last_assessment,
    CASE 
        WHEN srt.total_items > 0 THEN (srt.validated_items::DECIMAL / srt.total_items)
        ELSE 0 
    END as validation_rate,
    CASE 
        WHEN srt.total_items > 0 THEN (srt.contradicted_items::DECIMAL / srt.total_items)
        ELSE 0 
    END as contradiction_rate
FROM source_reliability_tracking srt
ORDER BY srt.reliability_score DESC, srt.total_items DESC;

-- ==========================================
-- COMPREHENSIVE FUNCTIONS FOR ALL KNOWLEDGE SOURCES
-- ==========================================

-- Enhanced function to search knowledge items across ALL sources
CREATE OR REPLACE FUNCTION search_knowledge_items(search_term TEXT, source_filter TEXT DEFAULT NULL)
RETURNS TABLE(
    id VARCHAR(255),
    type VARCHAR(100),
    source VARCHAR(100),
    sub_source VARCHAR(100),
    title VARCHAR(500),
    content TEXT,
    importance DECIMAL(3,2),
    confidence DECIMAL(3,2),
    relevance_score DECIMAL(3,2),
    credibility_score DECIMAL(3,2),
    validation_status VARCHAR(50),
    rank REAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ki.id,
        ki.type,
        ki.source,
        ki.sub_source,
        ki.title,
        ki.content,
        ki.importance,
        ki.confidence,
        ki.relevance_score,
        ki.credibility_score,
        ki.validation_status,
        ts_rank(to_tsvector('english', ki.content || ' ' || ki.title), plainto_tsquery('english', search_term)) as rank
    FROM knowledge_items ki
    WHERE to_tsvector('english', ki.content || ' ' || ki.title) @@ plainto_tsquery('english', search_term)
    AND (source_filter IS NULL OR ki.source = source_filter)
    ORDER BY rank DESC, ki.importance DESC, ki.confidence DESC
    LIMIT 100;
END;
$$ LANGUAGE plpgsql;

-- Comprehensive function to get knowledge statistics across ALL sources
CREATE OR REPLACE FUNCTION get_comprehensive_knowledge_stats()
RETURNS TABLE(
    total_items BIGINT,
    newsletter_items BIGINT,
    youtube_items BIGINT,
    social_sentiment_items BIGINT,
    price_verification_items BIGINT,
    web_search_items BIGINT,
    competitor_analysis_items BIGINT,
    twitter_items BIGINT,
    telegram_items BIGINT,
    discord_items BIGINT,
    high_importance_items BIGINT,
    recent_items BIGINT,
    validated_items BIGINT,
    cross_referenced_items BIGINT,
    red_flagged_sources BIGINT,
    avg_importance DECIMAL(3,2),
    avg_confidence DECIMAL(3,2),
    avg_relevance DECIMAL(3,2),
    avg_credibility DECIMAL(3,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_items,
        COUNT(*) FILTER (WHERE source = 'newsletter') as newsletter_items,
        COUNT(*) FILTER (WHERE source = 'youtube') as youtube_items,
        COUNT(*) FILTER (WHERE type = 'social_sentiment') as social_sentiment_items,
        COUNT(*) FILTER (WHERE type = 'price_verification') as price_verification_items,
        COUNT(*) FILTER (WHERE type = 'web_research') as web_search_items,
        COUNT(*) FILTER (WHERE type = 'competitor_analysis') as competitor_analysis_items,
        COUNT(*) FILTER (WHERE source = 'twitter') as twitter_items,
        COUNT(*) FILTER (WHERE source = 'telegram') as telegram_items,
        COUNT(*) FILTER (WHERE source = 'discord') as discord_items,
        COUNT(*) FILTER (WHERE importance > 0.7) as high_importance_items,
        COUNT(*) FILTER (WHERE extraction_timestamp > NOW() - INTERVAL '7 days') as recent_items,
        COUNT(*) FILTER (WHERE validation_status = 'validated') as validated_items,
        COUNT(*) FILTER (WHERE cross_references != '[]'::jsonb) as cross_referenced_items,
        (SELECT COUNT(*) FROM source_reliability_tracking WHERE red_flag_status = true) as red_flagged_sources,
        COALESCE(AVG(importance), 0)::DECIMAL(3,2) as avg_importance,
        COALESCE(AVG(confidence), 0)::DECIMAL(3,2) as avg_confidence,
        COALESCE(AVG(relevance_score), 0)::DECIMAL(3,2) as avg_relevance,
        COALESCE(AVG(credibility_score), 0)::DECIMAL(3,2) as avg_credibility
    FROM knowledge_items;
END;
$$ LANGUAGE plpgsql;

-- Function to get sentiment analysis across platforms
CREATE OR REPLACE FUNCTION get_sentiment_analysis(days_back INTEGER DEFAULT 7)
RETURNS TABLE(
    platform VARCHAR(50),
    avg_sentiment DECIMAL(3,2),
    total_data_points BIGINT,
    recent_items BIGINT,
    sentiment_trend VARCHAR(20)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ssd.platform,
        AVG(ssd.sentiment_score)::DECIMAL(3,2) as avg_sentiment,
        SUM(ssd.data_points) as total_data_points,
        COUNT(*) as recent_items,
        CASE 
            WHEN AVG(ssd.sentiment_score) > 0.3 THEN 'positive'
            WHEN AVG(ssd.sentiment_score) < -0.3 THEN 'negative'
            ELSE 'neutral'
        END as sentiment_trend
    FROM social_sentiment_data ssd
    JOIN knowledge_items ki ON ssd.knowledge_item_id = ki.id
    WHERE ki.extraction_timestamp > NOW() - (days_back || ' days')::INTERVAL
    GROUP BY ssd.platform
    ORDER BY avg_sentiment DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to get price verification reliability by API
CREATE OR REPLACE FUNCTION get_price_verification_reliability()
RETURNS TABLE(
    api_source VARCHAR(50),
    total_verifications BIGINT,
    verified_count BIGINT,
    discrepancy_count BIGINT,
    avg_confidence DECIMAL(3,2),
    reliability_rate DECIMAL(3,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        pvd.api_source,
        COUNT(*) as total_verifications,
        COUNT(*) FILTER (WHERE pvd.verification_status = 'verified') as verified_count,
        COUNT(*) FILTER (WHERE pvd.verification_status = 'discrepancy') as discrepancy_count,
        AVG(pvd.confidence_level)::DECIMAL(3,2) as avg_confidence,
        CASE 
            WHEN COUNT(*) > 0 THEN (COUNT(*) FILTER (WHERE pvd.verification_status = 'verified')::DECIMAL / COUNT(*))
            ELSE 0 
        END as reliability_rate
    FROM price_verification_data pvd
    JOIN knowledge_items ki ON pvd.knowledge_item_id = ki.id
    WHERE ki.extraction_timestamp > NOW() - INTERVAL '30 days'
    GROUP BY pvd.api_source
    ORDER BY reliability_rate DESC, avg_confidence DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to identify high-value knowledge items with cross-validation
CREATE OR REPLACE FUNCTION get_high_value_knowledge(minimum_importance DECIMAL DEFAULT 0.8)
RETURNS TABLE(
    id VARCHAR(255),
    type VARCHAR(100),
    source VARCHAR(100),
    title VARCHAR(500),
    importance DECIMAL(3,2),
    confidence DECIMAL(3,2),
    validation_count BIGINT,
    avg_agreement_score DECIMAL(3,2),
    total_quality_score DECIMAL(3,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ki.id,
        ki.type,
        ki.source,
        ki.title,
        ki.importance,
        ki.confidence,
        COUNT(cvr.id) as validation_count,
        COALESCE(AVG(cvr.agreement_score), 0)::DECIMAL(3,2) as avg_agreement_score,
        (ki.importance + ki.confidence + COALESCE(AVG(cvr.agreement_score), 0)) / 3 as total_quality_score
    FROM knowledge_items ki
    LEFT JOIN cross_validation_results cvr ON ki.id = cvr.primary_knowledge_item_id
    WHERE ki.importance >= minimum_importance
    GROUP BY ki.id, ki.type, ki.source, ki.title, ki.importance, ki.confidence
    ORDER BY total_quality_score DESC, validation_count DESC
    LIMIT 50;
END;
$$ LANGUAGE plpgsql;

-- ==========================================
-- COMPREHENSIVE SAMPLE QUERIES FOR ALL KNOWLEDGE SOURCES
-- ==========================================

/*
-- ✅ Get comprehensive knowledge statistics across ALL sources
SELECT * FROM get_comprehensive_knowledge_stats();

-- ✅ Search for DeFi-related content across ALL sources
SELECT * FROM search_knowledge_items('DeFi arbitrage yield farming');

-- ✅ Search only in Twitter sentiment data
SELECT * FROM search_knowledge_items('ethereum bull market', 'twitter');

-- ✅ Get high-value knowledge items with cross-validation
SELECT * FROM get_high_value_knowledge(0.8);

-- ✅ Get social sentiment analysis for the last 7 days
SELECT * FROM get_sentiment_analysis(7);

-- ✅ Get price verification reliability by API
SELECT * FROM get_price_verification_reliability();

-- ✅ View all high-importance knowledge items
SELECT * FROM high_importance_knowledge LIMIT 20;

-- ✅ View recent validated knowledge items
SELECT * FROM recent_knowledge WHERE validation_status = 'validated';

-- ✅ View social sentiment summary
SELECT * FROM social_sentiment_summary ORDER BY total_data_points DESC;

-- ✅ View price verification summary
SELECT * FROM price_verification_summary ORDER BY verified_count DESC;

-- ✅ View source reliability dashboard
SELECT * FROM source_reliability_dashboard;

-- ✅ Get all newsletter insights from the last week
SELECT * FROM knowledge_items 
WHERE source = 'newsletter' 
AND extraction_timestamp > NOW() - INTERVAL '7 days'
ORDER BY importance DESC;

-- ✅ Get high-importance YouTube insights with frame analysis
SELECT ki.*, 
       (metadata->>'chartsFound')::INTEGER as charts_found,
       metadata->>'sentiment' as video_sentiment
FROM knowledge_items ki
WHERE source = 'youtube' 
AND importance > 0.8
AND metadata->>'frameAnalysis' IS NOT NULL
ORDER BY extraction_timestamp DESC;

-- ✅ Get Twitter sentiment for specific keywords
SELECT ki.title, ssd.sentiment_score, ssd.volume, ssd.data_points
FROM knowledge_items ki
JOIN social_sentiment_data ssd ON ki.id = ssd.knowledge_item_id
WHERE ssd.platform = 'twitter'
AND ki.content ILIKE '%arbitrage%'
ORDER BY ssd.sentiment_score DESC;

-- ✅ Get price discrepancies detected across multiple APIs
SELECT ki.title, pvd.api_source, pvd.verification_status, 
       pvd.tokens, pvd.arbitrage_opportunities
FROM knowledge_items ki
JOIN price_verification_data pvd ON ki.id = pvd.knowledge_item_id
WHERE pvd.verification_status = 'discrepancy'
AND jsonb_array_length(pvd.arbitrage_opportunities) > 0
ORDER BY ki.extraction_timestamp DESC;

-- ✅ Get cross-validated insights with high agreement
SELECT ki.title, ki.source, cvr.validation_type, cvr.agreement_score
FROM knowledge_items ki
JOIN cross_validation_results cvr ON ki.id = cvr.primary_knowledge_item_id
WHERE cvr.agreement_score > 0.8
ORDER BY cvr.agreement_score DESC;

-- ✅ Get competitor analysis findings
SELECT ki.title, cad.competitor_type, cad.analysis_type, 
       cad.findings, cad.confidence_level
FROM knowledge_items ki
JOIN competitor_analysis_data cad ON ki.id = cad.knowledge_item_id
WHERE cad.confidence_level > 0.7
ORDER BY cad.confidence_level DESC;

-- ✅ Get web search insights with high credibility
SELECT ki.title, wsd.search_api, wsd.search_query, 
       wsd.results_count, wsd.sentiment_analysis
FROM knowledge_items ki
JOIN web_search_data wsd ON ki.id = wsd.knowledge_item_id
WHERE ki.credibility_score > 0.8
ORDER BY ki.extraction_timestamp DESC;

-- ✅ Get sources that need red flagging (low reliability)
SELECT source, sub_source, reliability_score, 
       validation_rate, contradiction_rate
FROM source_reliability_dashboard
WHERE reliability_score < 0.3 OR contradiction_rate > 0.5
ORDER BY reliability_score ASC;

-- ✅ Get knowledge items that contradict each other
SELECT 
    ki1.title as primary_item,
    ki2.title as contradicting_item,
    cvr.agreement_score,
    cvr.validation_details
FROM cross_validation_results cvr
JOIN knowledge_items ki1 ON cvr.primary_knowledge_item_id = ki1.id
JOIN knowledge_items ki2 ON cvr.validating_knowledge_item_id = ki2.id
WHERE cvr.validation_type = 'contradicts'
ORDER BY cvr.timestamp DESC;

-- ✅ Get trending topics across all sources
SELECT 
    unnest(string_to_array(lower(regexp_replace(content, '[^a-zA-Z0-9\s]', '', 'g')), ' ')) as word,
    COUNT(*) as frequency
FROM knowledge_items 
WHERE extraction_timestamp > NOW() - INTERVAL '24 hours'
AND length(unnest(string_to_array(lower(regexp_replace(content, '[^a-zA-Z0-9\s]', '', 'g')), ' '))) > 3
GROUP BY word
HAVING COUNT(*) > 5
ORDER BY frequency DESC
LIMIT 20;

-- ✅ Get sentiment correlation across platforms
SELECT 
    DATE(ki.extraction_timestamp) as date,
    ssd.platform,
    AVG(ssd.sentiment_score) as avg_sentiment,
    COUNT(*) as data_points
FROM knowledge_items ki
JOIN social_sentiment_data ssd ON ki.id = ssd.knowledge_item_id
WHERE ki.extraction_timestamp > NOW() - INTERVAL '30 days'
GROUP BY DATE(ki.extraction_timestamp), ssd.platform
ORDER BY date DESC, avg_sentiment DESC;
*/
