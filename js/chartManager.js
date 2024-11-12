/**
 * Classe responsável pelo gerenciamento de gráficos
 */
class ChartManager {
  constructor(containerId) {
      this.container = document.getElementById(containerId);
      if (!this.container) {
          throw new JobAnalyzerError('Container de gráficos não encontrado', 'ContainerError');
      }
      this.charts = [];
      this.chartConfig = {
          height: CONFIG.DISPLAY.CHART_HEIGHT,
          margin: CONFIG.DISPLAY.CHART_MARGIN
      };
  }

  /**
   * Limpa todos os gráficos
   */
  clearCharts() {
      Utils.cleanupDOM(this.container);
      this.charts = [];
  }

  /**
   * Cria container para um novo gráfico
   * @returns {HTMLElement} Container do gráfico
   */
  createChartContainer() {
      const div = document.createElement('div');
      div.className = 'chart-container';
      div.style.height = `${this.chartConfig.height}px`;
      this.container.appendChild(div);
      return div;
  }

  /**
   * Cria todos os gráficos
   * @param {Array} data - Dados para os gráficos
   */
  createCharts(data) {
      this.clearCharts();
      this.createBoxPlot(data);
      this.createTimeSeries(data);
      this.createDurationDistribution(data);
      this.createAgentPerformance(data);
  }

  /**
   * Cria gráficos de análise de overdue
   * @param {Object} analysis - Dados de análise
   */
  createOverdueAnalysisCharts(analysis) {
      this.clearCharts();
      this.createOverdueFrequencyChart(analysis.overdueJobs);
      this.createAverageDurationChart(analysis.jobDurations);
      this.createDurationVariationChart(analysis.durationVariation);
  }

  /**
   * Cria gráfico de box plot
   * @param {Array} data - Dados para o gráfico
   */
  createBoxPlot(data) {
      const container = this.createChartContainer();
      const jobNames = [...new Set(data.map(d => d.jobName))];
      
      const traces = jobNames.map(job => ({
          y: data.filter(d => d.jobName === job).map(d => d.duration),
          type: 'box',
          name: job,
          boxpoints: 'outliers',
          boxmean: true
      }));

      const layout = {
          title: 'Distribuição de Durações por Job',
          yaxis: { 
              title: 'Duração (minutos)',
              autorange: true
          },
          xaxis: {
              title: 'Job Name',
              tickangle: -45
          },
          showlegend: true,
          height: this.chartConfig.height,
          margin: this.chartConfig.margin
      };

      Plotly.newPlot(container, traces, layout);
      this.charts.push(container);
  }

  /**
   * Cria gráfico de série temporal
   * @param {Array} data - Dados para o gráfico
   */
  createTimeSeries(data) {
      const container = this.createChartContainer();
      const jobNames = [...new Set(data.map(d => d.jobName))];

      const traces = jobNames.map(job => {
          const jobData = data.filter(d => d.jobName === job);
          return {
              x: jobData.map(d => d.startDateTime),
              y: jobData.map(d => d.duration),
              type: 'scatter',
              mode: 'lines+markers',
              name: job,
              hovertemplate: 
                  '<b>%{text}</b><br>' +
                  'Data: %{x}<br>' +
                  'Duração: %{y:.1f} min<br>',
              text: jobData.map(d => d.jobName)
          };
      });

      const layout = {
          title: 'Duração ao Longo do Tempo',
          xaxis: { 
              title: 'Data/Hora de Início',
              tickangle: -45
          },
          yaxis: { 
              title: 'Duração (minutos)',
              autorange: true
          },
          height: this.chartConfig.height,
          margin: this.chartConfig.margin,
          hovermode: 'closest'
      };

      Plotly.newPlot(container, traces, layout);
      this.charts.push(container);
  }

  /**
   * Cria gráfico de distribuição de durações
   * @param {Array} data - Dados para o gráfico
   */
  createDurationDistribution(data) {
      const container = this.createChartContainer();
      const jobNames = [...new Set(data.map(d => d.jobName))];

      const traces = jobNames.map(job => ({
          x: data.filter(d => d.jobName === job).map(d => d.duration),
          type: 'histogram',
          name: job,
          opacity: 0.7,
          nbinsx: 30,
          histnorm: 'probability'
      }));

      const layout = {
          title: 'Distribuição de Durações',
          xaxis: { 
              title: 'Duração (minutos)',
              tickangle: -45
          },
          yaxis: { 
              title: 'Frequência Relativa',
              tickformat: ',.1%'
          },
          barmode: 'overlay',
          height: this.chartConfig.height,
          margin: this.chartConfig.margin
      };

      Plotly.newPlot(container, traces, layout);
      this.charts.push(container);
  }

  /**
   * Cria gráfico de frequência de overdue
   * @param {Object} overdueData - Dados de overdue
   */
  createOverdueFrequencyChart(overdueData) {
      const container = this.createChartContainer();
      
      const sortedData = Object.entries(overdueData)
          .sort(([,a], [,b]) => b.overduePercentage - a.overduePercentage);

      const trace = {
          x: sortedData.map(([job]) => job),
          y: sortedData.map(([,data]) => data.overduePercentage),
          type: 'bar',
          text: sortedData.map(([,data]) => 
              `${data.overdueCount} de ${data.totalExecutions} execuções`
          ),
          textposition: 'auto',
          marker: {
              color: sortedData.map(([,data]) => 
                  data.overduePercentage > 50 ? '#e74c3c' : '#3498db'
              )
          }
      };

      const layout = {
          title: 'Jobs com Maior Frequência de Overdue',
          yaxis: {
              title: 'Percentual de Overdue (%)',
              range: [0, 100]
          },
          xaxis: {
              title: 'Job Name',
              tickangle: -45
          },
          height: this.chartConfig.height,
          margin: this.chartConfig.margin
      };

      Plotly.newPlot(container, [trace], layout);
      this.charts.push(container);
  }

  // Continua...