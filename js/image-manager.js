/**
 * Image Manager - Utility for handling images from GitHub repository
 */

class ImageManager {
    constructor() {
        this.baseUrl = './images/';
        this.githubRawUrl = 'https://raw.githubusercontent.com/HarelItay/leaders-alumni-association/main/images/';
    }

    /**
     * Get profile image URL
     * @param {string} filename - Image filename (e.g., 'john-doe.jpg')
     * @returns {string} Full image URL
     */
    getProfileImage(filename) {
        return `${this.baseUrl}profiles/${filename}`;
    }

    /**
     * Get event image URL
     * @param {string} filename - Image filename
     * @returns {string} Full image URL
     */
    getEventImage(filename) {
        return `${this.baseUrl}events/${filename}`;
    }

    /**
     * Get company logo URL
     * @param {string} filename - Image filename
     * @returns {string} Full image URL
     */
    getCompanyImage(filename) {
        return `${this.baseUrl}companies/${filename}`;
    }

    /**
     * Get background image URL
     * @param {string} filename - Image filename
     * @returns {string} Full image URL
     */
    getBackgroundImage(filename) {
        return `${this.baseUrl}backgrounds/${filename}`;
    }

    /**
     * Get GitHub raw URL (useful for external references)
     * @param {string} category - Image category (profiles, events, companies, backgrounds)
     * @param {string} filename - Image filename
     * @returns {string} GitHub raw URL
     */
    getGithubRawUrl(category, filename) {
        return `${this.githubRawUrl}${category}/${filename}`;
    }

    /**
     * Create an img element with error handling
     * @param {string} src - Image source URL
     * @param {string} alt - Alt text
     * @param {string} className - CSS class name
     * @param {string} fallback - Fallback image URL
     * @returns {HTMLImageElement} Image element
     */
    createImageElement(src, alt = '', className = '', fallback = null) {
        const img = document.createElement('img');
        img.src = src;
        img.alt = alt;
        if (className) img.className = className;

        // Add error handling
        img.onerror = () => {
            if (fallback) {
                img.src = fallback;
            } else {
                // Default fallback - create a placeholder
                img.src = 'data:image/svg+xml,' + encodeURIComponent(`
                    <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
                        <rect width="200" height="200" fill="#f0f0f0"/>
                        <text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#999" font-family="Arial" font-size="14">
                            Image not found
                        </text>
                    </svg>
                `);
            }
        };

        return img;
    }

    /**
     * Preload images for better performance
     * @param {string[]} imageUrls - Array of image URLs to preload
     */
    preloadImages(imageUrls) {
        imageUrls.forEach(url => {
            const img = new Image();
            img.src = url;
        });
    }

    /**
     * Check if image exists
     * @param {string} url - Image URL to check
     * @returns {Promise<boolean>} Promise that resolves to true if image exists
     */
    async imageExists(url) {
        return new Promise(resolve => {
            const img = new Image();
            img.onload = () => resolve(true);
            img.onerror = () => resolve(false);
            img.src = url;
        });
    }

    /**
     * Get optimized image URL based on device pixel ratio
     * @param {string} baseUrl - Base image URL
     * @param {string} filename - Image filename without extension
     * @param {string} extension - Image extension
     * @returns {string} Optimized image URL
     */
    getOptimizedImage(baseUrl, filename, extension) {
        const pixelRatio = window.devicePixelRatio || 1;
        
        if (pixelRatio > 1) {
            // Try to load high-resolution version
            return `${baseUrl}${filename}@2x.${extension}`;
        }
        
        return `${baseUrl}${filename}.${extension}`;
    }
}

// Create global instance
const imageManager = new ImageManager();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ImageManager;
}
