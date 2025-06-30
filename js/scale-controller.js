/**
 * scale-controller.js
 * 量表控制器 - 处理量表的交互逻辑
 */

import ScaleRenderer from './scale-renderer.js';

/**
 * 量表控制器类
 * 处理量表的事件监听、计算和状态管理
 */
class ScaleController {
  constructor() {
    // 存储所有量表的状态
    this.states = {};
  }
  
  /**
   * 初始化量表
   * @param {Object} scaleConfig - 量表配置对象
   */
  initScale(scaleConfig) {
    const scaleId = scaleConfig.id;
    
    // 为量表添加事件监听
    this.addEventListeners(scaleConfig);
    
    // 恢复保存的状态
    this.restoreState(scaleConfig);
    
    // 初始计算分数
    this.calculateScore(scaleConfig);
  }
  
  /**
   * 为量表添加事件监听
   * @param {Object} scaleConfig - 量表配置对象
   */
  addEventListeners(scaleConfig) {
    const scaleId = scaleConfig.id;
    
    // 为每个部分的选项添加事件监听
    scaleConfig.sections.forEach(section => {
      const inputs = document.querySelectorAll(`input[name="${section.name}"]`);
      
      inputs.forEach(input => {
        input.addEventListener('change', () => {
          this.calculateScore(scaleConfig);
        });
      });
    });
  }
  
  /**
   * 计算量表的分数和解释
   * @param {Object} scaleConfig - 量表配置对象
   */
  calculateScore(scaleConfig) {
    const scaleId = scaleConfig.id;
    let values, totalScore;
    
    // 根据量表类型获取分值
    if (scaleConfig.type === 'radio') {
      // 单选类型，获取每个部分的选中值
      values = {};
      scaleConfig.sections.forEach(section => {
        const checkedInput = document.querySelector(`input[name="${section.name}"]:checked`);
        if (checkedInput) {
          values[section.id] = parseInt(checkedInput.getAttribute('data-score'));
        } else {
          values[section.id] = 0;
        }
      });
      
      // 使用量表的计算函数计算总分
      totalScore = scaleConfig.calculateScore(values);
    } else {
      // 复选框类型，获取所有选中项的分值
      const checkedInputs = document.querySelectorAll(`input[name="${scaleConfig.sections[0].name}"]:checked`);
      values = Array.from(checkedInputs).map(input => parseInt(input.getAttribute('data-score')));
      
      // 使用量表的计算函数计算总分
      totalScore = scaleConfig.calculateScore(values);
    }
    
    // 计算分数格式
    const scoreData = scaleConfig.formatScore ? scaleConfig.formatScore(values, totalScore) : { total: totalScore, detail: '' };
    
    // 计算解释
    let risk = '';
    let interpretation = '';
    
    for (const rule of scaleConfig.interpretations) {
      if (rule.condition(totalScore)) {
        risk = rule.risk;
        interpretation = rule.text;
        break;
      }
    }
    
    // 更新结果显示
    ScaleRenderer.updateResults(scaleId, scoreData, risk, interpretation);
    
    // 保存状态
    this.saveState(scaleConfig);

    // console.log('计算分数:', scaleConfig.id);
    // console.log('选中的值:', values);
    // console.log('计算总分:', totalScore);
    
    return { totalScore, risk, interpretation };
  }
  
  /**
   * 保存量表状态到本地存储
   * @param {Object} scaleConfig - 量表配置对象
   */
  saveState(scaleConfig) {
    const scaleId = scaleConfig.id;
    const state = {};
    
    // 根据量表类型保存状态
    if (scaleConfig.type === 'radio') {
      // 单选类型，保存每个部分的选中值
      scaleConfig.sections.forEach(section => {
        const checkedInput = document.querySelector(`input[name="${section.name}"]:checked`);
        if (checkedInput) {
          state[section.id] = checkedInput.value;
        }
      });
    } else {
      // 复选框类型，保存所有选中项的值
      const checkedInputs = document.querySelectorAll(`input[name="${scaleConfig.sections[0].name}"]:checked`);
      state.checked = Array.from(checkedInputs).map(input => input.value);
    }
    
    // 存储到本地存储
    localStorage.setItem(`${scaleId}State`, JSON.stringify(state));
    this.states[scaleId] = state;
  }
  
  /**
   * 从本地存储恢复量表状态
   * @param {Object} scaleConfig - 量表配置对象
   */
  restoreState(scaleConfig) {
    const scaleId = scaleConfig.id;
    const savedState = localStorage.getItem(`${scaleId}State`);
    
    if (!savedState) return;
    
    try {
      const state = JSON.parse(savedState);
      this.states[scaleId] = state;
      
      // 根据量表类型恢复状态
      if (scaleConfig.type === 'radio') {
        // 单选类型，设置每个部分的选中值
        for (const sectionId in state) {
          const value = state[sectionId];
          const input = document.querySelector(`input[name="${sectionId}"][value="${value}"]`);
          if (input) {
            input.checked = true;
          }
        }
      } else {
        // 复选框类型，设置选中项
        if (state.checked) {
          state.checked.forEach(value => {
            const input = document.querySelector(`input[name="${scaleConfig.sections[0].name}"][value="${value}"]`);
            if (input) {
              input.checked = true;
            }
          });
        }
      }
    } catch (error) {
      console.error(`恢复${scaleId}状态失败:`, error);
    }
  }
  
  /**
   * 复制量表结果
   * @param {string} scaleId - 量表ID
   * @returns {string} 格式化的结果文本
   */
  copyResult(scaleId, scaleConfig) {
    let resultText = '';
    
    const scoreElement = document.getElementById(`${scaleId}-score`);
    const detailElement = document.getElementById(`${scaleId}-detail`);
    const riskElement = document.getElementById(`${scaleId}-risk`);
    const interpretationElement = document.getElementById(`${scaleId}-interpretation`);
    
    // 构建结果文本
    resultText = `${scaleConfig.name}: ${scoreElement.textContent}${scaleConfig.maxScore ? `/${scaleConfig.maxScore}` : ''}\n`;
    
    // 如果有详细分项，则添加
    if (detailElement && detailElement.textContent) {
      resultText += `分项: ${detailElement.textContent}\n`;
    }
    
    // 添加风险级别和解释
    if (riskElement && riskElement.textContent !== '-') {
      resultText += `风险级别: ${riskElement.textContent}\n`;
    }
    
    resultText += `解释: ${interpretationElement.textContent}`;
    
    return resultText;
  }
}

export default new ScaleController();