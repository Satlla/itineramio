# PR: PERF-N1 - Lazy Loading for Videos

## Branch
- **Branch name**: `perf/n1-lazy-video-clean`
- **Base**: `main`
- **Status**: ✅ Ready for push (pending GitHub secret approval)

## Summary

Implements lazy loading for all homepage videos using IntersectionObserver API to dramatically reduce initial page load time and improve Time to Interactive (TTI).

## Changes

### Files Created
1. **`src/components/ui/VideoLazy.tsx`** - Lazy loading video component
   - Uses IntersectionObserver API to detect when video enters viewport
   - Threshold: 50% visible before loading
   - Pre-loads 100px before entering viewport (rootMargin)
   - `preload="none"` prevents immediate download
   - Graceful fallback for browsers without autoplay support

2. **`scripts/make-video-poster.ts`** - Automated poster generation
   - Uses ffmpeg to extract frame at 1 second
   - Uses sharp to convert to WebP with 75% quality
   - Generates lightweight posters (~20-110KB per video)

3. **`public/videos/*-poster.webp`** - 6 optimized poster images
   - no-calls-poster.webp (47KB)
   - host-preocupado-poster.webp (51KB)
   - famili-check-in-poster.webp (112KB)
   - wifi-poster.webp (58KB)
   - washing-machine-poster.webp (68KB)
   - vitro-poster.webp (66KB)
   - **Total**: 401KB vs 27MB original videos = **98.5% reduction**

4. **`.env.staging`** - Staging environment configuration
   - Feature flags for PERF-N1, N2, N3
   - All flags default to `false` for safe rollback

### Files Modified
1. **`app/page.tsx`** - Homepage video migration
   - Added VideoLazy component import
   - Added feature flag check: `NEXT_PUBLIC_ENABLE_VIDEO_LAZY`
   - Migrated all 6 videos to use conditional rendering:
     - Flag enabled → VideoLazy with poster
     - Flag disabled → Standard `<video>` (exact same behavior as before)
   - Zero breaking changes when flag is disabled

## Performance Impact (Expected)

### Before (Current)
- **TTI**: ~3.5s (mobile)
- **Initial Transfer**: ~27MB (6 videos)
- **FCP**: ~2.3s
- **Videos**: All 6 load immediately on page load

### After (Flag Enabled)
- **TTI**: ~1.5s (mobile) - **↓2s improvement**
- **Initial Transfer**: ~0.4MB (posters only) - **↓26MB improvement**
- **FCP**: ~1.5s - **↓0.8s improvement**
- **Videos**: Load only when entering viewport

### Metrics to Measure
```bash
# Run Lighthouse on mobile
npm run build
npm start
# Navigate to http://localhost:3000
# Open Chrome DevTools → Lighthouse
# Select "Mobile" + "Performance"
# Run audit

Compare:
1. TTI before/after
2. Total page weight before/after
3. FCP before/after
4. Network waterfall showing deferred video loads
```

## Feature Flag

**Environment Variable**: `NEXT_PUBLIC_ENABLE_VIDEO_LAZY`

### To Enable (Staging)
```bash
# In .env.staging or Vercel environment variables
NEXT_PUBLIC_ENABLE_VIDEO_LAZY=true
```

### To Disable (Rollback)
```bash
# In .env.staging or Vercel environment variables
NEXT_PUBLIC_ENABLE_VIDEO_LAZY=false
# Or simply remove the variable (defaults to false)
```

## Testing Checklist

### Functional Testing
- [ ] **Chrome Desktop**: Videos appear, posters visible, autoplay works when entering viewport
- [ ] **Chrome Mobile**: Videos lazy load, no layout shift (CLS)
- [ ] **Safari Desktop**: Videos work correctly
- [ ] **Safari iOS**: Videos work with `playsInline` attribute
- [ ] **Firefox**: Videos load and play correctly
- [ ] **Slow 3G**: Posters visible immediately, videos load when scrolling

### Performance Testing
- [ ] **Lighthouse Mobile** (before): TTI, FCP, Total Weight
- [ ] **Lighthouse Mobile** (after): TTI ≤ 2.0s, FCP < 2.0s
- [ ] **Network Tab**: Verify videos NOT loading until viewport entry
- [ ] **Network Tab**: Verify posters loading immediately (< 500KB total)
- [ ] **CLS Check**: No layout shift when videos load

### Regression Testing
- [ ] **Flag Disabled**: Exact same behavior as before (no changes)
- [ ] **Flag Enabled**: Videos load lazily but autoplay still works
- [ ] **No JavaScript**: Graceful degradation (poster visible)

## Evidence Required

### 1. Lighthouse Scores (Before)
```
Screenshot: lighthouse-before.png
- TTI: ___ s
- FCP: ___ s
- Total Weight: ___ MB
```

### 2. Lighthouse Scores (After)
```
Screenshot: lighthouse-after.png
- TTI: ___ s (target: ≤ 2.0s)
- FCP: ___ s (target: < 2.0s)
- Total Weight: ___ KB (target: < 3MB)
```

### 3. Network Waterfall
```
Screenshot: network-before.png
- All 6 videos loading immediately

Screenshot: network-after.png
- Only posters loading initially
- Videos load when entering viewport
```

### 4. Visual Comparison
```
Screenshot: mobile-home-before.png
- Blank areas while videos load

Screenshot: mobile-home-after.png
- Posters visible immediately
```

## Rollback Plan

### Immediate Rollback (< 5 minutes)
```bash
# Option 1: Disable flag
NEXT_PUBLIC_ENABLE_VIDEO_LAZY=false

# Option 2: Revert deployment
vercel rollback

# Option 3: Revert merge
git revert <merge-commit-sha>
```

### No Database Changes
- This PR does not touch the database
- No migrations needed
- Pure frontend change

## Technical Details

### IntersectionObserver Configuration
```typescript
new IntersectionObserver(
  ([entry]) => {
    if (entry.isIntersecting && !shouldLoad) {
      setShouldLoad(true)
      videoRef.current?.play()
    }
  },
  {
    threshold: 0.5,        // 50% visible
    rootMargin: '100px'    // Pre-load 100px before viewport
  }
)
```

### Poster Generation Process
1. Extract frame at 1s: `ffmpeg -i video.mp4 -ss 00:00:01.000 -vframes 1 -vf scale=1920:1080`
2. Convert to WebP: `sharp(jpg).webp({ quality: 75 })`
3. Result: 75-90% smaller than original frame

### Browser Compatibility
- IntersectionObserver: 95%+ browser support
- WebP: 95%+ browser support
- Fallback: Standard `<video>` when flag disabled

## References

- **Plan**: `/docs/perf/PERF_PLAN.md` (Section N1)
- **Measurement Guide**: `/docs/perf/MEASUREMENT_GUIDE.md`
- **Budget**: `/docs/perf/PERF_BUDGET.md`

## Security Notes

- No security implications
- No user data touched
- No API changes
- Pure frontend optimization

## Deployment Plan

1. **Staging**: Enable flag, test for 24h
2. **Canary**: Enable for 10% users
3. **Production**: Gradual rollout (25% → 50% → 100%)
4. **Monitoring**: Watch TTI, error rates, video play rates

## GitHub Push Note

⚠️ **Note**: This branch cannot be pushed due to GitHub Secret Scanning detecting Stripe API keys in the main branch's git history (not in this PR's changes).

**To push this branch**:
1. Visit GitHub repository settings
2. Allow the flagged secrets (they're in old commits, not this PR)
3. Or manually push using the allow URLs provided by GitHub

**Flagged commits** (in main branch history, not this PR):
- `1caf194` - scripts/setup-stripe-live-products.js
- `8c5ec98` - .env.stripe.example
- `8535141` - .env.local
- `62efbd8` - setup-stripe-env.sh

These files are NOT part of this PR - they're in the repo's git history.

---

**Commit**: `2ad9d0d`
**Author**: Alejandro Satlla
**Date**: 2025-10-19
