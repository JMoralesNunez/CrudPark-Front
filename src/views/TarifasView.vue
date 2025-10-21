<template>
    <div class="tarifas-view">
        <div class="page-header">
            <h1>Gestión de Tarifas</h1>
            <p class="page-subtitle">Configura las tarifas de parqueadero para diferentes tipos de vehículos</p>
        </div>

        <!-- Formulario para Editar Tarifa -->
        <div class="form-card">
            <div class="card-header">
                <h2>{{ editingRate.rateId ? 'Editar Tarifa' : 'Configuración de Tarifas' }}</h2>
                <div class="form-indicator" :class="{ editing: editingRate.rateId }">
                    {{ editingRate.rateId ? 'Modo Edición' : 'Seleccione una tarifa para editar' }}
                </div>
            </div>
            
            <form @submit.prevent="saveRate" v-if="editingRate.rateId" class="rate-form">
                <div class="form-grid">
                    <div class="form-group">
                        <label for="description">Descripción de la Tarifa</label>
                        <input type="text" id="description" v-model="rateForm.description" required 
                               placeholder="Ej: Tarifa estándar para carros">
                    </div>
                    
                    <div class="form-group">
                        <label for="vehicleType">Tipo de Vehículo</label>
                        <select id="vehicleType" v-model="rateForm.vehicleType" required>
                            <option value="">Seleccione el tipo de vehículo...</option>
                            <option value="Carro">Carro</option>
                            <option value="Moto">Moto</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="hourlyRate">Valor por Hora</label>
                        <div class="currency-input">
                            <span class="currency-symbol">$</span>
                            <input type="number" id="hourlyRate" v-model.number="rateForm.hourlyRate" 
                                   min="0" step="100" required placeholder="0">
                        </div>
                        <span class="input-hint">Precio base por cada hora completa</span>
                    </div>
                    
                    <div class="form-group">
                        <label for="fractionRate">Valor por Fracción</label>
                        <div class="currency-input">
                            <span class="currency-symbol">$</span>
                            <input type="number" id="fractionRate" v-model.number="rateForm.fractionRate" 
                                   min="0" step="100" required placeholder="0">
                        </div>
                        <span class="input-hint">Precio por fracciones de hora adicionales</span>
                    </div>
                    
                    <div class="form-group">
                        <label for="dailyCap">Tope Diario</label>
                        <div class="currency-input">
                            <span class="currency-symbol">$</span>
                            <input type="number" id="dailyCap" v-model.number="rateForm.dailyCap" 
                                   min="0" step="1000" required placeholder="0">
                        </div>
                        <span class="input-hint">Máximo a cobrar por día</span>
                    </div>
                    
                    <div class="form-group">
                        <label for="gracePeriodMinutes">Tiempo de Gracia</label>
                        <div class="time-input">
                            <input type="number" id="gracePeriodMinutes" v-model.number="rateForm.gracePeriodMinutes" 
                                   min="30" max="120" required>
                            <span class="time-unit">minutos</span>
                        </div>
                        <span class="input-hint">Tiempo gratuito antes de comenzar a cobrar</span>
                    </div>
                    
                    <div class="form-group checkbox-group">
                        <label class="checkbox-label">
                            <input type="checkbox" id="isActive" v-model="rateForm.isActive">
                            <span class="checkmark"></span>
                            Tarifa Activa
                        </label>
                        <span class="checkbox-description">Las tarifas inactivas no se aplican a los vehículos</span>
                    </div>
                </div>

                <div class="form-actions">
                    <button type="submit" class="btn-primary" :disabled="formLoading">
                        <span v-if="formLoading" class="button-loader"></span>
                        Guardar Cambios
                    </button>
                    <button type="button" class="btn-secondary" @click="cancelEdit">
                        Cancelar
                    </button>
                </div>
            </form>
            
            <div v-if="formError" class="error-message">
                <div class="error-icon">!</div>
                <p>{{ formError }}</p>
            </div>
            
            <div v-if="formSuccess" class="success-message">
                <div class="success-icon">✓</div>
                <p>{{ formSuccess }}</p>
            </div>
        </div>

        <!-- Listado de Tarifas Activas -->
        <div class="list-card">
            <div class="card-header">
                <h2>Tarifas Activas</h2>
                <div class="rates-count">
                    <span class="count">{{ activeRates.length }}</span>
                    <span class="label">tarifas activas</span>
                </div>
            </div>

            <div v-if="loading" class="loading-state">
                <div class="loading-spinner"></div>
                <p>Cargando tarifas...</p>
            </div>
            
            <div v-else-if="error" class="error-state">
                <div class="error-icon">!</div>
                <p>Error al cargar tarifas: {{ error }}</p>
                <button class="retry-button" @click="fetchRates">Reintentar</button>
            </div>
            
            <div v-else-if="activeRates.length" class="table-container">
                <table class="rates-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Descripción</th>
                            <th>Tipo</th>
                            <th>Valor/Hora</th>
                            <th>Fracción</th>
                            <th>Tope Diario</th>
                            <th>Tiempo Gracia</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="rate in activeRates" :key="rate.rateId" 
                            :class="'vehicle-' + rate.vehicleType.toLowerCase()">
                            <td class="rate-id">{{ rate.rateId }}</td>
                            <td class="rate-description">{{ rate.description }}</td>
                            <td>
                                <span class="vehicle-badge" :class="rate.vehicleType.toLowerCase()">
                                    {{ rate.vehicleType }}
                                </span>
                            </td>
                            <td class="rate-value">{{ formatCurrency(rate.hourlyRate) }}</td>
                            <td class="rate-value">{{ formatCurrency(rate.fractionRate) }}</td>
                            <td class="rate-value">{{ formatCurrency(rate.dailyCap) }}</td>
                            <td class="grace-period">
                                <span class="time-badge">{{ rate.gracePeriodMinutes }} min</span>
                            </td>
                            <td class="actions">
                                <button @click="editRate(rate)" class="btn-edit">
                                    Editar
                                </button>
                                <button @click="deactivateRate(rate)" class="btn-inactivate">
                                    Desactivar
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
            
            <div v-else class="empty-state">
                <div class="empty-icon">💰</div>
                <p>No hay tarifas activas</p>
                <p class="empty-subtitle">Active una tarifa existente o contacte al administrador</p>
            </div>
        </div>

        <!-- Listado de Tarifas Inactivas -->
        <div class="list-card" v-if="inactiveRates.length">
            <div class="card-header">
                <h2>Tarifas Inactivas</h2>
                <div class="rates-count inactive">
                    <span class="count">{{ inactiveRates.length }}</span>
                    <span class="label">tarifas inactivas</span>
                </div>
            </div>

            <div class="table-container">
                <table class="rates-table inactive-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Descripción</th>
                            <th>Tipo</th>
                            <th>Valor/Hora</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="rate in inactiveRates" :key="rate.rateId"
                            :class="'vehicle-' + rate.vehicleType.toLowerCase()">
                            <td class="rate-id">{{ rate.rateId }}</td>
                            <td class="rate-description">{{ rate.description }}</td>
                            <td>
                                <span class="vehicle-badge" :class="rate.vehicleType.toLowerCase()">
                                    {{ rate.vehicleType }}
                                </span>
                            </td>
                            <td class="rate-value">{{ formatCurrency(rate.hourlyRate) }}</td>
                            <td class="actions">
                                <button @click="activateRate(rate)" class="btn-activate">
                                    Activar
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'TarifasView',
    data() {
        return {
            allRates: [],
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
                gracePeriodMinutes: 30,
                isActive: true,
            },
            editingRate: {}
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
                this.allRates = response.data;
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
                if (!this.editingRate.rateId) {
                    this.formError = "No hay una tarifa seleccionada para editar.";
                    return;
                }

                const payload = {
                    description: this.rateForm.description,
                    vehicleType: this.rateForm.vehicleType,
                    hourlyRate: parseFloat(this.rateForm.hourlyRate),
                    fractionRate: parseFloat(this.rateForm.fractionRate),
                    dailyCap: parseFloat(this.rateForm.dailyCap),
                    gracePeriodMinutes: parseInt(this.rateForm.gracePeriodMinutes, 10),
                    isActive: this.rateForm.isActive
                };
                await this.$axios.put(`/Rates/${this.editingRate.rateId}`, payload);
                this.formSuccess = 'Tarifa actualizada con éxito!';

                this.resetForm();
                await this.fetchRates();
            } catch (err) {
                this.formError = err.response?.data?.message || err.response?.data || err.message || 'Error al guardar tarifa.';
                console.error('Error al guardar tarifa:', err.response?.data || err.message);
            } finally {
                this.formLoading = false;
            }
        },

        editRate(rate) {
            this.editingRate = { ...rate };
            this.rateForm = { ...rate };
            window.scrollTo({ top: 0, behavior: 'smooth' });
        },

        async deactivateRate(rate) {
            if (!confirm(`¿Estás seguro de desactivar la tarifa "${rate.description}" para ${rate.vehicleType}?`)) {
                return;
            }
            this.formLoading = true;
            this.formError = null;
            this.formSuccess = null;
            try {
                const payload = { ...rate, isActive: false };
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
                const payload = { ...rate, isActive: true };
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
            this.editingRate = {};
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

.form-card,
.list-card {
    background-color: var(--color-card);
    border-radius: var(--border-radius);
    box-shadow: var(--shadow-light);
    padding: 2rem;
    margin-bottom: 2rem;
    border: 1px solid var(--color-border);
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid var(--color-border);
}

.card-header h2 {
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--color-text);
    margin: 0;
}

.form-indicator {
    padding: 0.25rem 0.75rem;
    background-color: var(--color-primary-light);
    color: var(--color-text-light);
    border-radius: 20px;
    font-size: 0.8rem;
    font-weight: 500;
}

.form-indicator.editing {
    background-color: var(--color-warning);
    color: white;
}

.rates-count {
    display: flex;
    align-items: baseline;
    gap: 0.5rem;
}

.rates-count .count {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--color-accent);
}

.rates-count.inactive .count {
    color: var(--color-text-muted);
}

.rates-count .label {
    color: var(--color-text-light);
    font-size: 0.9rem;
}

.rate-form {
    margin-bottom: 1rem;
}

.form-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
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

.form-group input[type="text"],
.form-group input[type="number"],
.form-group select {
    padding: 0.75rem;
    background-color: var(--color-primary);
    border: 1px solid var(--color-border);
    border-radius: var(--border-radius);
    color: var(--color-text);
    font-size: 0.95rem;
    transition: var(--transition);
}

.form-group input:focus,
.form-group select:focus {
    outline: none;
    border-color: var(--color-accent);
    box-shadow: 0 0 0 2px rgba(67, 97, 238, 0.2);
}

.currency-input,
.time-input {
    position: relative;
    display: flex;
    align-items: center;
}

.currency-symbol {
    position: absolute;
    left: 0.75rem;
    color: var(--color-text-muted);
    font-weight: 600;
    z-index: 1;
}

.currency-input input {
    padding-left: 2rem !important;
}

.time-unit {
    position: absolute;
    right: 0.75rem;
    color: var(--color-text-muted);
    font-size: 0.8rem;
}

.time-input input {
    padding-right: 4rem !important;
}

.input-hint {
    font-size: 0.8rem;
    color: var(--color-text-muted);
    margin-top: 0.25rem;
}

.checkbox-group {
    margin-top: 1rem;
}

.checkbox-label {
    display: flex;
    align-items: center;
    cursor: pointer;
    font-weight: 500;
    color: var(--color-text);
    margin-bottom: 0.5rem;
}

.checkbox-label input {
    display: none;
}

.checkmark {
    width: 20px;
    height: 20px;
    border: 2px solid var(--color-border);
    border-radius: 4px;
    margin-right: 0.75rem;
    position: relative;
    transition: var(--transition);
}

.checkbox-label input:checked + .checkmark {
    background-color: var(--color-accent);
    border-color: var(--color-accent);
}

.checkbox-label input:checked + .checkmark::after {
    content: '';
    position: absolute;
    left: 6px;
    top: 2px;
    width: 4px;
    height: 8px;
    border: solid white;
    border-width: 0 2px 2px 0;
    transform: rotate(45deg);
}

.checkbox-description {
    font-size: 0.8rem;
    color: var(--color-text-muted);
    margin-left: 2rem;
}

.form-actions {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
}

.btn-primary,
.btn-secondary,
.btn-edit,
.btn-inactivate,
.btn-activate {
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: var(--border-radius);
    font-weight: 600;
    cursor: pointer;
    transition: var(--transition);
    font-size: 0.9rem;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
}

.btn-primary {
    background-color: var(--color-accent);
    color: white;
}

.btn-primary:hover:not(:disabled) {
    background-color: var(--color-accent-light);
    transform: translateY(-1px);
}

.btn-primary:disabled {
    background-color: var(--color-text-muted);
    cursor: not-allowed;
    transform: none;
}

.btn-secondary {
    background-color: transparent;
    color: var(--color-text);
    border: 1px solid var(--color-border);
}

.btn-secondary:hover {
    background-color: var(--color-primary-light);
}

.btn-edit {
    background-color: var(--color-warning);
    color: white;
    padding: 0.5rem 1rem;
    font-size: 0.8rem;
}

.btn-edit:hover {
    background-color: #e67e22;
}

.btn-inactivate {
    background-color: var(--color-danger);
    color: white;
    padding: 0.5rem 1rem;
    font-size: 0.8rem;
}

.btn-inactivate:hover {
    background-color: #dc2626;
}

.btn-activate {
    background-color: var(--color-success);
    color: white;
    padding: 0.5rem 1rem;
    font-size: 0.8rem;
}

.btn-activate:hover {
    background-color: #059669;
}

.button-loader {
    width: 16px;
    height: 16px;
    border: 2px solid transparent;
    border-top: 2px solid white;
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

.error-message,
.error-state,
.success-message {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 1rem;
    border-radius: var(--border-radius);
    margin-top: 1rem;
}

.error-message,
.error-state {
    background-color: rgba(239, 68, 68, 0.1);
    border: 1px solid var(--color-danger);
    color: var(--color-danger);
}

.success-message {
    background-color: rgba(16, 185, 129, 0.1);
    border: 1px solid var(--color-success);
    color: var(--color-success);
}

.error-icon,
.success-icon {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.8rem;
    font-weight: bold;
    flex-shrink: 0;
}

.error-icon {
    background-color: var(--color-danger);
    color: white;
}

.success-icon {
    background-color: var(--color-success);
    color: white;
}

.loading-state,
.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 3rem;
    color: var(--color-text-light);
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

.empty-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
    opacity: 0.5;
}

.empty-subtitle {
    font-size: 0.9rem;
    margin-top: 0.5rem;
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
}

.retry-button:hover {
    background-color: var(--color-accent-light);
}

.table-container {
    overflow-x: auto;
    border-radius: var(--border-radius);
    border: 1px solid var(--color-border);
}

.rates-table {
    width: 100%;
    border-collapse: collapse;
    background-color: var(--color-card);
}

.rates-table th {
    background-color: var(--color-primary);
    color: var(--color-text);
    font-weight: 600;
    padding: 1rem;
    text-align: left;
    font-size: 0.85rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    border-bottom: 1px solid var(--color-border);
}

.rates-table td {
    padding: 1rem;
    border-bottom: 1px solid var(--color-border);
    color: var(--color-text);
}

.rates-table tbody tr:hover {
    background-color: var(--color-primary-light);
}

.rates-table.inactive-table tbody tr {
    opacity: 0.7;
}

.rate-id {
    font-family: 'Monaco', 'Consolas', monospace;
    font-size: 0.85rem;
    color: var(--color-text-light);
}

.rate-description {
    font-weight: 500;
    max-width: 200px;
}

.rate-value {
    font-family: 'Monaco', 'Consolas', monospace;
    font-weight: 600;
    color: var(--color-success);
}

.vehicle-badge {
    padding: 0.25rem 0.75rem;
    border-radius: 20px;
    font-size: 0.8rem;
    font-weight: 600;
    text-transform: uppercase;
}

.vehicle-badge.carro {
    background-color: rgba(67, 97, 238, 0.2);
    color: var(--color-accent);
}

.vehicle-badge.moto {
    background-color: rgba(139, 69, 19, 0.2);
    color: #8b4513;
}

.grace-period {
    text-align: center;
}

.time-badge {
    padding: 0.25rem 0.5rem;
    background-color: var(--color-primary-light);
    color: var(--color-text);
    border-radius: 4px;
    font-size: 0.8rem;
    font-weight: 600;
}

.actions {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

/* Responsive */
@media (max-width: 768px) {
    .form-grid {
        grid-template-columns: 1fr;
    }
    
    .card-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.5rem;
    }
    
    .rates-table {
        font-size: 0.8rem;
    }
    
    .rates-table th,
    .rates-table td {
        padding: 0.75rem 0.5rem;
    }
    
    .actions {
        flex-direction: column;
    }
}

@media (max-width: 480px) {
    .form-card,
    .list-card {
        padding: 1.5rem;
    }
    
    .form-actions {
        flex-direction: column;
    }
    
    .btn-primary,
    .btn-secondary {
        width: 100%;
        justify-content: center;
    }
}
</style>