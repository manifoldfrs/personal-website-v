"use client"

import { FormEvent, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { executeTerminalCommand } from "@/lib/terminal/commands"

export function TerminalCommandBar({ postSlugs }: { postSlugs: readonly string[] }) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [history, setHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [value, setValue] = useState("")
  const [output, setOutput] = useState<string[]>([])
  const [toast, setToast] = useState<string | null>(null)

  function runCommand(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const command = value.trim()
    const result = executeTerminalCommand(command, postSlugs)

    if (command) {
      setHistory((current) => [...current, command])
      setHistoryIndex(-1)
    }
    setValue("")

    if (result.type === "navigate") {
      router.push(result.href)
      return
    }
    if (result.type === "clear") {
      setOutput([])
      setToast(null)
      return
    }
    if (result.type === "error") {
      setOutput([result.message])
      setToast(result.message)
      window.setTimeout(() => setToast(null), 5000)
      return
    }
    setOutput(result.lines)
  }

  function browseHistory(direction: "up" | "down") {
    if (history.length === 0) return
    const nextIndex = direction === "up"
      ? Math.min(historyIndex + 1, history.length - 1)
      : Math.max(historyIndex - 1, -1)
    setHistoryIndex(nextIndex)
    setValue(nextIndex === -1 ? "" : history[history.length - 1 - nextIndex] ?? "")
  }

  return (
    <div className="terminal-command">
      {output.length > 0 && (
        <div className="terminal-output" aria-live="polite">
          {output.map((line) => <div key={line}>{line}</div>)}
        </div>
      )}
      <form onSubmit={runCommand} className="terminal-prompt-row">
        <label htmlFor="terminal-command" className="sr-only">Terminal command</label>
        <span aria-hidden="true" className="terminal-prompt">hbb.dev:~$</span>
        <input
          ref={inputRef}
          id="terminal-command"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "ArrowUp") {
              event.preventDefault()
              browseHistory("up")
            } else if (event.key === "ArrowDown") {
              event.preventDefault()
              browseHistory("down")
            }
          }}
          className="terminal-input"
          autoComplete="off"
          spellCheck={false}
          placeholder="type help"
        />
      </form>
      {toast && (
        <div role="alert" className="terminal-toast">
          <span>{toast}</span>
          <button type="button" onClick={() => setToast(null)} aria-label="Dismiss error">×</button>
        </div>
      )}
    </div>
  )
}
