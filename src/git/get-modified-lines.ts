import {execSync} from 'child_process'

interface Line {
  file: string
  line: number
}

function getUnifiedDiff(targetBranch: string): string {
  try {
    return execSync(`git diff --unified=0 origin/${targetBranch}`).toString()
  } catch (e) {
    if (
      e instanceof Error &&
      e.message.includes('unknown revision or path not in the working tree')
    ) {
      throw new Error(
        `Unable to locate ${targetBranch}, ensure "fetch-depth: 0" is in action checkout configuration`
      )
    } else {
      throw e
    }
  }
}

function getModifiedLinesFromUnifiedDiff(unifiedDiff: string): Line[] {
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

function getModifiedLines(targetBranch: string): Line[] {
  return getModifiedLinesFromUnifiedDiff(getUnifiedDiff(targetBranch))
}

export {getModifiedLinesFromUnifiedDiff, Line}
export default getModifiedLines
