/**
 * Resolves a page template name to the corresponding component.
 * Templates are stored as string values in the database.
 */
export function usePageTemplate(templateName: MaybeRef<string | null | undefined>) {
  const templateMap: Record<string, string> = {
    default: 'CroutonContentPage',
    article: 'CroutonContentArticle',
  }

  const template = computed(() => {
    const name = unref(templateName) || 'default'
    const componentName = templateMap[name] ?? templateMap.default!
    return resolveComponent(componentName)
  })

  return { template }
}
