<template>
    <div class="reportes-view">
        <div class="page-header">
            <h1>Reportes y Análisis</h1>
            <p class="page-subtitle">Métricas y análisis detallados del rendimiento del parqueadero</p>
        </div>

        <!-- Selector de Rango de Fechas -->
        <div class="date-range-card">
            <div class="card-header">
                <h2>Rango de Fechas</h2>
                <div class="date-presets">
                    <button @click="setDateRange(7)" :class="{ active: selectedPreset === 7 }">7 días</button>
                    <button @click="setDateRange(30)" :class="{ active: selectedPreset === 30 }">30 días</button>
                    <button @click="setDateRange(90)" :class="{ active: selectedPreset === 90 }">90 días</button>
                </div>
            </div>
            <div class="date-range-selector">
                <div class="form-group">
                    <label for="startDate">Fecha de Inicio</label>
                    <div class="date-input-wrapper">
                        <input type="date" id="startDate" v-model="startDate">
                    </div>
                </div>
                <div class="form-group">
                    <label for="endDate">Fecha de Fin</label>
                    <div class="date-input-wrapper">
                        <input type="date" id="endDate" v-model="endDate">
                    </div>
                </div>
            </div>
        </div>

        <!-- Estados de carga y error -->
        <div v-if="loading" class="loading-state">
            <div class="loading-spinner"></div>
            <p>Generando reportes...</p>
        </div>

        <div v-else-if="error" class="error-state">
            <div class="error-icon">!</div>
            <div class="error-content">
                <p class="error-title">Error al cargar reportes</p>
                <p class="error-message">{{ error }}</p>
                <button class="retry-button" @click="fetchReports">Reintentar</button>
            </div>
        </div>

        <!-- Contenido principal de reportes -->
        <div v-if="!loading && !error" class="reports-content">
            <!-- 1. Gráfica de Ingresos Diarios -->
            <div class="report-card">
                <div class="card-header">
                    <h2>Ingresos Diarios</h2>
                    <button @click="exportDailyIncomeCsv" :disabled="!dailyIncomeData || dailyIncomeData.length === 0"
                        class="btn-export">
                        <span class="export-icon">📥</span>
                        Exportar CSV
                    </button>
                </div>
                <div v-if="dailyIncomeData && dailyIncomeData.length > 0" class="chart-container">
                    <LineChart :data="dailyIncomeChartData" :options="dailyIncomeChartOptions" />
                    <div class="chart-summary">
                        <div class="summary-item">
                            <span class="summary-label">Total Período</span>
                            <span class="summary-value">{{ formatCurrency(totalIncome) }}</span>
                        </div>
                        <div class="summary-item">
                            <span class="summary-label">Promedio Diario</span>
                            <span class="summary-value">{{ formatCurrency(averageDailyIncome) }}</span>
                        </div>
                        <div class="summary-item">
                            <span class="summary-label">Días con Datos</span>
                            <span class="summary-value">{{ dailyIncomeData.length }} días</span>
                        </div>
                    </div>
                </div>
                <div v-else class="empty-state">
                    <div class="empty-icon">📊</div>
                    <p>No hay datos de ingresos para el rango de fechas seleccionado</p>
                </div>
            </div>

            <!-- 2. Métricas de Ocupación -->
            <div class="report-card">
                <div class="card-header">
                    <h2>Métricas de Ocupación</h2>
                </div>
                <div v-if="occupationData && occupationData.averageOccupationPercentage !== null"
                    class="occupation-content">
                    <div class="metrics-grid">
                        <div class="metric-card">
                            <div class="metric-icon occupation-icon"></div>
                            <div class="metric-content">
                                <h3>Ocupación Promedio</h3>
                                <p class="metric-value">{{ occupationData.averageOccupationPercentage.toFixed(1) }}%</p>
                                <div class="progress-bar">
                                    <div class="progress-fill"
                                        :style="{ width: occupationData.averageOccupationPercentage + '%' }"></div>
                                </div>
                            </div>
                        </div>
                        <div class="metric-card">
                            <div class="metric-icon duration-icon"></div>
                            <div class="metric-content">
                                <h3>Estancia Promedio</h3>
                                <!-- El método de formato ahora se usa aquí -->
                                <p class="metric-value">{{ formatStayDuration(occupationData.averageStayDuration) }}</p>
                                <span class="metric-label">Tiempo promedio por vehículo</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div v-else class="empty-state">
                    <div class="empty-icon">⏱️</div>
                    <p>No hay datos de ocupación para el rango de fechas seleccionado</p>
                </div>
            </div>

            <!-- 3. Comparativa de Mensualidades vs Invitados -->
            <div class="report-card">
                <div class="card-header">
                    <h2>Comparativa Mensualidades vs Invitados</h2>
                </div>
                <div v-if="membershipVsGuestData && membershipVsGuestData.guestIncome !== null"
                    class="comparative-content">
                    <div class="chart-container">
                        <BarChart :data="membershipVsGuestChartData" :options="comparativeChartOptions" />
                    </div>
                    <div class="comparative-metrics">
                        <div class="comparative-item">
                            <div class="comparative-label guest">
                                <span class="color-dot"></span>
                                Ingresos Invitados
                            </div>
                            <div class="comparative-value">{{ formatCurrency(membershipVsGuestData.guestIncome) }}</div>
                        </div>
                        <div class="comparative-item">
                            <div class="comparative-label guest">
                                <span class="color-dot"></span>
                                Entradas Invitados
                            </div>
                            <div class="comparative-value">{{ membershipVsGuestData.guestEntries }}</div>
                        </div>
                        <div class="comparative-item">
                            <div class="comparative-label membership">
                                <span class="color-dot"></span>
                                Entradas Mensualidades
                            </div>
                            <div class="comparative-value">{{ membershipVsGuestData.membershipEntries }}</div>
                        </div>
                    </div>
                </div>
                <div v-else class="empty-state">
                    <div class="empty-icon">👥</div>
                    <p>No hay datos de comparativa para el rango de fechas seleccionado</p>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { Line, Bar } from 'vue-chartjs';
import { Chart as ChartJS, Title, Tooltip, Legend, LineElement, PointElement, CategoryScale, LinearScale, BarElement } from 'chart.js';

ChartJS.register(Title, Tooltip, Legend, LineElement, PointElement, CategoryScale, LinearScale, BarElement);

// *** SOLUCIÓN 1: Establecer colores globales para los gráficos usando variables CSS ***
ChartJS.defaults.color = 'var(--color-text-light)';
ChartJS.defaults.borderColor = 'var(--color-border)';

export default {
    name: 'ReportesView',
    components: {
        LineChart: Line,
        BarChart: Bar,
    },
    data() {
        const today = new Date();
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(today.getDate() - 30);

        return {
            startDate: this.formatDateForInput(thirtyDaysAgo),
            endDate: this.formatDateForInput(today),
            selectedPreset: 30,
            loading: true,
            error: null,
            dailyIncomeData: [],
            occupationData: null,
            membershipVsGuestData: null,
        };
    },
    watch: {
        startDate() {
            this.selectedPreset = null; // Desmarcar preset si se cambia fecha manualmente
            this.fetchReports();
        },
        endDate() {
            this.selectedPreset = null; // Desmarcar preset si se cambia fecha manualmente
            this.fetchReports();
        }
    },
    computed: {
        totalIncome() {
            if (!this.dailyIncomeData || this.dailyIncomeData.length === 0) return 0;
            return this.dailyIncomeData.reduce((sum, item) => sum + item.totalAmount, 0);
        },
        averageDailyIncome() {
            if (!this.dailyIncomeData || this.dailyIncomeData.length === 0) return 0;
            return this.totalIncome / this.dailyIncomeData.length;
        },
        dailyIncomeChartData() {
            if (!this.dailyIncomeData || this.dailyIncomeData.length === 0) {
                return { labels: [], datasets: [] };
            }
            const labels = this.dailyIncomeData.map(item => this.formatDate(item.date));
            const amounts = this.dailyIncomeData.map(item => item.totalAmount);
            return {
        labels: labels,
        datasets: [{
            label: 'Ingresos Diarios',
            backgroundColor: 'white', // Color de fondo más suave
            borderColor: 'white', // Color principal del borde
            pointBackgroundColor: 'rgb(99, 102, 241)',
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2,
            pointRadius: 6,
            pointHoverRadius: 8,
            data: amounts,
            fill: true,
            tension: 0.4,
            borderWidth: 3,
        }]
    };
        },
        membershipVsGuestChartData() {
            if (!this.membershipVsGuestData) {
                return { labels: [], datasets: [] };
            }
            const labels = ['Ingresos Invitados', 'Entradas Invitados', 'Entradas Mensualidades'];
            const data = [
                this.membershipVsGuestData.guestIncome,
                this.membershipVsGuestData.guestEntries,
                this.membershipVsGuestData.membershipEntries,
            ];
            return {
                labels: labels,
                datasets: [{
                    label: 'Comparativa',
                    backgroundColor: [
                        'rgba(67, 97, 238, 0.8)',
                        'rgba(245, 158, 11, 0.8)',
                        'rgba(16, 185, 129, 0.8)'
                    ],
                    borderColor: [
                        'var(--color-accent)',
                        'var(--color-warning)',
                        'var(--color-success)'
                    ],
                    borderWidth: 1,
                    data: data,
                }]
            };
        },
        dailyIncomeChartOptions() {
            return {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: 'white',
                        titleColor: 'black',
                        bodyColor: 'var(--color-text)',
                        borderColor: 'var(--color-border)',
                        borderWidth: 1,
                        callbacks: {
                            label: (context) => `Ingresos: ${this.formatCurrency(context.raw)}`
                        }
                    }
                },
                scales: {
                    y: {
                        ticks: {
                            color: '#E0E0E0',
                            callback: (value) => this.formatCurrency(value)
                        },
                        grid: {
                            color: '#707070'
                        }
                    },
                    x: {
                        ticks: {
                            color: '#E0E0E0'
                        },
                        grid: {
                            color: '#707070'
                        }
                    }
                }
            };
        },
        comparativeChartOptions() {
            return {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: 'white',
                        titleColor: 'blue',
                        bodyColor: 'var(--color-text)',
                        borderColor: 'var(--color-border)',
                        borderWidth: 1,
                        callbacks: {
                            label: (context) => {
                                const label = context.label.toLowerCase();
                                if (label.includes('ingresos')) {
                                    return `Ingresos: ${this.formatCurrency(context.raw)}`;
                                }
                                return `Entradas: ${context.raw}`;
                            }
                        }
                    }
                },

                scales:{
                    y: {
                        ticks: {
                            color: '#E0E0E0',
                            callback: (value) => this.formatCurrency(value)
                        },
                        grid: {
                            color: '#707070'
                        }
                    },
                    x: {
                        ticks: {
                            color: '#E0E0E0'
                        },
                        grid: {
                            color: '#707070'
                        }
                    }
                }

                
            };
        }
    },
    methods: {
        setDateRange(days) {
            const today = new Date();
            const startDate = new Date();
            // Restar un día menos para incluir el día de hoy en el conteo
            // Ej: 7 días = hoy - 6 días
            startDate.setDate(today.getDate() - (days - 1));

            // Usamos $nextTick para asegurar que los watchers no se disparen 
            // antes de que ambas fechas se hayan actualizado.
            this.$nextTick(() => {
                this.startDate = this.formatDateForInput(startDate);
                this.endDate = this.formatDateForInput(today);
                this.selectedPreset = days;
                // El watcher se encargará de llamar a fetchReports
            });
        },
        async fetchReports() {
            this.loading = true;
            this.error = null;
            try {
                const [dailyIncomeResponse, occupationResponse, membershipVsGuestResponse] = await Promise.all([
                    this.$axios.get(`/Reports/daily-income?startDate=${this.startDate}&endDate=${this.endDate}`),
                    this.$axios.get(`/Reports/occupation?startDate=${this.startDate}&endDate=${this.endDate}`),
                    this.$axios.get(`/Reports/membership-vs-guest?startDate=${this.startDate}&endDate=${this.endDate}`)
                ]);
                this.dailyIncomeData = dailyIncomeResponse.data;
                this.occupationData = occupationResponse.data;
                this.membershipVsGuestData = membershipVsGuestResponse.data;
            } catch (err) {
                this.error = err.response?.data?.message || err.message || 'Error al cargar los reportes.';
                console.error('Error al cargar reportes:', err);
            } finally {
                this.loading = false;
            }
        },
        async exportDailyIncomeCsv() {
            try {
                const response = await this.$axios.get(`/Reports/daily-income/export/csv?startDate=${this.startDate}&endDate=${this.endDate}`, {
                    responseType: 'blob'
                });
                const url = window.URL.createObjectURL(new Blob([response.data]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', `ingresos-diarios-${this.startDate}_${this.endDate}.csv`);
                document.body.appendChild(link);
                link.click();
                link.remove();
                window.URL.revokeObjectURL(url);
            } catch (err) {
                this.error = 'Error al exportar a CSV: ' + (err.response?.data || err.message);
                console.error('Error al exportar CSV:', err);
            }
        },
        // *** SOLUCIÓN 2: Método de formato de duración mejorado ***
        formatStayDuration(durationString) {
            if (!durationString || typeof durationString !== 'string') {
                return 'N/A';
            }

            let days = 0;
            let timePart = durationString;

            // Separar días si existen (formato D.HH:MM:SS)
            if (durationString.includes('.')) {
                const parts = durationString.split('.');
                days = parseInt(parts[0], 10) || 0;
                timePart = parts[1];
            }

            const timeParts = timePart.split(':');
            if (timeParts.length < 2) {
                return durationString; // Devolver original si el formato es inesperado
            }

            const hours = parseInt(timeParts[0], 10) || 0;
            const minutes = parseInt(timeParts[1], 10) || 0;

            const totalHours = (days * 24) + hours;

            let result = [];
            if (totalHours > 0) {
                result.push(`${totalHours} ${totalHours === 1 ? 'hr' : 'hrs'}`);
            }
            if (minutes > 0) {
                result.push(`${minutes} ${minutes === 1 ? 'min' : 'min'}`);
            }

            if (result.length === 0) {
                return '0 min';
            }

            return result.join(' y ');
        },
        formatDate(isoString) {
            if (!isoString) return 'N/A';
            const date = new Date(isoString);
            // Opciones para un formato más corto y legible en gráficos
            return date.toLocaleDateString('es-CO', { month: 'short', day: 'numeric' });
        },
        formatDateForInput(date) {
            const year = date.getFullYear();
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const day = date.getDate().toString().padStart(2, '0');
            return `${year}-${month}-${day}`;
        },
        formatCurrency(value) {
            if (typeof value !== "number") {
                return value;
            }
            return value.toLocaleString('es-CO', {
                style: 'currency',
                currency: 'COP',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            });
        }
    },
    mounted() {
        this.fetchReports();
    }
};
</script>

<style scoped>
/* Estilos sin cambios, ya que son excelentes */
.reportes-view {
    padding: 0;
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

.date-range-card {
    background-color: var(--color-card);
    border-radius: var(--border-radius);
    box-shadow: var(--shadow-light);
    padding: 1.5rem;
    margin-bottom: 2rem;
    border: 1px solid var(--color-border);
}

.date-range-card .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
}

.date-range-card h2 {
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--color-text);
    margin: 0;
}

.date-presets {
    display: flex;
    gap: 0.5rem;
}



.date-presets button {
    padding: 0.5rem 1rem;
    background-color: var(--color-primary);
    border: 1px solid var(--color-border);
    border-radius: var(--border-radius);
    color: var(--color-text-light);
    cursor: pointer;
    font-size: 0.8rem;
    transition: var(--transition);
}

.date-presets button:hover,
.date-presets button.active {
    background-color: var(--color-accent);
    color: white;
    border-color: var(--color-accent);
}

.date-range-selector {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1.5rem;
}

.form-group {
    display: flex;
    flex-direction: column;
}

.form-group label {
    font-weight: 600;
    color: var(--color-text);
    margin-bottom: 0.5rem;
    font-size: 0.9rem;
}

.date-input-wrapper {
    position: relative;
}

.form-group input[type="date"] {
    padding: 0.75rem;
    background-color: var(--color-primary);
    border: 1px solid var(--color-border);
    border-radius: var(--border-radius);
    color: var(--color-text);
    font-size: 0.95rem;
    width: 100%;
    transition: var(--transition);
}

.form-group input:focus {
    outline: none;
    border-color: var(--color-accent);
    box-shadow: 0 0 0 2px rgba(67, 97, 238, 0.2);
}

.loading-state,
.error-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 3rem;
    background-color: var(--color-card);
    border-radius: var(--border-radius);
    border: 1px solid var(--color-border);
    margin-bottom: 2rem;
}

.error-state {
    flex-direction: row;
    align-items: flex-start;
    text-align: left;
    border-color: var(--color-danger);
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

.error-icon {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background-color: var(--color-danger);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.2rem;
    font-weight: bold;
    flex-shrink: 0;
    margin-right: 1rem;
}

.error-content {
    flex: 1;
}

.error-title {
    font-weight: 600;
    color: var(--color-text);
    margin-bottom: 0.5rem;
}

.error-message {
    color: var(--color-text-light);
    margin-bottom: 1rem;
}

.retry-button {
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

.reports-content {
    display: flex;
    flex-direction: column;
    gap: 2rem;
}

.report-card {
    background-color: var(--color-card);
    border-radius: var(--border-radius);
    box-shadow: var(--shadow-light);
    padding: 2rem;
    border: 1px solid var(--color-border);
}

.report-card .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid var(--color-border);
}

.report-card h2 {
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--color-text);
    margin: 0;
}

.btn-export {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background-color: var(--color-success);
    color: white;
    border: none;
    border-radius: var(--border-radius);
    cursor: pointer;
    font-size: 0.9rem;
    font-weight: 500;
    transition: var(--transition);
}

.btn-export:hover:not(:disabled) {
    background-color: #059669;
    transform: translateY(-1px);
}

.btn-export:disabled {
    background-color: var(--color-text-muted);
    cursor: not-allowed;
    transform: none;
    opacity: 0.6;
}

.export-icon {
    font-size: 1rem;
}

.chart-container {
    position: relative;
    height: 300px;
    width: 100%;
    margin-bottom: 1.5rem;
}

.chart-summary {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 1rem;
    padding-top: 1rem;
    border-top: 1px solid var(--color-border);
}

.summary-item {
    text-align: center;
    padding: 1rem;
    background-color: var(--color-primary);
    border-radius: var(--border-radius);
}

.summary-label {
    display: block;
    font-size: 0.8rem;
    color: var(--color-text-light);
    margin-bottom: 0.5rem;
    font-weight: 500;
}

.summary-value {
    display: block;
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--color-text);
}

.occupation-content {
    margin-top: 1rem;
}

.metrics-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1.5rem;
}

.metric-card {
    background-color: var(--color-primary);
    padding: 1.5rem;
    border-radius: var(--border-radius);
    border-left: 4px solid var(--color-accent);
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    transition: var(--transition);
}

.metric-card:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-medium);
}

.metric-card .metric-icon {
    width: 48px;
    height: 48px;
    border-radius: 10px;
    background-color: var(--color-primary-light);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.occupation-icon::before {
    content: '📊';
    font-size: 1.5rem;
}

.duration-icon::before {
    content: '⏱️';
    font-size: 1.5rem;
}

.metric-content {
    flex: 1;
}

.metric-content h3 {
    font-size: 0.9rem;
    font-weight: 600;
    color: var(--color-text-light);
    margin: 0 0 0.5rem 0;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.metric-value {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--color-text);
    margin: 0 0 0.5rem 0;
    line-height: 1;
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

.comparative-content {
    margin-top: 1rem;
}

.comparative-metrics {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    margin-top: 1.5rem;
    padding-top: 1.5rem;
    border-top: 1px solid var(--color-border);
}

.comparative-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    background-color: var(--color-primary);
    border-radius: var(--border-radius);
    transition: var(--transition);
}

.comparative-item:hover {
    background-color: var(--color-primary-light);
    transform: translateX(4px);
}

.comparative-label {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    font-weight: 500;
    color: var(--color-text);
}

.comparative-label.guest .color-dot {
    background-color: var(--color-accent);
    
}

.comparative-label.membership .color-dot {
    background-color: var(--color-success);
}

.color-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
}

.comparative-value {
    font-weight: 600;
    color: var(--color-text);
    font-size: 1.1rem;
}

.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 3rem;
    color: var(--color-text-light);
    text-align: center;
    background-color: var(--color-primary);
    border-radius: var(--border-radius);
    border: 1px dashed var(--color-border);
}

.empty-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
    opacity: 0.5;
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}

/* Responsive */
@media (max-width: 768px) {
    .date-range-card .card-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
    }

    .date-presets {
        width: 100%;
        justify-content: space-between;
    }

    .date-presets button {
        flex: 1;
        text-align: center;
    }

    .report-card .card-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
    }

    .metrics-grid {
        grid-template-columns: 1fr;
    }

    .metric-card {
        flex-direction: column;
        text-align: center;
        gap: 1rem;
    }

    .metric-icon {
        align-self: center;
    }

    .chart-summary {
        grid-template-columns: 1fr;
    }
}

@media (max-width: 480px) {
    .report-card {
        padding: 1.5rem;
    }

    .date-range-selector {
        grid-template-columns: 1fr;
    }

    .comparative-item {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.5rem;
    }
}
</style>