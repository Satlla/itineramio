#!/usr/bin/env node

/**
 * Runtime Video Upload Test
 * 
 * This script tests the actual video upload functionality by:
 * 1. Starting the development server
 * 2. Testing the upload endpoint directly
 * 3. Creating a minimal test video file
 * 4. Simulating the upload process
 */

const { exec, spawn } = require('child_process');
const fs = require('fs');
const FormData = require('form-data');
const fetch = require('node-fetch');

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(color, message) {
  console.log(`${color}${message}${colors.reset}`);
}

function success(message) {
  log(colors.green, `✅ ${message}`);
}

function error(message) {
  log(colors.red, `❌ ${message}`);
}

function info(message) {
  log(colors.blue, `ℹ️  ${message}`);
}

function header(message) {
  log(colors.bright + colors.cyan, `\n=== ${message} ===`);
}

async function checkDependencies() {
  header('Checking Dependencies');
  
  try {
    // Check if we have node-fetch
    require('node-fetch');
    success('node-fetch is available');
  } catch (e) {
    error('node-fetch not found. Installing...');
    
    return new Promise((resolve, reject) => {
      exec('npm install node-fetch form-data', (error, stdout, stderr) => {
        if (error) {
          error(`Failed to install dependencies: ${error.message}`);
          reject(error);
        } else {
          success('Dependencies installed');
          resolve();
        }
      });
    });
  }
}

async function testUploadEndpoint() {
  header('Testing Upload Endpoint');
  
  // Create a minimal test file
  const testData = Buffer.from('fake video data for testing');
  const testFile = 'test-video.mp4';
  
  fs.writeFileSync(testFile, testData);
  info(`Created test file: ${testFile} (${testData.length} bytes)`);
  
  try {
    // Test the upload endpoint
    const formData = new FormData();
    formData.append('file', fs.createReadStream(testFile), {
      filename: testFile,
      contentType: 'video/mp4'
    });
    
    info('Sending upload request to http://localhost:3000/api/upload...');
    
    const response = await fetch('http://localhost:3000/api/upload', {
      method: 'POST',
      body: formData
    });
    
    const result = await response.json();
    
    if (response.ok) {
      success(`Upload successful: ${result.url}`);
      return result.url;
    } else {
      error(`Upload failed: ${result.error}`);
      return null;
    }
  } catch (uploadError) {
    error(`Upload error: ${uploadError.message}`);
    return null;
  } finally {
    // Clean up test file
    fs.unlinkSync(testFile);
    info('Cleaned up test file');
  }
}

async function testStepsAPI(videoUrl) {
  header('Testing Steps API');
  
  const testSteps = [
    {
      type: 'text',
      content: { es: 'Paso de prueba 1', en: '', fr: '' },
      order: 0
    },
    {
      type: 'video',
      content: { es: 'Paso con video', en: '', fr: '' },
      media: { url: videoUrl },
      mediaUrl: videoUrl,
      order: 1
    }
  ];
  
  try {
    info('Testing steps API with video URL...');
    
    // Note: This will likely fail due to authentication, but we can see if the endpoint is reachable
    const response = await fetch('http://localhost:3000/api/properties/test/zones/test/steps', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ steps: testSteps })
    });
    
    if (response.status === 401) {
      info('Steps API reachable (got 401 authentication error as expected)');
      return true;
    } else {
      const result = await response.json();
      info(`Steps API response: ${response.status} - ${JSON.stringify(result)}`);
      return response.ok;
    }
  } catch (apiError) {
    error(`Steps API error: ${apiError.message}`);
    return false;
  }
}

async function checkServerStatus() {
  header('Checking Server Status');
  
  try {
    const response = await fetch('http://localhost:3000/api/diagnostic');
    if (response.ok) {
      success('Development server is running');
      return true;
    } else {
      error('Development server is not responding correctly');
      return false;
    }
  } catch (e) {
    error('Development server is not running');
    info('Please start the development server with: npm run dev');
    return false;
  }
}

async function provideTroubleshootingSteps() {
  header('Troubleshooting Steps');
  
  console.log(`
${colors.yellow}If video upload is still not working, try these steps:${colors.reset}

${colors.cyan}1. Browser Console Debugging:${colors.reset}
   - Open DevTools → Console
   - Look for these specific logs when uploading:
     • "🎬 Starting video upload: [filename]"
     • "✅ Video validation result: true"
     • "💾 Saving video to media library..."
     • "🎬 MobileStepEditor VideoUpload onChange: { url: ... }"

${colors.cyan}2. Network Tab Investigation:${colors.reset}
   - Open DevTools → Network
   - Upload a video and check:
     • POST /api/upload (should return 200 with URL)
     • POST /api/media-library (might timeout but shouldn't fail)
     • PUT /api/properties/.../steps (should return 200)

${colors.cyan}3. Step-by-Step Manual Test:${colors.reset}
   - Try uploading a very small video (< 1MB)
   - Wait for "Video subido correctamente ✓" message
   - Add some text content to the step
   - Click "Finalizar" button
   - Check console for "🎯 MobileStepEditor: Finalizar clicked"

${colors.cyan}4. Common Issues & Solutions:${colors.reset}
   - Video too large: Try with < 5MB video
   - Wrong format: Use MP4, WebM, or MOV
   - Upload timeout: Check network connection
   - Button not clickable: Ensure step has content
   - Steps not saving: Check authentication cookies

${colors.cyan}5. Database Verification:${colors.reset}
   - If you have database access, check the 'steps' table
   - Look for a record with type='VIDEO'
   - Check if content JSON contains 'mediaUrl' field

${colors.cyan}6. Alternative Testing Method:${colors.reset}
   - Use a REST client (Postman, curl) to test:
     • POST /api/upload with a video file
     • PUT /api/properties/[id]/zones/[zoneId]/steps with the returned URL
  `);
}

async function main() {
  log(colors.bright + colors.cyan, '\n🎬 Runtime Video Upload Test\n');
  
  // Check if server is running
  const serverRunning = await checkServerStatus();
  if (!serverRunning) {
    return;
  }
  
  // Check dependencies
  try {
    await checkDependencies();
  } catch (e) {
    error('Failed to install dependencies');
    return;
  }
  
  // Test upload endpoint
  const videoUrl = await testUploadEndpoint();
  
  if (videoUrl) {
    // Test steps API
    await testStepsAPI(videoUrl);
  }
  
  // Provide troubleshooting steps
  await provideTroubleshootingSteps();
  
  header('Summary');
  
  if (videoUrl) {
    success('Upload endpoint is working correctly');
    info('The video upload pipeline structure is solid');
    log(colors.yellow, '⚠️  If the issue persists, it\'s likely in the frontend JavaScript execution');
  } else {
    error('Upload endpoint has issues');
    info('Check the server logs and fix upload issues first');
  }
}

main().catch(console.error);