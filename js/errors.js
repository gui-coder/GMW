/**
 * Classes de erro customizadas
 */

class JobAnalyzerError extends Error {
  /**
   * @param {string} message - Mensagem de erro
   * @param {string} type - Tipo do erro
   * @param {Error} [originalError] - Erro original
   */
  constructor(message, type = "GeneralError", originalError = null) {
    super(message);
    this.name = "JobAnalyzerError";
    this.type = type;
    this.originalError = originalError;
    this.timestamp = new Date();
  }

  /**
   * Retorna representação string do erro
   * @returns {string}
   */
  toString() {
    return `[${this.type}] ${this.message}`;
  }

  /**
   * Retorna detalhes completos do erro
   * @returns {Object}
   */
  getDetails() {
    return {
      type: this.type,
      message: this.message,
      timestamp: this.timestamp,
      stack: this.stack,
      originalError: this.originalError
        ? {
            message: this.originalError.message,
            stack: this.originalError.stack,
          }
        : null,
    };
  }
}

// Tipos específicos de erro
class FileError extends JobAnalyzerError {
  constructor(message, originalError = null) {
    super(message, "FileError", originalError);
  }
}

class DataError extends JobAnalyzerError {
  constructor(message, originalError = null) {
    super(message, "DataError", originalError);
  }
}

class ValidationError extends JobAnalyzerError {
  constructor(message, originalError = null) {
    super(message, "ValidationError", originalError);
  }
}

class ProcessingError extends JobAnalyzerError {
  constructor(message, originalError = null) {
    super(message, "ProcessingError", originalError);
  }
}

class ExportError extends JobAnalyzerError {
  constructor(message, originalError = null) {
    super(message, "ExportError", originalError);
  }
}

// Exporta as classes de erro para uso global
window.JobAnalyzerError = JobAnalyzerError;
window.FileError = FileError;
window.DataError = DataError;
window.ValidationError = ValidationError;
window.ProcessingError = ProcessingError;
window.ExportError = ExportError;
