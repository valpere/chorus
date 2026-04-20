@AGENTS.md

## Claude Code

The chorus plugin is installed from the repo root:
```bash
claude plugin install https://github.com/valpere/chorus
```

Workflow pattern commands live in `plugins/chorus/commands/`. Run them via:
```bash
node plugins/chorus/scripts/companion.mjs check-all
node plugins/chorus/scripts/companion.mjs council "<task>"
node plugins/chorus/scripts/companion.mjs review
node plugins/chorus/scripts/companion.mjs debug "<symptom>"
node plugins/chorus/scripts/companion.mjs second-opinion [--agent <name>] "<approach>"
```
