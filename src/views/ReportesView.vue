<template>
    <div class="reportes-view">
        <h1>Reportes y Análisis</h1>

        <div class="date-range-selector">
            <div class="form-group">
                <label for="startDate">Fecha de Inicio:</label>
                <input type="date" id="startDate" v-model="startDate" @change="fetchReports">
            </div>
            <div class="form-group">
                <label for="endDate">Fecha de Fin:</label>
                <input type="date" id="endDate" v-model="endDate" @change="fetchReports">
            </div>
        </div>

        <p v-if="loading" class="loading-message">Cargando reportes...</p>
        <p v-if="error" class="error-message">{{ error }}</p>

        <!-- 1. Gráfica de Ingresos Diarios/Semanales/Mensuales -->
        <div class="report-section">
            <h2>Ingresos Diarios</h2>
            <div class="chart-container" v-if="dailyIncomeChartData.labels.length > 0">
                <LineChart :chart-data="dailyIncomeChartData" />
            </div>
            <p v-else-if="!loading">No hay datos de ingresos para el rango de fechas seleccionado.</p>
            <button @click="exportDailyIncomeCsv" :disabled="!dailyIncomeData.length">Exportar Ingresos (CSV)</button>
        </div>

        <!-- 2. Promedio de Ocupación -->
        <div class="report-section">
            <h2>Promedio de Ocupación</h2>
            <div v-if="occupationData.averageOccupationPercentage !== null">
                <div class="occupation-metrics">
                    <div class="metric-item">
                        <h3>Porcentaje de Ocupación:</h3>
                        <p>{{ occupationData.averageOccupationPercentage.toFixed(2) }}%</p>
                    </div>
                    <div class="metric-item">
                        <h3>Duración Promedio de Estancia:</h3>
                        <p>{{ occupationData.averageStayDuration }}</p>
                    </div>
                </div>
            </div>
            <p v-else-if="!loading">No hay datos de ocupación para el rango de fechas seleccionado.</p>
        </div>

        <!-- 3. Comparativa de Mensualidades vs Invitados -->
        <div class="report-section">
            <h2>Comparativa de mensualidades e invitados.</h2>
            <div class="chart-container" v-if="membershipVsGuestChartData.labels.length > 0">
                <BarChart :chart-data="membershipVsGuestChartData" />
            </div>
            <p v-else-if="!loading">No hay datos de comparativa para el rango de fechas seleccionado.</p>
            <div v-if="membershipVsGuestData.guestIncome !== null" class="comparative-metrics">
                <p>Ingresos de Invitados: {{ formatCurrency(membershipVsGuestData.guestIncome) }}</p>
                <p>Entradas de Invitados: {{ membershipVsGuestData.guestEntries }}</p>
                <p>Entradas de Mensualidades: {{ membershipVsGuestData.membershipEntries }}</p>
            </div>
        </div>

        <!-- 4. Exportar datos a CSV (el botón ya está en cada sección relevante) -->

    </div>
</template>

<script>
import { Line, Bar } from 'vue-chartjs';
import { Chart as ChartJS, Title, Tooltip, Legend, LineElement, PointElement, CategoryScale, LinearScale, BarElement } from 'chart.js';

// Registrar los componentes y escalas necesarios para Chart.js
ChartJS.register(Title, Tooltip, Legend, LineElement, PointElement, CategoryScale, LinearScale, BarElement);

export default {
    name: 'ReportesView',
    components: {
        LineChart: Line,
        BarChart: Bar,
    },
    data() {
        const today = new Date();
        const thirtyDaysAgo = new Date(today);
        thirtyDaysAgo.setDate(today.getDate() - 30);

        return {
            startDate: this.formatDateForInput(thirtyDaysAgo),
            endDate: this.formatDateForInput(today),

            loading: false,
            error: null,

            dailyIncomeData: [],
            occupationData: {
                averageOccupationPercentage: null,
                averageStayDuration: null,
            },
            membershipVsGuestData: {
                guestIncome: null,
                guestEntries: null,
                membershipEntries: null,
            },
        };
    },
    computed: {
        dailyIncomeChartData() {
            const labels = this.dailyIncomeData.map(item => this.formatDate(item.date));
            const amounts = this.dailyIncomeData.map(item => item.totalAmount);

            return {
                labels: labels,
                datasets: [
                    {
                        label: 'Ingresos Diarios',
                        backgroundColor: '#42b983',
                        borderColor: '#42b983',
                        data: amounts,
                        fill: false,
                        tension: 0.1,
                    }
                ]
            };
        },
        membershipVsGuestChartData() {
            const labels = ['Ingresos Invitados', 'Entradas Invitados', 'Entradas Mensualidades'];
            const data = [
                this.membershipVsGuestData.guestIncome,
                this.membershipVsGuestData.guestEntries,
                this.membershipVsGuestData.membershipEntries,
            ];

            return {
                labels: labels,
                datasets: [
                    {
                        label: 'Comparativa',
                        backgroundColor: ['#3498db', '#f1c40f', '#9b59b6'],
                        data: data,
                    }
                ]
            };
        }
    },
    methods: {
        async fetchReports() {
            this.loading = true;
            this.error = null;
            try {
                // Fetch Ingresos Diarios
                const dailyIncomeResponse = await this.$axios.get(`/Reports/daily-income?startDate=${this.startDate}&endDate=${this.endDate}`);
                this.dailyIncomeData = dailyIncomeResponse.data;

                // Fetch Ocupación
                const occupationResponse = await this.$axios.get(`/Reports/occupation?startDate=${this.startDate}&endDate=${this.endDate}`);
                this.occupationData = occupationResponse.data;

                // Fetch Mensualidades vs Invitados
                const membershipVsGuestResponse = await this.$axios.get(`/Reports/membership-vs-guest?startDate=${this.startDate}&endDate=${this.endDate}`);
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
                    responseType: 'blob' // Importante para recibir un archivo binario
                });

                // Crear un enlace temporal para descargar el archivo
                const url = window.URL.createObjectURL(new Blob([response.data]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', `ingresos-diarios-${this.startDate}_${this.endDate}.csv`);
                document.body.appendChild(link);
                link.click();
                link.remove();
                window.URL.revokeObjectURL(url); // Limpiar URL
            } catch (err) {
                this.error = 'Error al exportar a CSV: ' + (err.response?.data || err.message);
                console.error('Error al exportar CSV:', err);
            }
        },

        formatDate(isoString) {
            if (!isoString) return 'N/A';
            const date = new Date(isoString);
            return date.toLocaleDateString('es-CO');
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
            });
        }
    },
    mounted() {
        this.fetchReports(); 
    }
};
</script>

<style scoped>
.reportes-view {
    padding: 20px;
    text-align: center;
}

h1 {
    color: #333;
    margin-bottom: 30px;
}

.date-range-selector {
    display: flex;
    justify-content: center;
    gap: 20px;
    margin-bottom: 40px;
    padding: 20px;
    background-color: #f9f9f9;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    max-width: 800px;
    margin: 0 auto 40px auto;
}

.form-group {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
}

.form-group label {
    font-weight: bold;
    margin-bottom: 5px;
    color: #555;
}

.form-group input[type="date"] {
    padding: 8px 12px;
    border: 1px solid #ccc;
    border-radius: 5px;
    font-size: 1em;
    width: 150px;
}

.loading-message,
.error-message {
    padding: 15px;
    font-size: 1.1em;
    margin-top: 20px;
    border-radius: 5px;
}

.error-message {
    color: #e74c3c;
    background-color: #fce4e4;
    border: 1px solid #e74c3c;
}

.loading-message {
    color: #3498db;
    background-color: #e8f5fd;
    border: 1px solid #3498db;
}

.report-section {
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    padding: 30px;
    margin: 30px auto;
    max-width: 900px;
    text-align: left;
}

.report-section h2 {
    color: #42b983;
    border-bottom: 2px solid #eee;
    padding-bottom: 15px;
    margin-bottom: 25px;
}

.chart-container {
    position: relative;
    height: 300px;
    /* Altura fija para las gráficas */
    width: 100%;
    margin-bottom: 20px;
}

.occupation-metrics,
.comparative-metrics {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
    justify-content: center;
    margin-top: 20px;
    font-size: 1.1em;
}

.metric-item {
    background-color: #f0f0f0;
    padding: 15px 20px;
    border-radius: 5px;
    text-align: center;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.metric-item h3 {
    margin: 0 0 5px 0;
    color: #2c3e50;
    font-size: 1em;
}

.metric-item p {
    margin: 0;
    font-weight: bold;
    color: #42b983;
    font-size: 1.2em;
}

button {
    background-color: #3498db;
    color: white;
    padding: 10px 20px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 1em;
    margin-top: 20px;
    transition: background-color 0.3s ease;
}

button:hover {
    background-color: #2980b9;
}

button:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
}
</style>