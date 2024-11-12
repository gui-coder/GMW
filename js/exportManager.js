/**
 * Classe responsável pelo gerenciamento de exportações
 */
class ExportManager {
  /**
   * @param {Array} data - Dados para exportação
   */
  constructor(data) {
    this.data = data;
    this.exportConfig = {
      xlsx: {
        sheetNames: ["Dados Brutos", "Estatísticas", "Análise de Overdue"],
        fileName: "analise_jobs.xlsx",
      },
      pdf: {
        orientation: "landscape",
        unit: "mm",
        format: "a4",
        fileName: "analise_jobs.pdf",
      },
    };
  }

  /**
   * Exporta dados para XLSX
   * @returns {Promise<boolean>} Sucesso da exportação
   */
  async exportToXLSX() {
    try {
      const wb = XLSX.utils.book_new();

      // Dados brutos
      const wsData = XLSX.utils.json_to_sheet(this.prepareRawData());
      XLSX.utils.book_append_sheet(
        wb,
        wsData,
        this.exportConfig.xlsx.sheetNames[0]
      );

      // Estatísticas
      const wsStats = XLSX.utils.json_to_sheet(this.prepareStatisticsData());
      XLSX.utils.book_append_sheet(
        wb,
        wsStats,
        this.exportConfig.xlsx.sheetNames[1]
      );

      // Análise de Overdue
      const wsOverdue = XLSX.utils.json_to_sheet(this.prepareOverdueData());
      XLSX.utils.book_append_sheet(
        wb,
        wsOverdue,
        this.exportConfig.xlsx.sheetNames[2]
      );

      // Adiciona estilos e formatação
      this.applyXLSXStyles(wb);

      XLSX.writeFile(wb, this.exportConfig.xlsx.fileName);
      return true;
    } catch (error) {
      throw new ExportError("Erro na exportação XLSX", error);
    }
  }

  /**
   * Exporta gráficos para PDF
   * @param {Array<HTMLElement>} charts - Elementos dos gráficos
   * @returns {Promise<boolean>} Sucesso da exportação
   */
  async exportToPDF(charts) {
    try {
      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF(
        this.exportConfig.pdf.orientation,
        this.exportConfig.pdf.unit,
        this.exportConfig.pdf.format
      );

      // Adiciona título
      pdf.setFontSize(16);
      pdf.text("Análise de Jobs", 15, 15);

      // Adiciona data do relatório
      pdf.setFontSize(10);
      pdf.text(`Gerado em: ${new Date().toLocaleString()}`, 15, 22);

      // Adiciona gráficos
      let currentY = 30;
      for (let i = 0; i < charts.length; i++) {
        if (i > 0) {
          pdf.addPage();
          currentY = 30;
        }

        const imgData = await this.chartToImage(charts[i]);
        pdf.addImage(imgData, "PNG", 15, currentY, 267, 150);
      }

      // Adiciona tabelas de estatísticas
      this.addStatisticsToPDF(pdf);

      pdf.save(this.exportConfig.pdf.fileName);
      return true;
    } catch (error) {
      throw new ExportError("Erro na exportação PDF", error);
    }
  }

  /**
   * Prepara dados brutos para exportação
   * @private
   */
  prepareRawData() {
    return this.data.map((row) => ({
      Job: row.jobName,
      Agente: row.agentName,
      Início: Utils.formatDate(row.startDateTime),
      Fim: Utils.formatDate(row.endDateTime),
      "Duração (min)": row.duration.toFixed(2),
    }));
  }

  /**
   * Prepara dados estatísticos para exportação
   * @private
   */
  prepareStatisticsData() {
    const stats = this.calculateStatistics();
    return Object.entries(stats).map(([job, stat]) => ({
      Job: job,
      "Média (min)": stat.mean.toFixed(2),
      "Desvio Padrão": stat.std.toFixed(2),
      "Mínimo (min)": stat.min.toFixed(2),
      "Máximo (min)": stat.max.toFixed(2),
      Execuções: stat.count,
      Agentes: stat.agents,
    }));
  }

  /**
   * Prepara dados de overdue para exportação
   * @private
   */
  prepareOverdueData() {
    const overdueAnalysis = this.calculateOverdueAnalysis();
    return Object.entries(overdueAnalysis).map(([job, data]) => ({
      Job: job,
      "Overdue (%)": data.overduePercentage.toFixed(2),
      "Quantidade Overdue": data.overdueCount,
      "Total Execuções": data.totalExecutions,
      "Duração Média": data.averageDuration.formatted,
      "Desvio Padrão": data.standardDeviation.formatted,
    }));
  }

  /**
   * Aplica estilos ao arquivo XLSX
   * @private
   */
  applyXLSXStyles(workbook) {
    // Implementar estilos se necessário
  }

  /**
   * Converte gráfico para imagem
   * @private
   */
  async chartToImage(chart) {
    return await Plotly.toImage(chart, {
      format: "png",
      width: 800,
      height: 400,
    });
  }

  /**
   * Adiciona estatísticas ao PDF
   * @private
   */
  addStatisticsToPDF(pdf) {
    pdf.addPage();

    pdf.setFontSize(14);
    pdf.text("Estatísticas Detalhadas", 15, 15);

    const stats = this.prepareStatisticsData();
    let y = 25;

    stats.forEach((row, index) => {
      if (y > 250) {
        pdf.addPage();
        y = 25;
      }

      Object.entries(row).forEach(([key, value], colIndex) => {
        pdf.setFontSize(10);
        pdf.text(`${key}: ${value}`, 15 + colIndex * 50, y);
      });

      y += 10;
    });
  }

  /**
   * Calcula estatísticas dos dados
   * @private
   */
  calculateStatistics() {
    const jobGroups = Utils.groupBy(this.data, "jobName");

    return Object.entries(jobGroups).reduce((stats, [job, jobs]) => {
      const durations = jobs.map((j) => j.duration);
      const mean = durations.reduce((a, b) => a + b, 0) / durations.length;
      const variance =
        durations.reduce((a, b) => a + Math.pow(b - mean, 2), 0) /
        durations.length;

      stats[job] = {
        mean: mean,
        std: Math.sqrt(variance),
        min: Math.min(...durations),
        max: Math.max(...durations),
        count: jobs.length,
        agents: new Set(jobs.map((j) => j.agentName)).size,
      };

      return stats;
    }, {});
  }

  /**
   * Calcula análise de overdue
   * @private
   */
  calculateOverdueAnalysis() {
    const jobGroups = Utils.groupBy(this.data, "jobName");
    const analysis = {};

    Object.entries(jobGroups).forEach(([job, jobs]) => {
      const durations = jobs.map((j) => j.duration);
      const stats = Utils.calculateStats(durations);

      const overdueThreshold =
        stats.mean + stats.std * CONFIG.ANALYSIS.OVERDUE_THRESHOLD;
      const overdueCount = jobs.filter(
        (j) => j.duration > overdueThreshold
      ).length;

      analysis[job] = {
        overdueCount,
        totalExecutions: jobs.length,
        overduePercentage: (overdueCount / jobs.length) * 100,
        averageDuration: Utils.formatDuration(stats.mean),
        standardDeviation: Utils.formatDuration(stats.std),
      };
    });

    return analysis;
  }
}

// Exporta a classe para uso global
window.ExportManager = ExportManager;
