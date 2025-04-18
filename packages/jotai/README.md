# @state-tracer/jotai

Visualize and trace state dependencies in jotai with an interactive data flow graph.

<p align="center">
  <img alt="Cover image" src="./src/__tests__/jotai-graph.svg" />
</p>

## ✨ Features

- ⚛️ Detects `atom`
- 🔗 Resolves jotai dependency graph across multiple files
- 🖼️ Generates a data flow graph as an SVG via the CLI.
- 🎯 Fast and lightweight thanks to [@hpcc-js/wasm](https://www.npmjs.com/package/@hpcc-js/wasm)
- 🧠 Ideal for debugging or understanding large jotai-based state trees

## 📥 Installation

```console
pnpm add -D @state-tracer/jotai
```

## 🛠 Usage

### 1. Generate a data flow graph as an SVG

```console
pnpm stj ./src
```

### 2. Open the SVG

```console
open jotai-graph.svg
```

## ⚙️ Options

| Option | Alias | Description | Default |
| -------- | ------------- | ------------- | --- |
| --output | -o | Specify the output path for the generated SVG | jotai-graph.svg |
