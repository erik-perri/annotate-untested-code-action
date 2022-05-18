import {GetUncoveredLines, UncoveredLineGroup} from './types'
import fs from 'fs'
import * as xml2js from 'xml2js'
import LineGrouper from './line-grouper'

interface CoberturaLine {
  $: {
    number: string
    hits: string
  }
}

interface CoberturaMethod {
  $: {
    name: string
    signature: string
    lineRate: string
    branchRate: string
    complexity: string
  }
  lines: {
    line: CoberturaLine[]
  }
}

interface CoberturaClass {
  $: {
    name: string
    filename: string
    lineRate: string
    branchRate: string
    complexity: string
  }
  methods: {
    method: CoberturaMethod[]
  }
  lines: {
    line: CoberturaLine[]
  }
}

interface CoberturaPackage {
  $: {
    name: string
    lineRate: string
    branchRate: string
    complexity: string
  }
  classes: {
    class: CoberturaClass[]
  }
}

interface CoberturaIndex {
  coverage: {
    packages: {
      package: CoberturaPackage[]
    }
  }
}

function getUncoveredFromPackage(
  coberturaPackage: CoberturaPackage
): UncoveredLineGroup[] {
  const uncovered: UncoveredLineGroup[] = []

  for (const coberturaClass of coberturaPackage.classes.class) {
    for (const coberturaMethod of coberturaClass.methods.method) {
      const fileName: string = coberturaClass.$.filename
      const grouper: LineGrouper = new LineGrouper()

      for (const line of coberturaMethod.lines.line) {
        if (line.$.hits === '0') {
          grouper.add(parseInt(line.$.number, 10))
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
  }

  return uncovered
}

const getUncoveredLinesFromCobertura: GetUncoveredLines = async (
  coveragePath: string
): Promise<UncoveredLineGroup[]> => {
  if (!fs.existsSync(coveragePath)) {
    throw new Error(`Invalid coverage path, "${coveragePath}" not found.`)
  }

  const uncovered: UncoveredLineGroup[] = []
  const parsed: CoberturaIndex = await xml2js.parseStringPromise(
    fs.readFileSync(coveragePath)
  )

  const packages = parsed?.coverage?.packages?.package
  if (!packages || !Array.isArray(packages)) {
    throw new Error(
      `Unexpected Cobertura format encountered, expected coverage>packages>package[]`
    )
  }

  for (const project of packages) {
    uncovered.push(...getUncoveredFromPackage(project))
  }

  return uncovered
}

export default getUncoveredLinesFromCobertura
