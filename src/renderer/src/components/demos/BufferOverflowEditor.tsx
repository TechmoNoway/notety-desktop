import React, { useState, useEffect } from 'react'
import { twMerge } from 'tailwind-merge'
import { useAtom, useAtomValue } from 'jotai'
import { selectedNoteAtom, saveNoteAtom } from '@renderer/store'
import { throttle } from 'lodash'
import { autoSavingTime } from '@shared/constants'

export const BufferOverflowEditor = () => {
  const selectedNote = useAtomValue(selectedNoteAtom)
  const saveNote = useAtom(saveNoteAtom)[1]

  // Input state for the buffer demo
  const [input, setInput] = useState('')
  const [bufferContent, setBufferContent] = useState<string[]>(Array(50).fill(''))
  const [overflow, setOverflow] = useState<string[]>([])
  const [result, setResult] = useState('')
  const [showAttack, setShowAttack] = useState(false)
  const [crashed, setCrashed] = useState(false)

  // Initialize input with note content when a note is selected
  useEffect(() => {
    if (selectedNote?.content) {
      setInput(selectedNote.content)
    }
  }, [selectedNote])

  // Auto-save functionality, like in MarkdownEditor
  const handleAutoSaving = throttle(
    async (content: string) => {
      if (!selectedNote) return
      console.info('Auto saving from Buffer Editor:', selectedNote.title)
      await saveNote(content)
    },
    autoSavingTime,
    { leading: false, trailing: true }
  )

  // Update buffer visualization when input changes
  useEffect(() => {
    const chars = input.split('')
    const newBuffer = Array(50).fill('')

    // Fill the buffer
    for (let i = 0; i < Math.min(chars.length, 50); i++) {
      newBuffer[i] = chars[i]
    }

    setBufferContent(newBuffer)

    // Calculate overflow
    if (chars.length > 50) {
      setOverflow(chars.slice(50))
    } else {
      setOverflow([])
    }
  }, [input])

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value
    setInput(newValue)

    // Save changes to the actual note
    if (selectedNote) {
      handleAutoSaving(newValue)
    }
  }

  const executeBufferDemo = async () => {
    if (input.length <= 50) {
      setResult('Buffer is not overflowed. Try entering more text.')
      setShowAttack(false)
      setCrashed(false)
      return
    }

    try {
      const result = await window.context.bufferOverflow()
      setResult(result)
      setShowAttack(true)

      // Simulate crash if overflow is severe (more than 20 chars)
      if (input.length > 20) {
        setTimeout(() => {
          setCrashed(true)
        }, 1500)
      }
    } catch (error) {
      setResult(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // If no note is selected, show a message
  if (!selectedNote) {
    return (
      <div className="p-8 text-center text-zinc-400">
        Select a note to start the buffer overflow demonstration
      </div>
    )
  }

  // Simulate app crash
  if (crashed) {
    return (
      <div className="p-8 bg-red-900/20 text-center">
        <h2 className="text-2xl font-bold text-red-500 mb-4">APPLICATION CRASHED</h2>
        <div className="font-mono bg-black/50 p-4 mb-4 text-left overflow-auto h-40">
          <p className="text-red-500">Segmentation fault (core dumped)</p>
          <p className="text-yellow-500 mt-4">Stack trace:</p>
          <p className="text-zinc-400">
            0x000000010f5a3c7c: [corrupted] in node::Buffer::Write+0x12c
          </p>
          <p className="text-zinc-400">
            0x000000010f5a3e29: [corrupted] in v8::internal::Execution::Call+0xb9
          </p>
          <p className="text-zinc-400">0x000000010f5a4004: electron::Initialize+0x34</p>
          <p className="text-zinc-400">0xdeadbeefdeadbeef: [invalid memory address]</p>
          <p className="text-red-500 mt-4">Memory at 0x000000010f5a4010 was corrupted</p>
        </div>
        <button
          onClick={() => setCrashed(false)}
          className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 rounded"
        >
          Restart Demo
        </button>
      </div>
    )
  }

  return (
    <div className="p-4 bg-zinc-900 rounded-lg border border-zinc-700">
      <h2 className="text-xl font-bold mb-4 text-red-500">Buffer Overflow Demonstration</h2>
      <p className="text-sm mb-4 text-zinc-400">
        Note: <strong>{selectedNote.title}</strong> is loaded. You can edit it below.
      </p>

      <div className="mb-4">
        <label className="block mb-2">Enter text to store in a 10-byte buffer:</label>
        <textarea
          value={input}
          onChange={handleInputChange}
          className="w-full bg-zinc-800 border border-zinc-600 rounded p-2 h-36 font-mono"
          placeholder="Type text here..."
        />
      </div>

      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Memory Visualization:</h3>
        <div className="flex flex-col gap-1">
          <div className="flex items-center">
            <div className="w-24 text-sm">Memory Address</div>
            <div className="flex flex-1">
              {bufferContent.map((_, i) => (
                <div
                  key={`addr-${i}`}
                  className="flex-1 text-center text-xs text-zinc-500 font-mono"
                >
                  0x{(0x1000 + i).toString(16)}
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center">
            <div className="w-24 text-sm font-bold text-yellow-500">Buffer Area</div>
            <div className="flex flex-1 h-10">
              {bufferContent.map((char, i) => (
                <div
                  key={`buf-${i}`}
                  className={twMerge(
                    'flex-1 border border-zinc-600 flex items-center justify-center font-mono',
                    char ? 'bg-zinc-700' : ''
                  )}
                >
                  {char || ' '}
                </div>
              ))}
            </div>
          </div>

          {overflow.length > 0 && (
            <div className="flex items-center mt-2">
              <div className="w-24 text-sm font-bold text-red-500">Overflow!</div>
              <div className="flex flex-1 overflow-x-auto">
                {overflow.map((char, i) => (
                  <div
                    key={`ovf-${i}`}
                    className="min-w-[2.5rem] h-10 border border-red-900 flex items-center justify-center font-mono bg-red-900/30 text-red-400"
                  >
                    {char}
                  </div>
                ))}
              </div>
            </div>
          )}

          {overflow.length > 0 && (
            <div className="flex items-center mt-1">
              <div className="w-24"></div>
              <div className="flex flex-1 overflow-x-auto">
                <div className="text-xs text-red-500 italic">
                  This data is writing outside the allocated buffer!
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mb-6">
        <button
          onClick={executeBufferDemo}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md font-medium transition-colors"
        >
          Execute Buffer Overflow Demo
        </button>
      </div>

      {result && (
        <div className="p-3 bg-zinc-800 rounded border border-zinc-600 font-mono text-sm">
          <strong>Result:</strong> {result}
        </div>
      )}

      {showAttack && overflow.length >= 5 && (
        <div className="mt-4 p-3 bg-red-900/30 border border-red-900 rounded animate-pulse">
          <h4 className="font-bold text-red-400">Simulating Attack Impact:</h4>
          <p className="mt-1">In a vulnerable native application, this overflow could:</p>
          <ul className="list-disc pl-5 mt-1 space-y-1 text-sm">
            <li>Overwrite the return address on the stack</li>
            <li>Redirect execution to attacker-controlled code</li>
            <li>Execute arbitrary commands with the application&apos;s privileges</li>
            <li>Crash the application (Denial of Service)</li>
          </ul>
          <p className="mt-2 text-sm text-zinc-400">
            JavaScript/Electron is protected from traditional buffer overflows, but many native
            components and dependencies used in desktop applications remain vulnerable.
            {overflow.length > 10 && (
              <span className="text-red-400 font-bold">
                {' '}
                Warning: Significant overflow detected, application may become unstable!
              </span>
            )}
          </p>
        </div>
      )}
    </div>
  )
}
