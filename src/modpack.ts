import { sandstonePack } from 'sandstone'
import { ITEMS } from 'sandstone/arguments/index'
import { RecipeClass, ResourceClassArguments, SandstoneCore, TagClass } from 'sandstone/core/index'
import { LiteralUnion } from 'sandstone/utils'

// RecipeKind should be exported from the sandstone library, but its not. I'll fix this in beta.1

type RecipeKind<NAME extends string, VALUES extends Record<string, unknown> | unknown, HAS_GROUP extends boolean = true> = {
  /**
   * A namespaced ID indicating the type of serializer of the recipe. Must be one of:
   * - `mekanism:enriching`: Represents a recipe in a Mekanism Enriching Factory
   * - `thermal:pulverizer`: Represents a recipe in a Thermal Expansion Pulverizer
   */
  type: LiteralUnion<NAME>
} & VALUES & (HAS_GROUP extends true ? {
  /**
   * Used to group multiple recipes together in the recipe book.
   * Example: group all boats recipes.
   */
  group: string
} : unknown)

type MODDED_ITEMS = LiteralUnion<
  ITEMS |
  'mekanism:enrichment_factory'
>

type OldItemOrTag = {
  /** The item. */
  id: MODDED_ITEMS
} | {
  /** An item tag. */
  tag: string | TagClass<'items'>
}

type ItemOrTag = {
  /** The item. */
  item: MODDED_ITEMS
} | {
  /** An item tag. */
  tag: string | TagClass<'items'>
}

type EntryPair<T> = readonly [T, T]

type ModdedRecipeJSON<P1 extends string = string, P2 extends string = string, P3 extends string = string> = (
  RecipeKind<'mekanism:enriching', {
    input: OldItemOrTag & {
      count: number
    },
    output: {
      /** The item. */
      id: MODDED_ITEMS
      count: number
    }
  }> |
  RecipeKind<'thermal:pulverizer', {
    ingredient: OldItemOrTag,
    result: EntryPair<{
      item: MODDED_ITEMS
      chance: number
    }>,
    experience: number
  }>
)

type RecipeClassArguments = {
  /**
   * The recipe's JSON.
   */
  recipe: ModdedRecipeJSON
} & ResourceClassArguments<'default'>

class ModdedRecipeClass extends RecipeClass {
  recipeJSON: NonNullable<RecipeClassArguments['recipe']>

  constructor(sandstoneCore: SandstoneCore, name: string, args: RecipeClassArguments) {
    super(sandstoneCore, name, args)
    this.recipeJSON = args.recipe
  }
}

// This should also be exported, and will also be fixed in beta.1
const conflictDefaults = (resourceType: string) => (process.env[`${resourceType.toUpperCase()}S_CONFLICT_STRATEGY`] || process.env.DEFAULT_CONFLICT_STRATEGY) as string

export function ModdedRecipe(name: string, recipe: RecipeClassArguments['recipe'], options?: Partial<RecipeClassArguments> | undefined) {
  return new ModdedRecipeClass(sandstonePack.core, name, {
    recipe,
    creator: 'user',
    addToSandstoneCore: true,
    onConflict: conflictDefaults('recipe') as RecipeClassArguments['onConflict'],
    ...options
   })
}