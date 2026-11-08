/**
 * Vista de Usuarios y Asignación de Roles
 * Basado estrictamente en las tablas:
 * CREATE TABLE usuarios (
 *     id_usuario BIGINT PRIMARY KEY AUTO_INCREMENT,
 *     nombre VARCHAR(100) NOT NULL,
 *     email VARCHAR(150) NOT NULL UNIQUE,
 *     password VARCHAR(255) NOT NULL,
 *     estado BOOLEAN DEFAULT TRUE,
 *     fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
 * );
 * CREATE TABLE usuarios_roles (
 *     id_usuario BIGINT NOT NULL,
 *     id_rol BIGINT NOT NULL,
 *     PRIMARY KEY (id_usuario, id_rol)
 * );
 * Cero emojis.
 */

(function () {
  window.Views = window.Views || {};

  let currentSearch = '';
  let currentStatusFilter = 'all';

  window.Views.Users = {
    render: async function (container) {
      const icons = window.Icons;
      const usuarios = await window.ApiService.getUsuarios();
      const roles = await window.ApiService.getRoles();

      const filtered = usuarios.filter((u) => {
        const matchesSearch = !currentSearch ||
          u.nombre.toLowerCase().includes(currentSearch.toLowerCase()) ||
          u.email.toLowerCase().includes(currentSearch.toLowerCase()) ||
          String(u.id_usuario).includes(currentSearch);

        let matchesStatus = true;
        if (currentStatusFilter === 'active') matchesStatus = u.estado === true;
        if (currentStatusFilter === 'inactive') matchesStatus = u.estado === false;

        return matchesSearch && matchesStatus;
      });

      const rowsHtml = filtered.length > 0
        ? filtered.map((user) => {
          const initials = user.nombre
            .split(' ')
            .map((n) => n[0])
            .slice(0, 2)
            .join('');

          const rolesBadges = user.roles && user.roles.length > 0
            ? user.roles.map((r) => `<span class="badge badge-primary">${escapeHtml(r.nombre)}</span>`).join(' ')
            : `<span class="badge badge-neutral" style="font-size: 0.65rem;">Sin rol asignado</span>`;

          return `
            <tr data-id="${user.id_usuario}">
              <td style="font-family: var(--font-mono); color: var(--text-muted); font-size: 0.75rem;">
                #${user.id_usuario}
              </td>
              <td>
                <div class="user-cell">
                  <div class="user-avatar">${initials}</div>
                  <div class="user-info">
                    <span class="user-name">${escapeHtml(user.nombre)}</span>
                    <span class="user-email">${escapeHtml(user.email)}</span>
                  </div>
                </div>
              </td>
              <td>
                <div class="user-roles-list">
                  ${rolesBadges}
                </div>
              </td>
              <td>
                <button class="btn btn-ghost btn-sm btn-toggle-user-status" data-id="${user.id_usuario}" title="Alternar acceso">
                  ${user.estado
                    ? `<span class="badge badge-success">${icons.get('check')} Activo</span>`
                    : `<span class="badge badge-neutral">${icons.get('close')} Inactivo</span>`
                  }
                </button>
              </td>
              <td style="font-size: 0.72rem; color: var(--text-muted); font-family: var(--font-mono);">
                ${user.fecha_creacion || 'N/D'}
              </td>
              <td style="text-align: right;">
                <div style="display: inline-flex; gap: 0.25rem;">
                  <button class="btn btn-ghost btn-sm btn-icon-only btn-edit-user" data-id="${user.id_usuario}" title="Editar usuario">
                    ${icons.get('edit')}
                  </button>
                  <button class="btn btn-ghost btn-sm btn-icon-only btn-delete-user" data-id="${user.id_usuario}" title="Eliminar usuario" style="color: var(--danger);">
                    ${icons.get('trash')}
                  </button>
                </div>
              </td>
            </tr>
          `;
        }).join('')
        : `
          <tr>
            <td colspan="6">
              <div class="empty-state">
                ${icons.get('users')}
                <p class="empty-title">No se encontraron usuarios</p>
                <p class="empty-desc">No hay coincidencias con los términos de búsqueda ingresados.</p>
              </div>
            </td>
          </tr>
        `;

      container.innerHTML = `
        <div class="action-bar">
          <div class="search-input-wrap">
            ${icons.get('search')}
            <input type="text" class="form-control" id="user-search-input" placeholder="Buscar por nombre, email o ID..." value="${escapeHtml(currentSearch)}" />
          </div>

          <div class="filter-group">
            <select class="form-control" id="user-status-filter" style="width: auto; min-width: 140px;">
              <option value="all" ${currentStatusFilter === 'all' ? 'selected' : ''}>Todos los estados</option>
              <option value="active" ${currentStatusFilter === 'active' ? 'selected' : ''}>Solo Activos</option>
              <option value="inactive" ${currentStatusFilter === 'inactive' ? 'selected' : ''}>Solo Inactivos</option>
            </select>

            <button class="btn btn-primary" id="btn-open-create-user">
              ${icons.get('plus')}
              <span>Nuevo Usuario</span>
            </button>
          </div>
        </div>

        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th style="width: 70px;">ID</th>
                <th>Usuario / Identidad</th>
                <th>Roles Asignados (usuarios_roles)</th>
                <th style="width: 110px;">Estado</th>
                <th style="width: 150px;">Fecha Registro</th>
                <th style="width: 100px; text-align: right;">Acciones</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>
        </div>
      `;

      // Eventos
      const searchInput = container.querySelector('#user-search-input');
      if (searchInput) {
        searchInput.addEventListener('input', (e) => {
          currentSearch = e.target.value;
          this.render(container);
        });
      }

      const statusFilter = container.querySelector('#user-status-filter');
      if (statusFilter) {
        statusFilter.addEventListener('change', (e) => {
          currentStatusFilter = e.target.value;
          this.render(container);
        });
      }

      // Nuevo Usuario
      const btnCreate = container.querySelector('#btn-open-create-user');
      if (btnCreate) {
        btnCreate.addEventListener('click', () => {
          this.openUserModal(null, roles, container);
        });
      }

      // Toggle Estado
      container.querySelectorAll('.btn-toggle-user-status').forEach((btn) => {
        btn.addEventListener('click', async () => {
          const id = btn.getAttribute('data-id');
          await window.ApiService.updateUsuarioEstado(id, null);
          window.App.showToast(`Estado del usuario #${id} modificado`, 'info');
          this.render(container);
        });
      });

      // Editar
      container.querySelectorAll('.btn-edit-user').forEach((btn) => {
        btn.addEventListener('click', async () => {
          const id = btn.getAttribute('data-id');
          const user = await window.ApiService.getUsuario(id);
          this.openUserModal(user, roles, container);
        });
      });

      // Eliminar
      container.querySelectorAll('.btn-delete-user').forEach((btn) => {
        btn.addEventListener('click', async () => {
          const id = btn.getAttribute('data-id');
          const confirmed = confirm(`¿Confirmas la eliminación del usuario #${id}? Se removerán también sus roles asignados.`);
          if (confirmed) {
            await window.ApiService.deleteUsuario(id);
            window.App.showToast(`Usuario #${id} eliminado correctamente`, 'error');
            this.render(container);
          }
        });
      });
    },

    openUserModal: function (user, allRoles, mainContainer) {
      const isEdit = Boolean(user);
      const title = isEdit ? `Editar Usuario #${user.id_usuario}` : 'Registrar Nuevo Usuario';

      const userRoleIds = user && user.roles ? user.roles.map((r) => r.id_rol) : [];

      const roleCheckboxes = allRoles.map((r) => `
        <label class="perm-checkbox-item">
          <input type="checkbox" name="roleIds" value="${r.id_rol}" ${userRoleIds.includes(r.id_rol) ? 'checked' : ''} />
          <div>
            <span style="font-weight: 600; color: var(--text-main);">${escapeHtml(r.nombre)}</span>
            <span style="display: block; font-size: 0.7rem; color: var(--text-muted);">${escapeHtml(r.descripcion || '')}</span>
          </div>
        </label>
      `).join('');

      const modalHtml = `
        <div class="modal-backdrop open" id="user-modal">
          <div class="modal-window">
            <div class="modal-header">
              <h3 class="modal-title">${title}</h3>
              <button class="btn btn-ghost btn-sm btn-icon-only modal-close-btn">
                ${window.Icons.get('close')}
              </button>
            </div>
            <form id="user-form">
              <div class="modal-body">
                <div class="form-group">
                  <label class="form-label required">Nombre Completo</label>
                  <input type="text" class="form-control" name="nombre" required maxlength="100" placeholder="Ej: Santiago Sarmiento" value="${escapeHtml(user ? user.nombre : '')}" />
                </div>

                <div class="form-group">
                  <label class="form-label required">Correo Electrónico (email único)</label>
                  <input type="email" class="form-control" name="email" required maxlength="150" placeholder="usuario@empresa.com" value="${escapeHtml(user ? user.email : '')}" />
                </div>

                ${!isEdit ? `
                  <div class="form-group">
                    <label class="form-label required">Contraseña Temporal</label>
                    <input type="password" class="form-control" name="password" required minlength="6" placeholder="Mínimo 6 caracteres" />
                  </div>
                ` : ''}

                <div class="form-group">
                  <label class="form-label">Asignación de Roles (tabla usuarios_roles)</label>
                  <div style="border: 1px solid var(--border-default); border-radius: var(--radius-sm); padding: 0.5rem; max-height: 150px; overflow-y: auto;">
                    ${roleCheckboxes}
                  </div>
                  <span class="form-help">Selecciona los roles que tendrá este usuario en la plataforma.</span>
                </div>

                <div class="form-group" style="margin-top: 0.5rem;">
                  <label class="toggle-label">
                    <input type="checkbox" class="toggle-input" name="estado" ${!user || user.estado ? 'checked' : ''} />
                    <span class="toggle-slider"></span>
                    <span class="form-label" style="margin-bottom: 0;">Usuario Habilitado</span>
                  </label>
                </div>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary modal-close-btn">Cancelar</button>
                <button type="submit" class="btn btn-primary">
                  ${isEdit ? 'Guardar Cambios' : 'Registrar Usuario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      `;

      const oldModal = document.getElementById('user-modal');
      if (oldModal) oldModal.remove();

      document.body.insertAdjacentHTML('beforeend', modalHtml);
      const modalEl = document.getElementById('user-modal');

      const closeModal = () => modalEl.remove();

      modalEl.querySelectorAll('.modal-close-btn').forEach((btn) => {
        btn.addEventListener('click', closeModal);
      });

      const form = modalEl.querySelector('#user-form');
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(form);

        const checkedRoles = Array.from(modalEl.querySelectorAll('input[name="roleIds"]:checked'))
          .map((cb) => Number(cb.value));

        const payload = {
          nombre: formData.get('nombre'),
          email: formData.get('email'),
          estado: formData.get('estado') === 'on',
          roleIds: checkedRoles
        };

        if (!isEdit) {
          payload.password = formData.get('password');
          const created = await window.ApiService.createUsuario(payload);
          window.App.showToast(`Usuario #${created.id_usuario} registrado con éxito`, 'success');
        } else {
          await window.ApiService.updateUsuario(user.id_usuario, payload);
          window.App.showToast(`Usuario #${user.id_usuario} actualizado con éxito`, 'success');
        }

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
