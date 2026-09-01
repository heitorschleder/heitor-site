/**
 * No `isPrivate` field, on purpose. The GraphQL query never asks for private
 * repositories, so a leak is not merely unlikely — it is unrepresentable.
 */
export type Repository = {
  name: string
  description: string
  language: string
  year: string
  url: string
  pinned: boolean
}

export type LoadResult = {
  repos: Repository[]
  missingOverrides: string[]
}
