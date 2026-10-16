// Data optimization utilities for faster loading

// Cache management
export const CacheManager = {
  // Cache keys
  ELECTION_DATA: 'electionData',
  CANDIDATE_PAGES: 'candidatePages',
  ELECTION_INFO: 'electionInfo',
  
  // Set cache with expiration (default 5 minutes)
  set(key, data, expirationMinutes = 5) {
    const item = {
      data,
      timestamp: Date.now(),
      expiration: expirationMinutes * 60 * 1000
    };
    localStorage.setItem(key, JSON.stringify(item));
  },
  
  // Get cache if not expired
  get(key) {
    try {
      const item = localStorage.getItem(key);
      if (!item) return null;
      
      const parsed = JSON.parse(item);
      const now = Date.now();
      
      // Check if expired
      if (now - parsed.timestamp > parsed.expiration) {
        localStorage.removeItem(key);
        return null;
      }
      
      return parsed.data;
    } catch (error) {
      console.warn(`Failed to get cache for ${key}:`, error);
      return null;
    }
  },
  
  // Clear specific cache
  clear(key) {
    localStorage.removeItem(key);
  },
  
  // Clear all election-related cache
  clearAll() {
    Object.values(this).forEach(key => {
      if (typeof key === 'string') {
        localStorage.removeItem(key);
      }
    });
  }
};

// Image optimization utilities
export const ImageOptimizer = {
  // Compress image to specified dimensions and quality
  compress(file, maxWidth = 400, quality = 0.8) {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img;
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(resolve, 'image/jpeg', quality);
      };
      
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  },
  
  // Convert file to compressed base64
  toBase64(file, maxWidth = 400, quality = 0.8) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          // Calculate new dimensions
          let { width, height } = img;
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
          
          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);
          
          const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
          resolve(compressedBase64);
        };
        img.onerror = reject;
        img.src = e.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
};

// Performance monitoring
export const PerformanceMonitor = {
  timers: {},
  
  start(label) {
    this.timers[label] = performance.now();
  },
  
  end(label) {
    if (this.timers[label]) {
      const duration = performance.now() - this.timers[label];
      console.log(`⏱️ ${label}: ${duration.toFixed(2)}ms`);
      delete this.timers[label];
      return duration;
    }
  }
};

// Data loading optimization
export const DataLoader = {
  // Load candidate pages with caching
  async loadCandidatePages(db, ref, onValue) {
    PerformanceMonitor.start('loadCandidatePages');
    
    // Try cache first
    const cached = CacheManager.get(CacheManager.CANDIDATE_PAGES);
    if (cached) {
      console.log('📦 Using cached candidate pages');
      PerformanceMonitor.end('loadCandidatePages');
      return cached;
    }
    
    // Load from Firebase
    return new Promise((resolve) => {
      const candidatesRef = ref(db, 'electionData/candidatePages');
      onValue(candidatesRef, (snapshot) => {
        const data = snapshot.val() || [];
        CacheManager.set(CacheManager.CANDIDATE_PAGES, data, 2); // Cache for 2 minutes
        PerformanceMonitor.end('loadCandidatePages');
        resolve(data);
      }, { onlyOnce: true });
    });
  }
};