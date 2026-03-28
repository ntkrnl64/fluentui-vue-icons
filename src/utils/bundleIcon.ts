import { defineComponent, h, type Component } from 'vue'

/**
 * Bundles a filled and regular icon into a single component.
 * When `filled` prop is true, renders the filled variant; otherwise regular.
 */
export function bundleIcon(
  FilledIcon: Component,
  RegularIcon: Component,
): Component {
  return defineComponent({
    name: 'BundledIcon',
    props: {
      filled: { type: Boolean, default: false },
      primaryFill: { type: String, default: 'currentColor' },
      title: { type: String, default: undefined },
    },
    setup(props, { attrs }) {
      return () => {
        const Icon = props.filled ? FilledIcon : RegularIcon
        return h(Icon, {
          primaryFill: props.primaryFill,
          title: props.title,
          ...attrs,
        })
      }
    },
  })
}
