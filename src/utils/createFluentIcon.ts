import { defineComponent, h, type PropType, type SVGAttributes } from 'vue'

export interface FluentIconProps {
  primaryFill?: string
  filled?: boolean
  title?: string
}

export type FluentIcon = ReturnType<typeof defineComponent>

export interface CreateFluentIconOptions {
  flipInRtl?: boolean
  color?: boolean
}

export function createFluentIcon(
  displayName: string,
  width: string,
  pathsOrSvg: string[] | string,
  options?: CreateFluentIconOptions,
): FluentIcon {
  const viewBoxWidth = width === '1em' ? '20' : width

  return defineComponent({
    name: displayName,
    props: {
      primaryFill: { type: String, default: 'currentColor' },
      title: { type: String, default: undefined },
    },
    setup(props, { attrs }) {
      return () => {
        const svgAttrs: SVGAttributes = {
          xmlns: 'http://www.w3.org/2000/svg',
          width,
          height: width,
          viewBox: `0 0 ${viewBoxWidth} ${viewBoxWidth}`,
          fill: props.primaryFill,
          'aria-hidden': props.title ? undefined : 'true',
          role: props.title ? 'img' : undefined,
          ...attrs,
        }

        const children: any[] = []

        if (props.title) {
          children.push(h('title', null, props.title))
        }

        if (typeof pathsOrSvg === 'string') {
          // Color icon - raw SVG innerHTML
          svgAttrs.innerHTML = pathsOrSvg
          return h('svg', svgAttrs)
        } else {
          // Regular icon - path elements
          for (const d of pathsOrSvg) {
            children.push(h('path', { d, fill: props.primaryFill }))
          }
          return h('svg', svgAttrs, children)
        }
      }
    },
  })
}
