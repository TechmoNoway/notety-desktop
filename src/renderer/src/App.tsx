import { useRef, useState } from 'react'
import {
  ActionButtonsRow,
  Content,
  DraggableTopBar,
  FloatingNoteTitle,
  MarkdownEditor,
  NotePreviewList,
  RootLayout,
  Sidebar
} from './components'

import { PrivilegeEscalationDemo } from './components/demos/PrivilegeEscalationDemo'

const App = () => {
  const contentContainerRef = useRef<HTMLDivElement>(null)
  const [activeView, setActiveView] = useState<
    'notes' | 'file-permissions' | 'privilege-escalation'
  >('notes')

  const resetScroll = () => {
    contentContainerRef.current?.scrollTo(0, 0)
  }

  return (
    <>
      <DraggableTopBar />
      <RootLayout>
        <Sidebar className="p-2">
          <ActionButtonsRow className="flex justify-between mt-1" />
          <NotePreviewList className="mt-3 space-y-1" onSelect={resetScroll} />

          <div className="mt-6 pt-4 border-t border-zinc-700">
            <h3 className="text-sm font-semibold mb-2 text-zinc-400">Security Demos</h3>
            <button
              onClick={() => setActiveView('notes')}
              className={`w-full text-left px-2 py-1.5 mb-1 rounded ${
                activeView === 'notes' ? 'bg-zinc-700' : 'hover:bg-zinc-800'
              }`}
            >
              📝 Notes Editor
            </button>

            <button
              onClick={() => setActiveView('privilege-escalation')}
              className={`w-full text-left px-2 py-1.5 mb-1 rounded ${
                activeView === 'privilege-escalation' ? 'bg-orange-900/50' : 'hover:bg-zinc-800'
              }`}
            >
              ⬆️ Privilege Escalation
            </button>
          </div>
        </Sidebar>

        <Content ref={contentContainerRef} className="border-l bg-zinc-900/50 border-l-white/20">
          {activeView === 'notes' ? (
            <>
              <FloatingNoteTitle className="pt-2" />
              <MarkdownEditor />
            </>
          ) : (
            <div className="p-4">
              <PrivilegeEscalationDemo />
            </div>
          )}
        </Content>
      </RootLayout>
    </>
  )
}

export default App
