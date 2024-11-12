/**
 * Classe principal da aplicação
 */
class JobAnalyzerApp {
  constructor() {
    this.initialized = false;
    this.components = {
      processor: null,
      chartManager: null,
      exportManager: null,
    };
  }

  /**
   * Inicializa a aplicação
   */
  async initialize() {
    try {
      window.loadingManager.startLoading("init", "Inicializando aplicação...");

      // Verifica se já está inicializado
      if (this.initialized) {
        console.warn("Aplicação já inicializada");
        return true;
      }

      // Carrega recursos necessários
      await ResourceLoader.initialize();

      // Inicializa componentes
      this.initializeComponents();

      // Configura event listeners
      this.setupEventListeners();

      this.initialized = true;
      window.loadingManager.finishLoading("init");

      console.log("Aplicação inicializada com sucesso");
      return true;
    } catch (error) {
      console.error("Erro na inicialização:", error);
      this.showError("Falha ao inicializar a aplicação: " + error.message);
      window.loadingManager.finishLoading("init");
      throw error;
    }
  }

  /**
   * Inicializa componentes da aplicação
   */
  initializeComponents() {
    // Inicializa processador de dados
    this.components.processor = new DataProcessor();

    // Inicializa gerenciador de gráficos
    this.components.chartManager = new ChartManager("charts");
  }

  /**
   * Configura event listeners
   */
  setupEventListeners() {
    // File Input
    const fileInput = document.getElementById("fileInput");
    if (fileInput) {
      fileInput.addEventListener("change", (e) => this.handleFileSelection(e));
    }

    // Process Button
    const processButton = document.getElementById("processButton");
    if (processButton) {
      processButton.addEventListener("click", () => this.processFiles());
    }

    // Export Buttons
    const exportXLSX = document.getElementById("exportXLSX");
    if (exportXLSX) {
      exportXLSX.addEventListener("click", () => this.handleExportXLSX());
    }

    const exportPDF = document.getElementById("exportPDF");
    if (exportPDF) {
      exportPDF.addEventListener("click", () => this.handleExportPDF());
    }
  }

  /**
   * Manipula seleção de arquivos
   */
  handleFileSelection(event) {
    try {
      const files = event.target.files;
      const processButton = document.getElementById("processButton");

      if (processButton) {
        processButton.disabled = files.length === 0;
      }

      this.displayFileList(files);
    } catch (error) {
      this.showError("Erro ao selecionar arquivos: " + error.message);
    }
  }

  /**
   * Exibe lista de arquivos selecionados
   */
  displayFileList(files) {
    const fileList = document.getElementById("fileList");
    if (!fileList) return;

    fileList.innerHTML = Array.from(files)
      .map(
        (file) => `
              <div class="file-item">
                  <span class="file-name">${file.name}</span>
                  <span class="file-size">(${Utils.formatFileSize(
                    file.size
                  )})</span>
              </div>
          `
      )
      .join("");
  }

  /**
   * Processa arquivos selecionados
   */
  async processFiles() {
    const loadingId = "process-files";
    window.loadingManager.startLoading(loadingId, "Processando arquivos...");

    try {
      const fileInput = document.getElementById("fileInput");
      if (!fileInput || !fileInput.files.length) {
        throw new ValidationError("Nenhum arquivo selecionado");
      }

      // Processa os arquivos
      const processedData = await this.components.processor.processFiles(
        fileInput.files
      );

      // Calcula análise de overdue
      const analysis = this.components.processor.calculateOverdueAnalysis();

      // Cria gráficos
      this.components.chartManager.createOverdueAnalysisCharts(analysis);
      this.components.chartManager.showOverdueAnalysis(analysis);

      // Inicializa gerenciador de exportação
      this.components.exportManager = new ExportManager(processedData);

      // Habilita botões de exportação
      this.enableExportButtons();

      this.showSuccess("Arquivos processados com sucesso!");
    } catch (error) {
      this.showError(error.message);
    } finally {
      window.loadingManager.finishLoading(loadingId);
    }
  }

  /**
   * Manipula exportação XLSX
   */
  async handleExportXLSX() {
    const loadingId = "export-xlsx";
    window.loadingManager.startLoading(loadingId, "Exportando XLSX...");

    try {
      if (!this.components.exportManager) {
        throw new ValidationError("Nenhum dado processado para exportar");
      }

      await this.components.exportManager.exportToXLSX();
      this.showSuccess("Arquivo XLSX exportado com sucesso!");
    } catch (error) {
      this.showError("Erro na exportação XLSX: " + error.message);
    } finally {
      window.loadingManager.finishLoading(loadingId);
    }
  }

  /**
   * Manipula exportação PDF
   */
  async handleExportPDF() {
    const loadingId = "export-pdf";
    window.loadingManager.startLoading(loadingId, "Exportando PDF...");

    try {
      if (!this.components.exportManager || !this.components.chartManager) {
        throw new ValidationError("Nenhum dado processado para exportar");
      }

      await this.components.exportManager.exportToPDF(
        this.components.chartManager.charts
      );
      this.showSuccess("Arquivo PDF exportado com sucesso!");
    } catch (error) {
      this.showError("Erro na exportação PDF: " + error.message);
    } finally {
      window.loadingManager.finishLoading(loadingId);
    }
  }

  /**
   * Habilita botões de exportação
   */
  enableExportButtons() {
    const exportXLSX = document.getElementById("exportXLSX");
    const exportPDF = document.getElementById("exportPDF");

    if (exportXLSX) exportXLSX.disabled = false;
    if (exportPDF) exportPDF.disabled = false;
  }

  /**
   * Exibe mensagem de erro
   */
  showError(message) {
    const errorContainer = document.getElementById("errorMessages");
    if (errorContainer) {
      errorContainer.innerHTML = `
              <div class="error-message">
                  <p>${message}</p>
              </div>
          `;
    }
  }

  /**
   * Exibe mensagem de sucesso
   */
  showSuccess(message) {
    const successContainer = document.getElementById("successMessages");
    if (successContainer) {
      successContainer.innerHTML = `
              <div class="success-message">
                  <p>${message}</p>
              </div>
          `;
      setTimeout(() => {
        successContainer.innerHTML = "";
      }, 5000);
    }
  }
}

// Inicialização da aplicação
document.addEventListener("DOMContentLoaded", async () => {
  try {
    window.app = new JobAnalyzerApp();
    await window.app.initialize();
  } catch (error) {
    console.error("Falha na inicialização da aplicação:", error);
    const errorMessages = document.getElementById("errorMessages");
    if (errorMessages) {
      errorMessages.innerHTML = `
              <div class="error-message">
                  <p>Falha ao inicializar a aplicação. Por favor, recarregue a página.</p>
                  <p>Erro: ${error.message}</p>
              </div>
          `;
    }
  }
});
