/**
 * Configurações globais da aplicação
 */
const CONFIG = {
  // Configurações de colunas da planilha
  EXCEL: {
    HEADER_ROW: 9,
    DATA_START_ROW: 10,
    COLUMNS: {
      JOB_NAME: "A",
      AGENT_NAME: "E",
      START_DATETIME: "O",
      END_DATETIME: "Q",
    },
    HEADERS: {
      JOB_NAME: "Job Name",
      AGENT_NAME: "Agent Name",
      START_DATETIME: "Start Date, Time",
      END_DATETIME: "End Date, Time",
    },
  },

  // Configurações de análise
  ANALYSIS: {
    OVERDUE_THRESHOLD: 1, // Desvio padrão acima da média
    MIN_EXECUTIONS: 3, // Mínimo de execuções para análise
  },

  // Configurações de visualização
  DISPLAY: {
    DATE_FORMAT: "dd/MM/yyyy HH:mm:ss",
    CHART_HEIGHT: 500,
    CHART_MARGIN: {
      top: 50,
      right: 50,
      bottom: 100,
      left: 50,
    },
  },

  // Mensagens do sistema
  MESSAGES: {
    ERRORS: {
      FILE_READ: "Erro ao ler arquivo",
      INVALID_DATA: "Dados inválidos ou ausentes",
      MISSING_COLUMNS: "Colunas obrigatórias não encontradas",
      PROCESSING_ERROR: "Erro no processamento dos dados",
      EXPORT_ERROR: "Erro na exportação",
    },
    SUCCESS: {
      PROCESSING: "Dados processados com sucesso",
      EXPORT_XLSX: "Arquivo XLSX exportado com sucesso",
      EXPORT_PDF: "Arquivo PDF exportado com sucesso",
    },
  },
};

// Previne modificações nas configurações
Object.freeze(CONFIG);
