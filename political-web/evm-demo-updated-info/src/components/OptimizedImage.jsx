import { useState, useEffect, useRef } from 'react';

/**
 * OptimizedImage - Fast loading image component with:
 * - Lazy loading (only loads when in viewport)
 * - Progressive loading (blur placeholder → full image)
 * - Error handling with fallback
 * - Caching support
 */
const OptimizedImage = ({
    src,
    alt,
    className = '',
    fallbackSrc = 'https://via.placeholder.com/150?text=Image',
    priority = false, // Set true for above-the-fold images
    onLoad,
    ...props
}) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [isInView, setIsInView] = useState(priority);
    const [currentSrc, setCurrentSrc] = useState(null);
    const [hasError, setHasError] = useState(false);
    const imgRef = useRef(null);
    const observerRef = useRef(null);

    // Intersection Observer for lazy loading
    useEffect(() => {
        if (priority) {
            setIsInView(true);
            return;
        }

        observerRef.current = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setIsInView(true);
                        observerRef.current?.disconnect();
                    }
                });
            },
            {
                rootMargin: '100px', // Start loading 100px before entering viewport
                threshold: 0.01
            }
        );

        if (imgRef.current) {
            observerRef.current.observe(imgRef.current);
        }

        return () => {
            observerRef.current?.disconnect();
        };
    }, [priority]);

    // Load image when in view
    useEffect(() => {
        if (!isInView || !src) return;

        const img = new Image();

        img.onload = () => {
            setCurrentSrc(src);
            setIsLoaded(true);
            setHasError(false);
            onLoad?.();
        };

        img.onerror = () => {
            setHasError(true);
            setCurrentSrc(fallbackSrc);
            setIsLoaded(true);
        };

        // Check if image is in browser cache
        img.src = src;

        // If image is already cached, it loads synchronously
        if (img.complete) {
            setCurrentSrc(src);
            setIsLoaded(true);
        }

        return () => {
            img.onload = null;
            img.onerror = null;
        };
    }, [isInView, src, fallbackSrc, onLoad]);

    // Generate placeholder color based on alt text
    const getPlaceholderColor = () => {
        if (!alt) return '#e5e7eb';
        const hash = alt.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const hue = hash % 360;
        return `hsl(${hue}, 70%, 90%)`;
    };

    return (
        <div
            ref={imgRef}
            className={`relative overflow-hidden ${className}`}
            style={{
                backgroundColor: getPlaceholderColor(),
                ...props.style
            }}
        >
            {/* Blur placeholder */}
            {!isLoaded && (
                <div
                    className="absolute inset-0 flex items-center justify-center animate-pulse"
                    style={{ backgroundColor: getPlaceholderColor() }}
                >
                    <svg
                        className="w-8 h-8 text-gray-400 opacity-50"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                </div>
            )}

            {/* Main image */}
            {currentSrc && (
                <img
                    src={currentSrc}
                    alt={alt}
                    className={`w-full h-full object-cover transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'
                        }`}
                    loading={priority ? 'eager' : 'lazy'}
                    decoding="async"
                    {...props}
                />
            )}

            {/* Error indicator */}
            {hasError && (
                <div className="absolute bottom-0 right-0 bg-red-500 text-white text-[8px] px-1 rounded-tl">
                    !
                </div>
            )}
        </div>
    );
};

/**
 * Preload critical images before they're needed
 */
export const preloadImages = (urls) => {
    urls.forEach(url => {
        if (!url) return;
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = url;
        document.head.appendChild(link);
    });
};

/**
 * Compress image before upload
 * @param {File} file - The image file
 * @param {number} maxWidth - Maximum width (default 800)
 * @param {number} quality - JPEG quality 0-1 (default 0.8)
 * @returns {Promise<string>} - Base64 compressed image
 */
export const compressImage = (file, maxWidth = 800, quality = 0.8) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            const img = new Image();

            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                // Calculate new dimensions
                if (width > maxWidth) {
                    height = (height * maxWidth) / width;
                    width = maxWidth;
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                // Convert to compressed JPEG/WebP
                const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
                resolve(compressedBase64);
            };

            img.onerror = reject;
            img.src = e.target.result;
        };

        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};

/**
 * Generate a tiny placeholder (10x10) for blur-up effect
 */
export const generateTinyPlaceholder = (file) => {
    return compressImage(file, 10, 0.5);
};

export default OptimizedImage;
