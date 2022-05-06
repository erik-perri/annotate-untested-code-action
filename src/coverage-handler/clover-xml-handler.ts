import * as fs from 'fs'
import * as xml2js from 'xml2js'
import {GetUncoveredLines, UncoveredLineGroup} from './types'
import LineGrouper from './line-grouper'

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

function getUncoveredFromProject(project: CloverProject): UncoveredLineGroup[] {
  const uncovered: UncoveredLineGroup[] = []

  for (const file of project.file) {
    const fileName: string = file.$.name
    const grouper: LineGrouper = new LineGrouper()

    for (const line of file.line) {
      if (line.$.count === '0') {
        grouper.add(parseInt(line.$.num, 10))
      }
    }

    uncovered.push(
      ...grouper.buildGroups().map(group => ({
        file: fileName,
        startLine: group.start,
        endLine: group.end
      }))
    )
  }

  return uncovered
}

const getUncoveredLinesFromClover: GetUncoveredLines = async (
  coveragePath: string
): Promise<UncoveredLineGroup[]> => {
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
    uncovered.push(...getUncoveredFromProject(project))
  }

  return uncovered
}

export default getUncoveredLinesFromClover
