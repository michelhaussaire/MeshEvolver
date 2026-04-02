# CosmosLearn Content Guide

## Content Structure

This guide explains how to create and organize educational content for CosmosLearn.

## Directory Structure

```
content/
├── education/        # Dual explanations (scientific + algorithmic)
│   ├── es/          # Spanish content
│   └── en/          # English content
├── catalog/         # Real astronomical objects
│   ├── galaxies/
│   └── planets/
├── challenges/      # Gamified learning challenges
└── schemas/         # JSON schemas for validation
```

## Educational Content

Each educational content file should follow the dual explanation format:

- **Scientific**: Explains the real-world astronomical/physical concept
- **Algorithmic**: Explains the procedural generation technique

## Categories

- `ocean` - Ocean dynamics and wave generation
- `atmosphere` - Atmospheric composition and rendering
- `vegetation` - Biomes and vegetation distribution
- `evolution` - Stellar evolution and genetic algorithms

## Writing Guidelines

1. Use clear, simple language
2. Include analogies for complex concepts
3. Provide real-world examples
4. Add physics formulas when applicable
5. Include pseudocode for algorithms
6. Document complexity (Big O)

## Validation

All content files must validate against their respective schemas in `content/schemas/`.
