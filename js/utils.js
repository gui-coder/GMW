/**
 * Utilitários gerais da aplicação
 */
class Utils {
  /**
   * Formata duração de minutos para horas e minutos
   * @param {number} minutes - Duração em minutos
   * @returns {Object} Objeto com diferentes formatos da duração
   */
  static formatDuration(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return {
      formatted: `${hours}h ${mins}m`,
      hours,
      minutes: mins,
      totalMinutes: minutes,
    };
  }

  /**
   * Formata tamanho de arquivo
   * @param {number} bytes - Tamanho em bytes
   * @returns {string} Tamanho formatado
   */
  static formatFileSize(bytes) {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  }

  /**
   * Formata data para exibição
   * @param {Date} date - Data a ser formatada
   * @returns {string} Data formatada
   */
  static formatDate(date) {
    if (!(date instanceof Date) || isNaN(date)) return "";

    const pad = (num) => String(num).padStart(2, "0");

    return (
      `${pad(date.getDate())}/${pad(
        date.getMonth() + 1
      )}/${date.getFullYear()} ` +
      `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(
        date.getSeconds()
      )}`
    );
  }

  /**
   * Calcula estatísticas básicas
   * @param {Array<number>} values - Array de valores numéricos
   * @returns {Object} Objeto com estatísticas
   */
  static calculateStats(values) {
    if (!values || !values.length) return null;

    const sum = values.reduce((a, b) => a + b, 0);
    const mean = sum / values.length;
    const squaredDiffs = values.map((value) => Math.pow(value - mean, 2));
    const variance = squaredDiffs.reduce((a, b) => a + b, 0) / values.length;

    return {
      min: Math.min(...values),
      max: Math.max(...values),
      mean: mean,
      std: Math.sqrt(variance),
      count: values.length,
    };
  }

  /**
   * Agrupa array de objetos por uma propriedade
   * @param {Array} array - Array de objetos
   * @param {string} key - Chave para agrupamento
   * @returns {Object} Objeto agrupado
   */
  static groupBy(array, key) {
    return array.reduce((groups, item) => {
      const group = groups[item[key]] || [];
      group.push(item);
      groups[item[key]] = group;
      return groups;
    }, {});
  }

  /**
   * Remove elementos HTML vazios
   * @param {HTMLElement} element - Elemento a ser limpo
   */
  static cleanupDOM(element) {
    if (!element) return;

    while (element.firstChild) {
      element.removeChild(element.firstChild);
    }
  }

  /**
   * Valida se uma string é uma data válida
   * @param {string} dateStr - String de data
   * @returns {boolean} Verdadeiro se for data válida
   */
  static isValidDate(dateStr) {
    const date = new Date(dateStr);
    return date instanceof Date && !isNaN(date);
  }

  /**
   * Gera ID único
   * @returns {string} ID único
   */
  static generateUniqueId() {
    return `id_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Exporta a classe Utils para uso global
window.Utils = Utils;
