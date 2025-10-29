# Video Saving Pipeline Debug Report

## Executive Summary
After thorough investigation of the video saving pipeline, I've identified multiple critical issues that explain why videos are not being saved correctly. The problems span across the component chain from VideoUpload to database storage.

## Key Issues Identified

### 1. **MobileStepEditor Video Handling Issue** ⚠️ **CRITICAL**
**File:** `/src/components/ui/MobileStepEditor.tsx` (lines 651-669)

**Problem:** The MobileStepEditor uses a mock file upload system that only creates temporary blob URLs and doesn't actually upload files to the server.

```javascript
// PROBLEMATIC CODE:
onChange={(e) => {
  const file = e.target.files?.[0]
  if (file && selectedStep !== null) {
    const mockUrl = URL.createObjectURL(file) // ❌ Creates temporary blob, not uploaded file
    updateStep(selectedStep, {
      media: {
        url: mockUrl, // ❌ This URL is temporary and will not persist
        thumbnail: file.type.startsWith('video/') ? mockUrl : undefined,
        title: file.name
      }
    })
  }
}}
```

**Impact:** Videos appear to upload but are actually just temporary blob URLs that disappear when the page reloads.

### 2. **VideoUpload Component Integration Missing** ⚠️ **CRITICAL**
**File:** `/src/components/ui/MobileStepEditor.tsx`

**Problem:** The MobileStepEditor doesn't use the VideoUpload component that handles proper file uploads to the server. Instead, it uses a basic file input that creates temporary blob URLs.

**Expected:** Should use VideoUpload component like the desktop StepEditor does.

### 3. **Desktop vs Mobile Inconsistency** ⚠️ **HIGH**
**Files:** 
- `/src/components/ui/StepEditor.tsx` (lines 804-822) ✅ Uses VideoUpload
- `/src/components/ui/MobileStepEditor.tsx` (lines 651-669) ❌ Uses basic file input

**Problem:** Desktop version properly uses VideoUpload component, but mobile version bypasses it entirely.

### 4. **API Step Processing Issues** ⚠️ **MEDIUM**
**File:** `/app/api/properties/[id]/zones/[zoneId]/steps/route.ts` (lines 374-425)

**Problem:** The API correctly processes and stores mediaUrl in the content field, but the frontend components may not be sending the correct data structure.

### 5. **Data Flow Inconsistencies** ⚠️ **MEDIUM**
**Files:** Multiple components

**Problem:** Different components handle video data differently:
- StepEditor: Uses `media.url` and passes to VideoUpload properly
- MobileStepEditor: Creates temporary blob URLs
- API: Expects `content.mediaUrl` for storage

## Root Cause Analysis

The primary issue is that **MobileStepEditor completely bypasses the VideoUpload component** and its proper file upload mechanism. This means:

1. Videos are never actually uploaded to the server
2. Only temporary blob URLs are created
3. When the form is saved, these temporary URLs are sent to the API
4. The database stores invalid/temporary URLs
5. When data is retrieved, the URLs are broken

## Recommended Fixes

### Fix 1: Update MobileStepEditor to Use VideoUpload Component

Replace the basic file input in MobileStepEditor with proper VideoUpload component integration:

```javascript
// In MobileStepEditor.tsx, replace the basic file handling with VideoUpload component
import { VideoUpload } from './VideoUpload'

// Replace the current video handling section with:
{step.type === 'video' && (
  <div className="space-y-3">
    <VideoUpload
      value={step.media?.url}
      onChange={(url, metadata) => {
        console.log('🎬 VideoUpload onChange called:', { url, metadata })
        
        if (url && metadata) {
          updateStep(index, {
            media: {
              url: url,
              thumbnail: metadata.thumbnail,
              title: 'Uploaded video'
            }
          })
        } else {
          updateStep(index, { media: undefined })
        }
      }}
      placeholder="Subir video VERTICAL (máx. 30 segundos)"
      maxSize={100}
      maxDuration={30}
      saveToLibrary={true}
    />
    
    <Input
      value={step.content[activeLanguage] || ''}
      onChange={(e) => updateStepContent(index, activeLanguage, e.target.value)}
      placeholder="Descripción del video (opcional)"
      className="text-sm"
    />
  </div>
)}
```

### Fix 2: Remove Basic File Input from MobileStepEditor

Remove the problematic file input that creates temporary blob URLs:

```javascript
// REMOVE this entire section:
{/* Hidden file input */}
<input
  ref={fileInputRef}
  type="file"
  accept={selectedStep !== null && steps[selectedStep]?.type === 'video' ? 'video/*' : 'image/*'}
  onChange={(e) => {
    // This entire onChange handler should be removed
  }}
  className="hidden"
/>
```

### Fix 3: Update Media Selection Handler

Update the media selection to not trigger file input for videos:

```javascript
const handleMediaSelect = (type: 'image' | 'video' | 'text' | 'youtube' | 'link') => {
  if (selectedStep !== null) {
    updateStep(selectedStep, { type })
    setShowMediaModal(false)
    
    // Only trigger file input for images, not videos
    if (type === 'image') {
      setTimeout(() => {
        fileInputRef.current?.click()
      }, 300)
    }
    // Video uploads will be handled by VideoUpload component directly
  }
}
```

### Fix 4: Ensure Consistent Data Structure

Make sure both desktop and mobile editors create the same step structure:

```javascript
// Both should create steps with this structure:
const step = {
  id: string,
  type: 'video',
  content: {
    es: string,
    en?: string,
    fr?: string
  },
  media: {
    url: string,        // Actual uploaded file URL
    thumbnail?: string, // Video thumbnail
    title?: string      // File title
  },
  order: number
}
```

## Testing Plan

1. **Test Video Upload on Mobile:**
   - Upload a video using mobile interface
   - Verify it uses VideoUpload component
   - Check network tab for actual file upload
   - Confirm video URL is not a blob: URL

2. **Test End-to-End Pipeline:**
   - Upload video → Save steps → Reload page
   - Verify video still displays correctly
   - Check database for proper mediaUrl storage

3. **Test Cross-Platform Consistency:**
   - Upload video on desktop
   - Switch to mobile and edit same step
   - Verify video data is preserved

## Impact Assessment

**Before Fix:**
- ❌ Videos not saved (temporary blob URLs)
- ❌ Mobile video uploads broken
- ❌ Inconsistent behavior between desktop/mobile
- ❌ Poor user experience

**After Fix:**
- ✅ Videos properly uploaded and saved
- ✅ Consistent behavior across platforms
- ✅ Proper video persistence
- ✅ Better user experience

## Priority: URGENT
This issue affects core functionality and user experience. Videos are a critical feature for guest instructions, and the current implementation gives users false confidence that their videos are saved when they're actually lost.