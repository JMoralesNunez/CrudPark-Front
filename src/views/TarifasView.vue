<template>
    <div class="tarifas-view">
        <h1>Gestión de Tarifas</h1>

        <!-- Formulario para Editar Tarifa -->
        <div class="form-card">
            <h2>{{ editingRate.rateId ? 'Editar Tarifa' : 'Seleccione una tarifa para editar' }}</h2>
            <form @submit.prevent="saveRate" v-if="editingRate.rateId">
                <div class="form-group">
                    <label for="description">Descripción:</label>
                    <input type="text" id="description" v-model="rateForm.description" required>
                </div>
                <div class="form-group">
                    <label for="vehicleType">Tipo de Vehículo:</label>
                    <select id="vehicleType" v-model="rateForm.vehicleType" required>
                        <option value="">Seleccione...</option>
                        <option value="Carro">Carro</option>
                        <option value="Moto">Moto</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="hourlyRate">Valor Base por Hora:</label>
                    <input type="number" id="hourlyRate" v-model.number="rateForm.hourlyRate" min="0" step="0.01"
                        required>
                </div>
                <div class="form-group">
                    <label for="fractionRate">Valor Adicional por Fracción:</label>
                    <input type="number" id="fractionRate" v-model.number="rateForm.fractionRate" min="0" step="0.01"
                        required>
                </div>
                <div class="form-group">
                    <label for="dailyCap">Tope Diario:</label>
                    <input type="number" id="dailyCap" v-model.number="rateForm.dailyCap" min="0" step="0.01" required>
                </div>
                <div class="form-group">
                    <label for="gracePeriodMinutes">Tiempo de Gracia (minutos):</label>
                    <input type="number" id="gracePeriodMinutes" v-model.number="rateForm.gracePeriodMinutes" min="30"
                        required>
                </div>
                <div class="form-group">
                    <label for="isActive">Activa:</label>
                    <input type="checkbox" id="isActive" v-model="rateForm.isActive">
                </div>

                <button type="submit" :disabled="formLoading">Guardar Cambios</button>
                <button type="button" @click="cancelEdit">Cancelar</button>
            </form>
            <p v-if="formError" class="error-message">{{ formError }}</p>
            <p v-if="formSuccess" class="success-message">{{ formSuccess }}</p>
        </div>

        <!-- Listado de Tarifas Activas -->
        <div class="list-card">
            <h2>Listado de Tarifas Activas</h2>
            <p v-if="loading">Cargando tarifas...</p>
            <p v-else-if="error" class="error-message">Error al cargar tarifas: {{ error }}</p>
            <table v-else-if="activeRates.length">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Descripción</th>
                        <th>Tipo Vehículo</th>
                        <th>Valor/Hora</th>
                        <th>Valor/Fracción</th>
                        <th>Tope Diario</th>
                        <th>Tiempo Gracia (min)</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="rate in activeRates" :key="rate.rateId">
                        <td>{{ rate.rateId }}</td>
                        <td>{{ rate.description }}</td>
                        <td>{{ rate.vehicleType }}</td>
                        <td>{{ formatCurrency(rate.hourlyRate) }}</td>
                        <td>{{ formatCurrency(rate.fractionRate) }}</td>
                        <td>{{ formatCurrency(rate.dailyCap) }}</td>
                        <td>{{ rate.gracePeriodMinutes }}</td>
                        <td>
                            <button @click="editRate(rate)">Editar</button>
                            <button @click="deactivateRate(rate)" class="button-inactivate">
                                Desactivar
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
            <p v-else>No hay tarifas activas registradas.</p>
        </div>

        <!-- Listado de Tarifas Inactivas (Opcional, pero útil para reactivar) -->
        <div class="list-card" v-if="inactiveRates.length">
            <h2>Tarifas Inactivas</h2>
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Descripción</th>
                        <th>Tipo Vehículo</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="rate in inactiveRates" :key="rate.rateId">
                        <td>{{ rate.rateId }}</td>
                        <td>{{ rate.description }}</td>
                        <td>{{ rate.vehicleType }}</td>
                        <td>
                            <button @click="activateRate(rate)" class="button-activate">
                                Activar
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script>
export default {
    name: 'TarifasView',
    data() {
        return {
            allRates: [], // Almacena todas las tarifas (activas e inactivas)
            loading: false,
            error: null,
            formLoading: false,
            formError: null,
            formSuccess: null,
            rateForm: {
                description: '',
                vehicleType: '',
                hourlyRate: 0,
                fractionRate: 0,
                dailyCap: 0,
                gracePeriodMinutes: 30, // Default mínimo
                isActive: true,
            },
            editingRate: {} // Tarifa que se está editando
        };
    },
    computed: {
        activeRates() {
            return this.allRates.filter(rate => rate.isActive);
        },
        inactiveRates() {
            return this.allRates.filter(rate => !rate.isActive);
        }
    },
    methods: {
        async fetchRates() {
            this.loading = true;
            this.error = null;
            try {
                const response = await this.$axios.get('/Rates');
                this.allRates = response.data; // Almacenamos todas las tarifas
                console.log('Tarifas cargadas:', this.allRates);
            } catch (err) {
                this.error = err.response?.data?.message || err.message || 'Error al obtener tarifas.';
                console.error('Error al obtener tarifas:', err);
            } finally {
                this.loading = false;
            }
        },

        async saveRate() {
            this.formLoading = true;
            this.formError = null;
            this.formSuccess = null;
            try {
                // Siempre es un PUT en este caso, ya que no hay POST para crear tarifas
                // Asumiendo que el formulario solo se activa para editar una tarifa existente.
                if (!this.editingRate.rateId) {
                    this.formError = "No hay una tarifa seleccionada para editar.";
                    return;
                }

                const payload = {
                    description: this.rateForm.description,
                    vehicleType: this.rateForm.vehicleType,
                    hourlyRate: parseFloat(this.rateForm.hourlyRate), // Asegurar que sean números
                    fractionRate: parseFloat(this.rateForm.fractionRate),
                    dailyCap: parseFloat(this.rateForm.dailyCap),
                    gracePeriodMinutes: parseInt(this.rateForm.gracePeriodMinutes, 10),
                    isActive: this.rateForm.isActive
                };
                await this.$axios.put(`/Rates/${this.editingRate.rateId}`, payload);
                this.formSuccess = 'Tarifa actualizada con éxito!';

                this.resetForm();
                await this.fetchRates(); // Recargar la lista
            } catch (err) {
                this.formError = err.response?.data?.message || err.response?.data || err.message || 'Error al guardar tarifa.';
                console.error('Error al guardar tarifa:', err.response?.data || err.message);
            } finally {
                this.formLoading = false;
            }
        },

        editRate(rate) {
            // Cargar los datos de la tarifa en el formulario para edición
            this.editingRate = { ...rate };
            this.rateForm = { ...rate }; // Copia todas las propiedades
            window.scrollTo({ top: 0, behavior: 'smooth' }); // Desplazar al formulario
        },

        async deactivateRate(rate) {
            if (!confirm(`¿Estás seguro de desactivar la tarifa "${rate.description}" para ${rate.vehicleType}?`)) {
                return;
            }
            this.formLoading = true;
            this.formError = null;
            this.formSuccess = null;
            try {
                const payload = { ...rate, isActive: false }; // Mantener los otros campos, solo cambiar isActive
                await this.$axios.put(`/Rates/${rate.rateId}`, payload);
                this.formSuccess = 'Tarifa desactivada con éxito!';
                await this.fetchRates();
            } catch (err) {
                this.formError = err.response?.data?.message || err.response?.data || err.message || 'Error al desactivar tarifa.';
                console.error('Error al desactivar tarifa:', err.response?.data || err.message);
            } finally {
                this.formLoading = false;
            }
        },

        async activateRate(rate) {
            if (!confirm(`¿Estás seguro de activar la tarifa "${rate.description}" para ${rate.vehicleType}?`)) {
                return;
            }
            this.formLoading = true;
            this.formError = null;
            this.formSuccess = null;
            try {
                const payload = { ...rate, isActive: true }; // Mantener los otros campos, solo cambiar isActive
                await this.$axios.put(`/Rates/${rate.rateId}`, payload);
                this.formSuccess = 'Tarifa activada con éxito!';
                await this.fetchRates();
            } catch (err) {
                this.formError = err.response?.data?.message || err.response?.data || err.message || 'Error al activar tarifa.';
                console.error('Error al activar tarifa:', err.response?.data || err.message);
            } finally {
                this.formLoading = false;
            }
        },

        resetForm() {
            this.rateForm = {
                description: '',
                vehicleType: '',
                hourlyRate: 0,
                fractionRate: 0,
                dailyCap: 0,
                gracePeriodMinutes: 30,
                isActive: true,
            };
            this.editingRate = {}; // Sale del modo edición
            this.formError = null;
            this.formSuccess = null;
        },

        cancelEdit() {
            this.resetForm();
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
        this.fetchRates();
    }
};
</script>

<style scoped>
.tarifas-view {
    padding: 20px;
    text-align: center;
}

h1 {
    color: #333;
    margin-bottom: 30px;
}

.form-card,
.list-card {
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    padding: 30px;
    margin: 30px auto;
    max-width: 900px;
    text-align: left;
}

.form-card h2,
.list-card h2 {
    color: #42b983;
    border-bottom: 2px solid #eee;
    padding-bottom: 15px;
    margin-bottom: 25px;
}

.form-group {
    margin-bottom: 20px;
}

.form-group label {
    display: block;
    margin-bottom: 8px;
    font-weight: bold;
    color: #555;
}

.form-group input[type="text"],
.form-group input[type="number"],
.form-group select {
    width: calc(100% - 20px);
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 5px;
    font-size: 1em;
}

.form-group input[type="checkbox"] {
    margin-top: 5px;
    transform: scale(1.2);
    margin-left: 5px;
}

button {
    background-color: #42b983;
    color: white;
    padding: 10px 20px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 1em;
    margin-right: 10px;
    transition: background-color 0.3s ease;
}

button:hover {
    background-color: #36a172;
}

button:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
}

.button-inactivate {
    background-color: #e74c3c;
}

.button-inactivate:hover {
    background-color: #c0392b;
}

.button-activate {
    background-color: #3498db;
}

.button-activate:hover {
    background-color: #2980b9;
}

.error-message {
    color: red;
    font-weight: bold;
    margin-top: 15px;
}

.success-message {
    color: green;
    font-weight: bold;
    margin-top: 15px;
}

table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 20px;
}

th,
td {
    border: 1px solid #eee;
    padding: 12px;
    text-align: left;
}

th {
    background-color: #f5f5f5;
    color: #333;
    font-weight: bold;
}

tbody tr:nth-child(even) {
    background-color: #fdfdfd;
}
</style>