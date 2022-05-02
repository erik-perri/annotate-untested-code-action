import {describe, expect, it, test} from '@jest/globals'
import CloverXmlHandler from '../../src/coverage-handler/clover-xml-handler'

describe('CloverXmlHandler', () => {
  it('returns an empty array when nothing is uncovered', async () => {
    const parser = new CloverXmlHandler()
    await expect(
      await parser.getUncoveredLines(
        '__mocks__/clover-xml-nothing-uncovered/clover.xml'
      )
    ).toEqual([])
  })

  it('returns the expected values when some lines are uncovered', async () => {
    const parser = new CloverXmlHandler()
    await expect(
      await parser.getUncoveredLines(
        '__mocks__/clover-xml-some-uncovered/clover.xml'
      )
    ).toEqual([
      {
        file: '/annotate-untested-code-testing/src/PartiallyTestedClass.php',
        line: 19
      }
    ])
  })
})
