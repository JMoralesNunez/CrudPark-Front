<template>
    <div class="mensualidades-view">
        <div class="page-header">
            <h1>Gestión de Mensualidades</h1>
            <p class="page-subtitle">Administra las membresías y suscripciones de vehículos</p>
        </div>

        <!-- Formulario para Registrar/Editar Mensualidad -->
        <div class="form-card">
            <div class="card-header">
                <h2>{{ editingMembership.membershipId ? 'Editar Mensualidad' : 'Registrar Nueva Mensualidad' }}</h2>
                <div class="form-indicator" :class="{ editing: editingMembership.membershipId }">
                    {{ editingMembership.membershipId ? 'Modo Edición' : 'Modo Registro' }}
                </div>
            </div>
            
            <form @submit.prevent="saveMembership" class="membership-form">
                <div class="form-grid">
                    <!-- Campos para registro -->
                    <div v-if="!editingMembership.membershipId" class="form-section">
                        <h3 class="section-title">Información del Cliente</h3>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="customerName">Nombre del Cliente</label>
                                <input type="text" id="customerName" v-model="membershipForm.customerName" required 
                                       placeholder="Ingrese el nombre completo">
                            </div>
                            <div class="form-group">
                                <label for="customerEmail">Correo Electrónico</label>
                                <input type="email" id="customerEmail" v-model="membershipForm.customerEmail" required 
                                       placeholder="cliente@ejemplo.com">
                            </div>
                        </div>
                        
                        <h3 class="section-title">Información del Vehículo</h3>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="licensePlate">Placa del Vehículo</label>
                                <input type="text" id="licensePlate" v-model="membershipForm.licensePlate" required 
                                       placeholder="ABC123" class="license-plate">
                            </div>
                            <div class="form-group">
                                <label for="vehicleType">Tipo de Vehículo</label>
                                <select id="vehicleType" v-model="membershipForm.vehicleType" required>
                                    <option value="">Seleccione el tipo...</option>
                                    <option value="Carro">Carro</option>
                                    <option value="Moto">Moto</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <!-- Campos para registro y edición -->
                    <div class="form-section">
                        <h3 class="section-title">Período de la Mensualidad</h3>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="startDate">Fecha de Inicio</label>
                                <input type="date" id="startDate" v-model="membershipForm.startDate" required>
                                <span class="date-hint">Fecha cuando inicia la membresía</span>
                            </div>
                            <div class="form-group">
                                <label for="endDate">Fecha de Fin</label>
                                <input type="date" id="endDate" v-model="membershipForm.endDate" required>
                                <span class="date-hint">Fecha cuando vence la membresía</span>
                            </div>
                        </div>
                    </div>

                    <!-- Solo para edición -->
                    <div class="form-section" v-if="editingMembership.membershipId">
                        <h3 class="section-title">Estado de la Membresía</h3>
                        <div class="form-group checkbox-group">
                            <label class="checkbox-label">
                                <input type="checkbox" id="isActive" v-model="membershipForm.isActive">
                                <span class="checkmark"></span>
                                Membresía Activa
                            </label>
                            <span class="checkbox-description">Cuando está inactiva, el vehículo no puede ingresar al parqueadero</span>
                        </div>
                    </div>
                </div>

                <div class="form-actions">
                    <button type="submit" class="btn-primary" :disabled="formLoading">
                        <span v-if="formLoading" class="button-loader"></span>
                        {{ editingMembership.membershipId ? 'Guardar Cambios' : 'Registrar Mensualidad' }}
                    </button>
                    <button type="button" class="btn-secondary" @click="cancelEdit" v-if="editingMembership.membershipId">
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

        <!-- Listado de Mensualidades -->
        <div class="list-card">
            <div class="card-header">
                <h2>Listado de Mensualidades</h2>
                <div class="memberships-count">
                    <span class="count">{{ memberships.length }}</span>
                    <span class="label">mensualidades</span>
                </div>
            </div>

            <div v-if="loading" class="loading-state">
                <div class="loading-spinner"></div>
                <p>Cargando mensualidades...</p>
            </div>
            
            <div v-else-if="error" class="error-state">
                <div class="error-icon">!</div>
                <p>Error al cargar mensualidades: {{ error }}</p>
                <button class="retry-button" @click="fetchMemberships">Reintentar</button>
            </div>
            
            <div v-else-if="memberships.length" class="table-container">
                <table class="memberships-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Cliente</th>
                            <th>Email</th>
                            <th>Placa</th>
                            <th>Tipo</th>
                            <th>Inicio</th>
                            <th>Fin</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="membership in memberships" :key="membership.membershipId" 
                            :class="{ 
                                'inactive': !membership.isActive,
                                'expiring-soon': isExpiringSoon(membership.endDate),
                                'expired': isExpired(membership.endDate)
                            }">
                            <td class="membership-id">{{ membership.membershipId }}</td>
                            <td class="customer-name">{{ membership.customerName }}</td>
                            <td class="customer-email">{{ membership.customerEmail }}</td>
                            <td class="license-plate">{{ membership.licensePlate }}</td>
                            <td>
                                <span class="vehicle-type" :class="membership.vehicleType.toLowerCase()">
                                    {{ membership.vehicleType }}
                                </span>
                            </td>
                            <td class="start-date">{{ formatDate(membership.startDate) }}</td>
                            <td class="end-date">{{ formatDate(membership.endDate) }}</td>
                            <td>
                                <span class="status-badge" :class="{ 
                                    'status-active': membership.isActive, 
                                    'status-inactive': !membership.isActive 
                                }">
                                    {{ membership.isActive ? 'Activa' : 'Inactiva' }}
                                </span>
                                <div v-if="isExpiringSoon(membership.endDate) && membership.isActive" class="expiry-warning">
                                    Próxima a vencer
                                </div>
                            </td>
                            <td class="actions">
                                <button @click="editMembership(membership)" class="btn-edit">
                                    Editar
                                </button>
                                <button @click="toggleMembershipStatus(membership)"
                                    :class="{ 
                                        'btn-inactivate': membership.isActive, 
                                        'btn-activate': !membership.isActive 
                                    }">
                                    {{ membership.isActive ? 'Inactivar' : 'Activar' }}
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
            
            <div v-else class="empty-state">
                <div class="empty-icon">📋</div>
                <p>No hay mensualidades registradas</p>
                <p class="empty-subtitle">Comienza registrando la primera mensualidad</p>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'MensualidadesView',
    data() {
        return {
            memberships: [],
            loading: false,
            error: null,
            formLoading: false,
            formError: null,
            formSuccess: null,
            membershipForm: {
                customerName: '',
                customerEmail: '',
                licensePlate: '',
                vehicleType: '',
                startDate: this.formatDateForInput(new Date()),
                endDate: this.formatDateForInput(new Date(new Date().setMonth(new Date().getMonth() + 1))),
                isActive: true,
            },
            editingMembership: {}
        };
    },
    methods: {
        async fetchMemberships() {
            this.loading = true;
            this.error = null;
            try {
                const response = await this.$axios.get('/Memberships');
                this.memberships = response.data;
                console.log('Mensualidades cargadas:', this.memberships);
            } catch (err) {
                this.error = err.response?.data || err.message || 'Error al obtener mensualidades.';
                console.error('Error al obtener mensualidades:', err);
            } finally {
                this.loading = false;
            }
        },

        async saveMembership() {
            this.formLoading = true;
            this.formError = null;
            this.formSuccess = null;
            try {
                if (this.editingMembership.membershipId) {
                    const payload = {
                        startDate: this.membershipForm.startDate + 'T00:00:00.000Z',
                        endDate: this.membershipForm.endDate + 'T00:00:00.000Z',
                        isActive: this.membershipForm.isActive
                    };
                    await this.$axios.put(`/Memberships/${this.editingMembership.membershipId}`, payload);
                    this.formSuccess = 'Mensualidad actualizada con éxito!';
                } else {
                    const payload = {
                        customerName: this.membershipForm.customerName,
                        customerEmail: this.membershipForm.customerEmail,
                        licensePlate: this.membershipForm.licensePlate,
                        vehicleType: this.membershipForm.vehicleType,
                        startDate: this.membershipForm.startDate + 'T00:00:00.000Z',
                        endDate: this.membershipForm.endDate + 'T00:00:00.000Z',
                    };
                    await this.$axios.post('/Memberships', payload);
                    this.formSuccess = 'Mensualidad registrada con éxito!';
                }
                this.resetForm();
                await this.fetchMemberships();
            } catch (err) {
                this.formError = err.response?.data?.message || err.response?.data || err.message || 'Error al guardar mensualidad.';
                console.error('Error al guardar mensualidad:', err.response?.data || err.message);
            } finally {
                this.formLoading = false;
            }
        },

        editMembership(membership) {
            this.editingMembership = { ...membership };
            this.membershipForm = {
                customerName: membership.customerName,
                customerEmail: membership.customerEmail,
                licensePlate: membership.licensePlate,
                vehicleType: membership.vehicleType,
                startDate: this.formatDateForInput(new Date(membership.startDate)),
                endDate: this.formatDateForInput(new Date(membership.endDate)),
                isActive: membership.isActive,
            };
            window.scrollTo({ top: 0, behavior: 'smooth' });
        },

        async toggleMembershipStatus(membership) {
            if (!confirm(`¿Estás seguro de ${membership.isActive ? 'inactivar' : 'activar'} la mensualidad de la placa ${membership.licensePlate}?`)) {
                return;
            }

            try {
                if (membership.isActive) {
                    await this.$axios.delete(`/Memberships/${membership.membershipId}`);
                    this.formSuccess = 'Mensualidad inactivada con éxito!';
                } else {
                    const payload = {
                        startDate: this.formatDateForInput(new Date(membership.startDate)) + 'T00:00:00.000Z',
                        endDate: this.formatDateForInput(new Date(membership.endDate)) + 'T00:00:00.000Z',
                        isActive: true
                    };
                    await this.$axios.put(`/Memberships/${membership.membershipId}`, payload);
                    this.formSuccess = 'Mensualidad activada con éxito!';
                }
                await this.fetchMemberships();
            } catch (err) {
                this.formError = err.response?.data?.message || err.response?.data || err.message || 'Error al cambiar estado de mensualidad.';
                console.error('Error al cambiar estado de mensualidad:', err.response?.data || err.message);
            }
        },

        resetForm() {
            this.membershipForm = {
                customerName: '',
                customerEmail: '',
                licensePlate: '',
                vehicleType: '',
                startDate: this.formatDateForInput(new Date()),
                endDate: this.formatDateForInput(new Date(new Date().setMonth(new Date().getMonth() + 1))),
                isActive: true,
            };
            this.editingMembership = {};
            this.formError = null;
        },

        cancelEdit() {
            this.resetForm();
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

        isExpiringSoon(endDate) {
            const end = new Date(endDate);
            const now = new Date();
            const daysDiff = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
            return daysDiff <= 7 && daysDiff > 0;
        },

        isExpired(endDate) {
            const end = new Date(endDate);
            const now = new Date();
            return end < now;
        }
    },
    mounted() {
        this.fetchMemberships();
    }
};
</script>

<style scoped>
.mensualidades-view {
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

.memberships-count {
    display: flex;
    align-items: baseline;
    gap: 0.5rem;
}

.memberships-count .count {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--color-accent);
}

.memberships-count .label {
    color: var(--color-text-light);
    font-size: 0.9rem;
}

.membership-form {
    margin-bottom: 1rem;
}

.form-grid {
    margin-bottom: 2rem;
}

.form-section {
    margin-bottom: 2rem;
    padding-bottom: 1.5rem;
    border-bottom: 1px solid var(--color-border);
}

.form-section:last-of-type {
    border-bottom: none;
    margin-bottom: 0;
}

.section-title {
    font-size: 1rem;
    font-weight: 600;
    color: var(--color-text);
    margin-bottom: 1rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid var(--color-border);
}

.form-row {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
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

.form-group input[type="text"],
.form-group input[type="email"],
.form-group input[type="date"],
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

.form-group input::placeholder {
    color: var(--color-text-muted);
}

.license-plate {
    text-transform: uppercase;
    font-family: 'Monaco', 'Consolas', monospace;
    font-weight: 600;
}

.date-hint {
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

.memberships-table {
    width: 100%;
    border-collapse: collapse;
    background-color: var(--color-card);
}

.memberships-table th {
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

.memberships-table td {
    padding: 1rem;
    border-bottom: 1px solid var(--color-border);
    color: var(--color-text);
}

.memberships-table tbody tr:hover {
    background-color: var(--color-primary-light);
}

.memberships-table tbody tr.inactive {
    opacity: 0.7;
}

.memberships-table tbody tr.expiring-soon {
    border-left: 3px solid var(--color-warning);
}

.memberships-table tbody tr.expired {
    border-left: 3px solid var(--color-danger);
}

.membership-id {
    font-family: 'Monaco', 'Consolas', monospace;
    font-size: 0.85rem;
    color: var(--color-text-light);
}

.customer-name {
    font-weight: 500;
}

.customer-email {
    color: var(--color-text-light);
    font-size: 0.9rem;
}

.license-plate {
    font-family: 'Monaco', 'Consolas', monospace;
    font-weight: 600;
    background-color: var(--color-primary-light);
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    display: inline-block;
}

.vehicle-type {
    padding: 0.25rem 0.75rem;
    border-radius: 20px;
    font-size: 0.8rem;
    font-weight: 600;
    text-transform: uppercase;
}

.vehicle-type.carro {
    background-color: rgba(67, 97, 238, 0.2);
    color: var(--color-accent);
}

.vehicle-type.moto {
    background-color: rgba(139, 69, 19, 0.2);
    color: #8b4513;
}

.start-date,
.end-date {
    font-family: 'Monaco', 'Consolas', monospace;
    font-size: 0.85rem;
}

.status-badge {
    padding: 0.25rem 0.75rem;
    border-radius: 20px;
    font-size: 0.8rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    display: inline-block;
    margin-bottom: 0.25rem;
}

.status-active {
    background-color: rgba(16, 185, 129, 0.2);
    color: var(--color-success);
}

.status-inactive {
    background-color: rgba(239, 68, 68, 0.2);
    color: var(--color-danger);
}

.expiry-warning {
    font-size: 0.7rem;
    color: var(--color-warning);
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
    .form-row {
        grid-template-columns: 1fr;
    }
    
    .card-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.5rem;
    }
    
    .memberships-table {
        font-size: 0.8rem;
    }
    
    .memberships-table th,
    .memberships-table td {
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