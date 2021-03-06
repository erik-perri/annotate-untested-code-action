import {describe, expect, it, test} from '@jest/globals'
import getUncoveredLinesFromClover from '../../src/coverage-handler/clover-xml-handler'

describe('getUncoveredLinesFromClover', () => {
  it('returns an empty array when nothing is uncovered', async () => {
    await expect(
      await getUncoveredLinesFromClover(
        '__mocks__/clover-xml-nothing-uncovered.xml'
      )
    ).toEqual([])
  })

  it('returns the expected values when some lines are uncovered', async () => {
    await expect(
      await getUncoveredLinesFromClover(
        '__mocks__/clover-xml-some-uncovered.xml'
      )
    ).toEqual([
      {
        file: '/annotate-untested-code-testing/src/PartiallyTestedClass.php',
        startLine: 19,
        endLine: 19
      }
    ])
  })

  it('groups lines when multiple sequential lines are supplied', async () => {
    await expect(
      await getUncoveredLinesFromClover(
        '__mocks__/clover-xml-group-of-uncovered.xml'
      )
    ).toEqual([
      {
        file: '/annotate-untested-code-testing/src/PartiallyTestedClass.php',
        startLine: 19,
        endLine: 20
      },
      {
        file: '/annotate-untested-code-testing/src/PartiallyTestedClass.php',
        startLine: 22,
        endLine: 22
      },
      {
        file: '/annotate-untested-code-testing/src/TestedClass.php',
        startLine: 23,
        endLine: 23
      },
      {
        file: '/annotate-untested-code-testing/src/TestedClass.php',
        startLine: 26,
        endLine: 30
      }
    ])
  })
})
