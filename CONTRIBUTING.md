# Contributing to useblysh

Thank you for your interest in improving **useblysh**! We welcome contributions to both the JavaScript/TypeScript and Python packages.

## How to Contribute

### 1. Development Environment
This is a monorepo. Ensure you have the following installed:
* **Node.js 20+** (for `packages/js-useblysh`)
* **Python 3.10+** (for `packages/py-useblysh`)

### 2. Branching Strategy
* Please create a feature branch for your changes: `git checkout -b feat/your-feature-name`.
* Ensure your branch is up to date with `main` before submitting a Pull Request.

### 3. Standards & Performance
* **JS/TS**: Follow the existing TypeScript patterns. All new image decoding logic must use the **IntersectionObserver API** to maintain high performance.
* **Python**: Maintain compatibility with Python 3.10 through 3.12.

### 4. Testing
Before submitting, ensure all tests pass:
* **JS**: `npm run test` inside the JS package directory.
* **Python**: `python -m unittest discover tests` inside the Python package directory.

### 5. Pull Request Process
1. Update the `README.md` if your change adds new functionality.
2. The CI/CD pipeline will automatically run build and test checks.
3. Once approved, a maintainer will merge the PR and trigger a new **Semantic Version** release.

## License
By contributing, you agree that your contributions will be licensed under the project's **MIT License**.
