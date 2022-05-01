import {Line} from '../types'

interface Handler {
  getUncoveredLines(coveragePath: string): Promise<Line[]>
}

export default Handler
