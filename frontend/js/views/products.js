/**
 * Vista de Productos
 * Basado estrictamente en la tabla:
 * CREATE TABLE productos (
 *     id_producto BIGINT PRIMARY KEY AUTO_INCREMENT,
 *     nombre VARCHAR(100) NOT NULL,
 *     descripcion TEXT,
 *     precio DECIMAL(10,2) NOT NULL,
 *     stock INT DEFAULT 0,
 *     estado BOOLEAN DEFAULT TRUE,
 *     fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
 * );
 * Cero emojis.
 */

(function () {
  window.Views = window.Views || {};

  let currentSearch = '';
  let currentStatusFilter = 'all';
  let currentStockFilter = 'all';

  window.Views.Products = {
    render: async function (container) {
      const icons = window.Icons;
      const productos = await window.ApiService.getProductos();

      // Aplicar filtros
      const filtered = productos.filter((p) => {
        const matchesSearch = !currentSearch ||
          p.nombre.toLowerCase().includes(currentSearch.toLowerCase()) ||
          (p.descripcion && p.descripcion.toLowerCase().includes(currentSearch.toLowerCase())) ||
          String(p.id_producto).includes(currentSearch);

        let matchesStatus = true;
        if (currentStatusFilter === 'active') matchesStatus = p.estado === true;
        if (currentStatusFilter === 'inactive') matchesStatus = p.estado === false;

        let matchesStock = true;
        if (currentStockFilter === 'low') matchesStock = p.stock > 0 && p.stock <= 10;
        if (currentStockFilter === 'out') matchesStock = p.stock === 0;
        if (currentStockFilter === 'available') matchesStock = p.stock > 10;

        return matchesSearch && matchesStatus && matchesStock;
      });

      const rowsHtml = filtered.length > 0
        ? filtered.map((prod) => {
          let stockClass = 'normal';
          let stockLabel = 'Disponible';
          let badgeClass = 'badge-success';

          if (prod.stock === 0) {
            stockClass = 'danger';
            stockLabel = 'Agotado';
            badgeClass = 'badge-danger';
          } else if (prod.stock <= 10) {
            stockClass = 'warning';
            stockLabel = 'Stock Bajo';
            badgeClass = 'badge-warning';
          }

          const stockPercent = Math.min(100, Math.max(5, (prod.stock / 60) * 100));

          return `
            <tr data-id="${prod.id_producto}">
              <td style="font-family: var(--font-mono); color: var(--text-muted); font-size: 0.75rem;">
                #${prod.id_producto}
              </td>
              <td>
                <div style="display: flex; flex-direction: column;">
                  <span style="font-weight: 600; color: var(--text-main);">${escapeHtml(prod.nombre)}</span>
                  <span style="font-size: 0.725rem; color: var(--text-muted); max-width: 320px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                    ${escapeHtml(prod.descripcion || 'Sin descripción')}
                  </span>
                </div>
              </td>
              <td class="price-text">
                $${parseFloat(prod.precio).toFixed(2)}
              </td>
              <td>
                <div class="stock-bar-wrap">
                  <div class="stock-bar-track">
                    <div class="stock-bar-fill ${stockClass}" style="width: ${stockPercent}%;"></div>
                  </div>
                  <span style="font-family: var(--font-mono); font-weight: 600;">${prod.stock}</span>
                  <span class="badge ${badgeClass}" style="font-size: 0.65rem; padding: 1px 4px;">${stockLabel}</span>
                </div>
              </td>
              <td>
                <button class="btn btn-ghost btn-sm btn-toggle-status" data-id="${prod.id_producto}" title="Cambiar estado">
                  ${prod.estado
                    ? `<span class="badge badge-success">${icons.get('check')} Activo</span>`
                    : `<span class="badge badge-neutral">${icons.get('close')} Inactivo</span>`
                  }
                </button>
              </td>
              <td style="font-size: 0.72rem; color: var(--text-muted); font-family: var(--font-mono);">
                ${prod.fecha_creacion || 'N/D'}
              </td>
              <td style="text-align: right;">
                <div style="display: inline-flex; gap: 0.25rem;">
                  <button class="btn btn-ghost btn-sm btn-icon-only btn-edit-product" data-id="${prod.id_producto}" title="Editar producto">
                    ${icons.get('edit')}
                  </button>
                  <button class="btn btn-ghost btn-sm btn-icon-only btn-delete-product" data-id="${prod.id_producto}" title="Eliminar producto" style="color: var(--danger);">
                    ${icons.get('trash')}
                  </button>
                </div>
              </td>
            </tr>
          `;
        }).join('')
        : `
          <tr>
            <td colspan="7">
              <div class="empty-state">
                ${icons.get('products')}
                <p class="empty-title">No se encontraron productos</p>
                <p class="empty-desc">Intenta ajustar los criterios de búsqueda o agrega un nuevo registro a la tabla.</p>
              </div>
            </td>
          </tr>
        `;

      container.innerHTML = `
        <div class="action-bar">
          <div class="search-input-wrap">
            ${icons.get('search')}
            <input type="text" class="form-control" id="product-search-input" placeholder="Buscar por nombre, descripción o ID..." value="${escapeHtml(currentSearch)}" />
          </div>

          <div class="filter-group">
            <select class="form-control" id="product-status-filter" style="width: auto; min-width: 140px;">
              <option value="all" ${currentStatusFilter === 'all' ? 'selected' : ''}>Todos los estados</option>
              <option value="active" ${currentStatusFilter === 'active' ? 'selected' : ''}>Solo Activos</option>
              <option value="inactive" ${currentStatusFilter === 'inactive' ? 'selected' : ''}>Solo Inactivos</option>
            </select>

            <select class="form-control" id="product-stock-filter" style="width: auto; min-width: 140px;">
              <option value="all" ${currentStockFilter === 'all' ? 'selected' : ''}>Todos los stocks</option>
              <option value="available" ${currentStockFilter === 'available' ? 'selected' : ''}>Normal (> 10 uds)</option>
              <option value="low" ${currentStockFilter === 'low' ? 'selected' : ''}>Stock Bajo (≤ 10 uds)</option>
              <option value="out" ${currentStockFilter === 'out' ? 'selected' : ''}>Agotado (0 uds)</option>
            </select>

            <button class="btn btn-primary" id="btn-open-create-product">
              ${icons.get('plus')}
              <span>Nuevo Producto</span>
            </button>
          </div>
        </div>

        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th style="width: 70px;">ID</th>
                <th>Nombre y Descripción</th>
                <th style="width: 110px;">Precio (USD)</th>
                <th style="width: 170px;">Existencias</th>
                <th style="width: 110px;">Estado</th>
                <th style="width: 140px;">Fecha Creación</th>
                <th style="width: 100px; text-align: right;">Acciones</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>
        </div>
      `;

      // Vincular eventos de filtros
      const searchInput = container.querySelector('#product-search-input');
      if (searchInput) {
        searchInput.addEventListener('input', (e) => {
          currentSearch = e.target.value;
          this.render(container);
        });
      }

      const statusFilter = container.querySelector('#product-status-filter');
      if (statusFilter) {
        statusFilter.addEventListener('change', (e) => {
          currentStatusFilter = e.target.value;
          this.render(container);
        });
      }

      const stockFilter = container.querySelector('#product-stock-filter');
      if (stockFilter) {
        stockFilter.addEventListener('change', (e) => {
          currentStockFilter = e.target.value;
          this.render(container);
        });
      }

      // Nuevo Producto
      const btnCreate = container.querySelector('#btn-open-create-product');
      if (btnCreate) {
        btnCreate.addEventListener('click', () => {
          this.openProductModal(null, container);
        });
      }

      // Toggle Estado
      container.querySelectorAll('.btn-toggle-status').forEach((btn) => {
        btn.addEventListener('click', async () => {
          const id = btn.getAttribute('data-id');
          await window.ApiService.updateProductoEstado(id, null);
          window.App.showToast(`Estado del producto #${id} actualizado`, 'info');
          this.render(container);
        });
      });

      // Editar
      container.querySelectorAll('.btn-edit-product').forEach((btn) => {
        btn.addEventListener('click', async () => {
          const id = btn.getAttribute('data-id');
          const prod = await window.ApiService.getProducto(id);
          this.openProductModal(prod, container);
        });
      });

      // Eliminar
      container.querySelectorAll('.btn-delete-product').forEach((btn) => {
        btn.addEventListener('click', async () => {
          const id = btn.getAttribute('data-id');
          const confirmed = confirm(`¿Confirmas la eliminación del producto #${id}? Esta acción afectará la tabla productos.`);
          if (confirmed) {
            await window.ApiService.deleteProducto(id);
            window.App.showToast(`Producto #${id} eliminado del catálogo`, 'error');
            this.render(container);
          }
        });
      });
    },

    openProductModal: function (product, mainContainer) {
      const isEdit = Boolean(product);
      const title = isEdit ? `Editar Producto #${product.id_producto}` : 'Registrar Nuevo Producto';

      const modalHtml = `
        <div class="modal-backdrop open" id="product-modal">
          <div class="modal-window">
            <div class="modal-header">
              <h3 class="modal-title">${title}</h3>
              <button class="btn btn-ghost btn-sm btn-icon-only modal-close-btn">
                ${window.Icons.get('close')}
              </button>
            </div>
            <form id="product-form">
              <div class="modal-body">
                <div class="form-group">
                  <label class="form-label required">Nombre del Producto</label>
                  <input type="text" class="form-control" name="nombre" required maxlength="100" placeholder="Ej: Relé industrial 24V" value="${escapeHtml(product ? product.nombre : '')}" />
                </div>

                <div class="form-group">
                  <label class="form-label">Descripción</label>
                  <textarea class="form-control" name="descripcion" placeholder="Especificaciones técnicas y detalles del artículo...">${escapeHtml(product ? product.descripcion || '' : '')}</textarea>
                </div>

                <div class="form-row">
                  <div class="form-group">
                    <label class="form-label required">Precio Unitario ($)</label>
                    <input type="number" step="0.01" min="0" class="form-control" name="precio" required placeholder="0.00" value="${product ? product.precio : ''}" />
                  </div>

                  <div class="form-group">
                    <label class="form-label required">Stock Inicial</label>
                    <input type="number" step="1" min="0" class="form-control" name="stock" required placeholder="0" value="${product ? product.stock : '0'}" />
                  </div>
                </div>

                <div class="form-group" style="margin-top: 0.5rem;">
                  <label class="toggle-label">
                    <input type="checkbox" class="toggle-input" name="estado" ${!product || product.estado ? 'checked' : ''} />
                    <span class="toggle-slider"></span>
                    <span class="form-label" style="margin-bottom: 0;">Producto Activo para Operaciones</span>
                  </label>
                  <span class="form-help">Si se desactiva, no estará disponible para salidas de inventario.</span>
                </div>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary modal-close-btn">Cancelar</button>
                <button type="submit" class="btn btn-primary">
                  ${isEdit ? 'Guardar Cambios' : 'Crear Producto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      `;

      // Remover modal previo si existiese
      const oldModal = document.getElementById('product-modal');
      if (oldModal) oldModal.remove();

      document.body.insertAdjacentHTML('beforeend', modalHtml);
      const modalEl = document.getElementById('product-modal');

      const closeModal = () => modalEl.remove();

      modalEl.querySelectorAll('.modal-close-btn').forEach((btn) => {
        btn.addEventListener('click', closeModal);
      });

      const form = modalEl.querySelector('#product-form');
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(form);

        const payload = {
          nombre: formData.get('nombre'),
          descripcion: formData.get('descripcion'),
          precio: parseFloat(formData.get('precio')),
          stock: parseInt(formData.get('stock'), 10),
          estado: formData.get('estado') === 'on'
        };

        if (isEdit) {
          await window.ApiService.updateProducto(product.id_producto, payload);
          window.App.showToast(`Producto #${product.id_producto} actualizado correctamente`, 'success');
        } else {
          const created = await window.ApiService.createProducto(payload);
          window.App.showToast(`Producto #${created.id_producto} registrado exitosamente`, 'success');
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
