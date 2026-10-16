// Simplified fast data loading system
import { ref, get } from 'firebase/database';
import { db } from '../firebase';

export class FastLoader {
  // Cache for ultra-fast repeated access
  static cache = new Map();
  static cacheExpiry = new Map();
  static CACHE_DURATION = 30000; // 30 seconds

  // Get candidate data with aggressive caching
  static async getCandidateBySlug(slug) {
    const startTime = performance.now();
    console.log('⚡ Fast loading candidate:', slug);

    // Check cache first
    const cacheKey = `candidate_${slug}`;
    if (this.cache.has(cacheKey) && Date.now() < this.cacheExpiry.get(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      console.log(`📦 Cache hit for ${slug} in ${(performance.now() - startTime).toFixed(1)}ms`);
      return cached;
    }

    try {
      // Direct Firebase query - much faster than complex indexing
      const candidatesRef = ref(db, 'electionData/candidatePages');
      const snapshot = await get(candidatesRef);
      
      if (snapshot.exists()) {
        const candidates = snapshot.val();
        
        // Find candidate by slug
        const candidate = Object.values(candidates).find(c => c.slug === slug);
        
        if (candidate) {
          // Cache the result
          this.cache.set(cacheKey, candidate);
          this.cacheExpiry.set(cacheKey, Date.now() + this.CACHE_DURATION);
          
          const loadTime = performance.now() - startTime;
          console.log(`✅ Loaded ${slug} in ${loadTime.toFixed(1)}ms`);
          return candidate;
        }
      }
      
      console.log('❌ Candidate not found:', slug);
      return null;
    } catch (error) {
      console.error('❌ Failed to load candidate:', error);
      return null;
    }
  }

  // Preload all candidates for instant access
  static async preloadAllCandidates() {
    const startTime = performance.now();
    console.log('🚀 Preloading all candidates...');

    try {
      const candidatesRef = ref(db, 'electionData/candidatePages');
      const snapshot = await get(candidatesRef);
      
      if (snapshot.exists()) {
        const candidates = snapshot.val();
        
        // Cache all candidates
        Object.values(candidates).forEach(candidate => {
          const cacheKey = `candidate_${candidate.slug}`;
          this.cache.set(cacheKey, candidate);
          this.cacheExpiry.set(cacheKey, Date.now() + this.CACHE_DURATION);
        });
        
        const loadTime = performance.now() - startTime;
        console.log(`✅ Preloaded ${Object.keys(candidates).length} candidates in ${loadTime.toFixed(1)}ms`);
        return Object.values(candidates);
      }
      
      return [];
    } catch (error) {
      console.error('❌ Failed to preload candidates:', error);
      return [];
    }
  }

  // Clear cache
  static clearCache() {
    this.cache.clear();
    this.cacheExpiry.clear();
    console.log('🗑️ Cache cleared');
  }

  // Get cache stats
  static getCacheStats() {
    const now = Date.now();
    const validEntries = Array.from(this.cacheExpiry.entries()).filter(([_, expiry]) => now < expiry);
    
    return {
      totalEntries: this.cache.size,
      validEntries: validEntries.length,
      expiredEntries: this.cache.size - validEntries.length
    };
  }
}