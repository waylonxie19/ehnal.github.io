# 医学量表计算系统

## 概述
系统将通过配置对象描述量表，并使用渲染引擎自动生成UI。

## 核心模块结构

### 1. 配置模块 (ScaleConfig)
定义量表配置对象的结构和接口。

```typescript
interface ScaleOption {
  id: string;           // 选项ID
  label: string;        // 选项标签文本
  value: number;        // 选项分值
  checked?: boolean;    // 是否默认选中
}

interface ScaleQuestion {
  id: string;           // 问题ID
  text: string;         // 问题文本
  type: 'radio' | 'checkbox';  // 输入类型
  options: ScaleOption[]; // 问题选项
  groupName?: string;    // 单选按钮组名称
}

interface ScaleSection {
  id: string;           // 区块ID
  title: string;        // 区块标题
  questions: ScaleQuestion[]; // 区块内问题
  layout?: 'table' | 'list' | 'grid'; // 布局方式
}

interface ScaleRiskLevel {
  min: number;          // 最小分值(含)
  max: number;          // 最大分值(含)
  text: string;         // 风险描述
  recommendation?: string; // 建议措施
}

interface ScaleRiskTable {
  header: string[];     // 表头
  rows: Array<Array<string | number>>; // 行数据
}

interface ScaleConfig {
  id: string;           // 量表ID
  name: string;         // 量表名称
  description: string;  // 量表描述
  scoreRange: {         // 分值范围
    min: number;
    max: number;
  };
  sections: ScaleSection[]; // 量表区块
  resultDisplay?: {     // 结果显示配置
    sections: string[];  // 结果中要显示的部分
    formula?: string;    // 结果公式显示方式(如"E{e}V{v}M{m}={total}")
  };
  riskLevels?: ScaleRiskLevel[]; // 风险等级
  riskTable?: ScaleRiskTable;    // 风险对照表
  calculateScore: (inputs: Record<string, any>) => any; // 计算分数的函数
}
```

### 2. 渲染引擎 (ScaleRenderer)
负责根据配置生成DOM结构。

```typescript
class ScaleRenderer {
  constructor(config: ScaleConfig);
  
  // 渲染整个量表
  renderScale(): HTMLElement;
  
  // 渲染量表信息区域
  renderInfo(): HTMLElement;
  
  // 渲染量表输入区域
  renderInputSections(): HTMLElement;
  
  // 渲染计算按钮区域
  renderCalculateSection(): HTMLElement;
  
  // 渲染结果区域
  renderResultContainer(): HTMLElement;
  
  // 渲染风险表格(如果有)
  renderRiskTable(): HTMLElement | null;
}
```

### 3. 控制器 (ScaleController)
管理量表的初始化、事件绑定和用户交互。

```typescript
class ScaleController {
  constructor(config: ScaleConfig, container: HTMLElement);
  
  // 初始化量表
  init(): void;
  
  // 绑定事件处理
  bindEvents(): void;
  
  // 计算量表得分
  calculate(): void;
  
  // 更新结果显示
  updateResult(result: any): void;
  
  // 复制结果
  copyResult(): void;
}
```

### 4. 应用管理器 (ScaleManager)
全局管理所有量表配置和切换。

```typescript
class ScaleManager {
  constructor(container: HTMLElement);
  
  // 注册量表配置
  registerScale(config: ScaleConfig): void;
  
  // 初始化所有量表
  initScales(): void;
  
  // 初始化标签切换
  initTabSwitching(): void;
  
  // 切换到指定量表
  switchToScale(scaleId: string): void;
}
```

### 5. 应用入口 (App)
应用程序入口点。

```typescript
class App {
  static init(): void;
}
```

## 数据流
1. App初始化ScaleManager
2. 注册所有量表配置
3. ScaleManager为每个量表创建ScaleController
4. ScaleController使用ScaleRenderer渲染量表UI
5. 用户交互由ScaleController处理，计算结果并更新显示

## 扩展方式
添加新量表只需：
1. 在scale.js中创建或者导入新的量表配置对象
2. 注册到ScaleManager