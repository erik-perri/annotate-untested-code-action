import * as core from '@actions/core'
import * as fs from 'fs'
import CoverageFormat from './enum/coverage-format'

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

    core.info(`check ${coveragePath} for coverage files in format ${format}`)
    core.info(JSON.stringify(process.env))

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
