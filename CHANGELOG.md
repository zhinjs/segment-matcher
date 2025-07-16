# 📝 Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Performance benchmark script (`npm run benchmark`)
- Comprehensive error handling system
- Custom exception classes (ValidationError, PatternParseError, etc.)
- English documentation (README.en.md)
- Migration guide (MIGRATION.md)
- Contributing guidelines (CONTRIBUTING.md)
- Performance optimization documentation

### Changed
- Optimized deep cloning using structuredClone with fallback
- Enhanced parameter validation in Commander constructor and match methods
- Improved rest parameter matching logic (collects only consecutive matching types)

### Fixed
- Fixed rest parameter test case expectations
- Removed debug console.log statements from production code
- Fixed pattern parsing error handling

## [1.0.6] - 2024-01-XX

### Added
- Initial release with core functionality
- TypeScript support with dual ESM/CJS format
- Pattern matching for OneBot12 message segments
- Support for required, optional, and rest parameters
- Typed literal matching
- Chainable action callbacks
- Async action support
- Default value support for optional parameters

### Features
- `Commander` class for pattern matching
- `match()` convenience function
- Support for text, face, image, at segment types
- Custom field mapping for typed literals
- Comprehensive test suite (32 test cases)

## [1.0.0] - 2024-01-XX

### Added
- Initial project setup
- Basic TypeScript configuration
- Dual build system (ESM + CJS)
- Core pattern parsing and matching functionality

---

## 🔗 Links

- [GitHub Repository](https://github.com/your-username/onebot-commander)
- [npm Package](https://www.npmjs.com/package/onebot-commander)
- [Documentation](README.md)
- [Migration Guide](MIGRATION.md)
- [Contributing Guide](CONTRIBUTING.md) 