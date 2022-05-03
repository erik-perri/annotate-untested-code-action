import * as fs from 'fs'
import * as xml2js from 'xml2js'
import {Types, UncoveredLineGroup} from './types'

interface CloverLine {
  $: {
    num: string
    count: string
  }
}

interface CloverFile {
  $: {
    name: string
  }
  line: CloverLine[]
}

interface CloverProject {
  file: CloverFile[]
}

interface CloverIndex {
  coverage: {
    project: CloverProject[]
  }
}

class CloverXmlHandler implements Types {
  async getUncoveredLines(coveragePath: string): Promise<UncoveredLineGroup[]> {
    if (!fs.existsSync(coveragePath)) {
      throw new Error(`Invalid coverage path, "${coveragePath}" not found.`)
    }

    const uncovered: UncoveredLineGroup[] = []
    const parsed: CloverIndex = await xml2js.parseStringPromise(
      fs.readFileSync(coveragePath)
    )

    const projects = parsed?.coverage?.project
    if (!projects || !Array.isArray(projects)) {
      throw new Error(
        `Unexpected Clover format encountered, expected coverage>project[]`
      )
    }

    for (const project of projects) {
      uncovered.push(...CloverXmlHandler.getUncoveredFromProject(project))
    }

    return uncovered
  }

  private static getUncoveredFromProject(
    project: CloverProject
  ): UncoveredLineGroup[] {
    const uncovered: UncoveredLineGroup[] = []

    for (const file of project.file) {
      const fileName: string = file.$.name
      let groupStart: number | undefined = undefined
      let groupEnd: number | undefined = undefined

      for (const line of file.line) {
        if (line.$.count === '0') {
          const lineNumber = parseInt(line.$.num, 10)

          if (
            groupStart !== undefined &&
            groupEnd !== undefined &&
            lineNumber - groupEnd > 1
          ) {
            uncovered.push({
              file: fileName,
              startLine: groupStart,
              endLine: groupEnd
            })

            groupStart = undefined
            groupEnd = undefined
          }

          groupStart ??= lineNumber
          groupEnd = lineNumber
        }
      }

      if (groupStart !== undefined && groupEnd !== undefined) {
        uncovered.push({
          file: fileName,
          startLine: groupStart,
          endLine: groupEnd
        })

        groupStart = undefined
        groupEnd = undefined
      }
    }

    return uncovered
  }
}

export default CloverXmlHandler
