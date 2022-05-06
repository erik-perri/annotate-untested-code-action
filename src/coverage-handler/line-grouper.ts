interface LineGroup {
  start: number
  end: number
}

class LineGrouper {
  constructor(private lines: number[] = []) {}

  add(lineNumber: number): void {
    this.lines.push(lineNumber)
  }

  buildGroups(): LineGroup[] {
    const groups: LineGroup[] = []
    let groupStart: number | undefined = undefined
    let groupEnd: number | undefined = undefined

    for (const line of this.lines) {
      if (
        groupStart !== undefined &&
        groupEnd !== undefined &&
        line - groupEnd > 1
      ) {
        groups.push({
          start: groupStart,
          end: groupEnd
        })

        groupStart = undefined
        groupEnd = undefined
      }

      groupStart ??= line
      groupEnd = line
    }

    if (groupStart !== undefined && groupEnd !== undefined) {
      groups.push({
        start: groupStart,
        end: groupEnd
      })
    }

    return groups
  }
}

export default LineGrouper
