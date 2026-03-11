import { defineComponent, h } from 'vue'

const S  = '#C4B5FD'
const sw = '1.8'

export const IconPerson = defineComponent({ setup() { return () => h('svg', { viewBox: '0 0 40 40', fill: 'none' }, [
  h('circle', { cx: '20', cy: '12', r: '5', stroke: S, 'stroke-width': sw }),
  h('path',   { d: 'M9 35c0-6.1 4.9-11 11-11s11 4.9 11 11', stroke: S, 'stroke-width': sw, 'stroke-linecap': 'round' }),
  h('path',   { d: 'M31 10C30 9.5 27 7.5 27 5.5C27 4 28 3.5 29 3.5C30 3.5 30.5 4 31 4.5C31.5 4 32 3.5 33 3.5C34 3.5 35 4 35 5.5C35 7.5 32 9.5 31 10Z', fill: S }),
]) }})

export const IconAnimal = defineComponent({ setup() { return () => h('svg', { viewBox: '0 0 40 40', fill: 'none' }, [
  h('ellipse', { cx: '20', cy: '27', rx: '7', ry: '8', stroke: S, 'stroke-width': sw }),
  h('circle',  { cx: '11', cy: '17', r: '3',   stroke: S, 'stroke-width': sw }),
  h('circle',  { cx: '29', cy: '17', r: '3',   stroke: S, 'stroke-width': sw }),
  h('circle',  { cx: '15', cy: '11', r: '2.5', stroke: S, 'stroke-width': sw }),
  h('circle',  { cx: '25', cy: '11', r: '2.5', stroke: S, 'stroke-width': sw }),
]) }})

export const IconAction = defineComponent({ setup() { return () => h('svg', { viewBox: '0 0 40 40', fill: 'none' }, [
  h('path', { d: 'M23 5L12 22h10l-5 13L33 17H22L23 5z', stroke: S, 'stroke-width': sw, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' }),
]) }})

export const IconDeath = defineComponent({ setup() { return () => h('svg', { viewBox: '0 0 40 40', fill: 'none' }, [
  h('path',   { d: 'M20 8c-6.6 0-12 5.4-12 12 0 4 2 7.6 5 9.8V34h14v-4.2c3-2.2 5-5.8 5-9.8 0-6.6-5.4-12-12-12z', stroke: S, 'stroke-width': sw, 'stroke-linejoin': 'round' }),
  h('circle', { cx: '15.5', cy: '21', r: '2', fill: S }),
  h('circle', { cx: '24.5', cy: '21', r: '2', fill: S }),
  h('path',   { d: 'M17 34v2h6v-2', stroke: S, 'stroke-width': sw, 'stroke-linecap': 'round' }),
]) }})

export const IconNature = defineComponent({ setup() { return () => h('svg', { viewBox: '0 0 40 40', fill: 'none' }, [
  h('circle', { cx: '20', cy: '20', r: '6', stroke: S, 'stroke-width': sw }),
  ...[[20,5,20,10],[20,30,20,35],[5,20,10,20],[30,20,35,20],
      [9.4,9.4,12.8,12.8],[27.2,27.2,30.6,30.6],
      [30.6,9.4,27.2,12.8],[9.4,30.6,12.8,27.2]].map(([x1,y1,x2,y2]) =>
    h('line', { x1: String(x1), y1: String(y1), x2: String(x2), y2: String(y2), stroke: S, 'stroke-width': sw, 'stroke-linecap': 'round' })
  ),
]) }})

export const IconGoods = defineComponent({ setup() { return () => h('svg', { viewBox: '0 0 40 40', fill: 'none' }, [
  h('path', { d: 'M10 17h18v12c0 2.2-1.8 4-4 4H14c-2.2 0-4-1.8-4-4V17z', stroke: S, 'stroke-width': sw }),
  h('path', { d: 'M28 21h3c1.7 0 3 1.3 3 3s-1.3 3-3 3h-3', stroke: S, 'stroke-width': sw, 'stroke-linecap': 'round' }),
  h('path', { d: 'M15 13c0-1.2.8-2 .8-3', stroke: S, 'stroke-width': sw, 'stroke-linecap': 'round' }),
  h('path', { d: 'M20 12c0-1.2.8-2 .8-3', stroke: S, 'stroke-width': sw, 'stroke-linecap': 'round' }),
  h('path', { d: 'M25 13c0-1.2.8-2 .8-3', stroke: S, 'stroke-width': sw, 'stroke-linecap': 'round' }),
]) }})

export const IconDream = defineComponent({ setup() { return () => h('svg', { viewBox: '0 0 24 24', fill: 'none' }, [
  h('path',   { d: 'M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z', fill: '#A78BFA' }),
  h('circle', { cx: '18.5', cy: '4.5', r: '1.2', fill: '#C4B5FD' }),
  h('circle', { cx: '15',   cy: '2.5', r: '0.8', fill: '#DDD6FE' }),
  h('circle', { cx: '21',   cy: '8',   r: '0.7', fill: '#C4B5FD' }),
]) }})

// 카테고리명 → 아이콘
export const CATEGORY_NAME_MAP = {
  '사람/감정': IconPerson,
  '동물/식물': IconAnimal,
  '행동':      IconAction,
  '죽음/영혼': IconDeath,
  '자연현상':  IconNature,
  '생활용품':  IconGoods,
}

// 카테고리 slug → 아이콘
export const CATEGORY_SLUG_MAP = {
  'people-emotion': IconPerson,
  'animal-plant':   IconAnimal,
  'action':         IconAction,
  'death-spirit':   IconDeath,
  'nature':         IconNature,
  'daily-goods':    IconGoods,
}
