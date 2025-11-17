import { SeedInterface } from 'api/core/framework/orm/base-seed'

import { FeatureFlagsSeed } from './feature-flags.seed'
import { XlmAssetSeed } from './xlm-asset.seed'

// Seeds to run when the database is initialized. Order is important.
export const seeds: SeedInterface[] = [new XlmAssetSeed(), new FeatureFlagsSeed()]
