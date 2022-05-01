import {execSync} from 'child_process'

function getDiff(targetBranch: string): string {
  try {
    return execSync(`git diff --unified=0 origin/${targetBranch}`).toString()
  } catch (e) {
    if (
      e instanceof Error &&
      e.message.includes('unknown revision or path not in the working tree')
    ) {
      throw new Error(
        `Unable to locate ${targetBranch}, ensure "fetch-depth: 0" is in action checkout configuration`
      )
    } else {
      throw e
    }
  }
}

export default getDiff
