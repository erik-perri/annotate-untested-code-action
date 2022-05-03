interface UncoveredLineGroup {
  file: string
  startLine: number
  endLine: number
}

interface Types {
  getUncoveredLines(coveragePath: string): Promise<UncoveredLineGroup[]>
}

export {Types, UncoveredLineGroup}
