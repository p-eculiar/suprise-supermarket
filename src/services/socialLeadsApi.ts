import { SocialMediaService } from './socialMediaService';

/**
 * API service for social leads functionality
 * This acts as a bridge between frontend and the SocialMediaService
 */

export class SocialLeadsApi {
  /**
   * Scan social media platforms for new leads
   * This endpoint triggers the actual Twitter and Facebook API calls
   */
  static async scanSocialLeads(): Promise<{ 
    success: boolean; 
    message: string; 
    data?: { total: number; byPlatform: Record<string, number> };
    error?: string;
  }> {
    try {
      console.log('\n✨ SocialLeadsApi: Starting social media scan...');
      console.log('🕐 Time:', new Date().toLocaleString());
      
      // Call the SocialMediaService to scan all platforms
      const result = await SocialMediaService.scanAllPlatforms();
      
      console.log('✅ SocialLeadsApi: Scan completed successfully');
      console.log('📊 Results:', result);
      
      // Provide detailed feedback
      let message = `Successfully scanned social media platforms.`;
      if (result.total > 0) {
        message += ` Found and saved ${result.total} new leads!`;
      } else {
        message += ` No new leads found this time.`;
      }
      
      // Add platform-specific information
      const platformDetails = Object.entries(result.byPlatform)
        .map(([platform, count]) => `${platform}: ${count}`)
        .join(', ');
      message += ` (${platformDetails})`;
      
      return {
        success: true,
        message,
        data: result
      };
    } catch (error) {
      console.error('❌ SocialLeadsApi: Scan failed');
      console.error('Error details:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Failed to scan social leads';
      console.error('Error message:', errorMessage);
      
      return {
        success: false,
        message: errorMessage,
        error: errorMessage
      };
    }
  }

  /**
   * Get social leads from database
   */
  static async getSocialLeads(platform?: string, status?: string) {
    // This would typically fetch from your database
    // For now, we'll return a placeholder
    console.log('Fetching social leads with filters:', { platform, status });
    return { success: true, data: [] };
  }
}