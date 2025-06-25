#!/usr/bin/env node
/**
 * DEBUG SCRIPT: Video Pipeline Investigation
 * This script simulates the video saving pipeline to identify where video data is lost
 */

console.log('🔍 DEBUG: Video Pipeline Investigation Starting...\n');

// Simulate the VideoUpload component flow
console.log('1️⃣ STEP 1: VideoUpload Component');
console.log('=====================================');

// Simulated video upload result from VideoUpload component
const simulatedVideoUploadResult = {
  videoUrl: 'https://example.com/uploads/video-123.mp4',
  metadata: {
    duration: 25.5,
    thumbnail: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...',
    size: 5242880, // 5MB
    width: 720,
    height: 1280
  }
};

console.log('📹 VideoUpload onChange called with:');
console.log('   - videoUrl:', simulatedVideoUploadResult.videoUrl);
console.log('   - metadata:', JSON.stringify(simulatedVideoUploadResult.metadata, null, 2));
console.log('');

// Simulate StepEditor/MobileStepEditor processing
console.log('2️⃣ STEP 2: Step Editor Processing');
console.log('=====================================');

// How the step editor should build the step object
const stepFromEditor = {
  id: 'step-123-456',
  type: 'video',
  content: {
    es: 'Descripción del video en español',
    en: 'Video description in English',
    fr: 'Description de la vidéo en français'
  },
  media: {
    url: simulatedVideoUploadResult.videoUrl,
    thumbnail: simulatedVideoUploadResult.metadata.thumbnail,
    title: 'Uploaded video'
  },
  order: 1
};

console.log('📝 Step object created by editor:');
console.log(JSON.stringify(stepFromEditor, null, 2));
console.log('');

// Simulate saveStepsData processing
console.log('3️⃣ STEP 3: saveStepsData Function');
console.log('=====================================');

const steps = [stepFromEditor];

// Simulate the saveStepsData function logic
const stepsForAPI = steps.map((step, index) => {
  console.log(`📝 Processing step ${index + 1}:`, {
    id: step.id,
    type: step.type,
    hasMedia: !!step.media,
    mediaUrl: step.media?.url,
    title: step.title || step.content
  });
  
  // Prepare content object that includes media URLs
  let contentData = step.content || {};
  
  // If step has media (video/image), include mediaUrl in content
  if (step.media?.url) {
    console.log(`🎬 Step ${index + 1} has media, adding to content:`, {
      url: step.media.url,
      thumbnail: step.media.thumbnail,
      title: step.media.title
    });
    contentData = {
      ...contentData,
      mediaUrl: step.media.url,
      thumbnail: step.media.thumbnail,
      title: step.media.title
    };
  }
  
  const apiStep = {
    type: step.type?.toLowerCase() || 'text',
    title: step.title || step.content,
    content: contentData,
    order: index + 1,
    status: 'ACTIVE'
  };
  
  console.log(`✅ Step ${index + 1} prepared for API:`, JSON.stringify(apiStep, null, 2));
  return apiStep;
});

console.log('💾 Final steps payload for API:');
console.log(JSON.stringify({ steps: stepsForAPI }, null, 2));
console.log('');

// Simulate API processing
console.log('4️⃣ STEP 4: API Processing');
console.log('=====================================');

// Simulate how the API should process the step
const apiStep = stepsForAPI[0];
console.log('🚨 API received step:', JSON.stringify(apiStep, null, 2));

// How the API creates the database record
const stepData = {
  title: typeof apiStep.title === 'string' 
    ? { es: apiStep.title.substring(0, 100), en: '', fr: '' }
    : {
        es: (apiStep.title?.es || '').substring(0, 100) || 'Paso 1',
        en: (apiStep.title?.en || '').substring(0, 100) || '',
        fr: (apiStep.title?.fr || '').substring(0, 100) || ''
      },
  content: typeof apiStep.content === 'string'
    ? { 
        es: apiStep.content, 
        en: '', 
        fr: '',
        // Include media data in content JSON
        ...(apiStep.mediaUrl && { mediaUrl: apiStep.mediaUrl }),
        ...(apiStep.linkUrl && { linkUrl: apiStep.linkUrl })
      }
    : {
        es: apiStep.content?.es || '',
        en: apiStep.content?.en || '',
        fr: apiStep.content?.fr || '',
        // Include media data in content JSON
        ...(apiStep.content?.mediaUrl && { mediaUrl: apiStep.content.mediaUrl }),
        ...(apiStep.content?.thumbnail && { thumbnail: apiStep.content.thumbnail }),
        ...(apiStep.content?.title && { title: apiStep.content.title })
      },
  type: (apiStep.type || 'TEXT').toUpperCase(),
  order: apiStep.order !== undefined ? apiStep.order : 1,
  isPublished: true,
  zoneId: 'zone-123'
};

console.log('🚨 Database record to be created:');
console.log(JSON.stringify(stepData, null, 2));
console.log('');

// Simulate database retrieval
console.log('5️⃣ STEP 5: Database Retrieval');
console.log('=====================================');

// Simulate the database record as it would be stored
const dbRecord = {
  id: 'step-db-123',
  title: stepData.title,
  content: stepData.content,
  type: stepData.type,
  order: stepData.order,
  isPublished: stepData.isPublished,
  zoneId: stepData.zoneId,
  createdAt: new Date(),
  updatedAt: new Date()
};

console.log('💾 Database record:');
console.log(JSON.stringify(dbRecord, null, 2));
console.log('');

// Simulate API GET response processing
console.log('6️⃣ STEP 6: API GET Response Processing');
console.log('=====================================');

// How the GET API processes the database record
let media = undefined;
let cleanContent = dbRecord.content || { es: '', en: '' };

if (dbRecord.content && typeof dbRecord.content === 'object' && dbRecord.content.mediaUrl) {
  media = {
    url: dbRecord.content.mediaUrl,
    thumbnail: dbRecord.content.thumbnail,
    title: dbRecord.content.title || 'Media'
  };
  
  // Remove media fields from content to keep it clean
  const { mediaUrl, thumbnail, title, ...restContent } = dbRecord.content;
  cleanContent = restContent;
}

const processedStep = {
  id: dbRecord.id,
  type: dbRecord.type?.toUpperCase() || 'TEXT',
  title: dbRecord.title || { es: 'Paso 1', en: 'Step 1' },
  content: cleanContent,
  media: media,
  order: dbRecord.order || 1,
  isPublished: dbRecord.isPublished
};

console.log('📤 Processed step returned by GET API:');
console.log(JSON.stringify(processedStep, null, 2));
console.log('');

// Summary
console.log('📊 PIPELINE ANALYSIS SUMMARY');
console.log('=====================================');
console.log('✅ VideoUpload: Provides video URL and metadata');
console.log('✅ StepEditor: Creates step with media object');
console.log('✅ saveStepsData: Includes mediaUrl in content for API');
console.log('✅ API PUT: Stores mediaUrl in content JSON field');
console.log('✅ API GET: Extracts mediaUrl from content and creates media object');
console.log('');
console.log('🎯 POTENTIAL ISSUES TO CHECK:');
console.log('1. VideoUpload component not calling onChange with video URL');
console.log('2. StepEditor not setting media object correctly');
console.log('3. saveStepsData not including mediaUrl in content');
console.log('4. API not storing mediaUrl in database content field');
console.log('5. GET API not extracting mediaUrl from content correctly');
console.log('');
console.log('🔍 DEBUGGING STEPS:');
console.log('1. Check console logs during video upload');
console.log('2. Verify step object has media.url after video upload');
console.log('3. Check network tab for API payloads');
console.log('4. Verify database content field contains mediaUrl');
console.log('5. Check GET API response includes media object');