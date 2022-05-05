import getUncoveredLinesFromClover from './clover-xml-handler'
import CoverageFormat from '../enum/coverage-format'
import {UncoveredLineGroup} from './types'

async function getUncoveredLines(
  handler: string,
  coveragePath: string
): Promise<UncoveredLineGroup[]> {
  switch (handler) {
    case CoverageFormat.CloverXml:
      return await getUncoveredLinesFromClover(coveragePath)

    default:
      throw new Error(`Unknown coverage handler "${handler}"`)
  }
}

export default getUncoveredLines
