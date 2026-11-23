# Use with an AI agent

The repository includes an agent skill (`.claude/skills/ai-icon-studio`, mirrored in `.agents/skills`). Open the project in your agent and ask:

- “Make me a calendar icon, with the line, tinted and colour versions.”
- “Design an icon set for a weather app, and animate them with pulse and float.”
- “Fix the heart: it touches the edge.”

The agent writes `icons/<name>.json`, runs the build, looks at the renders and reports the files.
