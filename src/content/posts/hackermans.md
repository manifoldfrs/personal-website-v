---
layout: post
title: "Why's everyone getting hacked?"
date: 2026-10-21
categories:
  - Posts
---

If you're in tech and have been paying attention, you'll notice that there's been a pile of security incidents and vulnerability disclosures within the last few days:

- [PHP](https://thephp.foundation/blog/2026/10/21/todays-php-security-release-and-how-were-strengthening-php-security/)
- [Oracle](https://www.oracle.com/security-alerts/cpuoct2026.html)
- [Node](https://nodejs.org/en/blog/vulnerability/october-2026-security-releases)
- [Railway](https://blog.railway.com/p/security-disclosure-wednesday-october-21st)
- [OpenCode](https://www.bleepingcomputer.com/news/security/opencode-hack-exposes-api-keys-amid-ai-distillation-attacks/)

It feels like everything is getting hacked at once, but that's not quite what's going on.

# PHP, Oracle, and Node

## PHP2Shell

Some bugs turn into exploits when randos on the internet can use them to make your server do what they want. In fancier terms, it's called [Remote Code Execution](https://www.bugcrowd.com/glossary/remote-code-execution-rce/). The biggest of these three was PHP, or as it's being dubbed, PHP2Shell. PHP used to run a huge portion of the web, WordPress included.

Two bugs in how PHP handles memory let an attacker take over a server with one web request. The most fascinating part about this is that the [PHP Foundation itself found this bug back in 2024](https://thephp.foundation/blog/2026/10/21/todays-php-security-release-and-how-were-strengthening-php-security/) during an audit. But back then nobody could prove it was exploitable. Then in August of this year, a security firm called Calif found a working attack using OpenAI's model. Wiz, a cloud security platform, [found the same thing using Google's Gemini and OpenAI's models](https://www.wiz.io/blog/php2shell-php-rce). Thanks to AI models, security researchers were able to exploit a bug nobody could prove was exploitable two years earlier.

![Mind Blown](/images/mind_blown_wiz_khalifa.gif)

Another interesting tidbit about the PHP2Shell exploit was how messy the embargo was. When a vulnerability is discovered, there's usually an embargo on announcing and releasing the fix so no attacker has time to study it.

Unfortunately, PHP's embargo fell apart, but to be fair to the PHP Foundation it wasn't on them. First the bug IDs leak online. Then one of the research firms posts a video of the exploit. By accident. But then Chainguard, a company that makes secure container images, ships the fix six hours before everyone else, which fucked the embargo between all the security and development teams. The lesson is **DON'T PANIC**.

One last note I'll say is that most modern web pages don't actually run PHP anymore. And if someone is telling you *"Well, PHP runs about 70% of the web,"* they're using a bogus statistic, because most of those websites that *"still run PHP"* are now unused or offline. It's like counting every gym membership as someone who is super fit and likes to work out.

## Oracle

Oracle tends to ship security fixes in one big patch every few months. Their [October batch](https://www.oracle.com/security-alerts/cpuoct2026.html) had close to 1,300 fixes, roughly 1,000 more than last year's batch. Five of these fixes were for vulnerabilities that scored 10/10 for severity.

I've never really been a fan of Oracle, and you most likely don't run Oracle at home, but banks, airlines, hospitals, and my favorite F1 team do. Oracle's own teams keeps seeing attackers succeed because customers don't keep their shit up to date. This is understandable if you do the math, IT teams have about 1,300 fixes to test and install. Split that over 90 days and that's about 14 per day!

## Node

If you've built a web app in the last ten years, you've likely built it with Node. The [October update](https://nodejs.org/en/blog/vulnerability/october-2026-security-releases) fixed ten vulnerabilities, the scariest of which is Brotli. To put it simply, the exploit happens when you send a backend server using Node a broken compressed file, such as a broken zip file. Brotli is used by Node to unzip compressed data, but the exploit found lets attackers run their own code on that uncompressed data. The catch here is that Node only unzips Brotli data when another application asks it to, so you're screwed if any Node server unzips data that an attacker controls. [Vercel explains this very well](https://vercel.com/kb/bulletin/node-js-security-advisory).

On a more positive note, [VulnCheck found](https://thenextweb.com/news/ai-discovered-vulnerabilities-exploitation-vulncheck-anthropic-ledger) that only about 1.3% of bugs discovered by AI have actually been exploited, which is about the same as every other bug. So more bugs found has yet to mean that more people are getting hacked.


# OpenCode and Railway

An API key is basically a password your app uses to talk to another app. Say your app calls OpenAI or Anthropic. It sends your key, and the bill goes to you. Which means whoever has a copy of that key can spend your money until you cancel it. That's what OpenCode and Railways users reported over the last few days. Both of them hold API keys for their users:

```
On a typical day
  your app  ──(your API key)──────────>  OpenAI/Antropic ──>  bill goes to you

After someone reads your key store
  your app  ──(your API key)──────────>  OpenAI/Anthropic ──>  bill goes to you
  attacker  ──(a copy of your API key)─>  OpenAI/Anthropic ──>  bill still goes to you
```

OpenCode is a popular coding harness developers use, much like Claude Code or Codex. They have a service called [OpenCode Console](https://opencode.ai/v2/docs/console), which is the hosted team version of their coding harness. Your team saves an API key for a model company there once, and everyone on the team [uses it without ever seeing the key](https://opencode.ai/v2/docs/console/providers/). Unfortunately, they [faced a security breach](https://x.com/opencode/status/2111519637049319818?s=20) where attackers hit a small group of users on OpenCode Console who had linked their own accounts w/ API keys to services like OpenAI and Anthropic. Some users [reported up to $1,700](https://www.bleepingcomputer.com/news/security/opencode-hack-exposes-api-keys-amid-ai-distillation-attacks/) in charges they never made.

Railway is a cloud service for hosting applications, much like Cloudflare or Vercel. When you put your OpenAI key in your app's settings on Railway, it [hands it to your app](https://docs.railway.com/guides/variables) every time it starts. Railway reported a [breach](https://blog.railway.com/p/security-disclosure-wednesday-october-21st) where an attacker may have gotten into where those settings are stored and, for some of them, read the real values.

## Why now?

This is where second-order effects come in. If there's one lesson I've seared into my brain it's that actions, both intended and unintended, have consequences. Whether in dating, going about your day, or thinking of long-term company strategies. First, though, let me explain distillation.

Distillation means training a smaller LLM on a bigger model's answers (see [my talk a couple years back](/blog/ai-camp-talk) as one such example). AI companies perform distillation on their models all the time when they want to make smaller, cheaper versions. Distillation can turn into an attack when someone does it to a competitor's model, without permission, over and over again.

OpenAI and Anthropic have been fighting distillation attacks hard. In February, [Anthropic named](https://www.anthropic.com/news/detecting-and-preventing-distillation-attacks) Chinese companies running millions of these requests through tens of thousands of fake accounts. And in September, the NSA, CISA, and FBI [put out a joint warning](https://www.nextgov.com/artificial-intelligence/2026/09/intelligence-agencies-warn-chinas-large-scale-ai-model-distillation-efforts/415851/). Finally, this month [Anthropic put out new defenses](https://www.anthropic.com/news/distillation-defenses) to cut how much distillers can harvest by 90 to 99%.

Now let's think like an attacker. If I can no longer call Anthropic or OpenAI to distill my model, where would I go next? I wouldn't be surprised if we see more breaches like this in the coming months.


# How do we stay safe?

Pray.

But in all seriousness, it's important to keep your software up to date. Turn on automatic updates. Don't share your API keys if you don't have to, and if you do, make sure to set a spending limit.

Stay safe folks 🙏

<video src="/videos/the_power_of_code_compels_you.mp4" controls playsinline preload="metadata" aria-label="The power of code compels you"></video>
