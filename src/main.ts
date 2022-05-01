import * as core from '@actions/core'
import * as fs from 'fs'
import CoverageFormat from './enum/coverage-format'
import DiffParser from './git/diff-parser'
import {execSync} from 'child_process'

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
    const pullBranch = process.env.GITHUB_HEAD_REF

    try {
      const gitOutput = execSync(
        `git diff --unified=0 origin/${targetBranch} ${pullBranch}`
      ).toString()

      const modifiedLines = new DiffParser().getModifiedLines(gitOutput)

      core.info(`modifiedLines ${JSON.stringify(modifiedLines)}`)
    } catch (e) {
      if (
        e instanceof Error &&
        e.message.includes('unknown revision or path not in the working tree')
      ) {
        core.setFailed(
          `Unable to locate ${targetBranch}, ensure "fetch-depth: 0" is in action checkout configuration`
        )
        return
      }

      core.setFailed(e instanceof Error ? e.message : 'Unknown error')
      return
    }

    // const ms: string = core.getInput('milliseconds')
    // core.debug(`Waiting ${ms} milliseconds ...`) // debug is only output if you set the secret `ACTIONS_STEP_DEBUG` to true
    //
    // core.debug(new Date().toTimeString())
    // await wait(parseInt(ms, 10))
    // core.debug(new Date().toTimeString())
    //
    // core.setOutput('time', new Date().toTimeString())
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message)
    }
  }
}

void run()
