interface UncoveredLineGroup {
  file: string
  startLine: number
  endLine: number
}

type GetUncoveredLines = (coveragePath: string) => Promise<UncoveredLineGroup[]>

export {GetUncoveredLines, UncoveredLineGroup}
