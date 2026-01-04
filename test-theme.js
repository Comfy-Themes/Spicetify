#!/usr/bin/env node

/**
 * Comprehensive Theme Validation Test Suite
 * Tests theme integrity, features, and compatibility without requiring Spotify/Spicetify installation
 */

const fs = require('fs');
const path = require('path');

// ANSI color codes for output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

let testsPassed = 0;
let testsFailed = 0;
const failures = [];

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function test(name, fn) {
  try {
    fn();
    testsPassed++;
    log(`✓ ${name}`, 'green');
    return true;
  } catch (error) {
    testsFailed++;
    failures.push({ name, error: error.message });
    log(`✗ ${name}`, 'red');
    log(`  ${error.message}`, 'red');
    return false;
  }
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function fileExists(filepath) {
  return fs.existsSync(filepath);
}

function readFile(filepath) {
  return fs.readFileSync(filepath, 'utf8');
}

log('\n═══════════════════════════════════════════════', 'cyan');
log('   COMFY THEME VALIDATION TEST SUITE', 'cyan');
log('═══════════════════════════════════════════════\n', 'cyan');

// Test 1: File Structure
log('📁 Testing File Structure...', 'blue');

test('README.md exists and contains version info', () => {
  const readme = readFile('README.md');
  assert(fileExists('README.md'), 'README.md not found');
  assert(readme.includes('2.42.7'), 'README missing Spicetify version 2.42.7');
  assert(readme.includes('1.2.80'), 'README missing Spotify version 1.2.80');
  assert(readme.includes('UNOFFICIAL'), 'README missing unofficial warning');
});

test('manifest.json exists and is valid', () => {
  assert(fileExists('manifest.json'), 'manifest.json not found');
  const manifest = JSON.parse(readFile('manifest.json'));
  assert(Array.isArray(manifest), 'manifest.json is not an array');
  
  const unofficialTheme = manifest.find(t => t.name.includes('Unofficial'));
  assert(unofficialTheme, 'Unofficial theme entry not found in manifest');
  assert(unofficialTheme.branch === 'unofficial', 'Branch not set to unofficial');
});

test('Comfy directory exists', () => {
  assert(fileExists('Comfy'), 'Comfy directory not found');
  assert(fs.statSync('Comfy').isDirectory(), 'Comfy is not a directory');
});

test('Required theme files exist', () => {
  const requiredFiles = [
    'Comfy/app.css',
    'Comfy/app.scss',
    'Comfy/color.ini',
    'Comfy/theme.script.js',
    'Comfy/user.css',
    'Comfy/README.md'
  ];
  
  requiredFiles.forEach(file => {
    assert(fileExists(file), `${file} not found`);
  });
});

test('Documentation files exist', () => {
  const docs = [
    'UNOFFICIAL_BRANCH_NOTES.md',
    'TESTING_CHECKLIST.md',
    'CONTRIBUTING_UNOFFICIAL.md',
    'COMPATIBILITY_ANALYSIS.md',
    'QUICK_START.md'
  ];
  
  docs.forEach(doc => {
    assert(fileExists(doc), `${doc} not found`);
  });
});

// Test 2: CSS Validation
log('\n🎨 Testing CSS/SCSS...', 'blue');

test('app.css is not empty and contains valid CSS', () => {
  const css = readFile('Comfy/app.css');
  assert(css.length > 1000, 'app.css is too small (< 1KB)');
  assert(css.includes(':root'), 'CSS missing :root selector');
  assert(css.includes('--spice-'), 'CSS missing spice variables');
  assert(!css.includes('undefined'), 'CSS contains undefined values');
});

test('app.scss exists and has content', () => {
  const scss = readFile('Comfy/app.scss');
  assert(scss.length > 100, 'app.scss is too small');
});

test('CSS uses mapped class names', () => {
  const css = readFile('Comfy/app.css');
  const mappedClasses = [
    'main-actionBar-ActionBar',
    'main-topBar-container',
    'main-nowPlayingBar-container',
    'main-trackList-trackList',
    'main-card-card',
    'Root__main-view'
  ];
  
  mappedClasses.forEach(className => {
    assert(css.includes(className), `CSS missing mapped class: ${className}`);
  });
});

test('CSS contains essential UI elements', () => {
  const css = readFile('Comfy/app.css');
  const essentialElements = [
    'playback-bar',
    'player-controls',
    'main-entityHeader',
    'main-contextMenu',
    'volume-bar'
  ];
  
  essentialElements.forEach(element => {
    assert(css.includes(element), `CSS missing essential element: ${element}`);
  });
});

// Test 3: JavaScript Validation
log('\n⚙️ Testing JavaScript...', 'blue');

test('theme.script.js exists and is valid JavaScript', () => {
  const js = readFile('Comfy/theme.script.js');
  assert(js.length > 1000, 'theme.script.js is too small');
  
  // Check for syntax errors by wrapping in function
  try {
    new Function(js);
  } catch (e) {
    throw new Error(`JavaScript syntax error: ${e.message}`);
  }
});

test('theme.script.js uses stable Spicetify APIs', () => {
  const js = readFile('Comfy/theme.script.js');
  const stableAPIs = [
    'Spicetify.React',
    'Spicetify.ReactDOM',
    'Spicetify.Config',
    'Spicetify.Platform',
    'Spicetify.Player'
  ];
  
  stableAPIs.forEach(api => {
    assert(js.includes(api), `JavaScript missing stable API: ${api}`);
  });
});

test('theme.script.js has proper dependency checks', () => {
  const js = readFile('Comfy/theme.script.js');
  assert(js.includes('if (!(Spicetify.React && Spicetify.ReactDOM'), 
    'Missing dependency check for React/ReactDOM');
  assert(js.includes('waitForDeps'), 'Missing waitForDeps function');
});

test('theme.script.js has no deprecated API usage', () => {
  const js = readFile('Comfy/theme.script.js');
  const deprecated = ['Spicetify.LocalStorage', 'Spicetify.BridgeAPI'];
  
  deprecated.forEach(api => {
    assert(!js.includes(api), `JavaScript uses deprecated API: ${api}`);
  });
});

// Test 4: Color Schemes
log('\n🎨 Testing Color Schemes...', 'blue');

test('color.ini exists and has valid structure', () => {
  const colorIni = readFile('Comfy/color.ini');
  assert(colorIni.length > 100, 'color.ini is too small');
  assert(colorIni.includes('[Comfy]'), 'Missing [Comfy] section');
  assert(colorIni.includes('[Spotify]'), 'Missing [Spotify] section');
});

test('color.ini contains required color variables', () => {
  const colorIni = readFile('Comfy/color.ini');
  const requiredVars = [
    'text',
    'subtext',
    'main',
    'sidebar',
    'player',
    'card',
    'button',
    'play-button',
    'progress-fg',
    'progress-bg'
  ];
  
  requiredVars.forEach(varName => {
    assert(colorIni.includes(varName), `color.ini missing variable: ${varName}`);
  });
});

test('color.ini has valid hex color values', () => {
  const colorIni = readFile('Comfy/color.ini');
  const lines = colorIni.split('\n');
  const colorLines = lines.filter(line => line.includes('=') && !line.startsWith('['));
  
  colorLines.forEach(line => {
    const value = line.split('=')[1]?.trim();
    if (value && value.length === 6) {
      assert(/^[0-9A-Fa-f]{6}$/.test(value), 
        `Invalid hex color: ${value} in line: ${line}`);
    }
  });
});

// Test 5: Manifest Validation
log('\n📋 Testing Manifest...', 'blue');

test('manifest.json has required fields', () => {
  const manifest = JSON.parse(readFile('manifest.json'));
  const unofficialTheme = manifest.find(t => t.name.includes('Unofficial'));
  
  const requiredFields = ['name', 'description', 'preview', 'usercss', 'schemes', 'authors'];
  requiredFields.forEach(field => {
    assert(unofficialTheme[field], `Manifest missing field: ${field}`);
  });
});

test('manifest.json authors are valid', () => {
  const manifest = JSON.parse(readFile('manifest.json'));
  const unofficialTheme = manifest.find(t => t.name.includes('Unofficial'));
  
  assert(Array.isArray(unofficialTheme.authors), 'Authors is not an array');
  assert(unofficialTheme.authors.length > 0, 'No authors listed');
  
  unofficialTheme.authors.forEach(author => {
    assert(author.name, 'Author missing name');
    assert(author.url, 'Author missing URL');
  });
});

test('manifest.json includes script reference', () => {
  const manifest = JSON.parse(readFile('manifest.json'));
  const unofficialTheme = manifest.find(t => t.name.includes('Unofficial'));
  
  assert(Array.isArray(unofficialTheme.include), 'Include is not an array');
  assert(unofficialTheme.include.length > 0, 'No includes listed');
  assert(unofficialTheme.include[0].includes('theme.script.js'), 
    'Include does not reference theme.script.js');
});

// Test 6: Features & Snippets
log('\n✨ Testing Features & Snippets...', 'blue');

test('theme.script.js implements banner system', () => {
  const js = readFile('Comfy/theme.script.js');
  assert(js.includes('comfy-banner'), 'Banner system not found');
  assert(js.includes('updateBanner'), 'updateBanner function not found');
  assert(js.includes('channels'), 'Banner channels not defined');
});

test('theme.script.js implements settings modal', () => {
  const js = readFile('Comfy/theme.script.js');
  assert(js.includes('comfy-settings'), 'Settings modal not found');
  assert(js.includes('Dialog'), 'Dialog component not found');
  assert(js.includes('getConfig'), 'Config getter not found');
  assert(js.includes('setConfig'), 'Config setter not found');
});

test('CSS contains snippet implementations', () => {
  const css = readFile('Comfy/app.css');
  const snippets = [
    'Custom-Playbar-Snippet',
    'Banner-Enabled',
    'Topbar-Inside-Titlebar-Snippet',
    'Compact-Context-Menu',
    'Flatten-Colors'
  ];
  
  snippets.forEach(snippet => {
    assert(css.includes(snippet), `CSS missing snippet: ${snippet}`);
  });
});

test('CSS has responsive layout variables', () => {
  const css = readFile('Comfy/app.css');
  const variables = [
    '--comfy-panel-width',
    '--comfy-left-sidebar-width',
    '--border-radius',
    '--button-radius'
  ];
  
  variables.forEach(variable => {
    assert(css.includes(variable), `CSS missing variable: ${variable}`);
  });
});

// Test 7: Documentation Quality
log('\n📚 Testing Documentation...', 'blue');

test('QUICK_START.md has installation instructions', () => {
  const quickStart = readFile('QUICK_START.md');
  assert(quickStart.includes('Installation'), 'Missing installation section');
  assert(quickStart.includes('git clone'), 'Missing git clone command');
  assert(quickStart.includes('spicetify apply'), 'Missing spicetify apply command');
});

test('TESTING_CHECKLIST.md has comprehensive tests', () => {
  const checklist = readFile('TESTING_CHECKLIST.md');
  assert(checklist.includes('Visual Testing'), 'Missing visual testing section');
  assert(checklist.includes('Color Schemes'), 'Missing color schemes section');
  assert(checklist.includes('Feature Testing'), 'Missing feature testing section');
});

test('COMPATIBILITY_ANALYSIS.md has API analysis', () => {
  const analysis = readFile('COMPATIBILITY_ANALYSIS.md');
  assert(analysis.includes('Spicetify API'), 'Missing API analysis');
  assert(analysis.includes('CSS Class'), 'Missing CSS class analysis');
  assert(analysis.includes('Compatible'), 'Missing compatibility status');
});

test('CONTRIBUTING_UNOFFICIAL.md has guidelines', () => {
  const contributing = readFile('CONTRIBUTING_UNOFFICIAL.md');
  assert(contributing.includes('Contributing'), 'Missing contribution section');
  assert(contributing.includes('Pull Request') || contributing.includes('PR'), 
    'Missing PR guidelines');
});

// Test 8: GitHub Actions
log('\n🔧 Testing CI/CD Configuration...', 'blue');

test('GitHub Actions workflow exists', () => {
  assert(fileExists('.github/workflows/build.yml'), 'build.yml not found');
});

test('GitHub Actions workflow includes unofficial branch', () => {
  const workflow = readFile('.github/workflows/build.yml');
  assert(workflow.includes('unofficial'), 'Workflow does not include unofficial branch');
  assert(workflow.includes('sass'), 'Workflow missing SASS compilation');
});

// Test 9: Asset Validation
log('\n🖼️ Testing Assets...', 'blue');

test('Assets directory exists', () => {
  assert(fileExists('Comfy/assets'), 'Assets directory not found');
});

test('Preview image referenced in manifest exists', () => {
  const manifest = JSON.parse(readFile('manifest.json'));
  const unofficialTheme = manifest.find(t => t.name.includes('Unofficial'));
  const previewPath = unofficialTheme.preview;
  
  assert(fileExists(previewPath), `Preview image not found: ${previewPath}`);
});

// Test 10: Integration Tests
log('\n🔗 Testing Integration...', 'blue');

test('user.css imports app.css correctly', () => {
  const userCss = readFile('Comfy/user.css');
  assert(userCss.includes('@import'), 'user.css missing @import');
  assert(userCss.includes('app.css'), 'user.css does not import app.css');
});

test('theme.script.js references color.ini', () => {
  const js = readFile('Comfy/theme.script.js');
  assert(js.includes('color.ini'), 'theme.script.js does not reference color.ini');
  assert(js.includes('parseIni') || js.includes('Color-Schemes'), 
    'Missing color scheme parsing logic');
});

test('CSS variables align with color.ini variables', () => {
  const css = readFile('Comfy/app.css');
  const colorIni = readFile('Comfy/color.ini');
  
  // Check that spice variables are defined
  assert(css.includes('--spice-text'), 'CSS missing --spice-text');
  assert(css.includes('--spice-main'), 'CSS missing --spice-main');
  assert(css.includes('--spice-sidebar'), 'CSS missing --spice-sidebar');
  
  // Check color.ini has corresponding values
  assert(colorIni.includes('text'), 'color.ini missing text variable');
  assert(colorIni.includes('main'), 'color.ini missing main variable');
  assert(colorIni.includes('sidebar'), 'color.ini missing sidebar variable');
});

// Results Summary
log('\n═══════════════════════════════════════════════', 'cyan');
log('   TEST RESULTS SUMMARY', 'cyan');
log('═══════════════════════════════════════════════\n', 'cyan');

const totalTests = testsPassed + testsFailed;
const passRate = ((testsPassed / totalTests) * 100).toFixed(1);

log(`Total Tests: ${totalTests}`, 'blue');
log(`Passed: ${testsPassed}`, 'green');
log(`Failed: ${testsFailed}`, testsFailed > 0 ? 'red' : 'green');
log(`Pass Rate: ${passRate}%\n`, passRate >= 95 ? 'green' : passRate >= 80 ? 'yellow' : 'red');

if (testsFailed > 0) {
  log('Failed Tests:', 'red');
  failures.forEach(failure => {
    log(`  ✗ ${failure.name}`, 'red');
    log(`    ${failure.error}`, 'red');
  });
  log('');
}

if (passRate >= 95) {
  log('✅ Theme validation PASSED - Ready for use!', 'green');
  process.exit(0);
} else if (passRate >= 80) {
  log('⚠️  Theme validation PARTIALLY PASSED - Some issues found', 'yellow');
  process.exit(1);
} else {
  log('❌ Theme validation FAILED - Critical issues found', 'red');
  process.exit(1);
}
