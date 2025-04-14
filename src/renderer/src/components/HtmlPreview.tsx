import { useAtomValue } from 'jotai'
import { selectedNoteAtom } from '@renderer/store'

export const HtmlPreview = () => {
  const selectedNote = useAtomValue(selectedNoteAtom)

  if (!selectedNote) return null

  // VULNERABILITY: Using dangerouslySetInnerHTML with unsanitized content
  return (
    <div
      className="px-8 py-5 min-h-screen"
      dangerouslySetInnerHTML={{
        __html: selectedNote.content // No sanitization!
      }}
    />
  )
}
