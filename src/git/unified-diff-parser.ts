import {Line} from './types'

class UnifiedDiffParser {
  getModifiedLines(unifiedDiff: string): Line[] {
    const modifiedLines: Line[] = []

    let lastFilePath: string | undefined
    let lastLineNumber: number | undefined

    const diffLines = unifiedDiff.replace(/\r/, '').split(/\n/)

    for (const line of diffLines) {
      if (line.startsWith('---')) {
        continue
      }

      if (line.startsWith('+++')) {
        lastFilePath = line.replace(/^\+\+\+\s(b\/)?/, '')
      } else if (line.startsWith('@@')) {
        const match = /^@@ -\d+(,\d+)? \+(\d+)(,\d+)? @@/.exec(line)
        const matchedLine = match?.at(2)
        if (!matchedLine) {
          throw new Error(`Failed to parse line number from line "${line}"`)
        }

        lastLineNumber = parseInt(matchedLine, 10)
      } else if (/^[-+]/.test(line)) {
        if (lastFilePath === undefined || lastLineNumber === undefined) {
          throw new Error(`Found early line change "${line}"`)
        }

        modifiedLines.push({
          file: lastFilePath,
          line: lastLineNumber
        })

        if (!line.startsWith('-')) {
          lastLineNumber++
        }
      }
    }

    return modifiedLines
  }
}

export default UnifiedDiffParser
