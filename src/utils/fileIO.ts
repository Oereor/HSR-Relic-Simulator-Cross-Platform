/**
 * File I/O utilities for save/load in the browser.
 *
 * Uses the File System Access API (modern browsers) with fallbacks:
 * - Save: showSaveFilePicker → blob download
 * - Load: showOpenFilePicker → hidden file input
 */

export async function saveToFile(
  json: string,
  defaultName: string = 'relic_set.json'
): Promise<string> {
  if ('showSaveFilePicker' in window) {
    try {
      const handle = await (window as any).showSaveFilePicker({
        suggestedName: defaultName,
        types: [{
          description: 'Relic Set JSON',
          accept: { 'application/json': ['.json'] }
        }]
      })
      const writable = await handle.createWritable()
      await writable.write(json)
      await writable.close()
      return handle.name
    } catch (err: any) {
      // User cancelled — fall through to blob download
      if (err.name === 'AbortError') return defaultName
      throw err
    }
  }
  // Fallback: download as blob (works in all browsers)
  downloadBlob(json, defaultName)
  return defaultName
}

export async function loadFromFile(): Promise<string> {
  if ('showOpenFilePicker' in window) {
    try {
      const [handle] = await (window as any).showOpenFilePicker({
        types: [{
          description: 'Relic Set JSON',
          accept: { 'application/json': ['.json'] }
        }]
      })
      const file = await handle.getFile()
      return await file.text()
    } catch (err: any) {
      if (err.name === 'AbortError') throw new Error('File selection cancelled')
      throw err
    }
  }
  // Fallback: hidden file input element
  return new Promise((resolve, reject) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = async () => {
      const file = input.files?.[0]
      if (file) {
        try {
          resolve(await file.text())
        } catch {
          reject(new Error('Failed to read file'))
        }
      } else {
        reject(new Error('No file selected'))
      }
    }
    input.click()
  })
}

function downloadBlob(content: string, filename: string) {
  const blob = new Blob([content], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
