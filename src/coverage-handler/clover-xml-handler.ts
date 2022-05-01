import * as fs from 'fs'
import * as xml2js from 'xml2js'
import Handler from './handler'
import {Line} from '../types'

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

class CloverXmlHandler implements Handler {
  async getUncoveredLines(coveragePath: string): Promise<Line[]> {
    if (!fs.existsSync(coveragePath)) {
      throw new Error(`Invalid coverage path, "${coveragePath}" not found.`)
    }

    const uncovered: Line[] = []
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

  private static getUncoveredFromProject(project: CloverProject): Line[] {
    const uncovered = []

    for (const file of project.file) {
      const fileName: string = file.$.name
      for (const line of file.line) {
        if (line.$.count === '0') {
          uncovered.push({
            file: fileName,
            line: parseInt(line.$.num, 10)
          })
        }
      }
    }

    return uncovered
  }
}

export default CloverXmlHandler
