import {Line} from '../types'

class DiffParser {
  getModifiedLines(gitDiffReport: string): Line[] {
    const modifiedLines: Line[] = []

    let lastFile: string | undefined
    let lastLine: number | undefined

    const diffLines = gitDiffReport.replace(/\r/, '').split(/\n/)

    for (const line of diffLines) {
      if (line.startsWith('---')) {
        continue
      }

      if (line.startsWith('+++')) {
        lastFile = line.replace(/^\+\+\+\s(b\/)?/, '')
      } else if (line.startsWith('@@')) {
        const match = /^@@ -\d+(,\d+)? \+(\d+)(,\d+)? @@/.exec(line)
        const matchedLine = match?.at(2)
        if (!matchedLine) {
          throw new Error(`Failed to parse line "${line}"`)
        }

        lastLine = parseInt(matchedLine, 10)
      } else if (/^[-+]/.test(line)) {
        if (lastFile === undefined || lastLine === undefined) {
          throw new Error(
            `Found unexpected input before determining path and line "${line}"`
          )
        }

        modifiedLines.push({
          file: lastFile,
          line: lastLine
        })

        if (!line.startsWith('-')) {
          lastLine++
        }
      }
    }

    return modifiedLines
  }
}

export default DiffParser
