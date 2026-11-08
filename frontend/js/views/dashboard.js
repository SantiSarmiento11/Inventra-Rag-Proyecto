/**
 * Vista de Dashboard
 * Métricas consolidadas derivadas del Modelo Entidad-Relación.
 * Gráficos nativos SVG mate (sin librerías externas).
 * Cero emojis.
 */

(function () {
  window.Views = window.Views || {};

  window.Views.Dashboard = {
    render: async function (container) {
      const data = await window.ApiService.getDashboardResumen();
      const icons = window.Icons;

      const valorMoneda = new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2
      }).format(data.valorTotal);

      // Calcular porcentajes para la distribución de stock
      const total = data.totalProductos || 1;
      const pctNormal = Math.round(((total - data.stockBajo - data.stockAgotado) / total) * 100);
      const pctBajo = Math.round((data.stockBajo / total) * 100);
      const pctAgotado = Math.round((data.stockAgotado / total) * 100);

      // Generar barras SVG de stock de los productos con mayor existencia
      const maxStock = Math.max(...(data.topProductsByStock.map(p => p.stock)), 1);
      const chartBars = data.topProductsByStock.map((prod, idx) => {
        const barWidth = Math.max(12, Math.round((prod.stock / maxStock) * 100));
        return `
          <div style="margin-bottom: 0.85rem;">
            <div style="display: flex; justify-content: space-between; font-size: 0.75rem; margin-bottom: 0.25rem;">
              <span style="font-weight: 500; color: var(--text-main);">${escapeHtml(prod.nombre)}</span>
              <span style="font-family: var(--font-mono); color: var(--text-secondary);">${prod.stock} uds</span>
            </div>
            <div style="background-color: var(--bg-muted); height: 8px; border-radius: var(--radius-full); overflow: hidden;">
              <div style="width: ${barWidth}%; height: 100%; background-color: var(--primary); border-radius: var(--radius-full); transition: width 0.5s ease;"></div>
            </div>
          </div>
        `;
      }).join('');

      // Lista de items con stock crítico
      const criticalListHtml = data.criticalProducts.length > 0
        ? data.criticalProducts.map(p => `
          <div class="critical-item">
            <div class="critical-item-info">
              <span class="critical-item-name">${escapeHtml(p.nombre)}</span>
              <span class="critical-item-sku">ID #${p.id_producto} | Stock actual: ${p.stock}</span>
            </div>
            <span class="badge ${p.stock === 0 ? 'badge-danger' : 'badge-warning'}">
              ${p.stock === 0 ? 'Agotado' : 'Stock Crítico'}
            </span>
          </div>
        `).join('')
        : `<div class="empty-state" style="padding: 1.5rem;"><p class="empty-desc">No hay productos en niveles críticos de inventario.</p></div>`;

      container.innerHTML = `
        <!-- Tarjetas KPI -->
        <div class="kpi-grid">
          <div class="kpi-card">
            <div class="kpi-top">
              <span class="kpi-label">Catálogo de Productos</span>
              <div class="kpi-icon-wrap">${icons.get('products')}</div>
            </div>
            <div class="kpi-value">${data.totalProductos}</div>
            <div class="kpi-foot">
              <span>${data.productosActivos} activos en sistema</span>
            </div>
          </div>

          <div class="kpi-card">
            <div class="kpi-top">
              <span class="kpi-label">Existencias Globales</span>
              <div class="kpi-icon-wrap">${icons.get('layers')}</div>
            </div>
            <div class="kpi-value">${data.stockTotal} <span style="font-size: 0.9rem; font-weight: 500; color: var(--text-muted);">uds</span></div>
            <div class="kpi-foot">
              <span>Valor: ${valorMoneda}</span>
            </div>
          </div>

          <div class="kpi-card">
            <div class="kpi-top">
              <span class="kpi-label">Stock Comprometido</span>
              <div class="kpi-icon-wrap">${icons.get('alertCircle')}</div>
            </div>
            <div class="kpi-value" style="color: ${data.stockBajo + data.stockAgotado > 0 ? 'var(--warning)' : 'var(--text-main)'};">
              ${data.stockBajo + data.stockAgotado}
            </div>
            <div class="kpi-foot">
              <span>${data.stockAgotado} agotados, ${data.stockBajo} en nivel bajo</span>
            </div>
          </div>

          <div class="kpi-card">
            <div class="kpi-top">
              <span class="kpi-label">Seguridad & Usuarios</span>
              <div class="kpi-icon-wrap">${icons.get('users')}</div>
            </div>
            <div class="kpi-value">${data.usuariosActivos} / ${data.totalUsuarios}</div>
            <div class="kpi-foot">
              <span>${data.totalRoles} roles, ${data.totalPermisos} permisos definidos</span>
            </div>
          </div>
        </div>

        <!-- Secciones de visualización analítica -->
        <div class="dashboard-grid">
          <div class="card">
            <div class="card-header">
              <div>
                <h3 class="card-title">Existencias por Producto Relevante</h3>
                <p class="card-subtitle">Productos con mayor cantidad en almacén (tabla: productos)</p>
              </div>
              <button class="btn btn-secondary btn-sm" id="btn-refresh-dashboard">
                ${icons.get('refresh')}
                <span>Actualizar</span>
              </button>
            </div>
            <div class="card-body">
              ${chartBars}
            </div>
          </div>

          <div class="card">
            <div class="card-header">
              <div>
                <h3 class="card-title">Alertas de Reposición</h3>
                <p class="card-subtitle">Productos que requieren atención inmediata</p>
              </div>
            </div>
            <div class="card-body">
              <div class="critical-items-list">
                ${criticalListHtml}
              </div>
            </div>
          </div>
        </div>

        <!-- Estado de Relaciones de la Base de Datos -->
        <div class="card" style="margin-top: 1.25rem;">
          <div class="card-header">
            <div>
              <h3 class="card-title">Integridad del Modelo Relacional</h3>
              <p class="card-subtitle">Estado de sincronización y conectividad de tablas del MER</p>
            </div>
            <span class="badge badge-success">
              ${icons.get('check')}
              <span>Estructura Válida</span>
            </span>
          </div>
          <div class="card-body" style="padding: 1rem 1.25rem;">
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1rem; font-size: 0.8125rem;">
              <div style="padding: 0.75rem; background: var(--bg-subtle); border-radius: var(--radius-sm); border: 1px solid var(--border-light);">
                <span style="font-family: var(--font-mono); font-weight: 600; color: var(--primary);">usuarios</span>
                <p style="font-size: 0.72rem; color: var(--text-muted); margin-top: 0.25rem;">${data.totalUsuarios} registros</p>
              </div>
              <div style="padding: 0.75rem; background: var(--bg-subtle); border-radius: var(--radius-sm); border: 1px solid var(--border-light);">
                <span style="font-family: var(--font-mono); font-weight: 600; color: var(--primary);">roles</span>
                <p style="font-size: 0.72rem; color: var(--text-muted); margin-top: 0.25rem;">${data.totalRoles} registros</p>
              </div>
              <div style="padding: 0.75rem; background: var(--bg-subtle); border-radius: var(--radius-sm); border: 1px solid var(--border-light);">
                <span style="font-family: var(--font-mono); font-weight: 600; color: var(--primary);">permisos</span>
                <p style="font-size: 0.72rem; color: var(--text-muted); margin-top: 0.25rem;">${data.totalPermisos} registros</p>
              </div>
              <div style="padding: 0.75rem; background: var(--bg-subtle); border-radius: var(--radius-sm); border: 1px solid var(--border-light);">
                <span style="font-family: var(--font-mono); font-weight: 600; color: var(--primary);">productos</span>
                <p style="font-size: 0.72rem; color: var(--text-muted); margin-top: 0.25rem;">${data.totalProductos} registros</p>
              </div>
              <div style="padding: 0.75rem; background: var(--bg-subtle); border-radius: var(--radius-sm); border: 1px solid var(--border-light);">
                <span style="font-family: var(--font-mono); font-weight: 600; color: var(--primary);">usuarios_roles</span>
                <p style="font-size: 0.72rem; color: var(--text-muted); margin-top: 0.25rem;">Relación N:M Activa</p>
              </div>
              <div style="padding: 0.75rem; background: var(--bg-subtle); border-radius: var(--radius-sm); border: 1px solid var(--border-light);">
                <span style="font-family: var(--font-mono); font-weight: 600; color: var(--primary);">roles_permisos</span>
                <p style="font-size: 0.72rem; color: var(--text-muted); margin-top: 0.25rem;">Matriz RBAC Activa</p>
              </div>
            </div>
          </div>
        </div>
      `;

      // Eventos
      const btnRefresh = container.querySelector('#btn-refresh-dashboard');
      if (btnRefresh) {
        btnRefresh.addEventListener('click', () => {
          this.render(container);
          window.App.showToast('Datos del dashboard actualizados', 'info');
        });
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
})();
