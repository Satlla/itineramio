# Video Upload & Save Debugging Guide

## 🔍 Issue Analysis

All structural tests passed and the upload endpoint is working correctly. The issue is likely in the **runtime execution** of the video save process.

## ✅ What's Working

1. **VideoUpload component** - Structure is correct
2. **MobileStepEditor component** - VideoUpload integration is proper
3. **StepEditor component** - Mobile editor forwarding is correct
4. **Zone detail page** - handleSaveSteps function is implemented
5. **API endpoint** - Steps saving logic is complete
6. **Upload endpoint** - File upload is working (tested successfully)

## 🎯 Debugging Steps

### Step 1: Test Video Upload Component
1. Open browser DevTools (F12)
2. Go to Console tab
3. Navigate to the zone editing page
4. Try uploading a small video (< 5MB, MP4 format)
5. Look for these console logs:

```
🎬 Starting video upload: filename.mp4
📋 Validating file: filename.mp4 video/mp4 [size]
✅ Video validation result: true
💾 Saving video to media library...
✅ Video saved to media library: [result]
🎬 MobileStepEditor VideoUpload onChange: { url: "...", metadata: {...} }
```

**If you DON'T see these logs:**
- Video upload component is not working
- Check for JavaScript errors in console
- Try with a different video file

**If you DO see these logs:**
- Video upload is working, continue to Step 2

### Step 2: Test Step Media Assignment
After video upload succeeds, check the step data:
1. In Console, look for:
```
📹 Setting video data in step: { url: "...", thumbnail: "...", title: "..." }
```

2. You should see the step being updated with media information

**If you DON'T see this:**
- The VideoUpload onChange is not calling updateStep correctly
- Check MobileStepEditor VideoUpload onChange handler

### Step 3: Test Step Saving
1. Add some text content to the step (required for saving)
2. Click the "Finalizar" button
3. Look for these console logs:

```
🎯 MobileStepEditor: Finalizar clicked (TOP)
🎯 Steps to save: [array of steps]
🔵 StepEditor: onSave called with X steps
💾 handleSaveSteps called with: [steps array]
🚨 PUT /steps endpoint called
💾 Response status: 200
✅ Steps saved: Saved X steps
```

**If you DON'T see "🎯 MobileStepEditor: Finalizar clicked":**
- Button click is not registering
- Check if button is disabled (needs step content)
- Check for JavaScript errors

**If you see the click but NOT the API call:**
- onSave prop chain is broken
- Check StepEditor → ZoneDetailPage connection

### Step 4: Check Network Requests
1. Open DevTools → Network tab
2. Upload video and save steps
3. Look for these requests:

```
POST /api/upload → Status 200, Response: {"success": true, "url": "..."}
PUT /api/properties/[id]/zones/[zoneId]/steps → Status 200
```

**If upload fails:**
- Check file size (max 100MB)
- Check file format (MP4, WebM, MOV)
- Check network connection

**If steps PUT request fails:**
- Check authentication (should have auth-token cookie)
- Check request payload (should contain steps array)
- Check response for error details

### Step 5: Verify Database Persistence
If you have database access:
1. Check the `steps` table for your zone
2. Look for a record with `type = 'VIDEO'`
3. Check the `content` JSON field for `mediaUrl`

Example expected content:
```json
{
  "es": "Video description",
  "en": "",
  "fr": "",
  "mediaUrl": "/uploads/filename.mp4"
}
```

## 🚨 Common Issues & Solutions

### Issue: Video uploads but step doesn't save
**Cause:** Button is disabled because step content is empty
**Solution:** Add text content to the step before clicking "Finalizar"

### Issue: "Finalizar" button doesn't respond
**Cause:** JavaScript error preventing click handler
**Solution:** Check console for errors, refresh page and try again

### Issue: Video uploads but mediaUrl is missing in database
**Cause:** Data transformation error in handleSaveSteps
**Solution:** Check the request payload in Network tab

### Issue: Steps save but video is lost
**Cause:** mediaUrl not properly extracted from step.media.url
**Solution:** Verify the data flow in handleSaveSteps function

### Issue: Upload fails with "File too large"
**Cause:** Video file exceeds 100MB limit
**Solution:** Use a smaller video file or compress the video

## 🔧 Quick Fixes to Try

### Fix 1: Refresh and Retry
1. Refresh the page
2. Try with a very small video file (< 1MB)
3. Make sure to add text content to the step
4. Click "Finalizar"

### Fix 2: Check File Format
1. Use an MP4 video file
2. Ensure it's a valid video (can play in browser)
3. Try with a video recorded on your phone

### Fix 3: Clear Browser Cache
1. Clear browser cache and cookies
2. Try in incognito/private mode
3. Try in a different browser

### Fix 4: Verify Authentication
1. Make sure you're logged in
2. Check that auth-token cookie exists
3. Try logging out and back in

## 📞 Need More Help?

If the issue persists after following these steps:

1. **Share Console Logs:** Copy all console logs from the upload attempt
2. **Share Network Tab:** Screenshot of the Network requests and responses
3. **Describe Behavior:** What exactly happens vs. what you expect
4. **Share Test Details:** Video file size, format, browser used

The most likely issue is:
- **Missing step content** (button disabled)
- **JavaScript error** (check console)
- **Authentication issue** (check cookies)
- **Video format/size issue** (try different file)

## 🎯 Expected Working Flow

```
1. Upload video → See upload logs → Video URL returned
2. Video assigned to step → See media assignment logs
3. Add text content → Button becomes enabled
4. Click "Finalizar" → See save logs → API call made
5. Steps saved → Success message → Navigate away
```

Each step should produce specific console logs. The first step that doesn't produce expected logs is where the issue lies.