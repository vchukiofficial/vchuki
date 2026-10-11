# VCHUKI — Agent System

Nine agents run this business. This file explains how they fit together, where
they live, and the rules that keep them from drifting out of date.

## The agents

| Agent | Owns |
|---|---|
| `/vchuki-ceo` | Weekly review, the week's single priority, cross-department decisions |
| `/vchuki-finance` | Unit economics, contribution margin, pricing, RTO cost, GST, runway |
| `/vchuki-growth` | Traffic and first customers — SEO, organic social, influencers, marketplaces |
| `/vchuki-sales` | Conversion, AOV, bundles, COD→prepaid, cart recovery, repeat purchase |
| `/vchuki-post` | Instagram content — captions, Reels, calendar |
| `/vchuki-cx` | Customer conversations — confirmation, support, returns, reviews |
| `/vchuki-ops` | Dispatch, couriers, NDR, RTO control, returns processing, 3PL |
| `/vchuki-dev` | Site, admin panel, integrations, technical SEO |
| `/vchuki-supply` | Fabric, tailors, costing, inventory, size ratios, packaging |

## Where the lines fall

Several of these are adjacent. When two could plausibly own a question:

```
growth  brings strangers  →  sales  converts them  →  cx  looks after them
supply  is upstream of stock  →  ops  is downstream of it
cx      does the talking      →  ops  moves the box
```

Each agent now carries an explicit owns / does-not-own table, so routing is
decided by the skill rather than by whichever description matched first.

## Shared context

Every agent reads these before answering. They are the difference between an
agent that asks you for revenue every session and one that already knows it.

```
context/metrics.md       money, demand, operations — update weekly
context/products.md      SKUs, costs, sizing, bundles
context/customers.md     who buys, real objections, why orders come back
context/decisions.md     what's settled, what you chose to skip
context/competitors.md   the five, their Reel style, and ten scripts
```

**The rule that matters:** if a number is unknown, write `unknown`. Never leave a
guess in place. Every agent is instructed to ask rather than invent, and a stale
number is worse than a blank one — a blank prompts a question, a wrong number
silently produces wrong advice.

## Where skills actually live

Skills persist in your Claude account. That is the live copy and the only one
that changes when you edit a skill.

`.claude/skills/` in this repo is a **mirror** — for version control, for diffs,
and so Claude Code picks the agents up when run inside this project.

```
account  ──sync-skills.sh──>  repo
   ↑                            
   └── edits happen here, via Claude
```

One-way. Editing a file in `.claude/skills/` does **not** change the live skill.
After changing any agent, run:

```bash
./scripts/sync-skills.sh
```

## Keeping agents honest

Agents rot when they encode state instead of judgment. A skill that says "what is
built" is wrong the day you ship something; a skill that says "read the code and
check" stays right.

`/vchuki-dev` used to carry a long audit of what was and wasn't built. That has
been replaced with a set of `grep` checks the agent runs itself before answering,
so it establishes current state rather than asserting a remembered one. It still
carries the conventions, the build queue and the build/don't-build test — those
are judgment, and judgment doesn't rot.

**When you edit an agent, prefer removing a fact over adding one.** The test:
would this sentence still be true if you shipped three features tomorrow? If not,
turn it into an instruction to go and look.

## Adding a tenth agent

Don't, unless you used all nine last week. Nine is already more org than a
one-person company needs, and `/vchuki-ceo` is instructed to push back on exactly
this instinct — it is the same impulse as building instead of selling, one level up.
