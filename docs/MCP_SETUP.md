# MCP-инструменты в проекте

## UI UX Pro Max

- **Skill:** `.cursor/skills/ui-ux-pro-max/` (установлен через `uipro init --ai cursor`)
- **MCP:** `ui-ux-pro-max` в `.cursor/mcp.json`
- **Design system:** `design-system/delybet/MASTER.md`

После изменения конфига перезапустите Cursor.

## Magic MCP (21st.dev)

1. Получите API key на [21st.dev](https://21st.dev)
2. В `.cursor/mcp.json` укажите ключ в `env.API_KEY` для `@21st-dev/magic`
3. Или глобально: `npx @21st-dev/cli@latest install cursor --api-key <key>`
4. Перезапустите Cursor
