import type { Category } from "./categories-service"

export interface FlatCategory {
  id: number
  name: string
  parent: number | null
  level: number
  displayName: string
}

/**
 * Flattens hierarchical category structure to show all categories including subcategories with indentation
 */
export function flattenCategories(categories: Category[]): FlatCategory[] {
  const flattened: FlatCategory[] = []

  const addCategory = (category: Category, level = 0) => {
    flattened.push({
      id: category.id,
      name: category.name,
      parent: category.parent,
      level,
      displayName: level > 0 ? `${"— ".repeat(level)}${category.name}` : category.name,
    })

    if (category.children && category.children.length > 0) {
      category.children.forEach((child) => addCategory(child, level + 1))
    }
  }

  categories.forEach((category) => addCategory(category))
  return flattened
}
