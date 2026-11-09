/**
 * Orquestador Principal de la Aplicación
 * Enrutamiento SPA, control de vistas y autenticación obligatoria contra Backend Spring Boot.
 * Cero simulación ni datos mockeados.
 */

(function () {
  window.App = {
    currentRoute: 'dashboard',

    init: async function () {
      const token = window.API_CONFIG.getToken();
      const currentHash = window.location.hash.replace('#', '');

      // Exigir autenticación real con token JWT para acceder a la aplicación
      if (!token && currentHash !== 'mer') {
        window.location.replace('login.html');
        return;
      }

      if (token) {
        try {
          // Validar el token en vivo contra el backend (/api/auth/me)
          const user = await window.ApiService.getMe();
          if (!user || !user.id_usuario) {
            window.API_CONFIG.clearSession();
            window.location.replace('login.html');
            return;
          }
        } catch (e) {
          console.warn('Sesión no autorizada o expirada:', e);
          window.API_CONFIG.clearSession();
          window.location.replace('login.html');
          return;
        }
      }

      this.bindNavigation();
      this.bindGlobalActions();
      this.updateUserSessionUI();
      this.handleHashChange();
      window.addEventListener('hashchange', () => this.handleHashChange());
    },

    bindNavigation: function () {
      document.querySelectorAll('.nav-link').forEach((link) => {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          const targetRoute = link.getAttribute('data-route');
          window.location.hash = `#${targetRoute}`;
        });
      });
    },

    bindGlobalActions: function () {
      // Botón global de cerrar sesión
      document.addEventListener('click', async (e) => {
        const logoutBtn = e.target.closest('#btn-user-logout');
        if (logoutBtn) {
          e.preventDefault();
          await window.ApiService.logout();
          this.showToast('Sesión finalizada. Redirigiendo...', 'info');
          setTimeout(() => {
            window.location.replace('login.html');
          }, 300);
        }
      });
    },

    updateUserSessionUI: function () {
      const user = window.API_CONFIG.getCurrentUser();
      const userProfileContainer = document.getElementById('header-user-profile');
      const sidebarFooterContainer = document.getElementById('sidebar-user-footer');

      if (user) {
        const initials = (user.nombre || 'U')
          .split(' ')
          .map((n) => n[0])
          .slice(0, 2)
          .join('')
          .toUpperCase();

        let roleName = 'USUARIO';
        if (user.roles && user.roles.length > 0) {
          roleName = typeof user.roles[0] === 'string' ? user.roles[0] : (user.roles[0].nombre || 'USUARIO');
        }

        if (userProfileContainer) {
          userProfileContainer.innerHTML = `
            <div style="display: flex; align-items: center; gap: 0.65rem; padding-left: 0.75rem; border-left: 1px solid var(--border-default);">
              <div class="user-avatar" style="width: 30px; height: 30px; font-size: 0.7rem; font-weight: 700;">${initials}</div>
              <div style="display: flex; flex-direction: column; line-height: 1.2;">
                <span style="font-weight: 600; font-size: 0.775rem; color: var(--text-main);">${escapeHtml(user.nombre)}</span>
                <span style="font-size: 0.65rem; color: var(--text-muted);">${escapeHtml(roleName)}</span>
              </div>
              <button class="btn btn-ghost btn-sm btn-icon-only" id="btn-user-logout" title="Cerrar sesión y salir" style="color: var(--danger); margin-left: 0.25rem;">
                ${window.Icons.get('logout')}
              </button>
            </div>
          `;
        }

        if (sidebarFooterContainer) {
          sidebarFooterContainer.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: space-between; width: 100%;">
              <div style="display: flex; align-items: center; gap: 0.5rem;">
                <span class="status-dot"></span>
                <span style="font-size: 0.75rem; color: var(--text-sidebar-muted);">Sesión: ${escapeHtml((user.nombre || '').split(' ')[0])}</span>
              </div>
              <a href="login.html" title="Cambiar de usuario" style="color: var(--text-sidebar-muted); font-size: 0.7rem; text-decoration: none;">Salir</a>
            </div>
          `;
        }
      } else {
        if (userProfileContainer) {
          userProfileContainer.innerHTML = `
            <a href="login.html" class="btn btn-primary btn-sm">
              ${window.Icons.get('lock')}
              <span>Iniciar Sesión</span>
            </a>
          `;
        }

        if (sidebarFooterContainer) {
          sidebarFooterContainer.innerHTML = `
            <div class="system-status">
              <span class="status-dot" style="background-color: var(--warning);"></span>
              <a href="login.html" style="color: var(--text-sidebar-muted); text-decoration: none;">Iniciar Sesión</a>
            </div>
          `;
        }
      }
    },

    handleHashChange: function () {
      const token = window.API_CONFIG.getToken();
      let hash = window.location.hash.replace('#', '') || 'dashboard';

      if (!token && hash !== 'mer') {
        window.location.replace('login.html');
        return;
      }

      this.navigateTo(hash);
    },

    navigateTo: function (routeName) {
      const validRoutes = ['dashboard', 'products', 'users', 'roles', 'rag', 'mer'];
      const route = validRoutes.includes(routeName) ? routeName : 'dashboard';
      this.currentRoute = route;

      // Actualizar sidebar links activos
      document.querySelectorAll('.nav-link').forEach((link) => {
        const linkRoute = link.getAttribute('data-route');
        if (linkRoute === route) {
          link.classList.add('active');
        } else {
          link.classList.remove('active');
        }
      });

      // Actualizar encabezado superior
      const pageTitleEl = document.getElementById('current-page-title');
      const pageSubtitleEl = document.getElementById('current-page-subtitle');

      const routeMeta = {
        dashboard: {
          title: 'Panel de Control - Inventra',
          subtitle: 'Visión general de existencias, usuarios y estado del sistema (PostgreSQL)'
        },
        products: {
          title: 'Catálogo de Productos',
          subtitle: 'Gestión y control de existencias de la tabla productos en tiempo real'
        },
        users: {
          title: 'Directorio de Usuarios',
          subtitle: 'Administración de accesos y asignación en usuarios_roles'
        },
        roles: {
          title: 'Roles y Control de Acceso (RBAC)',
          subtitle: 'Gestión de roles y asignación matricial en roles_permisos'
        },
        rag: {
          title: 'Consultas RAG de Inventario (n8n)',
          subtitle: 'Endpoint frontend para procesamiento con n8n y modelos de lenguaje'
        },
        mer: {
          title: 'Modelo Entidad-Relación y API Endpoints',
          subtitle: 'Especificación de base de datos y consola de pruebas REST'
        }
      };

      if (pageTitleEl && routeMeta[route]) {
        pageTitleEl.textContent = routeMeta[route].title;
      }
      if (pageSubtitleEl && routeMeta[route]) {
        pageSubtitleEl.textContent = routeMeta[route].subtitle;
      }

      // Renderizar vista con desvanecido
      const container = document.getElementById('main-view-container');
      if (!container) return;

      container.style.opacity = '0';
      container.style.transform = 'translateY(4px)';

      setTimeout(async () => {
        try {
          if (route === 'dashboard' && window.Views.Dashboard) {
            await window.Views.Dashboard.render(container);
          } else if (route === 'products' && window.Views.Products) {
            await window.Views.Products.render(container);
          } else if (route === 'users' && window.Views.Users) {
            await window.Views.Users.render(container);
          } else if (route === 'roles' && window.Views.Roles) {
            await window.Views.Roles.render(container);
          } else if (route === 'rag' && window.Views.RagChat) {
            await window.Views.RagChat.render(container);
          } else if (route === 'mer' && window.Views.ApiDocs) {
            await window.Views.ApiDocs.render(container);
          }
        } catch (err) {
          console.error(`Error renderizando vista ${route}:`, err);
        }

        container.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
        container.style.opacity = '1';
        container.style.transform = 'translateY(0)';
      }, 100);
    },

    showToast: function (message, type = 'info') {
      const container = document.getElementById('toast-container');
      if (!container) return;

      const toast = document.createElement('div');
      toast.className = `toast toast-${type}`;

      let iconName = 'info';
      if (type === 'success') iconName = 'check';
      if (type === 'error') iconName = 'alertCircle';

      toast.innerHTML = `
        <div style="color: ${type === 'success' ? 'var(--success)' : type === 'error' ? 'var(--danger)' : 'var(--primary)'};">
          ${window.Icons.get(iconName)}
        </div>
        <div class="toast-text">${escapeHtml(message)}</div>
      `;

      container.appendChild(toast);

      setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(8px)';
        setTimeout(() => toast.remove(), 250);
      }, 3200);
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

  // Inicializar al cargar el DOM
  document.addEventListener('DOMContentLoaded', () => {
    window.App.init();
  });
})();
