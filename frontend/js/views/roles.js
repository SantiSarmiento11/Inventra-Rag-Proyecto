/**
 * Vista de Roles y Permisos (Control de Acceso Basado en Roles - RBAC)
 * Basado estrictamente en las tablas:
 * CREATE TABLE roles (
 *     id_rol BIGINT PRIMARY KEY AUTO_INCREMENT,
 *     nombre VARCHAR(50) NOT NULL UNIQUE,
 *     descripcion VARCHAR(255)
 * );
 * CREATE TABLE permisos (
 *     id_permiso BIGINT PRIMARY KEY AUTO_INCREMENT,
 *     nombre VARCHAR(100) NOT NULL UNIQUE,
 *     descripcion VARCHAR(255)
 * );
 * CREATE TABLE roles_permisos (
 *     id_rol BIGINT NOT NULL,
 *     id_permiso BIGINT NOT NULL,
 *     PRIMARY KEY (id_rol, id_permiso)
 * );
 * Cero emojis.
 */

(function () {
  window.Views = window.Views || {};

  let currentTab = 'matrix'; // 'matrix' | 'roles' | 'permissions'

  window.Views.Roles = {
    render: async function (container) {
      const icons = window.Icons;
      const roles = await window.ApiService.getRoles();
      const permisos = await window.ApiService.getPermisos();

      let tabContentHtml = '';

      if (currentTab === 'matrix') {
        tabContentHtml = this.renderMatrixTab(roles, permisos, icons);
      } else if (currentTab === 'roles') {
        tabContentHtml = this.renderRolesTab(roles, permisos, icons);
      } else {
        tabContentHtml = this.renderPermissionsTab(permisos, icons);
      }

      container.innerHTML = `
        <div class="rbac-tabs">
          <button class="tab-btn ${currentTab === 'matrix' ? 'active' : ''}" data-tab="matrix">
            ${icons.get('layers')}
            <span>Matriz de Permisos (roles_permisos)</span>
          </button>
          <button class="tab-btn ${currentTab === 'roles' ? 'active' : ''}" data-tab="roles">
            ${icons.get('roles')}
            <span>Roles (${roles.length})</span>
          </button>
          <button class="tab-btn ${currentTab === 'permissions' ? 'active' : ''}" data-tab="permissions">
            ${icons.get('permissions')}
            <span>Catálogo de Permisos (${permisos.length})</span>
          </button>
        </div>

        <div id="rbac-tab-content">
          ${tabContentHtml}
        </div>
      `;

      // Eventos de tabs
      container.querySelectorAll('.tab-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
          currentTab = btn.getAttribute('data-tab');
          this.render(container);
        });
      });

      this.bindTabEvents(container, roles, permisos);
    },

    renderMatrixTab: function (roles, permisos, icons) {
      const headerCols = roles.map((r) => `
        <th style="text-align: center; min-width: 130px;">
          <div style="display: flex; flex-direction: column; align-items: center; gap: 0.2rem;">
            <span>${escapeHtml(r.nombre)}</span>
            <span style="font-size: 0.65rem; color: var(--text-muted); font-weight: normal; text-transform: none;">
              ${r.userCount || 0} usuarios
            </span>
          </div>
        </th>
      `).join('');

      const rows = permisos.map((perm) => {
        const checkCells = roles.map((r) => {
          const hasPerm = r.permisos && r.permisos.some((p) => p.id_permiso === perm.id_permiso);
          return `
            <td style="text-align: center;">
              <input type="checkbox"
                class="matrix-checkbox"
                data-role-id="${r.id_rol}"
                data-perm-id="${perm.id_permiso}"
                ${hasPerm ? 'checked' : ''}
                style="cursor: pointer; width: 16px; height: 16px; accent-color: var(--primary);" />
            </td>
          `;
        }).join('');

        return `
          <tr>
            <td>
              <div style="display: flex; flex-direction: column;">
                <span style="font-family: var(--font-mono); font-weight: 600; color: var(--text-main); font-size: 0.775rem;">
                  ${escapeHtml(perm.nombre)}
                </span>
                <span style="font-size: 0.72rem; color: var(--text-secondary);">
                  ${escapeHtml(perm.descripcion || '')}
                </span>
              </div>
            </td>
            ${checkCells}
          </tr>
        `;
      }).join('');

      return `
        <div class="card">
          <div class="card-header">
            <div>
              <h3 class="card-title">Matriz de Acceso RBAC</h3>
              <p class="card-subtitle">Asignación directa entre las tablas roles y permisos mediante roles_permisos</p>
            </div>
            <span class="badge badge-primary">Guardado Automático</span>
          </div>
          <div class="table-responsive" style="border: none;">
            <table class="data-table">
              <thead>
                <tr>
                  <th style="min-width: 240px;">Permiso del Sistema</th>
                  ${headerCols}
                </tr>
              </thead>
              <tbody>
                ${rows}
              </tbody>
            </table>
          </div>
        </div>
      `;
    },

    renderRolesTab: function (roles, permisos, icons) {
      const cardsHtml = roles.map((r) => {
        const assignedCount = r.permisos ? r.permisos.length : 0;
        return `
          <div class="role-card">
            <div class="role-card-header">
              <div>
                <span class="role-name">${escapeHtml(r.nombre)}</span>
                <p class="role-desc">${escapeHtml(r.descripcion || 'Sin descripción')}</p>
              </div>
              <div style="display: flex; gap: 0.25rem;">
                <button class="btn btn-ghost btn-sm btn-icon-only btn-edit-role" data-id="${r.id_rol}" title="Editar rol">
                  ${icons.get('edit')}
                </button>
                <button class="btn btn-ghost btn-sm btn-icon-only btn-delete-role" data-id="${r.id_rol}" title="Eliminar rol" style="color: var(--danger);">
                  ${icons.get('trash')}
                </button>
              </div>
            </div>

            <div class="role-permissions-section">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span class="role-perm-label">Permisos Habilitados</span>
                <span class="badge badge-neutral" style="font-size: 0.65rem;">${assignedCount} de ${permisos.length}</span>
              </div>
              <div style="display: flex; flex-wrap: wrap; gap: 0.35rem; margin-top: 0.25rem;">
                ${r.permisos && r.permisos.length > 0
                  ? r.permisos.map((p) => `<span class="badge badge-primary" style="font-size: 0.68rem;">${escapeHtml(p.nombre)}</span>`).join('')
                  : `<span style="font-size: 0.72rem; color: var(--text-muted);">Sin permisos asignados</span>`
                }
              </div>
            </div>
          </div>
        `;
      }).join('');

      return `
        <div class="action-bar">
          <div>
            <h3 style="font-size: 0.95rem; font-weight: 600; color: var(--text-main);">Catálogo de Roles</h3>
            <p style="font-size: 0.75rem; color: var(--text-secondary);">Define los perfiles de usuario aplicables en la plataforma</p>
          </div>
          <button class="btn btn-primary" id="btn-open-create-role">
            ${icons.get('plus')}
            <span>Nuevo Rol</span>
          </button>
        </div>

        <div class="roles-grid">
          ${cardsHtml}
        </div>
      `;
    },

    renderPermissionsTab: function (permisos, icons) {
      const rows = permisos.map((p) => `
        <tr>
          <td style="font-family: var(--font-mono); color: var(--text-muted); font-size: 0.75rem;">
            #${p.id_permiso}
          </td>
          <td style="font-family: var(--font-mono); font-weight: 600; color: var(--text-main);">
            ${escapeHtml(p.nombre)}
          </td>
          <td style="color: var(--text-secondary);">
            ${escapeHtml(p.descripcion || '')}
          </td>
          <td style="text-align: right;">
            <button class="btn btn-ghost btn-sm btn-icon-only btn-delete-permission" data-id="${p.id_permiso}" title="Eliminar permiso" style="color: var(--danger);">
              ${icons.get('trash')}
            </button>
          </td>
        </tr>
      `).join('');

      return `
        <div class="action-bar">
          <div>
            <h3 style="font-size: 0.95rem; font-weight: 600; color: var(--text-main);">Catálogo de Permisos</h3>
            <p style="font-size: 0.75rem; color: var(--text-secondary);">Operaciones atómicas que los roles pueden ejecutar</p>
          </div>
          <button class="btn btn-primary" id="btn-open-create-permission">
            ${icons.get('plus')}
            <span>Nuevo Permiso</span>
          </button>
        </div>

        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th style="width: 70px;">ID</th>
                <th style="width: 240px;">Identificador del Permiso</th>
                <th>Descripción de la Operación</th>
                <th style="width: 80px; text-align: right;">Acciones</th>
              </tr>
            </thead>
            <tbody>
              ${rows}
            </tbody>
          </table>
        </div>
      `;
    },

    bindTabEvents: function (container, roles, permisos) {
      // Toggle en Matriz
      container.querySelectorAll('.matrix-checkbox').forEach((cb) => {
        cb.addEventListener('change', async () => {
          const roleId = cb.getAttribute('data-role-id');
          const permId = cb.getAttribute('data-perm-id');
          window.Store.toggleRolPermiso(roleId, permId);
          window.App.showToast(`Relación rol #${roleId} y permiso #${permId} actualizada`, 'info');
        });
      });

      // Crear Rol
      const btnCreateRole = container.querySelector('#btn-open-create-role');
      if (btnCreateRole) {
        btnCreateRole.addEventListener('click', () => {
          this.openRoleModal(null, permisos, container);
        });
      }

      // Editar Rol
      container.querySelectorAll('.btn-edit-role').forEach((btn) => {
        btn.addEventListener('click', async () => {
          const id = btn.getAttribute('data-id');
          const rol = window.Store.getRolById(id);
          this.openRoleModal(rol, permisos, container);
        });
      });

      // Eliminar Rol
      container.querySelectorAll('.btn-delete-role').forEach((btn) => {
        btn.addEventListener('click', async () => {
          const id = btn.getAttribute('data-id');
          const confirmed = confirm(`¿Confirmas la eliminación del rol #${id}? Se desasignará de los usuarios y de la tabla roles_permisos.`);
          if (confirmed) {
            await window.ApiService.deleteRol(id);
            window.App.showToast(`Rol #${id} eliminado`, 'error');
            this.render(container);
          }
        });
      });

      // Crear Permiso
      const btnCreatePerm = container.querySelector('#btn-open-create-permission');
      if (btnCreatePerm) {
        btnCreatePerm.addEventListener('click', () => {
          this.openPermissionModal(container);
        });
      }

      // Eliminar Permiso
      container.querySelectorAll('.btn-delete-permission').forEach((btn) => {
        btn.addEventListener('click', async () => {
          const id = btn.getAttribute('data-id');
          const confirmed = confirm(`¿Confirmas la eliminación del permiso #${id}?`);
          if (confirmed) {
            await window.ApiService.deletePermiso(id);
            window.App.showToast(`Permiso #${id} eliminado`, 'error');
            this.render(container);
          }
        });
      });
    },

    openRoleModal: function (rol, allPermisos, mainContainer) {
      const isEdit = Boolean(rol);
      const title = isEdit ? `Editar Rol: ${rol.nombre}` : 'Registrar Nuevo Rol';

      const rolPermIds = rol && rol.permisos ? rol.permisos.map((p) => p.id_permiso) : [];

      const permCheckboxes = allPermisos.map((p) => `
        <label class="perm-checkbox-item">
          <input type="checkbox" name="permisoIds" value="${p.id_permiso}" ${rolPermIds.includes(p.id_permiso) ? 'checked' : ''} />
          <div>
            <span style="font-family: var(--font-mono); font-weight: 600; color: var(--text-main);">${escapeHtml(p.nombre)}</span>
            <span style="display: block; font-size: 0.7rem; color: var(--text-muted);">${escapeHtml(p.descripcion || '')}</span>
          </div>
        </label>
      `).join('');

      const modalHtml = `
        <div class="modal-backdrop open" id="role-modal">
          <div class="modal-window">
            <div class="modal-header">
              <h3 class="modal-title">${title}</h3>
              <button class="btn btn-ghost btn-sm btn-icon-only modal-close-btn">
                ${window.Icons.get('close')}
              </button>
            </div>
            <form id="role-form">
              <div class="modal-body">
                <div class="form-group">
                  <label class="form-label required">Nombre del Rol (Identificador único)</label>
                  <input type="text" class="form-control" name="nombre" required maxlength="50" placeholder="Ej: SUPERVISOR_PLANTA" value="${escapeHtml(rol ? rol.nombre : '')}" style="font-family: var(--font-mono);" />
                </div>

                <div class="form-group">
                  <label class="form-label">Descripción</label>
                  <textarea class="form-control" name="descripcion" placeholder="Alcance y responsabilidades de este perfil...">${escapeHtml(rol ? rol.descripcion || '' : '')}</textarea>
                </div>

                <div class="form-group">
                  <label class="form-label">Permisos Asignados (tabla roles_permisos)</label>
                  <div class="perm-checkbox-group" style="border: 1px solid var(--border-default); border-radius: var(--radius-sm); padding: 0.5rem;">
                    ${permCheckboxes}
                  </div>
                </div>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary modal-close-btn">Cancelar</button>
                <button type="submit" class="btn btn-primary">
                  ${isEdit ? 'Guardar Cambios' : 'Crear Rol'}
                </button>
              </div>
            </form>
          </div>
        </div>
      `;

      const oldModal = document.getElementById('role-modal');
      if (oldModal) oldModal.remove();

      document.body.insertAdjacentHTML('beforeend', modalHtml);
      const modalEl = document.getElementById('role-modal');

      const closeModal = () => modalEl.remove();

      modalEl.querySelectorAll('.modal-close-btn').forEach((btn) => {
        btn.addEventListener('click', closeModal);
      });

      const form = modalEl.querySelector('#role-form');
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(form);

        const checkedPerms = Array.from(modalEl.querySelectorAll('input[name="permisoIds"]:checked'))
          .map((cb) => Number(cb.value));

        const payload = {
          nombre: formData.get('nombre').toUpperCase(),
          descripcion: formData.get('descripcion'),
          permisoIds: checkedPerms
        };

        if (isEdit) {
          await window.ApiService.updateRol(rol.id_rol, payload);
          window.App.showToast(`Rol #${rol.id_rol} actualizado`, 'success');
        } else {
          await window.ApiService.createRol(payload);
          window.App.showToast(`Nuevo rol registrado con éxito`, 'success');
        }

        closeModal();
        this.render(mainContainer);
      });
    },

    openPermissionModal: function (mainContainer) {
      const modalHtml = `
        <div class="modal-backdrop open" id="perm-modal">
          <div class="modal-window">
            <div class="modal-header">
              <h3 class="modal-title">Registrar Nuevo Permiso</h3>
              <button class="btn btn-ghost btn-sm btn-icon-only modal-close-btn">
                ${window.Icons.get('close')}
              </button>
            </div>
            <form id="perm-form">
              <div class="modal-body">
                <div class="form-group">
                  <label class="form-label required">Código del Permiso</label>
                  <input type="text" class="form-control" name="nombre" required maxlength="100" placeholder="Ej: REPORTES_EXPORTAR" style="font-family: var(--font-mono);" />
                </div>

                <div class="form-group">
                  <label class="form-label required">Descripción</label>
                  <input type="text" class="form-control" name="descripcion" required maxlength="255" placeholder="Permite exportar datos a formatos externos" />
                </div>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary modal-close-btn">Cancelar</button>
                <button type="submit" class="btn btn-primary">Registrar Permiso</button>
              </div>
            </form>
          </div>
        </div>
      `;

      const oldModal = document.getElementById('perm-modal');
      if (oldModal) oldModal.remove();

      document.body.insertAdjacentHTML('beforeend', modalHtml);
      const modalEl = document.getElementById('perm-modal');

      const closeModal = () => modalEl.remove();

      modalEl.querySelectorAll('.modal-close-btn').forEach((btn) => {
        btn.addEventListener('click', closeModal);
      });

      const form = modalEl.querySelector('#perm-form');
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(form);

        await window.ApiService.createPermiso({
          nombre: formData.get('nombre').toUpperCase(),
          descripcion: formData.get('descripcion')
        });

        window.App.showToast('Permiso registrado en la tabla permisos', 'success');
        closeModal();
        this.render(mainContainer);
      });
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
})();
