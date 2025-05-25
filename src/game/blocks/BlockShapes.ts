import { BlockShape } from '@/types/game'

// 俄罗斯方块形状定义
export class BlockShapes {
  private static shapes: BlockShape[] = [
    // 单格方块
    {
      id: 'single',
      name: '单格',
      pattern: [[1]],
      color: '#ffff00', // 黄色
      rotatable: false,
      rarity: 1
    },

    // 两格方块
    {
      id: 'line2h',
      name: '直线2(横)',
      pattern: [[1, 1]],
      color: '#00ff00', // 绿色
      rotatable: true,
      rarity: 1
    },
    {
      id: 'line2v',
      name: '直线2(竖)',
      pattern: [[1], [1]],
      color: '#00ff00', // 绿色
      rotatable: true,
      rarity: 1
    },

    // 三格方块
    {
      id: 'line3h',
      name: '直线3(横)',
      pattern: [[1, 1, 1]],
      color: '#00ffff', // 青色
      rotatable: true,
      rarity: 2
    },
    {
      id: 'line3v',
      name: '直线3(竖)',
      pattern: [[1], [1], [1]],
      color: '#00ffff', // 青色
      rotatable: true,
      rarity: 2
    },
    {
      id: 'l3_1',
      name: 'L形3-1',
      pattern: [
        [1, 1],
        [1, 0]
      ],
      color: '#ff8000', // 橙色
      rotatable: true,
      rarity: 2
    },
    {
      id: 'l3_2',
      name: 'L形3-2',
      pattern: [
        [1, 0],
        [1, 1]
      ],
      color: '#ff8000', // 橙色
      rotatable: true,
      rarity: 2
    },

    // 四格方块 - 经典俄罗斯方块
    {
      id: 'i_piece',
      name: 'I形',
      pattern: [[1, 1, 1, 1]],
      color: '#00ffff', // 青色
      rotatable: true,
      rarity: 3
    },
    {
      id: 'o_piece',
      name: 'O形',
      pattern: [
        [1, 1],
        [1, 1]
      ],
      color: '#ffff00', // 黄色
      rotatable: false,
      rarity: 3
    },
    {
      id: 't_piece',
      name: 'T形',
      pattern: [
        [0, 1, 0],
        [1, 1, 1]
      ],
      color: '#800080', // 紫色
      rotatable: true,
      rarity: 3
    },
    {
      id: 'l_piece',
      name: 'L形',
      pattern: [
        [1, 0, 0],
        [1, 1, 1]
      ],
      color: '#ff8000', // 橙色
      rotatable: true,
      rarity: 3
    },
    {
      id: 'j_piece',
      name: 'J形',
      pattern: [
        [0, 0, 1],
        [1, 1, 1]
      ],
      color: '#0000ff', // 蓝色
      rotatable: true,
      rarity: 3
    },
    {
      id: 's_piece',
      name: 'S形',
      pattern: [
        [0, 1, 1],
        [1, 1, 0]
      ],
      color: '#00ff00', // 绿色
      rotatable: true,
      rarity: 3
    },
    {
      id: 'z_piece',
      name: 'Z形',
      pattern: [
        [1, 1, 0],
        [0, 1, 1]
      ],
      color: '#ff0000', // 红色
      rotatable: true,
      rarity: 3
    },

    // 五格方块 - 俄罗斯方块变种（Pentomino）
    {
      id: 'p_piece',
      name: 'P形五格',
      pattern: [
        [1, 1],
        [1, 1],
        [1, 0]
      ],
      color: '#ff69b4', // 粉红色
      rotatable: true,
      rarity: 4
    },
    {
      id: 'u_piece',
      name: 'U形五格',
      pattern: [
        [1, 0, 1],
        [1, 1, 1]
      ],
      color: '#ffa500', // 橙红色
      rotatable: true,
      rarity: 4
    },
    {
      id: 'w_piece',
      name: 'W形五格',
      pattern: [
        [1, 0, 0],
        [1, 1, 0],
        [0, 1, 1]
      ],
      color: '#8a2be2', // 蓝紫色
      rotatable: true,
      rarity: 4
    },
    {
      id: 'y_piece',
      name: 'Y形五格',
      pattern: [
        [0, 1],
        [1, 1],
        [0, 1],
        [0, 1]
      ],
      color: '#20b2aa', // 浅海绿色
      rotatable: true,
      rarity: 4
    },
    {
      id: 'x_piece',
      name: 'X形五格',
      pattern: [
        [0, 1, 0],
        [1, 1, 1],
        [0, 1, 0]
      ],
      color: '#dc143c', // 深红色
      rotatable: true,
      rarity: 4
    },
    {
      id: 'n_piece',
      name: 'N形五格',
      pattern: [
        [0, 1, 1, 1],
        [1, 1, 0, 0]
      ],
      color: '#9acd32', // 黄绿色
      rotatable: true,
      rarity: 4
    },
    {
      id: 'f_piece',
      name: 'F形五格',
      pattern: [
        [0, 1, 1],
        [1, 1, 0],
        [0, 1, 0]
      ],
      color: '#4169e1', // 皇家蓝
      rotatable: true,
      rarity: 4
    },

    // 六格超大方块
    {
      id: 'plus_big',
      name: '大十字',
      pattern: [
        [0, 1, 0],
        [1, 1, 1],
        [0, 1, 0]
      ],
      color: '#ff6347', // 番茄红
      rotatable: false,
      rarity: 4
    },
    {
      id: 'corner_6',
      name: '角形六格',
      pattern: [
        [1, 1, 1],
        [1, 0, 0],
        [1, 0, 0],
        [1, 0, 0]
      ],
      color: '#dda0dd', // 洋李色
      rotatable: true,
      rarity: 5
    },
    {
      id: 'stairs_6',
      name: '阶梯六格',
      pattern: [
        [1, 0, 0],
        [1, 1, 0],
        [0, 1, 1],
        [0, 0, 1]
      ],
      color: '#b22222', // 耐火砖色
      rotatable: true,
      rarity: 5
    },

    // 大型方块（真正的6-9格）
    {
      id: 'big_l',
      name: '大L形',
      pattern: [
        [1, 0, 0, 0],
        [1, 0, 0, 0],
        [1, 0, 0, 0],
        [1, 1, 1, 1]
      ],
      color: '#800000', // 栗色
      rotatable: true,
      rarity: 5
    },
    {
      id: 'mega_cross',
      name: '巨型十字',
      pattern: [
        [0, 0, 1, 0, 0],
        [0, 0, 1, 0, 0],
        [1, 1, 1, 1, 1],
        [0, 0, 1, 0, 0],
        [0, 0, 1, 0, 0]
      ],
      color: '#2f4f4f', // 暗石板灰
      rotatable: false,
      rarity: 6
    },

    // 特殊形状 - 更复杂的图案
    {
      id: 'diamond_5',
      name: '钻石五格',
      pattern: [
        [0, 1, 0],
        [1, 1, 1],
        [1, 0, 1]
      ],
      color: '#00ced1', // 深绿松石色
      rotatable: true,
      rarity: 4
    },
    {
      id: 'claw_5',
      name: '爪形五格',
      pattern: [
        [1, 0, 1],
        [1, 1, 1],
        [0, 1, 0]
      ],
      color: '#ff1493', // 深粉红色
      rotatable: true,
      rarity: 4
    },
    {
      id: 'hook_5',
      name: '钩形五格',
      pattern: [
        [1, 1, 1, 1],
        [0, 0, 0, 1],
        [0, 0, 1, 0]
      ],
      color: '#32cd32', // 石灰绿
      rotatable: true,
      rarity: 4
    },

    // 线性大方块
    {
      id: 'line5',
      name: '五格直线',
      pattern: [[1, 1, 1, 1, 1]],
      color: '#ff4500', // 橙红色
      rotatable: true,
      rarity: 4
    },
    {
      id: 'line6',
      name: '六格直线',
      pattern: [[1, 1, 1, 1, 1, 1]],
      color: '#8b0000', // 暗红色
      rotatable: true,
      rarity: 5
    },

    // 方形大方块
    {
      id: 'square3',
      name: '3x3方形',
      pattern: [
        [1, 1, 1],
        [1, 1, 1],
        [1, 1, 1]
      ],
      color: '#483d8b', // 暗板岩蓝
      rotatable: false,
      rarity: 5
    },

    // 螺旋形状
    {
      id: 'spiral_5',
      name: '螺旋五格',
      pattern: [
        [1, 1, 1],
        [0, 0, 1],
        [1, 1, 1]
      ],
      color: '#ba55d3', // 中紫罗兰色
      rotatable: true,
      rarity: 4
    },

    // 锯齿形状
    {
      id: 'zigzag_6',
      name: '锯齿六格',
      pattern: [
        [1, 0, 1, 0],
        [1, 1, 1, 1],
        [0, 1, 0, 1]
      ],
      color: '#cd853f', // 秘鲁色
      rotatable: true,
      rarity: 5
    }
  ]

  // 获取所有形状
  static getAllShapes(): BlockShape[] {
    return [...this.shapes]
  }

  // 根据难度获取形状
  static getShapesByDifficulty(level: number): BlockShape[] {
    if (level <= 0) {
      // 超简单：只有单格方块
      return this.shapes.filter(shape => shape.rarity === 1 && shape.pattern.length === 1 && shape.pattern[0].length === 1)
    } else if (level <= 1) {
      // 新手：只有1-2格方块
      return this.shapes.filter(shape => shape.rarity <= 1)
    } else if (level <= 2) {
      // 基础：1-3格方块
      return this.shapes.filter(shape => shape.rarity <= 2)
    } else if (level <= 3) {
      // 进阶：1-4格方块（经典俄罗斯方块）
      return this.shapes.filter(shape => shape.rarity <= 3)
    } else if (level <= 4) {
      // 高级：1-5格方块（包含五格方块Pentomino）
      return this.shapes.filter(shape => shape.rarity <= 4)
    } else if (level <= 5) {
      // 专家：1-6格方块（包含大部分复杂形状）
      return this.shapes.filter(shape => shape.rarity <= 5)
    } else {
      // 大师：所有形状（包含最复杂的6级稀有度巨型方块）
      return this.shapes
    }
  }

  // 随机获取一个形状（带权重）
  static getRandomShape(level: number = 1): BlockShape {
    const availableShapes = this.getShapesByDifficulty(level)
    
    // 根据稀有度设置权重（稀有度越高，出现概率越低，但高level时要增加复杂方块概率）
    const weights = availableShapes.map(shape => {
      const baseWeight = 8 - shape.rarity // 基础权重（稀有度越高，基础权重越低）
      
      // 高级关卡大幅增加复杂方块的出现率
      let levelBonus = 0
      if (level >= 3) {
        // level 3+ 开始增加复杂方块权重
        levelBonus = Math.min(4, Math.floor((level - 2) * 1.5))
        
        // 对于高稀有度方块，level越高，权重增加越多
        if (shape.rarity >= 4) {
          levelBonus += Math.min(3, level - 3)
        }
        if (shape.rarity >= 5) {
          levelBonus += Math.min(2, level - 4)
        }
        if (shape.rarity >= 6) {
          levelBonus += Math.min(2, level - 5)
        }
      }
      
      // 特别奖励：在最高难度时，巨型方块权重大幅提升
      if (level >= 6 && shape.rarity >= 5) {
        levelBonus += 3 // 巨型方块在最高难度时权重大幅提升
      }
      
      return Math.max(1, baseWeight + levelBonus)
    })
    
    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0)
    let random = Math.random() * totalWeight
    
    for (let i = 0; i < availableShapes.length; i++) {
      random -= weights[i]
      if (random <= 0) {
        return availableShapes[i]
      }
    }
    
    return availableShapes[availableShapes.length - 1] // 兜底返回
  }

  // 旋转方块形状
  static rotateShape(pattern: number[][]): number[][] {
    const rows = pattern.length
    const cols = pattern[0].length
    const rotated: number[][] = []

    for (let j = 0; j < cols; j++) {
      rotated[j] = []
      for (let i = rows - 1; i >= 0; i--) {
        rotated[j][rows - 1 - i] = pattern[i][j]
      }
    }

    return rotated
  }

  // 获取形状的边界框
  static getShapeBounds(pattern: number[][]): { width: number, height: number } {
    return {
      width: pattern[0].length,
      height: pattern.length
    }
  }
} 