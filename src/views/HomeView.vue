<template>
    <div class="home">
        <h1>Dashboard de DriveRent</h1>
        <p>Métricas importantes del negocio en tiempo real.</p>

        <div class="dashboard-metrics">
            <div v-if="loading" class="loading-message">
                Cargando métricas...
            </div>
            <div v-else-if="error" class="error-message">
                Error al cargar las métricas: {{ error }}
            </div>
            <div v-else class="metrics-grid">
                <div class="metric-card">
                    <h3>Vehículos en Parqueadero</h3>
                    <p class="metric-value">{{ metrics.vehiclesCurrentlyInside }}</p>
                </div>
                <div class="metric-card">
                    <h3>Ingresos del Día</h3>
                    <p class="metric-value">{{ formatCurrency(metrics.incomeToday) }}</p>
                </div>
                <div class="metric-card">
                    <h3>Membresías Activas</h3>
                    <p class="metric-value">{{ metrics.membershipsActive }}</p>
                </div>
                <div class="metric-card">
                    <h3>Membresías Próx. a Vencer</h3>
                    <p class="metric-value">{{ metrics.membershipsExpiringSoon }}</p>
                </div>
                <div class="metric-card">
                    <h3>Membresías Vencidas</h3>
                    <p class="metric-value expired">{{ metrics.membershipsExpired }}</p>
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
                incomeToday: 0,
                membershipsActive: 0,
                membershipsExpiringSoon: 0,
                membershipsExpired: 0,
            },
            loading: false,
            error: null,
            dashboardApiUrl: 'https://parkingcrud.onrender.com/api/Dashboard/metrics'
        };
    },
    methods: {
        async fetchDashboardMetrics() {
            this.loading = true;
            this.error = null;
            try {
                // Hacemos la petición GET a la URL completa de la API externa
                // Usamos this.$axios.get pero le pasamos la URL completa para que ignore la baseURL configurada
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
    padding: 20px;
    text-align: center;
}

.home h1 {
    margin-top: 20px;
    color: #333;
}

.home p {
    color: #555;
    font-size: 1.1em;
}

.dashboard-metrics {
    margin: 40px auto;
    max-width: 900px;
    padding: 20px;
    background-color: #f9f9f9;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.loading-message,
.error-message {
    padding: 20px;
    font-size: 1.2em;
}

.error-message {
    color: red;
}

.metrics-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 20px;
}

.metric-card {
    background-color: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    min-height: 120px;
}

.metric-card h3 {
    margin-top: 0;
    color: #42b983;
    /* Verde Vue */
    font-size: 1.1em;
}

.metric-value {
    font-size: 2.2em;
    font-weight: bold;
    color: #2c3e50;
    margin-top: 10px;
}

.metric-value.expired {
    color: #e74c3c;
}

.button {
    display: inline-block;
    padding: 10px 20px;
    border-radius: 5px;
    text-decoration: none;
    font-weight: bold;
    transition: background-color 0.3s ease;
    background-color: #42b983;
    color: white;
}

.button:hover {
    background-color: #36a172;
}

.button.primary {
    background-color: #2c3e50;
    color: white;
}

.button.primary:hover {
    background-color: #1e2a36;
}
</style>