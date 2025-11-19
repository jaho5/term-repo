# Term Registry

An AI-powered learning tool that generates structured term entries for any topic. Built with SvelteKit and Cerebras AI.

## Features

- Generate comprehensive term definitions for any topic
- Adjustable learning levels: beginner, intermediate, advanced, expert
- Each term includes:
  - Core definition
  - Technical definition
  - Practical examples
  - Usage guidance
  - Scope/context
  - Relationships to other terms
- Clean, minimal UI with expandable/collapsible term cards

## Setup

1. Install dependencies:
```sh
npm install
```

2. Create a `.env` file with your Cerebras API key:
```sh
CEREBRAS_API_KEY=your_api_key_here
```

3. Start the development server:
```sh
npm run dev
```

## Usage

1. Enter a topic (e.g., "React Hooks", "Machine Learning", "Quantum Physics")
2. Select your learning level
3. Click "Generate Terms"
4. Browse generated terms - click any term to expand full details

## Tech Stack

- **Frontend**: SvelteKit 2, TypeScript
- **AI**: Cerebras Cloud SDK (gpt-oss-120b model)
- **Styling**: Minimal CSS
- **Runtime**: Bun/Node.js

## Development

```sh
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run linter
npm run format       # Format code with Prettier
```
