import {describe, expect, it, test} from '@jest/globals'
import {getModifiedLinesFromUnifiedDiff} from '../../src/git/get-modified-lines'

describe('DiffParser', () => {
  it('returns an empty array on empty input', async () => {
    await expect(getModifiedLinesFromUnifiedDiff('')).toEqual([])
  })

  it('parses a basic addition', async () => {
    const diff =
      'diff --git a/src/TestedClass.php b/src/TestedClass.php\n' +
      'index f119f84..e4a60ed 100644\n' +
      '--- a/src/TestedClass.php\n' +
      '+++ b/src/TestedClass.php\n' +
      '@@ -21,0 +22,5 @@ class TestedClass\n' +
      '+\n' +
      '+    public function methodThree(): int\n' +
      '+    {\n' +
      '+        return 4;\n' +
      '+    }'

    await expect(getModifiedLinesFromUnifiedDiff(diff)).toEqual([
      {file: 'src/TestedClass.php', line: 22},
      {file: 'src/TestedClass.php', line: 23},
      {file: 'src/TestedClass.php', line: 24},
      {file: 'src/TestedClass.php', line: 25},
      {file: 'src/TestedClass.php', line: 26}
    ])
  })
})
