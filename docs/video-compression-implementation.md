# Video Compression Implementation

## Overview
Implemented client-side video compression to handle Vercel's 4.5MB file size limit on the free tier.

## Features
1. **Automatic Compression**: Videos larger than 4MB are automatically compressed before upload
2. **Progress Tracking**: Shows real-time compression progress to users
3. **Quality Preservation**: Maintains reasonable video quality while reducing file size
4. **Browser-Based**: Uses native browser APIs (Canvas + MediaRecorder) for compression
5. **Smart Scaling**: Automatically adjusts resolution, bitrate, and frame rate

## Technical Details

### Compression Algorithm
- Uses HTML5 Canvas API to re-encode video frames
- Reduces resolution by a scale factor (default 0.75x)
- Lowers frame rate to 24 fps
- Calculates optimal bitrate based on target file size
- Supports WebM (VP9/VP8) and MP4 codecs

### Compression Parameters
- **Target Size**: 3.5MB (leaves buffer for Vercel's 4.5MB limit)
- **Quality**: 0.7 (adjustable, 0-1 range)
- **Scale**: 0.75 (reduces dimensions to 75%)
- **FPS**: 24 (from original, typically 30)
- **Audio**: Preserved when possible

### User Experience
1. Files under 4MB upload directly
2. Larger files trigger automatic compression
3. Progress bar shows compression status
4. Notifications inform user of compression results
5. Original vs compressed size displayed

## Implementation Files
- `/src/utils/videoCompression.ts` - Core compression logic
- `/src/components/ui/VideoUpload.tsx` - Updated UI component

## Benefits
- No server-side processing required
- Works within Vercel free tier limits
- Fast compression using browser APIs
- No external dependencies needed
- Progressive compression if needed