# fluentui-vue-icons

20,000+ [Fluent UI System Icons](https://github.com/microsoft/fluentui-system-icons) as tree-shakeable Vue 3 components.

Generated from the official Microsoft SVG assets with the same naming convention as `@fluentui/react-icons`.

## Installation

```bash
bun add fluentui-vue-icons
```

## Usage

```vue
<script setup>
import { Add20Filled, Settings24Regular, Dismiss16Regular } from 'fluentui-vue-icons'
</script>

<template>
  <Add20Filled />
  <Settings24Regular primary-fill="blue" />
  <Dismiss16Regular title="Close" />
</template>
```

### Bundle Icons (Filled + Regular toggle)

```vue
<script setup>
import { bundleIcon, Heart20Filled, Heart20Regular } from 'fluentui-vue-icons'

const Heart = bundleIcon(Heart20Filled, Heart20Regular)
</script>

<template>
  <Heart :filled="isFavorite" />
</template>
```

### Custom Icons

```ts
import { createFluentIcon } from 'fluentui-vue-icons'

const MyIcon = createFluentIcon('MyIcon', '20', [
  'M10 2a8 8 0 1 0 0 16 8 8 0 0 0 0-16Z',
])
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `primaryFill` | `string` | `'currentColor'` | SVG fill color |
| `title` | `string` | -- | Accessible title (adds `role="img"`) |

All standard SVG attributes are also supported via `v-bind`.

## Icon Naming Convention

Icons follow the pattern `[Name][Size][Style]`:

- **Name**: PascalCase icon name (e.g., `Add`, `Settings`, `ChevronDown`)
- **Size**: `12`, `16`, `20`, `24`, `28`, `32`, `48`
- **Style**: `Filled`, `Regular`, `Light`, `Color`

Examples: `Add20Filled`, `Settings24Regular`, `ChevronDown16Regular`

## Icon Count

| Style | Count |
|-------|-------|
| Filled | ~5,300 |
| Regular | ~5,300 |
| Light + Color | ~9,500 |
| **Total** | **~20,149** |

## Tree Shaking

Each icon is a named export with `/*#__PURE__*/` annotation. Only the icons you import will be included in your bundle.

## Generation

Icons are generated from the [fluentui-system-icons](https://github.com/microsoft/fluentui-system-icons) SVG assets:

```bash
node scripts/generate.js --assets-path /path/to/fluentui-system-icons/assets
bun run build
```

## Third-Party Notices

See [THIRD_PARTY_LICENSES](./THIRD_PARTY_LICENSES).

## License

GPL-3.0 -- see [LICENSE](./LICENSE).
