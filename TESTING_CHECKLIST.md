# Testing Checklist for Unofficial Branch

## Pre-Testing Setup

### Required Versions
- Spicetify CLI: 2.42.7 or newer
- Spotify: 1.2.80 or newer

### Installation Steps
```bash
# Install/Update Spicetify
# Windows (PowerShell)
iwr -useb https://raw.githubusercontent.com/spicetify/cli/main/install.ps1 | iex

# macOS/Linux
curl -fsSL https://raw.githubusercontent.com/spicetify/cli/main/install.sh | sh

# Clone theme
cd ~/.spicetify/Themes  # or %APPDATA%\spicetify\Themes on Windows
git clone https://github.com/Comfy-Themes/Spicetify
cd Spicetify
git checkout unofficial
cd ..
mv Spicetify Comfy

# Apply theme
spicetify config current_theme Comfy
spicetify config color_scheme Comfy
spicetify config inject_css 1 replace_colors 1 overwrite_assets 1 inject_theme_js 1
spicetify apply
```

## Visual Testing

### Basic UI Elements
- [ ] Theme loads without errors
- [ ] Topbar renders correctly
- [ ] Sidebar displays properly
- [ ] Main content area styled correctly
- [ ] Now playing bar functional
- [ ] Album/playlist headers visible
- [ ] Card components styled
- [ ] Buttons and controls visible

### Layout & Responsive Design
- [ ] Sidebar collapse/expand works
- [ ] Right panel (if visible) renders correctly
- [ ] Window resize behavior correct
- [ ] Zoom levels work properly
- [ ] Full screen mode functional

### Images & Artwork
- [ ] Album covers display
- [ ] Artist images load
- [ ] Playlist covers visible
- [ ] Banner images (if enabled) display
- [ ] Image placeholders work

## Color Schemes Testing

Test each color scheme for visual consistency:

- [ ] Comfy (default)
- [ ] Spotify
- [ ] Nord
- [ ] Catppuccin variants (Mocha, Macchiato, Frappe, Latte)
- [ ] Rosé Pine variants (Main, Moon, Dawn)
- [ ] Everforest variants
- [ ] Dracula
- [ ] Gruvbox variants
- [ ] Tokyo Night variants
- [ ] Custom color schemes

### For Each Scheme, Verify:
- Colors apply correctly
- Text remains readable
- Contrast is acceptable
- Buttons are visible
- Active states clear
- Hover effects work

## Feature Testing

### Banner System
- [ ] Playlist banner enabled/disabled
- [ ] Artist banner enabled/disabled
- [ ] Album banner enabled/disabled
- [ ] Collection banner enabled/disabled
- [ ] Show banner enabled/disabled
- [ ] Lyrics banner enabled/disabled
- [ ] Banner transitions smooth
- [ ] Banner images load correctly

### Settings Modal
- [ ] Modal opens (Ctrl/Cmd + Shift + S or via button)
- [ ] All tabs accessible
- [ ] Settings save properly
- [ ] Color scheme switcher works
- [ ] Snippet toggles functional
- [ ] Reset button works
- [ ] Modal closes correctly

### Snippets (Custom Features)
Test each snippet by enabling/disabling:

- [ ] Custom Playbar
- [ ] Banner Images
- [ ] Topbar Inside Titlebar
- [ ] Compact Context Menu
- [ ] Home Header
- [ ] Flatten Colors
- [ ] Remove Column Bar
- [ ] Horizontal Page Links
- [ ] Playbar Above Right Panel
- [ ] Smooth Progress Bar
- [ ] Remove Progress Bar Gradient
- [ ] Remove Connect Bar
- [ ] Remove Lyrics Button
- [ ] Hoverable Timers
- [ ] Remove Tracklist Index
- [ ] Collapse Topbar
- [ ] Header Background
- [ ] Apple Music Gradient

## Playback Testing

### Player Controls
- [ ] Play/Pause button works
- [ ] Skip forward/backward works
- [ ] Shuffle toggle visible
- [ ] Repeat toggle visible
- [ ] Volume slider functional
- [ ] Progress bar clickable
- [ ] Time displays correctly

### Now Playing
- [ ] Track info displays
- [ ] Artist links work
- [ ] Album art shows
- [ ] Queue accessible
- [ ] Lyrics button (if not removed)
- [ ] Connect to device picker works

## Navigation Testing

### Sidebar Navigation
- [ ] Home link works
- [ ] Search link works
- [ ] Your Library link works
- [ ] Create Playlist works
- [ ] Liked Songs link works
- [ ] Playlist items clickable
- [ ] Drag and drop functional (if applicable)

### Main Content Navigation
- [ ] Page transitions smooth
- [ ] Back/forward buttons work
- [ ] Search functionality works
- [ ] Browse categories accessible
- [ ] Genre pages load

## Context Menu Testing

- [ ] Right-click on tracks works
- [ ] Right-click on playlists works
- [ ] Right-click on albums works
- [ ] Right-click on artists works
- [ ] Menu items clickable
- [ ] Sub-menus expand
- [ ] Menu positioning correct
- [ ] Compact mode (if enabled)

## Modal/Dialog Testing

- [ ] Add to playlist modal
- [ ] Create playlist dialog
- [ ] Edit playlist details
- [ ] Share dialog
- [ ] Track credits modal
- [ ] About dialog
- [ ] Settings modal
- [ ] Confirmation dialogs

## Console Error Check

Open browser console (F12 or Ctrl+Shift+I) and check for:
- [ ] No JavaScript errors on load
- [ ] No errors during navigation
- [ ] No errors during playback
- [ ] No CSS warnings
- [ ] No API deprecation warnings
- [ ] Comfy debug messages present (if enabled)

## Cross-Platform Testing

### Windows
- [ ] Theme loads
- [ ] All features work
- [ ] Window controls functional
- [ ] Titlebar integration correct

### macOS
- [ ] Theme loads
- [ ] All features work
- [ ] Window controls functional
- [ ] Titlebar integration correct

### Linux
- [ ] Theme loads
- [ ] All features work
- [ ] Window controls functional
- [ ] Titlebar integration correct

## Performance Testing

- [ ] Theme loads quickly
- [ ] No lag during navigation
- [ ] Smooth animations
- [ ] No memory leaks (long session)
- [ ] CPU usage acceptable

## Edge Cases

- [ ] Empty playlists
- [ ] Long playlist names
- [ ] Long track titles
- [ ] Missing album art
- [ ] Offline mode
- [ ] Limited connectivity
- [ ] Very small window size
- [ ] Very large window size
- [ ] High DPI displays
- [ ] Dark/light system theme switching (if applicable)

## Known Issues to Document

If any issues are found, document them in this format:

### Issue: [Brief Description]
- **Severity**: Critical / High / Medium / Low
- **Component**: UI / Playback / Navigation / etc.
- **Steps to Reproduce**: 
  1. Step 1
  2. Step 2
- **Expected Behavior**: What should happen
- **Actual Behavior**: What actually happens
- **Workaround**: If any
- **Notes**: Additional context

## Regression Testing

If changes are made after initial testing:
- [ ] Re-test affected components
- [ ] Check for new console errors
- [ ] Verify fixes don't break other features

## Final Checklist

Before marking branch as ready:
- [ ] All critical issues resolved or documented
- [ ] Performance acceptable
- [ ] Documentation complete
- [ ] README accurate
- [ ] UNOFFICIAL_BRANCH_NOTES.md updated
- [ ] Testing results documented

## Testing Results

### Test Date: ___________
### Tester: ___________
### Spicetify Version: ___________
### Spotify Version: ___________
### Operating System: ___________

### Overall Status: PASS / FAIL / PARTIAL

### Critical Issues: 
- None / [List issues]

### Minor Issues:
- None / [List issues]

### Notes:
[Add any additional observations or comments]

---

**Note**: This is a comprehensive checklist. Not all items may apply to every test session, but they should all be considered.
