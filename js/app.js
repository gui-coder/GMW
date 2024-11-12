// Inicialização da aplicação
async function initializeApplication() {
  try {
    await ScriptLoader.loadScripts();
    const app = new JobAnalyzer();
    return app;
  } catch (error) {
    console.error("Erro na inicialização:", error);
    throw error;
  }
}

// Inicializa a aplicação quando o DOM estiver carregado
document.addEventListener("DOMContentLoaded", () => {
  initializeApplication().catch((error) => {
    console.error("Falha na inicialização:", error);
    const errorMessages = document.getElementById("errorMessages");
    if (errorMessages) {
      errorMessages.innerHTML = `
                <div class="error-message">
                    <p>Falha ao inicializar a aplicação. Por favor, recarregue a página.</p>
                    <p>Erro: ${error.message}</p>
                </div>
            `;
    }
  });
});
