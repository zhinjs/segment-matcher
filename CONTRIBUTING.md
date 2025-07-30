# 🤝 Contributing to Segment Matcher

Thank you for your interest in contributing to Segment Matcher! This document provides guidelines for contributing to the project.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Code Style](#code-style)
- [Testing](#testing)
- [Submitting Changes](#submitting-changes)
- [Issue Guidelines](#issue-guidelines)
- [Pull Request Guidelines](#pull-request-guidelines)

## 📜 Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code.

## 🚀 Getting Started

### Prerequisites

- Node.js 16+ 
- npm or yarn
- Git

### Fork and Clone

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/segment-matcher.git
   cd segment-matcher
   ```
3. Add the original repository as upstream:
   ```bash
   git remote add upstream https://github.com/ORIGINAL_OWNER/segment-matcher.git
   ```

## 🛠️ Development Setup

### Install Dependencies

```bash
npm install
```

### Build the Project

```bash
# Build all formats (ESM + CJS)
npm run build

# Build ESM format only
npm run build:esm

# Build CommonJS format only
npm run build:cjs
```

### Run Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run performance benchmarks
npm run benchmark
```

## 📝 Code Style

### TypeScript Guidelines

- Use TypeScript strict mode
- Prefer interfaces over types for object shapes
- Use meaningful variable and function names
- Add JSDoc comments for public APIs
- Keep functions small and focused

### Code Formatting

- Use 2 spaces for indentation
- Use semicolons at the end of statements
- Use single quotes for strings
- Use trailing commas in objects and arrays
- Maximum line length: 100 characters

### File Naming

- Use kebab-case for file names: `pattern-parser.ts`
- Use PascalCase for class names: `PatternParser`
- Use camelCase for variables and functions: `parsePattern`

### Example Code Style

```typescript
/**
 * Parses a pattern string into tokens
 * @param pattern - The pattern string to parse
 * @returns Array of parsed tokens
 */
export function parsePattern(pattern: string): PatternToken[] {
  if (!pattern || typeof pattern !== 'string') {
    throw new ValidationError('Pattern must be a non-empty string');
  }

  const tokens: PatternToken[] = [];
  // ... implementation
  return tokens;
}
```

## 🧪 Testing

### Writing Tests

- Place test files in `src/__tests__/` directory
- Use descriptive test names
- Test both success and failure cases
- Test edge cases and error conditions
- Use meaningful test data

### Test Structure

```typescript
describe('FeatureName', () => {
  describe('when condition is met', () => {
    it('should behave correctly', () => {
      // Arrange
      const input = 'test input';
      
      // Act
      const result = functionUnderTest(input);
      
      // Assert
      expect(result).toBe('expected output');
    });
  });

  describe('when condition is not met', () => {
    it('should handle error gracefully', () => {
      // Arrange
      const invalidInput = null;
      
      // Act & Assert
      expect(() => functionUnderTest(invalidInput))
        .toThrow(ValidationError);
    });
  });
});
```

### Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test -- src/__tests__/pattern-parser.test.ts

# Run tests matching pattern
npm test -- --testNamePattern="should parse"

# Run tests with verbose output
npm test -- --verbose
```

## 📤 Submitting Changes

### Before Submitting

1. **Update tests**: Add tests for new functionality
2. **Update documentation**: Update README and API docs if needed
3. **Run tests**: Ensure all tests pass
4. **Run benchmarks**: Ensure performance hasn't regressed
5. **Check formatting**: Ensure code follows style guidelines

### Commit Guidelines

Use conventional commit format:

```
type(scope): description

[optional body]

[optional footer]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

Examples:
```
feat(parser): add support for custom field mapping
fix(matcher): handle empty segments array correctly
docs(readme): add performance optimization section
test(commander): add error handling test cases
```

### Branch Naming

Use descriptive branch names:
- `feat/add-custom-field-mapping`
- `fix/handle-empty-segments`
- `docs/update-api-reference`
- `test/add-error-handling-tests`

## 🐛 Issue Guidelines

### Before Creating an Issue

1. Check existing issues to avoid duplicates
2. Search the documentation for solutions
3. Try to reproduce the issue with the latest version

### Issue Template

When creating an issue, please include:

```markdown
## Description
Brief description of the issue

## Steps to Reproduce
1. Step one
2. Step two
3. Step three

## Expected Behavior
What you expected to happen

## Actual Behavior
What actually happened

## Environment
- Node.js version:
- npm version:
- OS:
- Browser (if applicable):

## Additional Information
Any additional context, logs, or screenshots
```

## 🔄 Pull Request Guidelines

### Before Creating a PR

1. **Fork and clone** the repository
2. **Create a feature branch** from main
3. **Make your changes** following the code style
4. **Add tests** for new functionality
5. **Update documentation** if needed
6. **Run all tests** and ensure they pass
7. **Commit your changes** using conventional commits

### PR Template

When creating a PR, please include:

```markdown
## Description
Brief description of the changes

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Testing
- [ ] Added tests for new functionality
- [ ] All existing tests pass
- [ ] Performance benchmarks show no regression

## Checklist
- [ ] My code follows the style guidelines
- [ ] I have performed a self-review of my code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes
```

### PR Review Process

1. **Automated checks** must pass (tests, linting, etc.)
2. **Code review** by maintainers
3. **Address feedback** and make requested changes
4. **Maintainer approval** required for merge

## 🏷️ Release Process

### Version Bumping

We use semantic versioning:
- `patch`: Bug fixes and minor improvements
- `minor`: New features (backward compatible)
- `major`: Breaking changes

### Release Steps

1. Update version in `package.json`
2. Update CHANGELOG.md
3. Create release tag
4. Publish to npm

## 📞 Getting Help

If you need help with contributing:

1. Check the documentation
2. Search existing issues
3. Create a new issue with the "question" label
4. Join our community discussions

## 🙏 Thank You

Thank you for contributing to Segment Matcher! Your contributions help make this project better for everyone. 