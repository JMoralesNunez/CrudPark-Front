<template>
    <div class="home">
        <div class="page-header">
            <h1>Dashboard DriveRent</h1>
            <p class="page-subtitle">Métricas importantes del negocio en tiempo real</p>
        </div>

        <div class="dashboard-metrics">
            <div v-if="loading" class="loading-state">
                <div class="loading-spinner"></div>
                <p>Cargando métricas...</p>
            </div>
            
            <div v-else-if="error" class="error-state">
                <div class="error-icon">!</div>
                <p>Error al cargar las métricas: {{ error }}</p>
                <button class="retry-button" @click="fetchDashboardMetrics">Reintentar</button>
            </div>
            
            <div v-else class="metrics-grid">
                <div class="metric-card">
                    <div class="metric-icon vehicles-icon"></div>
                    <div class="metric-content">
                        <h3>Vehículos en Parqueadero</h3>
                        <p class="metric-value">{{ metrics.vehiclesCurrentlyInside }}</p>
                        <span class="metric-label">Unidades activas</span>
                    </div>
                </div>
                
                <div class="metric-card">
                    <div class="metric-icon income-icon"></div>
                    <div class="metric-content">
                        <h3>Ingresos del Día</h3>
                        <p class="metric-value">{{ formatCurrency(metrics.incomeToday) }}</p>
                        <span class="metric-label">Hoy</span>
                    </div>
                </div>
                
                <div class="metric-card">
                    <div class="metric-icon memberships-icon"></div>
                    <div class="metric-content">
                        <h3>Membresías Activas</h3>
                        <p class="metric-value">{{ metrics.membershipsActive }}</p>
                        <span class="metric-label">Clientes activos</span>
                    </div>
                </div>
                
                <div class="metric-card warning">
                    <div class="metric-icon expiring-icon"></div>
                    <div class="metric-content">
                        <h3>Próximas a Vencer</h3>
                        <p class="metric-value">{{ metrics.membershipsExpiringSoon }}</p>
                        <span class="metric-label">En los próximos 7 días</span>
                    </div>
                </div>
                
                <div class="metric-card danger">
                    <div class="metric-icon expired-icon"></div>
                    <div class="metric-content">
                        <h3>Membresías Vencidas</h3>
                        <p class="metric-value">{{ metrics.membershipsExpired }}</p>
                        <span class="metric-label">Requieren atención</span>
                    </div>
                </div>
                
                <div class="metric-card">
                    <div class="metric-icon occupation-icon"></div>
                    <div class="metric-content">
                        <h3>Ocupación Actual</h3>
                        <p class="metric-value">{{ metrics.occupationPercentage }}%</p>
                        <div class="progress-bar">
                            <div class="progress-fill" :style="{ width: metrics.occupationPercentage + '%' }"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'HomeView',
    data() {
        return {
            metrics: {
                vehiclesCurrentlyInside: 0,
                occupationPercentage: 0,
                incomeToday: 0,
                membershipsActive: 0,
                membershipsExpiringSoon: 0,
                membershipsExpired: 0,
            },
            loading: false,
            error: null,
            dashboardApiUrl: 'https://parkingcrud2-0.onrender.com/api/Dashboard/metrics'
        };
    },
    methods: {
        async fetchDashboardMetrics() {
            this.loading = true;
            this.error = null;
            try {
                const response = await this.$axios.get(this.dashboardApiUrl);
                this.metrics = response.data;
                console.log('Métricas cargadas:', this.metrics);
            } catch (err) {
                this.error = err.message || 'Ocurrió un error al cargar las métricas.';
                console.error('Error al obtener las métricas del dashboard:', err);
            } finally {
                this.loading = false;
            }
        },
        formatCurrency(value) {
            if (typeof value !== "number") {
                return value;
            }
            return value.toLocaleString('es-CO', {
                style: 'currency',
                currency: 'COP', 
            });
        }
    },
    mounted() {
        this.fetchDashboardMetrics();
    },
}
</script>

<style scoped>
.home {
    padding: 0;
    text-align: left;
}

.page-header {
    margin-bottom: 2rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid var(--color-border);
}

.page-header h1 {
    font-size: 1.75rem;
    font-weight: 700;
    color: var(--color-text);
    margin-bottom: 0.5rem;
    background: linear-gradient(90deg, var(--color-text) 0%, var(--color-accent-light) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}

.page-subtitle {
    color: var(--color-text-light);
    font-size: 1rem;
    margin: 0;
}

.dashboard-metrics {
    margin: 0;
}

.loading-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 3rem;
    background-color: var(--color-card);
    border-radius: var(--border-radius);
    border: 1px solid var(--color-border);
}

.loading-spinner {
    width: 40px;
    height: 40px;
    border: 3px solid var(--color-border);
    border-top: 3px solid var(--color-accent);
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 1rem;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

.error-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 3rem;
    background-color: var(--color-card);
    border-radius: var(--border-radius);
    border: 1px solid var(--color-danger);
    color: var(--color-danger);
}

.error-icon {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background-color: var(--color-danger);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    font-weight: bold;
    margin-bottom: 1rem;
}

.retry-button {
    margin-top: 1rem;
    padding: 0.5rem 1.5rem;
    background-color: var(--color-accent);
    color: white;
    border: none;
    border-radius: var(--border-radius);
    cursor: pointer;
    transition: var(--transition);
    font-weight: 500;
}

.retry-button:hover {
    background-color: var(--color-accent-light);
    transform: translateY(-1px);
}

.metrics-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1.5rem;
}

.metric-card {
    background-color: var(--color-card);
    padding: 1.5rem;
    border-radius: var(--border-radius);
    border-left: 4px solid var(--color-accent);
    box-shadow: var(--shadow-light);
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    transition: var(--transition);
    position: relative;
    overflow: hidden;
}

.metric-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(90deg, var(--color-accent) 0%, transparent 100%);
    opacity: 0;
    transition: var(--transition);
}

.metric-card:hover {
    transform: translateY(-5px);
    box-shadow: var(--shadow-medium);
}

.metric-card:hover::before {
    opacity: 1;
}

.metric-card.warning {
    border-left-color: var(--color-warning);
}

.metric-card.danger {
    border-left-color: var(--color-danger);
}

.metric-icon {
    width: 48px;
    height: 48px;
    border-radius: 10px;
    background-color: var(--color-primary-light);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    position: relative;
}

.vehicles-icon::before {
    content: '🚗';
    font-size: 1.5rem;
}

.income-icon::before {
    content: '💰';
    font-size: 1.5rem;
}

.memberships-icon::before {
    content: '👥';
    font-size: 1.5rem;
}

.expiring-icon::before {
    content: '⏳';
    font-size: 1.5rem;
}

.expired-icon::before {
    content: '⚠️';
    font-size: 1.5rem;
}

.occupation-icon::before {
    content: '📊';
    font-size: 1.5rem;
}

.metric-content {
    flex: 1;
}

.metric-card h3 {
    font-size: 0.9rem;
    font-weight: 600;
    color: var(--color-text-light);
    margin: 0 0 0.5rem 0;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.metric-value {
    font-size: 2rem;
    font-weight: 700;
    color: var(--color-text);
    margin: 0 0 0.25rem 0;
    line-height: 1;
}

.metric-card.warning .metric-value {
    color: var(--color-warning);
}

.metric-card.danger .metric-value {
    color: var(--color-danger);
}

.metric-label {
    font-size: 0.8rem;
    color: var(--color-text-muted);
    display: block;
}

.progress-bar {
    width: 100%;
    height: 6px;
    background-color: var(--color-primary-light);
    border-radius: 3px;
    margin-top: 0.5rem;
    overflow: hidden;
}

.progress-fill {
    height: 100%;
    background: linear-gradient(90deg, var(--color-accent) 0%, var(--color-accent-light) 100%);
    border-radius: 3px;
    transition: width 0.5s ease;
}

/* Responsive */
@media (max-width: 768px) {
    .metrics-grid {
        grid-template-columns: 1fr;
        gap: 1rem;
    }
    
    .metric-card {
        padding: 1.25rem;
    }
    
    .metric-value {
        font-size: 1.75rem;
    }
}

@media (max-width: 480px) {
    .metric-card {
        flex-direction: column;
        text-align: center;
        gap: 0.75rem;
    }
    
    .metric-icon {
        align-self: center;
    }
}
</style>