export type Section = '新手村' | '框架岛'

export interface MapNode {
  id: number          // matches case map_position
  x: number           // rpx from left (out of 750rpx)
  y: number           // rpx from top (inside scroll-view)
  section: Section
  label: string
  framework: string
  estimatedMin: number
}

// Canvas: 750rpx wide, 1800rpx tall (fits in one scroll)
// Nodes flow upward (y decreases toward top)
export const MAP_NODES: MapNode[] = [
  // 新手村 (positions 1-5, bottom to top)
  { id: 1,  x: 220, y: 1600, section: '新手村', label: '瑞幸 vs 星巴克', framework: '价值主张',  estimatedMin: 5 },
  { id: 2,  x: 480, y: 1420, section: '新手村', label: '拼多多崛起',      framework: '用户分层',    estimatedMin: 5 },
  { id: 3,  x: 180, y: 1240, section: '新手村', label: '苹果的溢价逻辑',  framework: '品牌溢价',    estimatedMin: 5 },
  { id: 4,  x: 500, y: 1060, section: '新手村', label: '滴滴打车革命',    framework: '双边平台',    estimatedMin: 5 },
  { id: 5,  x: 280, y: 880,  section: '新手村', label: '健身房的秘密',    framework: '商业模式画布', estimatedMin: 5 },
  // 框架岛 (positions 6-15)
  { id: 6,  x: 160, y: 700,  section: '框架岛', label: '美团+摩拜',      framework: 'SWOT',        estimatedMin: 8 },
  { id: 7,  x: 480, y: 560,  section: '框架岛', label: '短视频战争',      framework: '波特五力',    estimatedMin: 8 },
  { id: 8,  x: 220, y: 420,  section: '框架岛', label: '咖啡店选址',      framework: 'MECE',        estimatedMin: 8 },
  { id: 9,  x: 500, y: 290,  section: '框架岛', label: 'Airbnb冷启动',   framework: 'AARRR',       estimatedMin: 8 },
  { id: 10, x: 260, y: 160,  section: '框架岛', label: '爆米花定价术',    framework: '捆绑定价',    estimatedMin: 8 },
]

export const SECTION_LABELS: { section: Section; y: number; color: string }[] = [
  { section: '新手村', y: 1680, color: '#a8e6cf' },
  { section: '框架岛', y: 780,  color: '#4da6ff' },
]
