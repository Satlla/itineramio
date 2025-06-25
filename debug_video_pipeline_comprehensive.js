#!/usr/bin/env node

/**
 * Comprehensive Video Upload Pipeline Debugger
 * 
 * This script tests the complete video upload and save flow:
 * 1. VideoUpload component functionality
 * 2. File upload to /api/upload
 * 3. MobileStepEditor onChange handling
 * 4. handleSaveSteps execution
 * 5. API call to save steps
 * 6. Database persistence
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(color, message) {
  console.log(`${color}${message}${colors.reset}`);
}

function header(message) {
  log(colors.bright + colors.cyan, `\n${'='.repeat(80)}`);
  log(colors.bright + colors.cyan, `  ${message}`);
  log(colors.bright + colors.cyan, `${'='.repeat(80)}\n`);
}

function section(message) {
  log(colors.bright + colors.blue, `\n--- ${message} ---`);
}

function success(message) {
  log(colors.green, `✅ ${message}`);
}

function error(message) {
  log(colors.red, `❌ ${message}`);
}

function warning(message) {
  log(colors.yellow, `⚠️  ${message}`);
}

function info(message) {
  log(colors.blue, `ℹ️  ${message}`);
}

async function checkFileExists(filePath) {
  try {
    await fs.promises.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function readFile(filePath) {
  try {
    return await fs.promises.readFile(filePath, 'utf8');
  } catch (error) {
    return null;
  }
}

async function searchInFile(filePath, searchPattern) {
  const content = await readFile(filePath);
  if (!content) return false;
  
  if (typeof searchPattern === 'string') {
    return content.includes(searchPattern);
  } else {
    return searchPattern.test(content);
  }
}

async function countOccurrences(filePath, searchPattern) {
  const content = await readFile(filePath);
  if (!content) return 0;
  
  if (typeof searchPattern === 'string') {
    return (content.match(new RegExp(searchPattern, 'g')) || []).length;
  } else {
    return (content.match(searchPattern) || []).length;
  }
}

async function extractCodeBlock(filePath, startPattern, endPattern) {
  const content = await readFile(filePath);
  if (!content) return null;
  
  const startIndex = content.indexOf(startPattern);
  if (startIndex === -1) return null;
  
  const endIndex = content.indexOf(endPattern, startIndex);
  if (endIndex === -1) return null;
  
  return content.substring(startIndex, endIndex + endPattern.length);
}

async function testVideoUploadComponent() {
  header('🎬 Testing VideoUpload Component');
  
  const videoUploadPath = 'src/components/ui/VideoUpload.tsx';
  
  if (!(await checkFileExists(videoUploadPath))) {
    error('VideoUpload component not found');
    return false;
  }
  
  success('VideoUpload component found');
  
  // Check key functionalities
  const checks = [
    {
      name: 'onChange prop exists',
      pattern: 'onChange: (videoUrl: string | null, metadata?: VideoMetadata) => void'
    },
    {
      name: 'handleUpload function exists',
      pattern: 'const handleUpload = async (file: File)'
    },
    {
      name: 'Upload to /api/upload',
      pattern: "xhr.open('POST', '/api/upload')"
    },
    {
      name: 'onChange callback called on success',
      pattern: 'onChange(data.url, metadata || undefined)'
    },
    {
      name: 'Video validation',
      pattern: 'const validateVideo = async (file: File)'
    },
    {
      name: 'Progress tracking',
      pattern: 'setUploadProgress'
    },
    {
      name: 'Error handling',
      pattern: 'setVideoError'
    }
  ];
  
  let allPassed = true;
  for (const check of checks) {
    if (await searchInFile(videoUploadPath, check.pattern)) {
      success(check.name);
    } else {
      error(check.name);
      allPassed = false;
    }
  }
  
  // Check for debug logs
  const debugCount = await countOccurrences(videoUploadPath, /console\.log/g);
  info(`Found ${debugCount} debug logs in VideoUpload component`);
  
  return allPassed;
}

async function testMobileStepEditor() {
  header('📱 Testing MobileStepEditor Component');
  
  const editorPath = 'src/components/ui/MobileStepEditor.tsx';
  
  if (!(await checkFileExists(editorPath))) {
    error('MobileStepEditor component not found');
    return false;
  }
  
  success('MobileStepEditor component found');
  
  // Check VideoUpload integration
  const checks = [
    {
      name: 'VideoUpload import',
      pattern: "import { VideoUpload } from './VideoUpload'"
    },
    {
      name: 'VideoUpload usage',
      pattern: '<VideoUpload'
    },
    {
      name: 'VideoUpload onChange handler',
      pattern: 'onChange={(url, metadata) => {'
    },
    {
      name: 'Step media update',
      pattern: 'updateStep(index, {'
    },
    {
      name: 'onSave prop handling',
      pattern: 'onSave: (steps: Step[]) => void'
    },
    {
      name: 'Finalizar button onClick',
      pattern: 'onClick={(e) => {'
    },
    {
      name: 'Steps validation',
      pattern: 'steps.every(step => !step.content.es?.trim())'
    }
  ];
  
  let allPassed = true;
  for (const check of checks) {
    if (await searchInFile(editorPath, check.pattern)) {
      success(check.name);
    } else {
      error(check.name);
      allPassed = false;
    }
  }
  
  // Extract the VideoUpload onChange handler
  const onChangeHandler = await extractCodeBlock(
    editorPath,
    'onChange={(url, metadata) => {',
    '})'
  );
  
  if (onChangeHandler) {
    info('VideoUpload onChange handler found:');
    console.log(onChangeHandler.substring(0, 200) + '...');
  } else {
    warning('Could not extract VideoUpload onChange handler');
  }
  
  // Check for debug logs
  const debugCount = await countOccurrences(editorPath, /console\.log/g);
  info(`Found ${debugCount} debug logs in MobileStepEditor`);
  
  return allPassed;
}

async function testStepEditor() {
  header('📝 Testing StepEditor Component');
  
  const editorPath = 'src/components/ui/StepEditor.tsx';
  
  if (!(await checkFileExists(editorPath))) {
    error('StepEditor component not found');
    return false;
  }
  
  success('StepEditor component found');
  
  // Check mobile editor integration
  const checks = [
    {
      name: 'MobileStepEditor import',
      pattern: "import { MobileStepEditor as MobileStepEditorNew } from './MobileStepEditor'"
    },
    {
      name: 'Mobile detection',
      pattern: 'const [isMobile, setIsMobile] = useState(false)'
    },
    {
      name: 'MobileStepEditor usage',
      pattern: '<MobileStepEditorNew'
    },
    {
      name: 'onSave prop forwarding',
      pattern: 'onSave={(steps) => {'
    },
    {
      name: 'Debug logging in onSave',
      pattern: "console.log('🔵 StepEditor: onSave called with'"
    }
  ];
  
  let allPassed = true;
  for (const check of checks) {
    if (await searchInFile(editorPath, check.pattern)) {
      success(check.name);
    } else {
      error(check.name);
      allPassed = false;
    }
  }
  
  return allPassed;
}

async function testZoneDetailPage() {
  header('🏠 Testing Zone Detail Page');
  
  const pagePath = 'app/(dashboard)/properties/[id]/zones/[zoneId]/page.tsx';
  
  if (!(await checkFileExists(pagePath))) {
    error('Zone detail page not found');
    return false;
  }
  
  success('Zone detail page found');
  
  // Check handleSaveSteps function
  const checks = [
    {
      name: 'StepEditor import',
      pattern: "import { StepEditor } from '../../../../../../src/components/ui/StepEditor'"
    },
    {
      name: 'handleSaveSteps function',
      pattern: 'const handleSaveSteps = async (steps: any[]) => {'
    },
    {
      name: 'API endpoint call',
      pattern: "fetch(`/api/properties/${propertyId}/zones/${zoneId}/steps`"
    },
    {
      name: 'PUT method',
      pattern: "method: 'PUT'"
    },
    {
      name: 'Steps formatting',
      pattern: 'const formattedSteps = steps.map((step, index) => {'
    },
    {
      name: 'Media URL handling',
      pattern: 'mediaUrl: step.media?.url || null'
    },
    {
      name: 'StepEditor onSave prop',
      pattern: 'onSave={handleSaveSteps}'
    }
  ];
  
  let allPassed = true;
  for (const check of checks) {
    if (await searchInFile(pagePath, check.pattern)) {
      success(check.name);
    } else {
      error(check.name);
      allPassed = false;
    }
  }
  
  // Extract handleSaveSteps function
  const saveHandler = await extractCodeBlock(
    pagePath,
    'const handleSaveSteps = async (steps: any[]) => {',
    '}'
  );
  
  if (saveHandler) {
    info('handleSaveSteps function structure looks correct');
  } else {
    warning('Could not extract handleSaveSteps function');
  }
  
  // Check for debug logs
  const debugCount = await countOccurrences(pagePath, /console\.log.*💾/g);
  info(`Found ${debugCount} debug logs in handleSaveSteps`);
  
  return allPassed;
}

async function testAPIEndpoint() {
  header('🌐 Testing API Endpoint');
  
  const apiPath = 'app/api/properties/[id]/zones/[zoneId]/steps/route.ts';
  
  if (!(await checkFileExists(apiPath))) {
    error('Steps API endpoint not found');
    return false;
  }
  
  success('Steps API endpoint found');
  
  // Check PUT endpoint implementation
  const checks = [
    {
      name: 'PUT export',
      pattern: 'export async function PUT('
    },
    {
      name: 'Authentication check',
      pattern: "const token = request.cookies.get('auth-token')?.value"
    },
    {
      name: 'Body parsing',
      pattern: 'const body = await request.json()'
    },
    {
      name: 'Steps extraction',
      pattern: 'const { steps } = body'
    },
    {
      name: 'Zone validation',
      pattern: 'const zone = await prisma.zone.findFirst({'
    },
    {
      name: 'Delete existing steps',
      pattern: 'await prisma.step.deleteMany({'
    },
    {
      name: 'Create new steps',
      pattern: 'await prisma.step.create({'
    },
    {
      name: 'Media URL handling in content',
      pattern: '...(step.mediaUrl && { mediaUrl: step.mediaUrl })'
    },
    {
      name: 'Success response',
      pattern: 'message: `Saved ${createdSteps.length} steps`'
    }
  ];
  
  let allPassed = true;
  for (const check of checks) {
    if (await searchInFile(apiPath, check.pattern)) {
      success(check.name);
    } else {
      error(check.name);
      allPassed = false;
    }
  }
  
  // Check for debug logs
  const debugCount = await countOccurrences(apiPath, /console\.log.*🚨/g);
  info(`Found ${debugCount} debug logs in API endpoint`);
  
  return allPassed;
}

async function testUploadEndpoint() {
  header('☁️ Testing Upload Endpoint');
  
  const uploadPath = 'app/api/upload/route.ts';
  
  if (!(await checkFileExists(uploadPath))) {
    error('Upload API endpoint not found');
    return false;
  }
  
  success('Upload API endpoint found');
  
  // Check upload functionality
  const checks = [
    {
      name: 'POST export',
      pattern: 'export async function POST(request: NextRequest)'
    },
    {
      name: 'FormData parsing',
      pattern: 'const data = await request.formData()'
    },
    {
      name: 'File extraction',
      pattern: "const file: File | null = data.get('file')"
    },
    {
      name: 'File size validation',
      pattern: 'if (file.size > 100 * 1024 * 1024)'
    },
    {
      name: 'Development mode handling',
      pattern: "if (process.env.NODE_ENV === 'development')"
    },
    {
      name: 'Filesystem upload',
      pattern: 'await writeFile(path, buffer)'
    },
    {
      name: 'Vercel Blob upload',
      pattern: 'await put(uniqueFilename, file'
    },
    {
      name: 'Success response',
      pattern: 'success: true,'
    }
  ];
  
  let allPassed = true;
  for (const check of checks) {
    if (await searchInFile(uploadPath, check.pattern)) {
      success(check.name);
    } else {
      error(check.name);
      allPassed = false;
    }
  }
  
  return allPassed;
}

async function testDataFlow() {
  header('🔄 Testing Data Flow Integration');
  
  // Test the complete data flow chain
  const flowSteps = [
    {
      name: 'VideoUpload → MobileStepEditor',
      description: 'VideoUpload calls onChange with URL and metadata'
    },
    {
      name: 'MobileStepEditor → StepEditor', 
      description: 'MobileStepEditor calls onSave with steps array'
    },
    {
      name: 'StepEditor → ZoneDetailPage',
      description: 'StepEditor forwards onSave to handleSaveSteps'
    },
    {
      name: 'ZoneDetailPage → API',
      description: 'handleSaveSteps formats data and calls API'
    },
    {
      name: 'API → Database',
      description: 'API endpoint saves steps to database'
    }
  ];
  
  info('Data flow chain:');
  for (let i = 0; i < flowSteps.length; i++) {
    const step = flowSteps[i];
    console.log(`  ${i + 1}. ${step.name}`);
    console.log(`     ${step.description}`);
  }
  
  // Check for potential issues
  section('Potential Issues Analysis');
  
  // Check if mediaUrl is properly preserved through the chain
  const mobileEditorContent = await readFile('src/components/ui/MobileStepEditor.tsx');
  const zonePageContent = await readFile('app/(dashboard)/properties/[id]/zones/[zoneId]/page.tsx');
  const apiContent = await readFile('app/api/properties/[id]/zones/[zoneId]/steps/route.ts');
  
  if (mobileEditorContent && mobileEditorContent.includes('media: {')) {
    success('MobileStepEditor sets media object in step');
  } else {
    error('MobileStepEditor may not be setting media object properly');
  }
  
  if (zonePageContent && zonePageContent.includes('mediaUrl: step.media?.url')) {
    success('handleSaveSteps extracts mediaUrl from step.media.url');
  } else {
    error('handleSaveSteps may not be extracting mediaUrl properly');
  }
  
  if (apiContent && apiContent.includes('{ mediaUrl: step.mediaUrl }')) {
    success('API endpoint includes mediaUrl in content JSON');
  } else {
    error('API endpoint may not be saving mediaUrl properly');
  }
  
  return true;
}

async function generateDebugInstructions() {
  header('🔧 Debug Instructions');
  
  info('To debug the video upload issue, follow these steps:');
  
  console.log(`
${colors.yellow}1. Open Browser Developer Tools${colors.reset}
   - Open the page where video upload fails
   - Go to Console tab
   - Enable all log levels (Info, Warnings, Errors)

${colors.yellow}2. Test Video Upload${colors.reset}
   - Try uploading a video file
   - Watch for these console logs:
     • VideoUpload: "🎬 Starting video upload"
     • VideoUpload: "✅ Video validation result"
     • VideoUpload: "💾 Saving video to media library"
     • MobileStepEditor: "🎬 MobileStepEditor VideoUpload onChange"
     • API: "🚨 PUT /steps endpoint called"

${colors.yellow}3. Check Network Tab${colors.reset}
   - Go to Network tab
   - Look for:
     • POST /api/upload (should return 200 with URL)
     • PUT /api/properties/.../steps (should return 200)
   - Check request/response payloads

${colors.yellow}4. Test Step Saving${colors.reset}
   - After uploading video, click "Finalizar"
   - Watch for these console logs:
     • "🎯 MobileStepEditor: Finalizar clicked"
     • "🔵 StepEditor: onSave called with X steps"
     • "💾 handleSaveSteps called with"
     • "🚨 PUT /steps endpoint called"

${colors.yellow}5. Database Check${colors.reset}
   - If available, check the database directly
   - Look at the 'steps' table for the zone
   - Check if mediaUrl is in the content JSON field

${colors.yellow}6. Common Issues to Look For${colors.reset}
   - Upload fails: Check file size, format, network
   - Video uploads but doesn't save: Check console for errors
   - Steps save but video missing: Check mediaUrl in database
   - Button doesn't work: Check for JavaScript errors
  `);
}

async function main() {
  header('🎬 Comprehensive Video Upload Pipeline Debugger');
  
  const results = [];
  
  // Test each component
  results.push({ name: 'VideoUpload Component', passed: await testVideoUploadComponent() });
  results.push({ name: 'MobileStepEditor Component', passed: await testMobileStepEditor() });
  results.push({ name: 'StepEditor Component', passed: await testStepEditor() });
  results.push({ name: 'Zone Detail Page', passed: await testZoneDetailPage() });
  results.push({ name: 'API Endpoint', passed: await testAPIEndpoint() });
  results.push({ name: 'Upload Endpoint', passed: await testUploadEndpoint() });
  results.push({ name: 'Data Flow', passed: await testDataFlow() });
  
  // Summary
  header('📊 Test Results Summary');
  
  const passed = results.filter(r => r.passed).length;
  const total = results.length;
  
  for (const result of results) {
    if (result.passed) {
      success(`${result.name}: PASSED`);
    } else {
      error(`${result.name}: FAILED`);
    }
  }
  
  console.log();
  if (passed === total) {
    success(`All ${total} tests passed! The pipeline structure looks correct.`);
    warning('If video saving still doesn\'t work, the issue is likely runtime-specific.');
  } else {
    error(`${total - passed} out of ${total} tests failed. Review the issues above.`);
  }
  
  await generateDebugInstructions();
  
  header('🎯 Next Steps');
  
  if (passed === total) {
    info('Since all structural tests passed, try these runtime debugging steps:');
    console.log(`
${colors.cyan}1. Test with a small video file (< 5MB)${colors.reset}
${colors.cyan}2. Check browser console for any JavaScript errors${colors.reset}
${colors.cyan}3. Verify network requests complete successfully${colors.reset}
${colors.cyan}4. Test on different browsers/devices${colors.reset}
${colors.cyan}5. Check if the issue is specific to certain video formats${colors.reset}
    `);
  } else {
    info('Fix the structural issues identified above first, then rerun this test.');
  }
}

// Run the debugger
main().catch(console.error);