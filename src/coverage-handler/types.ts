interface UncoveredLineGroup {
  file: string
  startLine: number
  endLine: number
  message?: string
}

type GetUncoveredLines = (coveragePath: string) => Promise<UncoveredLineGroup[]>

export {GetUncoveredLines, UncoveredLineGroup}
