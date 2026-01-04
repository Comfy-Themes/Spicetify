# Contributing to Unofficial Branch

Thank you for your interest in helping maintain compatibility with the latest Spicetify and Spotify versions!

## Overview

The `unofficial` branch is a community-driven effort to keep the Comfy theme working with bleeding-edge versions of Spicetify CLI and Spotify desktop client. This branch may contain experimental changes and is not officially supported by the original theme authors.

## How to Contribute

### Reporting Issues

When reporting issues specific to the unofficial branch:

1. **Check existing issues** to avoid duplicates
2. **Verify the issue** exists on latest versions:
   - Latest Spicetify CLI
   - Latest Spotify desktop client
3. **Include version information**:
   ```
   Spicetify version: (run `spicetify -v`)
   Spotify version: (Help > About Spotify)
   Branch: unofficial
   OS: Windows/macOS/Linux
   ```
4. **Provide details**:
   - Clear description of the issue
   - Steps to reproduce
   - Expected vs actual behavior
   - Console errors (if any)
   - Screenshots (for visual issues)

### Testing Updates

Help test the theme on new Spicetify/Spotify versions:

1. Update to the latest versions
2. Use the [TESTING_CHECKLIST.md](TESTING_CHECKLIST.md)
3. Document results in an issue or PR
4. Note any new compatibility issues

### Submitting Fixes

#### For CSS/Visual Issues

1. **Identify the problem**:
   - Which UI element is broken?
   - What class names changed?
   - Compare with Spicetify's css-map.json

2. **Make minimal changes**:
   - Only fix what's broken
   - Maintain existing style conventions
   - Test thoroughly

3. **Update documentation**:
   - Note the change in commit message
   - Update UNOFFICIAL_BRANCH_NOTES.md if significant

4. **Submit PR**:
   - Target the `unofficial` branch
   - Reference any related issues
   - Include before/after screenshots for visual changes

#### For JavaScript/API Issues

1. **Check Spicetify API**:
   - Review [Spicetify docs](https://spicetify.app/docs)
   - Check the CLI source code if needed
   - Test API availability in console

2. **Update API usage**:
   - Use current API patterns
   - Maintain backward compatibility if possible
   - Add error handling

3. **Test thoroughly**:
   - Test the specific feature
   - Check console for errors
   - Verify no regressions

4. **Document changes**:
   - Note API changes in commit
   - Update UNOFFICIAL_BRANCH_NOTES.md

### Code Style

Follow existing conventions:

#### CSS/SCSS
- Use existing class naming
- Maintain indentation (tabs)
- Group related styles
- Comment complex sections
- Use CSS variables where appropriate

#### JavaScript
- Use modern ES6+ syntax
- Follow existing patterns
- Add comments for complex logic
- Use descriptive variable names
- Handle errors gracefully

### Workflow

1. **Fork the repository**
2. **Create a feature branch** from `unofficial`:
   ```bash
   git checkout unofficial
   git pull origin unofficial
   git checkout -b fix/description-of-fix
   ```
3. **Make your changes**
4. **Test thoroughly** using the testing checklist
5. **Commit with clear messages**:
   ```
   fix: correct button styling for new Spotify UI
   
   - Updated .main-button-class selector
   - Fixed hover state color
   - Tested on Spotify 1.2.80
   ```
6. **Push to your fork**
7. **Create PR** targeting the `unofficial` branch

### Commit Message Guidelines

Use conventional commit format:

- `fix:` - Bug fixes
- `feat:` - New features
- `style:` - CSS/visual changes
- `refactor:` - Code restructuring
- `docs:` - Documentation updates
- `test:` - Testing updates
- `chore:` - Maintenance tasks

Examples:
```
fix: restore album header background opacity
feat: add support for new lyrics view
style: update color scheme for new sidebar
docs: update compatibility notes for Spicetify 2.42.7
```

### What to Contribute

#### High Priority
- Fixes for broken UI elements
- Updates for API changes
- Compatibility fixes for new versions
- Console error fixes
- Visual regressions

#### Medium Priority
- Performance improvements
- Code refactoring
- Documentation improvements
- Testing improvements

#### Welcome but Not Critical
- New features (consider compatibility)
- Additional color schemes
- Enhanced snippets
- Quality of life improvements

### What Not to Contribute

- Changes unrelated to latest version compatibility
- Breaking changes to stable features
- Large refactors without discussion
- Features that should go to main branch
- Changes that break older Spicetify versions

### Getting Help

- **Questions**: Open a discussion or issue
- **Ideas**: Discuss before implementing
- **Stuck**: Ask in the issue tracker
- **Discord**: Join the [Comfy Camp server](https://discord.gg/comfy-camp-811203761619337259)

### Review Process

1. PRs are reviewed by maintainers or contributors
2. Testing is required before merge
3. Documentation must be updated
4. CI checks must pass
5. Feedback will be provided

### Syncing with Main Branch

The unofficial branch may occasionally sync with the main branch to:
- Pull in stable fixes
- Adopt new features
- Maintain consistency

When this happens:
- Existing unofficial changes are preserved
- Conflicts resolved carefully
- Testing redone if needed

### Version Updates

When new Spicetify/Spotify versions release:

1. **Check for changes**:
   - Review Spicetify changelog
   - Check for UI updates in Spotify
   - Look for API deprecations

2. **Test the theme**:
   - Use testing checklist
   - Document any issues
   - Note what still works

3. **Update documentation**:
   - Update version numbers
   - Note compatibility status
   - Document known issues

4. **Fix issues**:
   - Prioritize critical breaks
   - Test fixes thoroughly
   - Submit PRs with fixes

### Community Guidelines

- Be respectful and constructive
- Help others when possible
- Share testing results
- Report issues clearly
- Credit contributors
- Follow code of conduct

## Resources

- [Spicetify Documentation](https://spicetify.app/docs)
- [Spicetify CLI Repository](https://github.com/spicetify/cli)
- [CSS Class Map](https://github.com/spicetify/cli/blob/main/css-map.json)
- [Original Comfy Theme](https://github.com/Comfy-Themes/Spicetify)
- [Comfy Discord Server](https://discord.gg/comfy-camp-811203761619337259)

## Recognition

Contributors to the unofficial branch will be recognized in:
- UNOFFICIAL_BRANCH_NOTES.md
- Commit history
- Issue/PR comments

Thank you for helping keep Comfy updated! 🎨

---

**Remember**: This is an unofficial branch. Changes here may not be merged to the main branch and may become outdated if official updates are released.
