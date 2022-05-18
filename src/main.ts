import * as core from '@actions/core'
import * as fs from 'fs'
import CoverageFormat from './enum/coverage-format'
import getModifiedLines from './git/get-modified-lines'
import getUncoveredLines from './coverage-handler/get-uncovered-lines'

async function run(): Promise<void> {
  try {
    const format: string = core.getInput('format')
    const validFormats: string[] = Object.values(CoverageFormat)
    if (!validFormats.includes(format)) {
      core.setFailed(
        `Unknown format "${format}" provided, valid values: ${validFormats.join(
          ', '
        )}`
      )
      return
    }

    const coveragePath: string = core.getInput('coverage-path')
    if (!fs.existsSync(coveragePath)) {
      core.setFailed(
        `Invalid coverage path specified, "${coveragePath}" was not found`
      )
      return
    }

    if (process.env.GITHUB_EVENT_NAME !== 'pull_request') {
      core.warning(
        `Invalid event "${process.env.GITHUB_EVENT_NAME}", this should only run on "pull_request"`
      )
      return
    }

    core.info(`check ${coveragePath} for coverage files in format ${format}`)
    core.info(`process.env ${JSON.stringify(process.env)}`)

    const targetBranch = process.env.GITHUB_BASE_REF
    // const pullBranch = process.env.GITHUB_HEAD_REF

    if (!targetBranch) {
      core.setFailed(
        `Unable to determine target branch to compare against, missing GITHUB_BASE_REF env variable`
      )
      return
    }

    const modifiedLines = getModifiedLines(targetBranch)
    const uncoveredLines = await getUncoveredLines(format, coveragePath)

    core.info(`modifiedLines ${JSON.stringify(modifiedLines, null, 2)}`)
    core.info(`uncoveredLines ${JSON.stringify(uncoveredLines, null, 2)}`)

    for (const uncoveredLine of uncoveredLines) {
      const modifiedLine = modifiedLines.find(
        line =>
          uncoveredLine.file.endsWith(line.file) &&
          uncoveredLine.startLine <= line.line &&
          uncoveredLine.endLine >= line.line
      )

      if (modifiedLine) {
        core.warning(uncoveredLine.message ?? `Uncovered by tests`, {
          file: modifiedLine.file,
          startLine: uncoveredLine.startLine,
          endLine: uncoveredLine.endLine
        })
      }
    }
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message)
    }
  }
}

void run()
