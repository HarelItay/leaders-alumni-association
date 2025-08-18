# Images Database

This directory contains all images used in the LEADERS Alumni Association website.

## Directory Structure

- `profiles/` - Alumni profile photos
- `events/` - Event photos and banners  
- `companies/` - Company logos and images
- `backgrounds/` - Background images and graphics

## Image Guidelines

### File Naming Convention
- Use lowercase letters and hyphens
- Include descriptive names
- Examples: `john-doe-profile.jpg`, `tech-summit-2024.png`

### Recommended Formats
- **Profile photos**: JPG/JPEG (optimized for web)
- **Logos**: PNG (with transparency if needed)
- **Events**: JPG/JPEG for photos, PNG for graphics
- **Backgrounds**: JPG/JPEG (optimized for web)

### Size Guidelines
- **Profile photos**: 400x400px (square)
- **Event banners**: 1200x600px (2:1 ratio)
- **Company logos**: 200x100px (maintain aspect ratio)
- **Backgrounds**: 1920x1080px (HD)

## Usage in Code

### Direct GitHub URLs
Images can be referenced using GitHub's raw content URLs:
```
https://raw.githubusercontent.com/HarelItay/leaders-alumni-association/main/images/profiles/john-doe.jpg
```

### Relative URLs (recommended)
For better performance and easier maintenance:
```
./images/profiles/john-doe.jpg
```

## How to Add Images

1. **Via GitHub Web Interface**:
   - Navigate to the appropriate folder (profiles/, events/, etc.)
   - Click "Add file" → "Upload files"
   - Drag and drop or select your images
   - Commit the changes

2. **Via Git Command Line**:
   ```bash
   git add images/profiles/new-photo.jpg
   git commit -m "Add profile photo for new alumni"
   git push origin main
   ```

## Image Optimization

Before uploading, consider:
- Compress images to reduce file size
- Use appropriate dimensions
- Convert to web-friendly formats
- Remove metadata for privacy

## Examples

### Profile Photo Usage
```html
<img src="./images/profiles/jane-smith.jpg" alt="Jane Smith" class="profile-photo">
```

### Event Banner Usage
```html
<div class="event-banner" style="background-image: url('./images/events/networking-2024.jpg')"></div>
```

### Company Logo Usage
```html
<img src="./images/companies/tech-corp-logo.png" alt="Tech Corp" class="company-logo">
```
