import { readdir, stat } from 'node:fs/promises'
import { join, relative } from 'node:path'

const limits = {
  '.js': 250 * 1024,
  '.css': 550 * 1024,
}

async function filesIn(directory) {
  const entries = await readdir(directory, { withFileTypes: true })
  const files = await Promise.all(
    entries.map((entry) => {
      const path = join(directory, entry.name)
      return entry.isDirectory() ? filesIn(path) : Promise.resolve([path])
    }),
  )
  return files.flat()
}

const files = await filesIn('dist')
const failures = []
let totalJavaScript = 0

for (const path of files) {
  const extension = Object.keys(limits).find((candidate) => path.endsWith(candidate))
  if (!extension) continue

  const { size } = await stat(path)
  if (extension === '.js') totalJavaScript += size
  if (size > limits[extension]) {
    failures.push(
      `${relative('.', path)}: ${(size / 1024).toFixed(1)} KiB supera ${(limits[extension] / 1024).toFixed(0)} KiB`,
    )
  }
}

const totalJavaScriptLimit = 700 * 1024
if (totalJavaScript > totalJavaScriptLimit) {
  failures.push(
    `JavaScript total: ${(totalJavaScript / 1024).toFixed(1)} KiB supera ${(totalJavaScriptLimit / 1024).toFixed(0)} KiB`,
  )
}

if (failures.length) {
  console.error(`Presupuesto de rendimiento incumplido:\n${failures.join('\n')}`)
  process.exitCode = 1
} else {
  console.log(`Presupuesto de rendimiento: OK (${(totalJavaScript / 1024).toFixed(1)} KiB JS)`)
}
