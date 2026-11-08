/**
 * Orquestador Principal de la Aplicación
 * Enrutamiento SPA, control de vistas, autenticación de usuarios y notificaciones Toast.
 * Integra la identidad de marca Inventra analizada en /assets/Inventra.png.
 * Cero emojis.
 */

(function () {
  window.App = {
    currentRoute: 'dashboard',

    init: function () {
      // Verificación de autenticación: si no hay sesión activa, redirigir a la página de login separada
      const user = window.API_CONFIG.getCurrentUser();
      const currentHash = window.location.hash.replace('#', '');

      if (!user && currentHash !== 'mer') {
        window.location.replace('login.html');
        return;
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
          }, 400);
        }
      });
    },

    updateUserSessionUI: function () {
      const user = window.API_CONFIG.getCurrentUser();
      const userProfileContainer = document.getElementById('header-user-profile');
      const sidebarFooterContainer = document.getElementById('sidebar-user-footer');

      if (user) {
        const initials = user.nombre
          .split(' ')
          .map((n) => n[0])
          .slice(0, 2)
          .join('')
          .toUpperCase();

        const roleName = user.roles && user.roles.length > 0
          ? user.roles[0].nombre
          : 'USUARIO';

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
                <span style="font-size: 0.75rem; color: var(--text-sidebar-muted);">Sesión: ${escapeHtml(user.nombre.split(' ')[0])}</span>
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
      const user = window.API_CONFIG.getCurrentUser();
      let hash = window.location.hash.replace('#', '') || 'dashboard';

      if (!user && hash !== 'mer') {
        window.location.replace('login.html');
        return;
      }

      this.navigateTo(hash);
    },

    navigateTo: function (routeName) {
      const validRoutes = ['dashboard', 'products', 'users', 'roles', 'mer'];
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
          subtitle: 'Visión general de existencias, usuarios y estado del sistema'
        },
        products: {
          title: 'Catálogo de Productos',
          subtitle: 'Gestión y control de existencias de la tabla productos'
        },
        users: {
          title: 'Directorio de Usuarios',
          subtitle: 'Administración de accesos y asignación en usuarios_roles'
        },
        roles: {
          title: 'Roles y Control de Acceso (RBAC)',
          subtitle: 'Gestión de roles y asignación matricial en roles_permisos'
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
        if (route === 'dashboard' && window.Views.Dashboard) {
          await window.Views.Dashboard.render(container);
        } else if (route === 'products' && window.Views.Products) {
          await window.Views.Products.render(container);
        } else if (route === 'users' && window.Views.Users) {
          await window.Views.Users.render(container);
        } else if (route === 'roles' && window.Views.Roles) {
          await window.Views.Roles.render(container);
        } else if (route === 'mer' && window.Views.ApiDocs) {
          await window.Views.ApiDocs.render(container);
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
