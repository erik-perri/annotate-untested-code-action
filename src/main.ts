import * as core from '@actions/core'
import * as fs from 'fs'
import CoverageFormat from './enum/coverage-format'
import getModifiedFiles from './git/get-diff'
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

    const modifiedLines = getModifiedFiles(targetBranch)
    const uncoveredLines = await getUncoveredLines(format, coveragePath)

    core.info(`modifiedLines ${JSON.stringify(modifiedLines, null, 2)}`)
    core.info(`uncoveredLines ${JSON.stringify(uncoveredLines, null, 2)}`)

    for (const modifiedLine of modifiedLines) {
      if (
        uncoveredLines.find(
          uncoveredLine =>
            uncoveredLine.file.endsWith(modifiedLine.file) &&
            uncoveredLine.line === modifiedLine.line
        )
      ) {
        core.warning(`${modifiedLine.file}:${modifiedLine.line} Uncovered`)
      }
    }
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message)
    }
  }
}

void run()
