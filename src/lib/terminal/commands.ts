import { routeLinks, socialLinks } from "@/lib/site-navigation"

export type CommandResult =
  | { type: "navigate"; href: string }
  | { type: "output"; lines: string[] }
  | { type: "clear" }
  | { type: "error"; message: string }

const aliases = new Map([
  ["home", "/"],
  ["cd ~", "/"],
  ["cd /", "/"],
  ["about", "/about"],
  ["cd about", "/about"],
  ["blog", "/blog"],
  ["cd blog", "/blog"],
  ["contact", "/contact"],
  ["cd contact", "/contact"],
])

const helpLines = [
  "help                 show this command list",
  "home | cd ~          open the home page",
  "about | cd about     open the about page",
  "blog | cd blog       open the blog",
  "contact | cd contact open the contact page",
  "open <post-slug>     open a blog post",
  "socials              list social profiles",
  "clear                clear command output",
]

export function executeTerminalCommand(rawCommand: string, postSlugs: readonly string[]): CommandResult {
  const command = rawCommand.trim().toLowerCase().replaceAll(/\s+/g, " ")

  if (!command) {
    return { type: "output", lines: [] }
  }

  const href = aliases.get(command)
  if (href) {
    return { type: "navigate", href }
  }

  if (command === "help") {
    return { type: "output", lines: helpLines }
  }

  if (command === "socials") {
    return {
      type: "output",
      lines: socialLinks.map((link) => `${link.label.toLowerCase().padEnd(10)} ${link.href}`),
    }
  }

  if (command === "clear") {
    return { type: "clear" }
  }

  if (command.startsWith("open ")) {
    const slug = command.slice(5).trim()
    if (postSlugs.includes(slug)) {
      return { type: "navigate", href: `/blog/${slug}` }
    }
    return { type: "error", message: `Post not found: ${slug || "(missing slug)"}` }
  }

  const knownCommand = routeLinks.find((link) => link.command === command)
  if (knownCommand) {
    return { type: "navigate", href: knownCommand.href }
  }

  return { type: "error", message: `Command not found: ${command}. Type help.` }
}
