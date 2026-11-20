export type SaveOutcome = 'saved' | 'cancelled'

function isAbort(error: unknown): boolean {
  return typeof error === 'object' && error != null && 'name' in error && error.name === 'AbortError'
}

export async function saveFile(filename: string, content: string, type: string): Promise<SaveOutcome> {
  const file = new File([content], filename, { type })
  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: filename })
      return 'saved'
    } catch (error) {
      if (isAbort(error)) {
        return 'cancelled'
      }
    }
  }
  const url = URL.createObjectURL(file)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.append(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(url), 10_000)
  return 'saved'
}

export function newId(): string {
  return crypto.randomUUID()
}
