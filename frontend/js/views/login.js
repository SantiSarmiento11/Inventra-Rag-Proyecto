/**
 * Vista de Inicio de Sesión (Login)
 * Autenticación real contra el Backend Spring Boot y PostgreSQL.
 * Cero simulación.
 */

(function () {
  window.Views = window.Views || {};

  window.Views.Login = {
    render: function (container) {
      const icons = window.Icons;

      container.innerHTML = `
        <div class="login-wrapper">
          <div class="login-container">
            <div class="login-card">
              <!-- Cabecera de Marca con Logo Inventra -->
              <div class="login-brand-header">
                <div class="login-logo-container">
                  <img src="assets/Inventra.png" alt="Inventra Logo" class="login-brand-logo" />
                </div>
                <h1 class="login-title">Iniciar Sesión</h1>
                <p class="login-subtitle">Control de inventarios y gestión relacional empresarial</p>
              </div>

              <!-- Alerta de Error de Autenticación -->
              <div class="login-alert-box" id="login-error-alert" style="display: none;">
                <div class="login-alert-icon">${icons.get('alertCircle')}</div>
                <div class="login-alert-text" id="login-error-text">Credenciales inválidas</div>
              </div>

              <!-- Formulario de Acceso -->
              <form id="login-form" class="login-form">
                <div class="form-group">
                  <label class="form-label required" for="login-email">Correo Electrónico</label>
                  <div class="input-icon-wrap">
                    ${icons.get('user')}
                    <input
                      type="email"
                      id="login-email"
                      class="form-control with-icon"
                      name="email"
                      placeholder="usuario@empresa.com"
                      required
                      autocomplete="email"
                      value=""
                    />
                  </div>
                </div>

                <div class="form-group">
                  <div style="display: flex; justify-content: space-between; align-items: center;">
                    <label class="form-label required" for="login-password">Contraseña</label>
                    <span style="font-size: 0.7rem; color: var(--text-muted); cursor: pointer;" id="btn-forgot-password">Olvidé mi contraseña</span>
                  </div>
                  <div class="input-icon-wrap">
                    ${icons.get('lock')}
                    <input
                      type="password"
                      id="login-password"
                      class="form-control with-icon"
                      name="password"
                      placeholder="Ingresa tu contraseña"
                      required
                      autocomplete="current-password"
                      value=""
                    />
                    <button type="button" class="btn-toggle-password" id="btn-toggle-pwd" title="Mostrar u ocultar contraseña">
                      ${icons.get('eye')}
                    </button>
                  </div>
                </div>

                <div class="login-options-row">
                  <label class="toggle-label" style="font-size: 0.775rem;">
                    <input type="checkbox" id="login-remember" checked />
                    <span style="color: var(--text-secondary);">Mantener sesión iniciada</span>
                  </label>
                  <span class="badge badge-neutral" style="font-size: 0.65rem;">POST /api/auth/login</span>
                </div>

                <button type="submit" class="btn btn-primary btn-login-submit" id="btn-submit-login">
                  <span class="btn-text">Acceder a la Plataforma</span>
                  <span class="btn-spinner" style="display: none;">${icons.get('refresh')}</span>
                </button>
              </form>

              <!-- Información de Conexión Real -->
              <div class="demo-accounts-card" style="padding: 0.75rem;">
                <div class="demo-accounts-header" style="margin-bottom: 0.25rem;">
                  <span>Autenticación Real en Vivo</span>
                  <span class="badge badge-success" style="font-size: 0.62rem;">JWT</span>
                </div>
                <div style="font-size: 0.72rem; color: var(--text-muted); line-height: 1.4;">
                  Admin: <code>carlos.mendoza@empresa.com</code> | <code>password123</code>
                </div>
              </div>

              <!-- Pie de Seguridad -->
              <div class="login-footer-security">
                <div style="display: flex; align-items: center; justify-content: center; gap: 0.4rem; font-size: 0.72rem; color: var(--text-muted);">
                  ${icons.get('roles')}
                  <span>Control de Acceso Basado en Roles (RBAC) con Token Bearer</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;

      this.bindEvents(container);
    },

    bindEvents: function (container) {
      const form = container.querySelector('#login-form');
      const emailInput = container.querySelector('#login-email');
      const passwordInput = container.querySelector('#login-password');
      const submitBtn = container.querySelector('#btn-submit-login');
      const btnText = submitBtn.querySelector('.btn-text');
      const btnSpinner = submitBtn.querySelector('.btn-spinner');
      const errorBox = container.querySelector('#login-error-alert');
      const errorText = container.querySelector('#login-error-text');
      const togglePwdBtn = container.querySelector('#btn-toggle-pwd');

      // Toggle visibilidad de contraseña
      if (togglePwdBtn) {
        togglePwdBtn.addEventListener('click', () => {
          const isPassword = passwordInput.getAttribute('type') === 'password';
          passwordInput.setAttribute('type', isPassword ? 'text' : 'password');
          togglePwdBtn.style.color = isPassword ? 'var(--primary)' : 'var(--text-muted)';
        });
      }

      // Olvido de contraseña
      const btnForgot = container.querySelector('#btn-forgot-password');
      if (btnForgot) {
        btnForgot.addEventListener('click', () => {
          window.App.showToast('Contacte a un Administrador para reestablecer credenciales en la base de datos.', 'info');
        });
      }

      // Submit del formulario
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        errorBox.style.display = 'none';

        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();

        if (!email || !password) {
          errorText.textContent = 'Por favor ingresa tanto el correo como la contraseña';
          errorBox.style.display = 'flex';
          return;
        }

        // Estado de carga
        submitBtn.disabled = true;
        btnText.textContent = 'Autenticando con el backend...';
        btnSpinner.style.display = 'inline-block';

        try {
          const res = await window.ApiService.login(email, password);

          if (res.ok && res.data) {
            window.App.showToast(`Bienvenido de nuevo, ${res.data.user.nombre}`, 'success');
            window.App.onLoginSuccess(res.data.user);
          } else {
            errorText.textContent = res.error || 'No se pudo iniciar sesión. Verifica tus datos.';
            errorBox.style.display = 'flex';
            submitBtn.disabled = false;
            btnText.textContent = 'Acceder a la Plataforma';
            btnSpinner.style.display = 'none';
          }
        } catch (err) {
          errorText.textContent = err.message || 'Error de conexión con el backend de Spring Boot';
          errorBox.style.display = 'flex';
          submitBtn.disabled = false;
          btnText.textContent = 'Acceder a la Plataforma';
          btnSpinner.style.display = 'none';
        }
      });
    }
  };
})();
