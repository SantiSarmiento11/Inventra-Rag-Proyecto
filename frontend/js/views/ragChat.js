/**
 * Vista de Consultas RAG & Asistente Inteligente (Integración con n8n)
 * Endpoint exclusivo del frontend (/rag/consulta) diseñado para alimentar
 * y ser consumido por workflows de n8n con modelos de IA.
 * Cero emojis.
 */

(function () {
  window.Views = window.Views || {};

  window.Views.RagChat = {
    render: async function (container) {
      const icons = window.Icons;
      const templates = window.API_CONFIG.RAG_TEMPLATES || [];
      const currentWebhookUrl = window.API_CONFIG.getN8nWebhookUrl();

      // Renderizar estructura general de la vista
      container.innerHTML = `
        <div class="rag-view-wrapper">
          <!-- Banner de Configuración del Endpoint n8n -->
          <div class="card" style="margin-bottom: 1.5rem; border-left: 4px solid var(--primary);">
            <div class="card-header" style="flex-wrap: wrap; gap: 1rem;">
              <div>
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                  <span class="badge badge-primary" style="font-family: var(--font-mono); font-size: 0.72rem;">POST /rag/consulta</span>
                  <span class="badge badge-neutral" style="font-size: 0.65rem;">Webhook n8n</span>
                </div>
                <h3 class="card-title" style="margin-top: 0.35rem;">Endpoint de Consultas RAG para n8n</h3>
                <p class="card-subtitle">
                  El frontend empaqueta la consulta en lenguaje natural junto con el contexto del inventario para ser procesado por un flujo de n8n con IA.
                </p>
              </div>

              <!-- Configuración del Webhook URL -->
              <div style="display: flex; align-items: center; gap: 0.5rem; flex: 1; min-width: 300px; justify-content: flex-end;">
                <div class="input-icon-wrap" style="flex: 1; max-width: 440px;">
                  ${icons.get('link')}
                  <input
                    type="url"
                    id="input-n8n-webhook"
                    class="form-control with-icon"
                    style="font-family: var(--font-mono); font-size: 0.75rem;"
                    value="${escapeHtml(currentWebhookUrl)}"
                    placeholder="http://localhost:5678/webhook/inventario-rag"
                  />
                </div>
                <button class="btn btn-secondary btn-sm" id="btn-save-webhook" title="Guardar URL del Webhook">
                  ${icons.get('check')}
                  <span>Guardar</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Cuadrícula Principal: Ideas de Consulta y Consola de Chat -->
          <div style="display: grid; grid-template-columns: 360px 1fr; gap: 1.5rem; align-items: start;">
            
            <!-- Columna Izquierda: Banco de Consultas Ideadas para RAG -->
            <div class="card">
              <div class="card-header">
                <div>
                  <h4 class="card-title" style="font-size: 0.9rem;">Consultas Sugeridas para RAG</h4>
                  <p class="card-subtitle" style="font-size: 0.7rem;">Casos de uso clave ideados para este inventario</p>
                </div>
              </div>
              <div style="padding: 1rem; display: flex; flex-direction: column; gap: 1.25rem;">
                ${templates.map((cat) => `
                  <div>
                    <span style="display: block; font-size: 0.7rem; font-weight: 700; text-transform: uppercase; color: var(--text-muted); margin-bottom: 0.5rem; letter-spacing: 0.04em;">
                      ${escapeHtml(cat.categoria)}
                    </span>
                    <div style="display: flex; flex-direction: column; gap: 0.4rem;">
                      ${cat.preguntas.map((q) => `
                        <button type="button" class="btn-template-query" data-query="${escapeHtml(q)}">
                          <span class="btn-template-icon">${icons.get('chevronRight')}</span>
                          <span class="btn-template-text">${escapeHtml(q)}</span>
                        </button>
                      `).join('')}
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>

            <!-- Columna Derecha: Consola Interactiva del RAG -->
            <div class="card" style="display: flex; flex-direction: column; min-height: 600px;">
              <div class="card-header" style="border-bottom: 1px solid var(--border-default);">
                <div style="display: flex; align-items: center; gap: 0.6rem;">
                  <div style="background-color: var(--primary-muted); color: var(--primary); padding: 6px; border-radius: var(--radius-sm);">
                    ${icons.get('bot')}
                  </div>
                  <div>
                    <h4 class="card-title" style="font-size: 0.95rem;">Asistente de Consultas RAG</h4>
                    <p class="card-subtitle" style="font-size: 0.72rem;">Respuestas generadas con contexto enriquecido del inventario</p>
                  </div>
                </div>

                <div style="display: flex; align-items: center; gap: 0.5rem;">
                  <button class="btn btn-ghost btn-sm" id="btn-clear-chat" title="Limpiar conversación">
                    ${icons.get('trash')}
                    <span>Limpiar</span>
                  </button>
                </div>
              </div>

              <!-- Área de Mensajes del Chat -->
              <div id="rag-chat-messages" style="flex: 1; padding: 1.25rem; overflow-y: auto; display: flex; flex-direction: column; gap: 1rem; max-height: 520px;">
                <div class="rag-system-message">
                  <div class="rag-bot-avatar">${icons.get('bot')}</div>
                  <div class="rag-message-body">
                    <p style="margin: 0 0 0.5rem 0; font-weight: 600; color: var(--text-main);">
                      Bienvenido al Asistente RAG del Inventario
                    </p>
                    <p style="margin: 0; font-size: 0.775rem; color: var(--text-secondary); line-height: 1.5;">
                      Puedes formular preguntas en lenguaje natural sobre existencias de productos, stock crítico, valorización económica, permisos de usuarios o solicitar un informe ejecutivo. Cada consulta enviará el contexto estructurado al Webhook de n8n para su procesamiento con IA.
                    </p>
                  </div>
                </div>
              </div>

              <!-- Input y Formulario de Envío de Consulta -->
              <div style="padding: 1rem; border-top: 1px solid var(--border-default); background-color: var(--bg-surface);">
                <form id="rag-query-form" style="display: flex; gap: 0.5rem; align-items: center;">
                  <div style="flex: 1; position: relative;">
                    <input
                      type="text"
                      id="rag-query-input"
                      class="form-control"
                      placeholder="Escribe tu consulta sobre el inventario (ej: ¿Cuáles productos tienen stock bajo?)"
                      required
                      autocomplete="off"
                      style="padding-right: 2.5rem;"
                    />
                  </div>
                  <button type="submit" class="btn btn-primary" id="btn-submit-rag" style="display: flex; align-items: center; gap: 0.4rem;">
                    <span class="btn-text">Consultar RAG</span>
                    <span class="btn-spinner" style="display: none;">${icons.get('refresh')}</span>
                    ${icons.get('send')}
                  </button>
                </form>

                <!-- Footer Técnico -->
                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 0.5rem; font-size: 0.68rem; color: var(--text-muted);">
                  <span>Canal: Webhook HTTP POST (n8n JSON)</span>
                  <span id="rag-status-indicator" style="font-family: var(--font-mono);">Estado: Listo</span>
                </div>
              </div>

              <!-- Inspector de Payload JSON para n8n -->
              <div id="rag-payload-inspector" style="display: none; padding: 1rem; border-top: 1px solid var(--border-default); background-color: #0b0f14;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                  <span style="font-family: var(--font-mono); font-size: 0.7rem; color: #64748b; font-weight: 600;">
                    PAYLOAD ENVIADO AL WEBHOOK DE N8N:
                  </span>
                  <button class="btn btn-ghost btn-sm" id="btn-copy-payload" style="font-size: 0.68rem; padding: 2px 6px;">
                    ${icons.get('copy')} Copiar JSON
                  </button>
                </div>
                <pre id="rag-payload-code" style="margin: 0; font-family: var(--font-mono); font-size: 0.7rem; color: #a5b4fc; max-height: 180px; overflow-y: auto; white-space: pre-wrap; word-break: break-all;"></pre>
              </div>
            </div>

          </div>
        </div>
      `;

      this.bindEvents(container);
    },

    bindEvents: function (container) {
      const webhookInput = container.querySelector('#input-n8n-webhook');
      const saveWebhookBtn = container.querySelector('#btn-save-webhook');
      const queryForm = container.querySelector('#rag-query-form');
      const queryInput = container.querySelector('#rag-query-input');
      const submitBtn = container.querySelector('#btn-submit-rag');
      const btnText = submitBtn.querySelector('.btn-text');
      const btnSpinner = submitBtn.querySelector('.btn-spinner');
      const messagesContainer = container.querySelector('#rag-chat-messages');
      const statusIndicator = container.querySelector('#rag-status-indicator');
      const clearChatBtn = container.querySelector('#btn-clear-chat');
      const payloadInspector = container.querySelector('#rag-payload-inspector');
      const payloadCode = container.querySelector('#rag-payload-code');
      const copyPayloadBtn = container.querySelector('#btn-copy-payload');

      let lastPayload = null;

      // Guardar URL del webhook de n8n
      saveWebhookBtn.addEventListener('click', () => {
        const url = webhookInput.value.trim();
        window.API_CONFIG.setN8nWebhookUrl(url);
        window.App.showToast('URL del Webhook n8n guardada correctamente', 'success');
      });

      // Copiar JSON del payload
      if (copyPayloadBtn) {
        copyPayloadBtn.addEventListener('click', () => {
          if (lastPayload) {
            navigator.clipboard.writeText(JSON.stringify(lastPayload, null, 2));
            window.App.showToast('Payload JSON copiado al portapapeles', 'info');
          }
        });
      }

      // Limpiar chat
      clearChatBtn.addEventListener('click', () => {
        messagesContainer.innerHTML = `
          <div class="rag-system-message">
            <div class="rag-bot-avatar">${window.Icons.get('bot')}</div>
            <div class="rag-message-body">
              <p style="margin: 0; font-size: 0.775rem; color: var(--text-secondary);">
                Conversación reiniciada. Puedes formular una nueva consulta o seleccionar una de las sugerencias.
              </p>
            </div>
          </div>
        `;
        payloadInspector.style.display = 'none';
      });

      // Clic en consultas sugeridas
      container.querySelectorAll('.btn-template-query').forEach((btn) => {
        btn.addEventListener('click', () => {
          const q = btn.getAttribute('data-query');
          queryInput.value = q;
          queryInput.focus();
          // Ejecutar automáticamente la consulta seleccionada
          this.ejecutarConsulta(q, container);
        });
      });

      // Envío del formulario
      queryForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const pregunta = queryInput.value.trim();
        if (!pregunta) return;
        this.ejecutarConsulta(pregunta, container);
      });
    },

    ejecutarConsulta: async function (pregunta, container) {
      const queryInput = container.querySelector('#rag-query-input');
      const submitBtn = container.querySelector('#btn-submit-rag');
      const btnText = submitBtn.querySelector('.btn-text');
      const btnSpinner = submitBtn.querySelector('.btn-spinner');
      const messagesContainer = container.querySelector('#rag-chat-messages');
      const statusIndicator = container.querySelector('#rag-status-indicator');
      const payloadInspector = container.querySelector('#rag-payload-inspector');
      const payloadCode = container.querySelector('#rag-payload-code');

      // 1. Agregar mensaje del usuario a la pantalla
      const userMsgHtml = `
        <div class="rag-user-message">
          <div class="rag-message-body user-bubble">
            <p style="margin: 0; font-size: 0.8rem; font-weight: 500;">${escapeHtml(pregunta)}</p>
          </div>
        </div>
      `;
      messagesContainer.insertAdjacentHTML('beforeend', userMsgHtml);

      // Burbuja temporal de espera
      const loadingId = 'rag-loading-' + Date.now();
      const loadingMsgHtml = `
        <div class="rag-system-message" id="${loadingId}">
          <div class="rag-bot-avatar">${window.Icons.get('refresh')}</div>
          <div class="rag-message-body bot-bubble" style="opacity: 0.85;">
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <span class="btn-spinner" style="display: inline-block;">${window.Icons.get('refresh')}</span>
              <span style="font-size: 0.775rem; color: var(--text-secondary);">
                Esperando respuesta del flujo en n8n (límite: 20 segundos)...
              </span>
            </div>
          </div>
        </div>
      `;
      messagesContainer.insertAdjacentHTML('beforeend', loadingMsgHtml);
      messagesContainer.scrollTop = messagesContainer.scrollHeight;

      // Estado de carga
      submitBtn.disabled = true;
      btnText.textContent = 'Esperando n8n (20s)...';
      btnSpinner.style.display = 'inline-block';
      statusIndicator.textContent = 'Esperando n8n (límite 20s)...';

      queryInput.value = '';

      try {
        // 2. Invocar el endpoint RAG real en n8n
        const resultado = await window.ApiService.consultarRag(pregunta);

        // Remover burbuja de carga
        const loadingEl = document.getElementById(loadingId);
        if (loadingEl) loadingEl.remove();

        // Guardar y mostrar el payload en el inspector
        if (resultado.payloadEnviado) {
          payloadCode.textContent = JSON.stringify(resultado.payloadEnviado, null, 2);
          payloadInspector.style.display = 'block';
        }

        // Formatear markdown básico a HTML
        const respuestaHtml = formatMarkdownToHtml(resultado.respuesta);

        // 3. Agregar respuesta real del bot a la pantalla
        const botMsgHtml = `
          <div class="rag-system-message">
            <div class="rag-bot-avatar">${window.Icons.get('sparkles')}</div>
            <div class="rag-message-body bot-bubble">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; font-size: 0.68rem; color: var(--text-muted);">
                <span>Fuente: ${escapeHtml(resultado.fuente)}</span>
                <span class="badge badge-success">${resultado.duracion}</span>
              </div>
              <div class="rag-response-content" style="font-size: 0.775rem; line-height: 1.55; color: var(--text-main);">
                ${respuestaHtml}
              </div>
            </div>
          </div>
        `;
        messagesContainer.insertAdjacentHTML('beforeend', botMsgHtml);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        statusIndicator.textContent = `Respondido en ${resultado.duracion}`;
      } catch (err) {
        // Remover burbuja de carga
        const loadingEl = document.getElementById(loadingId);
        if (loadingEl) loadingEl.remove();

        const errorMsgHtml = `
          <div class="rag-system-message">
            <div class="rag-bot-avatar" style="color: var(--danger); border-color: var(--danger);">${window.Icons.get('alertCircle')}</div>
            <div class="rag-message-body bot-bubble" style="border-left: 3px solid var(--danger); background-color: rgba(239, 68, 68, 0.05);">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.35rem;">
                <span style="font-weight: 700; color: var(--danger); font-size: 0.75rem;">Error de Conexión</span>
                <span class="badge badge-danger">Timeout / Falla</span>
              </div>
              <p style="margin: 0; color: var(--text-secondary); font-size: 0.75rem; line-height: 1.45;">
                ${escapeHtml(err.message)}
              </p>
            </div>
          </div>
        `;
        messagesContainer.insertAdjacentHTML('beforeend', errorMsgHtml);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        statusIndicator.textContent = 'Fallo de conexión';
      } finally {
        submitBtn.disabled = false;
        btnText.textContent = 'Consultar RAG';
        btnSpinner.style.display = 'none';
      }
    }
  };

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function formatMarkdownToHtml(text) {
    if (!text) return '';
    let html = escapeHtml(text);

    // Encabezados ###
    html = html.replace(/^### (.*$)/gim, '<h5 style="margin: 0.5rem 0 0.25rem 0; font-weight: 700; color: var(--text-main); font-size: 0.85rem;">$1</h5>');
    html = html.replace(/^## (.*$)/gim, '<h4 style="margin: 0.5rem 0 0.25rem 0; font-weight: 700; color: var(--text-main); font-size: 0.9rem;">$1</h4>');

    // Negritas **texto**
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong style="color: var(--text-main);">$1</strong>');

    // Código `texto`
    html = html.replace(/`(.*?)`/g, '<code style="background: rgba(255,255,255,0.06); padding: 1px 4px; border-radius: 4px; font-family: var(--font-mono); font-size: 0.72rem;">$1</code>');

    // Listas con viñetas
    html = html.replace(/^\- (.*$)/gim, '<li style="margin-left: 1rem; margin-bottom: 0.25rem;">$1</li>');

    // Saltos de línea
    html = html.replace(/\n\n/g, '<div style="margin-bottom: 0.5rem;"></div>');
    html = html.replace(/\n/g, '<br />');

    return html;
  }
})();
