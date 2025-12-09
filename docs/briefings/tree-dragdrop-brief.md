# Tree Drag-Drop Implementation Briefing

## Current State

Nested drag-drop for the tree layout in nuxt-crouton is **functional but janky**. Test at: `http://localhost:3000/dashboard/fyit/pages`

### What Works
- Drag items between levels (root ↔ child)
- Reorder items within same level
- Changes persist to API via `useTreeMutation.moveNode()`
- Single toast per move (duplicate event fixed)

### What's Janky
- Visual feedback during drag is rough
- Animations feel stuttery
- Drop indicators could be clearer

---

## Files Modified

| File | Location | Change |
|------|----------|--------|
| `Tree.vue` | `nuxt-crouton/app/components/` | Removed duplicate emit (was calling both `props.onMove` AND `emit('move')`) |
| `TreeView.vue` | `nuxt-crouton/app/components/` | Uses native SortableJS, `shallowRef` for instance tracking, init-once pattern |
| `TreeNode.vue` | `nuxt-crouton/app/components/` | Same pattern as TreeView, recursive with nested sortables |
| `Collection.vue` | `nuxt-crouton/app/components/` | Connected to `useTreeMutation` for API persistence |

---

## Technical Architecture

```
Collection.vue (layout="tree")
  └─> CroutonTree (Tree.vue)
        └─> CroutonTreeView (TreeView.vue)
              ├─> Sortable instance for root level
              └─> CroutonTreeNode (TreeNode.vue) [recursive]
                    └─> Sortable instance for children container
```

### Key Pattern: DOM Revert

SortableJS directly manipulates the DOM, which conflicts with Vue's virtual DOM. The solution:

```typescript
onEnd: (evt) => {
  // 1. Extract move info from event
  const itemId = evt.item.dataset.id
  const toParentId = evt.to.dataset.parentId
  const newIndex = evt.newIndex

  // 2. REVERT the DOM change SortableJS made
  evt.from.insertBefore(evt.item, refNode)

  // 3. Emit event - let Vue handle the actual data update
  emit('move', itemId, toParentId, newIndex)
}
```

### Key Pattern: Instance Tracking

Prevent duplicate sortable instances with `shallowRef`:

```typescript
const sortableInstance = shallowRef<SortableType | null>(null)

async function initSortable() {
  if (sortableInstance.value) return // Already initialized

  sortableInstance.value = new Sortable(containerRef.value, { ... })
}

onBeforeUnmount(() => {
  sortableInstance.value?.destroy()
})
```

---

## Remaining Work

### 1. Improve Visual Feedback
- Better ghost/chosen/drag CSS classes
- Smoother transitions (current: 200ms)
- Consider adding drop zone indicators

### 2. Animation Tuning
SortableJS options to experiment with:
```typescript
{
  animation: 200,        // Currently 200ms, try 150-300
  easing: 'cubic-bezier(1, 0, 0, 1)',
  ghostClass: 'tree-ghost',
  chosenClass: 'tree-chosen',
  dragClass: 'tree-drag',
  forceFallback: true,   // Currently enabled for consistency
}
```

### 3. CSS Classes to Improve

Located in both `TreeView.vue` and `TreeNode.vue`:

```css
:deep(.tree-ghost) {
  opacity: 0.4;
  background: rgb(var(--color-primary-100));
}

:deep(.tree-chosen) {
  background: rgb(var(--color-primary-50));
}

:deep(.tree-drag) {
  opacity: 1;
  background: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}
```

### 4. Consider
- Add `dragoverBubble: false` if parent highlighting during drag is needed
- Increase `emptyInsertThreshold` if dropping into empty containers is hard

---

## Testing Checklist

- [ ] Drag item A below item B (same level)
- [ ] Drag item to become child of another item
- [ ] Drag nested item to root level
- [ ] Drag into empty children container
- [ ] Verify only ONE toast appears per drag
- [ ] Verify change persists after page refresh
- [ ] Check console for errors during drag

---

## Dependencies

- `sortablejs` - Direct import (not via VueUse wrapper)
- `@vueuse/integrations/useSortable` - Previously used, removed in favor of direct import
- `useTreeMutation` composable - For API persistence

---

## API Endpoint

```
PATCH /api/teams/{teamId}/{collection}/{id}/move
Body: { parentId: string | null, order: number }
```

Handled by `useTreeMutation.moveNode()` in nuxt-crouton.
