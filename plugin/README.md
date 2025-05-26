# Playwright E2E Test Plugin

## Introduction

This plugin supports building and executing an **E2E (End-to-End) automated test pipeline based on natural language scripts** within the Jenkins environment using **Playwright MCP**.

With the recent advancements in LLM (Large Language Model) and MCP (Model Context Protocol) technologies, new possibilities are opening up beyond traditional automated testing methods. By combining Microsoft's powerful Playwright E2E test tool with LLMs, this plugin helps developers and QA engineers manage and execute automated tests more flexibly through natural language.

Using this plugin, you can easily integrate and execute test scripts within your Jenkins CI/CD pipeline, significantly improving the efficiency of the automated testing process, including management and execution results analysis. It is useful for those looking to introduce or enhance automated E2E testing in their CI/CD pipelines.

## Getting started

### 📦 Prerequisites

The following items must be installed:

- Python 3.12
- Node.js (latest recommended)
- Chromium

### ⚙️ Environment Setup

- Configure the plugin environment

```bash
# install uv
pip install uv

# venv setting
uv sync

# npm install
cd mcp
npm install
cd ..
```

### Create .env File

```
LLM_PROVIDER={openai or anthropic}
LLM_MODEL={model to use}
LLM_API_KEY={API key}
```

- Supported Models:

**Claude:** claude-3-7-sonnet-latest, claude-3-5-sonnet-latest, claude-3-5-haiku-latest
**GPT:** gpt-4o, gpt-4o-mini

- The .env file contents (especially LLM_API_KEY) should be registered as Jenkins credentials for secure storage and use within the plugin configuration.

### How to Use the Plugin

- Pipeline Example

```bash
pipeline {
  agent any
  stages {
    stage('RunMST') {
      steps {
        // Pass the script title and credentialsId
        runMST input: 'script title', envFileCredentialsId: 'credentialsId'
        echo ">>> RunMST was invoked!"
      }
    }
  }
}
```

## Issues

When running Jenkins as a Docker Container, it must be run with Root privileges.
(Otherwise, normal execution will not be possible.)

Report issues and enhancements in the [Jenkins issue tracker](https://issues.jenkins.io/).

## Contributing

TODO review the default [CONTRIBUTING](https://github.com/jenkinsci/.github/blob/master/CONTRIBUTING.md) file and make sure it is appropriate for your plugin, if not then add your own one adapted from the base file

Refer to our [contribution guidelines](https://github.com/jenkinsci/.github/blob/master/CONTRIBUTING.md)

## LICENSE

Licensed under MIT, see [LICENSE](LICENSE.md)
