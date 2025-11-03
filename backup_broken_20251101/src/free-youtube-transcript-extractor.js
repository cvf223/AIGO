import { YoutubeTranscript } from 'youtube-transcript';
import axios from 'axios';
import { EventEmitter } from 'events';

/**
 * 🆓 FREE YOUTUBE TRANSCRIPT EXTRACTOR
 * 
 * Multi-method approach for ZERO-COST transcript extraction:
 * 1. YouTube auto-generated captions (FREE)
 * 2. Supadata API (100 free requests/month)
 * 3. YouTube-Transcript.io (25 free tokens)
 * 4. Local Whisper fallback (setup cost only)
 * 
 * Cost: ~$0.001 per video vs $0.36/hour with OpenAI
 */

interface TranscriptSegment {
  text: string;
  start: number;
  duration: number;
  language?: string;
}

interface TranscriptResult {
  segments: TranscriptSegment[];
  language: string;
  source: 'youtube-auto' | 'supadata' | 'transcript-io' | 'local-whisper';
  cost: number;
  processingTime: number;
}

export class FreeYouTubeTranscriptExtractor extends EventEmitter {
  private supadataApiKey: string = process.env.SUPADATA_API_KEY || '';
  private transcriptIoApiKey: string = process.env.TRANSCRIPT_IO_API_KEY || '';
  private requestCounts = {
    supadata: 0,
    transcriptIo: 0,
    youtube: 0
  };
  private dailyLimits = {
    supadata: 100, // Free tier
    transcriptIo: 25, // Free tier
    youtube: 1000 // No official limit, but be reasonable
  };

  constructor() {
    super();
    this.emit('system', 'Free YouTube Transcript Extractor initialized 🆓');
  }

  /**
   * 📹 Extract transcript using the most cost-effective method
   */
  async extractTranscript(videoUrl: string): Promise<TranscriptResult> {
    const startTime = Date.now();
    const videoId = this.extractVideoId(videoUrl);
    
    if (!videoId) {
      throw new Error('Invalid YouTube URL');
    }

    // Method 1: YouTube Auto-Generated Captions (FREE)
    try {
      const result = await this.extractYouTubeNativeCaptions(videoId);
      this.emit('transcript_extracted', {
        videoId,
        method: 'youtube-auto',
        cost: 0,
        segmentCount: result.segments.length
      });
      return result;
    } catch (error) {
      this.emit('method_failed', { method: 'youtube-auto', error: error.message });
    }

    // Method 2: Supadata API (100 free requests/month)
    if (this.requestCounts.supadata < this.dailyLimits.supadata && this.supadataApiKey) {
      try {
        const result = await this.extractWithSupadata(videoId);
        this.requestCounts.supadata++;
        this.emit('transcript_extracted', {
          videoId,
          method: 'supadata',
          cost: 0,
          segmentCount: result.segments.length
        });
        return result;
      } catch (error) {
        this.emit('method_failed', { method: 'supadata', error: error.message });
      }
    }

    // Method 3: YouTube-Transcript.io (25 free tokens)
    if (this.requestCounts.transcriptIo < this.dailyLimits.transcriptIo) {
      try {
        const result = await this.extractWithTranscriptIo(videoId);
        this.requestCounts.transcriptIo++;
        this.emit('transcript_extracted', {
          videoId,
          method: 'transcript-io',
          cost: 0,
          segmentCount: result.segments.length
        });
        return result;
      } catch (error) {
        this.emit('method_failed', { method: 'transcript-io', error: error.message });
      }
    }

    // Method 4: Local Whisper (setup cost only)
    try {
      const result = await this.extractWithLocalWhisper(videoId);
      this.emit('transcript_extracted', {
        videoId,
        method: 'local-whisper',
        cost: 0.001, // Electricity cost estimate
        segmentCount: result.segments.length
      });
      return result;
    } catch (error) {
      this.emit('method_failed', { method: 'local-whisper', error: error.message });
    }

    throw new Error('All transcript extraction methods failed');
  }

  /**
   * 🆓 Method 1: YouTube Native Auto-Generated Captions
   */
  private async extractYouTubeNativeCaptions(videoId: string): Promise<TranscriptResult> {
    const startTime = Date.now();
    
    try {
      const transcript = await YoutubeTranscript.fetchTranscript(videoId);
      
      const segments: TranscriptSegment[] = transcript.map(item => ({
        text: item.text,
        start: item.offset / 1000, // Convert to seconds
        duration: item.duration / 1000, // Convert to seconds
        language: 'auto-detected'
      }));

      return {
        segments,
        language: 'auto-detected',
        source: 'youtube-auto',
        cost: 0,
        processingTime: Date.now() - startTime
      };
    } catch (error) {
      throw new Error(`YouTube native captions failed: ${error.message}`);
    }
  }

  /**
   * 🆓 Method 2: Supadata API (100 free requests/month)
   */
  private async extractWithSupadata(videoId: string): Promise<TranscriptResult> {
    const startTime = Date.now();
    
    try {
      const response = await axios.get(
        `https://api.supadata.ai/v1/youtube/transcript?videoId=${videoId}`,
        {
          headers: {
            'x-api-key': this.supadataApiKey
          }
        }
      );

      const segments: TranscriptSegment[] = response.data.content.map(item => ({
        text: item.text,
        start: item.offset / 1000,
        duration: item.duration / 1000,
        language: item.lang
      }));

      return {
        segments,
        language: response.data.lang,
        source: 'supadata',
        cost: 0, // Free tier
        processingTime: Date.now() - startTime
      };
    } catch (error) {
      throw new Error(`Supadata API failed: ${error.message}`);
    }
  }

  /**
   * 🆓 Method 3: YouTube-Transcript.io (25 free tokens)
   */
  private async extractWithTranscriptIo(videoId: string): Promise<TranscriptResult> {
    const startTime = Date.now();
    
    try {
      const response = await axios.post(
        'https://api.youtube-transcript.io/extract',
        {
          videoId: videoId,
          format: 'json'
        },
        {
          headers: {
            'Authorization': `Bearer ${this.transcriptIoApiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const segments: TranscriptSegment[] = response.data.transcript.map(item => ({
        text: item.text,
        start: item.start,
        duration: item.duration,
        language: response.data.language
      }));

      return {
        segments,
        language: response.data.language,
        source: 'transcript-io',
        cost: 0, // Free tier
        processingTime: Date.now() - startTime
      };
    } catch (error) {
      throw new Error(`Transcript.io API failed: ${error.message}`);
    }
  }

  /**
   * 🆓 Method 4: Local Whisper (setup cost only)
   */
  private async extractWithLocalWhisper(videoId: string): Promise<TranscriptResult> {
    const startTime = Date.now();
    
    try {
      // This would call a local Whisper server
      // For now, we'll throw an error to indicate it's not implemented
      throw new Error('Local Whisper not implemented yet - requires separate setup');
      
      // Future implementation would:
      // 1. Download audio using youtube-dl or similar
      // 2. Send to local Whisper server
      // 3. Return formatted transcript
    } catch (error) {
      throw new Error(`Local Whisper failed: ${error.message}`);
    }
  }

  /**
   * 📊 Get cost optimization statistics
   */
  getCostStats(): {
    totalTranscripts: number;
    totalCost: number;
    averageCostPerTranscript: number;
    methodBreakdown: Record<string, number>;
    savingsVsOpenAI: number;
  } {
    const totalTranscripts = this.requestCounts.youtube + this.requestCounts.supadata + this.requestCounts.transcriptIo;
    const totalCost = this.requestCounts.supadata * 0.001 + this.requestCounts.transcriptIo * 0.001; // Minimal costs
    const averageCostPerTranscript = totalCost / totalTranscripts || 0;
    
    // OpenAI Whisper costs $0.006/minute = $0.36/hour
    // Assume average video is 10 minutes = $0.06 per video
    const openAICost = totalTranscripts * 0.06;
    const savingsVsOpenAI = openAICost - totalCost;

    return {
      totalTranscripts,
      totalCost,
      averageCostPerTranscript,
      methodBreakdown: {
        'youtube-auto': this.requestCounts.youtube,
        'supadata': this.requestCounts.supadata,
        'transcript-io': this.requestCounts.transcriptIo
      },
      savingsVsOpenAI
    };
  }

  /**
   * 🔍 Extract video ID from various YouTube URL formats
   */
  private extractVideoId(url: string): string | null {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /^([a-zA-Z0-9_-]{11})$/ // Direct video ID
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }

    return null;
  }

  /**
   * 🎯 Bulk transcript extraction for channels/playlists
   */
  async extractBulkTranscripts(videoUrls: string[]): Promise<TranscriptResult[]> {
    const results: TranscriptResult[] = [];
    const batchSize = 5; // Process in batches to avoid rate limits

    for (let i = 0; i < videoUrls.length; i += batchSize) {
      const batch = videoUrls.slice(i, i + batchSize);
      const batchPromises = batch.map(url => 
        this.extractTranscript(url).catch(error => {
          this.emit('batch_error', { url, error: error.message });
          return null;
        })
      );

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults.filter(result => result !== null));
      
      // Rate limiting: wait 1 second between batches
      if (i + batchSize < videoUrls.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    this.emit('bulk_extraction_complete', {
      totalVideos: videoUrls.length,
      successfulExtractions: results.length,
      failedExtractions: videoUrls.length - results.length
    });

    return results;
  }

  /**
   * 🚀 FLASH LOAN ARBITRAGE SPECIFIC: Extract crypto education content
   */
  async extractCryptoEducationContent(searchTerms: string[]): Promise<{
    transcripts: TranscriptResult[];
    insights: string[];
    tradingSignals: string[];
  }> {
    // This would integrate with YouTube search to find relevant crypto content
    // For now, placeholder implementation
    
    const cryptoInsights = [
      'Flash loan arbitrage opportunities on DEXs',
      'L2 network gas optimization strategies',
      'MEV bot detection and counter-strategies',
      'DeFi protocol yield farming mechanics'
    ];

    const tradingSignals = [
      'High volume DEX swaps indicate arbitrage opportunities',
      'Gas price spikes may reduce arbitrage profitability',
      'New token listings create temporary price discrepancies',
      'Cross-chain bridge delays create arbitrage windows'
    ];

    return {
      transcripts: [],
      insights: cryptoInsights,
      tradingSignals
    };
  }
}

// Example usage with flash loan arbitrage context
const transcriptExtractor = new FreeYouTubeTranscriptExtractor();

// Listen for events
transcriptExtractor.on('transcript_extracted', (data) => {
  console.log(`✅ Transcript extracted: ${data.method} - ${data.segmentCount} segments - Cost: $${data.cost}`);
});

transcriptExtractor.on('method_failed', (data) => {
  console.log(`❌ Method failed: ${data.method} - ${data.error}`);
});

transcriptExtractor.on('system', (message) => {
  console.log(`🔔 System: ${message}`);
});

export default transcriptExtractor; 