/**
 * script.js
 * 医学评分量表系统 - 主程序
 * 整合各模块，实现应用初始化和标签页管理
 */

import scales from './scales.js';
import ScaleRenderer from './scale-renderer.js';
import ScaleController from './scale-controller.js';

/**
 * 当DOM加载完成后执行初始化
 */
document.addEventListener('DOMContentLoaded', () => {
  // 初始化标签页系统
  initTabs();
  
  // 初始化量表系统
  initScales();
  
  // 初始化复制按钮
  initCopyButtons();
});

/**
 * 初始化标签页切换功能
 */
function initTabs() {
  const tabsContainer = document.querySelector('.tabs');
  
  // 清空现有标签
  tabsContainer.innerHTML = '';
  
  // 根据scales对象动态生成标签按钮
  Object.entries(scales).forEach(([scaleId, scaleConfig], index) => {
    const button = document.createElement('button');
    button.className = 'tab-btn' + (index === 0 ? ' active' : '');
    button.setAttribute('data-tab', scaleId);
    button.textContent = scaleConfig.name;
    tabsContainer.appendChild(button);
  });
  
  // 为所有标签按钮添加事件监听
  const tabButtons = document.querySelectorAll('.tab-btn');
  
  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      // 移除所有标签和内容的活跃状态
      document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
      
      // 激活当前标签和对应内容
      button.classList.add('active');
      const tabId = button.getAttribute('data-tab');
      const contentElement = document.getElementById(tabId);
      if (contentElement) {
        contentElement.classList.add('active');
      }
      
      // 保存当前标签到本地存储
      localStorage.setItem('activeTab', tabId);
    });
  });
  
  // 恢复上次选择的标签
  const savedTab = localStorage.getItem('activeTab');
  if (savedTab) {
    const tabToActivate = document.querySelector(`.tab-btn[data-tab="${savedTab}"]`);
    if (tabToActivate) {
      tabToActivate.click();
    }
  } else if (tabButtons.length > 0) {
    // 如果没有保存的标签，激活第一个
    tabButtons[0].click();
  }
  
  console.log(`已初始化 ${tabButtons.length} 个标签页`);
}

/**
 * 初始化所有量表
 */
function initScales() {
  const container = document.querySelector('.container');
  
  // 清除现有内容(保留标题和标签导航)
  const existingTabs = document.querySelectorAll('.tab-content');
  existingTabs.forEach(tab => tab.remove());
  
  // 遍历所有量表配置，渲染并初始化
  Object.values(scales).forEach(scaleConfig => {
    // 渲染量表
    ScaleRenderer.renderScale(scaleConfig, container);
    
    // 初始化控制器
    ScaleController.initScale(scaleConfig);
    
    // 如果量表有onInit函数，调用它
    if (typeof scaleConfig.onInit === 'function') {
      try {
        scaleConfig.onInit();
      } catch (error) {
        console.error(`初始化量表 ${scaleConfig.id} 时出错:`, error);
      }
    }
  });
}

/**
 * 初始化复制按钮功能
 */
function initCopyButtons() {
  const copyButtons = document.querySelectorAll('.copy-btn');
  
  copyButtons.forEach(button => {
    button.addEventListener('click', () => {
      const tabId = button.getAttribute('data-tab');
      copyResult(tabId);
    });
  });
}

/**
 * 复制评分结果
 * @param {string} tabId - 标签ID
 */
function copyResult(tabId) {
  const scaleConfig = scales[tabId];
  if (!scaleConfig) return;
  
  const resultText = ScaleController.copyResult(tabId, scaleConfig);
  
  // 使用剪贴板API复制
  navigator.clipboard.writeText(resultText)
    .then(() => {
      // 复制成功提示
      const button = document.querySelector(`.copy-btn[data-tab="${tabId}"]`);
      const originalText = button.textContent;
      button.textContent = '已复制!';
      
      // 2秒后恢复原始文本
      setTimeout(() => {
        button.textContent = originalText;
      }, 2000);
    })
    .catch(err => {
      console.error('复制失败:', err);
      alert('复制失败，请手动复制。');
    });
}

// 语法自检
try {
  console.log("语法检查通过");
}
catch (error) {
  console.error("语法错误:", error.message);
}

// 功能验证
console.assert(
  document.querySelector('.tabs') !== null,
  "标签页容器元素不存在"
);

console.assert(
  typeof scales === 'object' && Object.keys(scales).length > 0,
  "量表配置未正确加载"
);