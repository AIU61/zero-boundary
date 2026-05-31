# 零界 App Figma 视觉重设计说明

由于当前会话没有暴露可调用的 Figma MCP 写入工具，本文件作为 Figma 画布重建规范。可在 Figma 中按此创建 `零界 / Cyber MVP UI` 页面，并与当前代码实现保持一致。

## Artboards

- Mobile primary: `390 x 844`
- Desktop preview: `1440 x 1024`
- Safe area: mobile top `24`, horizontal `16`

## Visual Direction

- 风格关键词：未来商业操作系统、赛博城市、霓虹雨夜、可信链上凭证、HUD 仪表盘。
- 底色：接近黑蓝的深色空间，不使用纯黑。
- 主色：霓虹青用于协议/链路，紫粉用于交互动作，琥珀用于权益/票根。
- 质感：玻璃拟态卡片、细描边、扫描线、网格底纹、轻微霓虹辉光。

## Tokens

- `bg/base`: `#050712`
- `surface/glass`: `rgba(9, 18, 36, 0.78)`
- `surface/strong`: `rgba(12, 28, 52, 0.92)`
- `line/cyan`: `rgba(104, 241, 255, 0.26)`
- `accent/cyan`: `#35F4FF`
- `accent/violet`: `#9B6CFF`
- `accent/pink`: `#FF3ED0`
- `accent/amber`: `#FFB84D`
- `accent/green`: `#76FFBF`
- `text/primary`: `#E8FBFF`
- `text/muted`: `#83A9BA`
- `radius/card`: `8`

## Main Screen Structure

1. Hero / protocol header
   - Badge: `ZERO BOUNDARY ECONOMY / CYBER COMMERCE OS`
   - H1: `零界夜行协议`
   - Body: `把现实城市叠加为第二层商业空间...`
   - Segmented tabs: 用户端 / 商家端 / 治理端
   - Right status module: current notice, `FISCO BCOS Adapter`, `TX_REF`

2. User tab
   - Route card: route name, story, 4-step orbit progress `领取 / 到店 / 存证 / 权益`
   - Stops list: `黑雨冷萃`, `霓虹烘焙所`
   - Primary actions: `领取路线`, `扫码核销`
   - Wallet card: Lingjie ID, level, energy, credit, benefit count, consent button, ticket list

3. Merchant tab
   - Merchant cards with compliance badge
   - Task console: task completion rate and verified checkins

4. Governance tab
   - Compliance boundary card
   - Chain notarization card
   - Governance metrics card

## Component Notes

- Buttons use 46px height, 8px radius, icon + label.
- Cards use 1px cyan translucent stroke, blur background, no nested card-on-card frames except repeated metric cells.
- Route orbit should read as a HUD progress rail, not a marketing timeline.
- Avoid decorative blobs; use grid, scanline, thin neon strokes, and data modules.
