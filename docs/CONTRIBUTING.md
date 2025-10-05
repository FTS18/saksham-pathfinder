# Contributing to Saksham AI

Thank you for your interest in contributing to Saksham AI! We welcome contributions from the community.

## How to Contribute

### Reporting Bugs

If you find a bug, please create an issue with:
- Clear description of the bug
- Steps to reproduce
- Expected vs actual behavior
- Screenshots (if applicable)
- Environment details (browser, OS, etc.)

### Suggesting Features

We love new ideas! Please create an issue with:
- Clear description of the feature
- Use case and benefits
- Possible implementation approach

### Pull Requests

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make your changes**
   - Follow existing code style
   - Add comments for complex logic
   - Update documentation if needed

4. **Test your changes**
   ```bash
   npm run type-check
   npm run lint
   npm run build
   ```

5. **Commit your changes**
   ```bash
   git commit -m "Add: Brief description of your changes"
   ```
   Use conventional commits:
   - `Add:` for new features
   - `Fix:` for bug fixes
   - `Update:` for updates to existing features
   - `Refactor:` for code refactoring
   - `Docs:` for documentation changes

6. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

7. **Create a Pull Request**
   - Provide clear description of changes
   - Reference any related issues
   - Include screenshots for UI changes

## Code Style

- Use TypeScript for type safety
- Follow existing component structure
- Use Tailwind CSS for styling
- Keep components small and focused
- Write meaningful variable and function names

## Development Setup

```bash
# Install dependencies
npm install --legacy-peer-deps

# Start development server
npm run dev

# Run linting
npm run lint

# Type checking
npm run type-check
```

## Questions?

Feel free to create an issue for any questions or reach out to the team.

---

**Thank you for contributing to Saksham AI!** 🚀
