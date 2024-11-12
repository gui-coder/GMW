/**
 * Classe responsável pelo carregamento de recursos
 */
class ResourceLoader {
  /**
   * Carrega um script externo
   * @param {string} src - URL do script
   * @param {string} id - ID do elemento script
   * @returns {Promise} Promise que resolve quando o script é carregado
   */
  static loadScript(src, id) {
    return new Promise((resolve, reject) => {
      if (document.getElementById(id)) {
        resolve();
        return;
      }

      const script = document.createElement("script");
      script.id = id;
      script.src = src;
      script.async = true;

      script.onload = () => resolve();
      script.onerror = () =>
        reject(new Error(`Falha ao carregar script: ${src}`));

      document.head.appendChild(script);
    });
  }

  /**
   * Carrega uma folha de estilo
   * @param {string} href - URL do CSS
   * @param {string} id - ID do elemento link
   * @returns {Promise} Promise que resolve quando o CSS é carregado
   */
  static loadStylesheet(href, id) {
    return new Promise((resolve, reject) => {
      if (document.getElementById(id)) {
        resolve();
        return;
      }

      const link = document.createElement("link");
      link.id = id;
      link.rel = "stylesheet";
      link.href = href;

      link.onload = () => resolve();
      link.onerror = () => reject(new Error(`Falha ao carregar CSS: ${href}`));

      document.head.appendChild(link);
    });
  }

  /**
   * Verifica se todos os recursos necessários estão carregados
   * @returns {boolean} True se todos os recursos estão disponíveis
   */
  static checkDependencies() {
    const requiredGlobals = ["XLSX", "Plotly", "jspdf"];
    return requiredGlobals.every((dep) => window[dep] !== undefined);
  }

  /**
   * Inicializa o carregamento de todos os recursos necessários
   * @returns {Promise} Promise que resolve quando todos os recursos estão carregados
   */
  static async initialize() {
    try {
      const loadingTasks = [
        // Scripts externos
        this.loadScript(
          "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.17.0/xlsx.full.min.js",
          "xlsx-script"
        ),
        this.loadScript(
          "https://cdn.plot.ly/plotly-latest.min.js",
          "plotly-script"
        ),
        this.loadScript(
          "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.4.0/jspdf.umd.min.js",
          "jspdf-script"
        ),
      ];

      await Promise.all(loadingTasks);

      if (!this.checkDependencies()) {
        throw new Error(
          "Nem todas as dependências foram carregadas corretamente"
        );
      }

      return true;
    } catch (error) {
      throw new JobAnalyzerError(
        "Falha ao carregar recursos necessários",
        "ResourceLoadError",
        error
      );
    }
  }
}

/**
 * Classe para gerenciar estados de carregamento
 */
class LoadingManager {
  constructor() {
    this.overlay = document.getElementById("loadingOverlay");
    this.loadingStates = new Map();
  }

  /**
   * Mostra o overlay de carregamento
   * @param {string} [message] - Mensagem opcional de carregamento
   */
  show(message = "Carregando...") {
    if (this.overlay) {
      const messageElement =
        this.overlay.querySelector(".loading-message") ||
        this.createMessageElement();
      messageElement.textContent = message;
      this.overlay.classList.remove("hidden");
    }
  }

  /**
   * Esconde o overlay de carregamento
   */
  hide() {
    if (this.overlay) {
      this.overlay.classList.add("hidden");
    }
  }

  /**
   * Cria elemento para mensagem de carregamento
   * @private
   * @returns {HTMLElement} Elemento criado
   */
  createMessageElement() {
    const messageElement = document.createElement("div");
    messageElement.className = "loading-message";
    this.overlay.appendChild(messageElement);
    return messageElement;
  }

  /**
   * Inicia um novo estado de carregamento
   * @param {string} id - Identificador do estado
   * @param {string} message - Mensagem de carregamento
   */
  startLoading(id, message) {
    this.loadingStates.set(id, message);
    if (this.loadingStates.size === 1) {
      this.show(message);
    }
  }

  /**
   * Finaliza um estado de carregamento
   * @param {string} id - Identificador do estado
   */
  finishLoading(id) {
    this.loadingStates.delete(id);
    if (this.loadingStates.size === 0) {
      this.hide();
    } else {
      const lastMessage = Array.from(this.loadingStates.values()).pop();
      this.show(lastMessage);
    }
  }
}

// Exporta as classes para uso global
window.ResourceLoader = ResourceLoader;
window.LoadingManager = LoadingManager;

// Cria instância global do LoadingManager
window.loadingManager = new LoadingManager();
