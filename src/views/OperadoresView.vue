<template>
    <div class="operadores-view">
        <div class="page-header">
            <h1>Gestión de Operadores</h1>
            <p class="page-subtitle">Administra los operadores del sistema</p>
        </div>

        <!-- Formulario para Crear/Editar Operador -->
        <div class="form-card">
            <div class="card-header">
                <h2>{{ editingOperator.operatorId ? 'Editar Operador' : 'Registrar Nuevo Operador' }}</h2>
                <div class="form-indicator" :class="{ editing: editingOperator.operatorId }">
                    {{ editingOperator.operatorId ? 'Modo Edición' : 'Modo Registro' }}
                </div>
            </div>
            
            <form @submit.prevent="saveOperator" class="operator-form">
                <div class="form-grid">
                    <div class="form-group">
                        <label for="fullName">Nombre Completo</label>
                        <input type="text" id="fullName" v-model="operatorForm.fullName" required 
                               placeholder="Ingrese el nombre completo">
                    </div>
                    
                    <div class="form-group">
                        <label for="email">Correo Electrónico <span class="optional">(Opcional)</span></label>
                        <input type="email" id="email" v-model="operatorForm.email" 
                               placeholder="correo@ejemplo.com">
                    </div>
                    
                    <!-- El campo password solo para el registro -->
                    <div class="form-group" v-if="!editingOperator.operatorId">
                        <label for="password">Contraseña</label>
                        <input type="password" id="password" v-model="operatorForm.password" required 
                               placeholder="Ingrese la contraseña">
                    </div>
                    
                    <!-- Solo para edición, para cambiar el estado de activo -->
                    <div class="form-group checkbox-group" v-if="editingOperator.operatorId">
                        <label class="checkbox-label">
                            <input type="checkbox" id="isActive" v-model="operatorForm.isActive">
                            <span class="checkmark"></span>
                            Operador Activo
                        </label>
                    </div>
                </div>

                <div class="form-actions">
                    <button type="submit" class="btn-primary" :disabled="formLoading">
                        <span v-if="formLoading" class="button-loader"></span>
                        {{ editingOperator.operatorId ? 'Guardar Cambios' : 'Registrar Operador' }}
                    </button>
                    <button type="button" class="btn-secondary" @click="cancelEdit" v-if="editingOperator.operatorId">
                        Cancelar
                    </button>
                </div>
            </form>
            
            <div v-if="formError" class="error-message">
                <div class="error-icon">!</div>
                <p>{{ formError }}</p>
            </div>
        </div>

        <!-- Listado de Operadores -->
        <div class="list-card">
            <div class="card-header">
                <h2>Listado de Operadores</h2>
                <div class="operators-count">{{ operadores.length }} operadores</div>
            </div>

            <div v-if="loading" class="loading-state">
                <div class="loading-spinner"></div>
                <p>Cargando operadores...</p>
            </div>
            
            <div v-else-if="error" class="error-state">
                <div class="error-icon">!</div>
                <p>Error al cargar operadores: {{ error }}</p>
                <button class="retry-button" @click="fetchOperadores">Reintentar</button>
            </div>
            
            <div v-else-if="operadores.length" class="table-container">
                <table class="operators-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nombre</th>
                            <th>Correo</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="operador in operadores" :key="operador.operatorId" 
                            :class="{ inactive: !operador.isActive }">
                            <td class="operator-id">{{ operador.operatorId }}</td>
                            <td class="operator-name">{{ operador.fullName }}</td>
                            <td class="operator-email">{{ operador.email || 'N/A' }}</td>
                            <td>
                                <span class="status-badge" :class="{ 
                                    'status-active': operador.isActive, 
                                    'status-inactive': !operador.isActive 
                                }">
                                    {{ operador.isActive ? 'Activo' : 'Inactivo' }}
                                </span>
                            </td>
                            <td class="actions">
                                <button @click="editOperator(operador)" class="btn-edit">
                                    Editar
                                </button>
                                <button @click="toggleOperatorStatus(operador)"
                                    :class="{ 
                                        'btn-inactivate': operador.isActive, 
                                        'btn-activate': !operador.isActive 
                                    }">
                                    {{ operador.isActive ? 'Inactivar' : 'Activar' }}
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
            
            <div v-else class="empty-state">
                <div class="empty-icon">👥</div>
                <p>No hay operadores registrados</p>
                <p class="empty-subtitle">Comienza registrando el primer operador</p>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'OperadoresView',
    data() {
        return {
            operadores: [],
            loading: false,
            error: null,
            formLoading: false,
            formError: null,
            operatorForm: {
                password: '',
                fullName: '',
                email: '',
                isActive: true,
            },
            editingOperator: {},
            operatorApiUrl: 'https://parkingcrud2-0.onrender.com/api/Operators'
        };
    },
    methods: {
        async fetchOperadores() {
            this.loading = true;
            this.error = null;
            try {
                const response = await this.$axios.get(this.operatorApiUrl);
                this.operadores = response.data;
                console.log('Operadores cargados:', this.operadores);
            } catch (err) {
                this.error = err.response?.data || err.message || 'Error al obtener operadores.';
                console.error('Error al obtener operadores:', err);
            } finally {
                this.loading = false;
            }
        },

        async saveOperator() {
            this.formLoading = true;
            this.formError = null;
            try {
                if (this.editingOperator.operatorId) {
                    const payload = {
                        fullName: this.operatorForm.fullName,
                        email: this.operatorForm.email,
                        isActive: this.operatorForm.isActive
                    };
                    await this.$axios.put(`/Operators/${this.editingOperator.operatorId}`, payload);
                    alert('Operador actualizado con éxito!');
                } else {
                    const payload = {
                        password: this.operatorForm.password,
                        fullName: this.operatorForm.fullName,
                        email: this.operatorForm.email
                    };
                    await this.$axios.post('/Operators', payload);
                    alert('Operador registrado con éxito!');
                }
                this.resetForm();
                await this.fetchOperadores();
            } catch (err) {
                this.formError = err.response?.data || err.message || 'Error al guardar operador.';
                console.error('Error al guardar operador:', err.response?.data || err.message);
            } finally {
                this.formLoading = false;
            }
        },

        editOperator(operador) {
            this.editingOperator = { ...operador };
            this.operatorForm.fullName = operador.fullName;
            this.operatorForm.email = operador.email;
            this.operatorForm.isActive = operador.isActive;
            this.operatorForm.password = '';
            window.scrollTo({ top: 0, behavior: 'smooth' });
        },

        async toggleOperatorStatus(operador) {
            if (!confirm(`¿Estás seguro de ${operador.isActive ? 'inactivar' : 'activar'} al operador ${operador.fullName}?`)) {
                return;
            }

            try {
                if (!operador.isActive) {
                    await this.$axios.put(`/Operators/${operador.operatorId}`, {
                        fullName: operador.fullName,
                        email: operador.email,
                        isActive: true
                    });
                    alert('Operador activado con éxito!');
                } else {
                    await this.$axios.delete(`/Operators/${operador.operatorId}`);
                    alert('Operador inactivado con éxito!');
                }
                await this.fetchOperadores();
            } catch (err) {
                this.error = err.response?.data || err.message || 'Error al cambiar el estado del operador.';
                console.error('Error al cambiar el estado del operador:', err.response?.data || err.message);
            }
        },

        resetForm() {
            this.operatorForm = {
                password: '',
                fullName: '',
                email: '',
                isActive: true,
            };
            this.editingOperator = {};
            this.formError = null;
        },

        cancelEdit() {
            this.resetForm();
        }
    },
    mounted() {
        this.fetchOperadores();
    }
};
</script>

<style scoped>
.operadores-view {
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

.operators-count {
    color: var(--color-text-light);
    font-size: 0.9rem;
}

.operator-form {
    margin-bottom: 1rem;
}

.form-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
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

.optional {
    color: var(--color-text-muted);
    font-weight: 400;
}

.form-group input[type="text"],
.form-group input[type="email"],
.form-group input[type="password"] {
    padding: 0.75rem;
    background-color: var(--color-primary);
    border: 1px solid var(--color-border);
    border-radius: var(--border-radius);
    color: var(--color-text);
    font-size: 0.95rem;
    transition: var(--transition);
}

.form-group input:focus {
    outline: none;
    border-color: var(--color-accent);
    box-shadow: 0 0 0 2px rgba(67, 97, 238, 0.2);
}

.form-group input::placeholder {
    color: var(--color-text-muted);
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
.error-state {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 1rem;
    background-color: rgba(239, 68, 68, 0.1);
    border: 1px solid var(--color-danger);
    border-radius: var(--border-radius);
    color: var(--color-danger);
    margin-top: 1rem;
}

.error-icon {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background-color: var(--color-danger);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.8rem;
    font-weight: bold;
    flex-shrink: 0;
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

.operators-table {
    width: 100%;
    border-collapse: collapse;
    background-color: var(--color-card);
}

.operators-table th {
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

.operators-table td {
    padding: 1rem;
    border-bottom: 1px solid var(--color-border);
    color: var(--color-text);
}

.operators-table tbody tr:hover {
    background-color: var(--color-primary-light);
}

.operators-table tbody tr.inactive {
    opacity: 0.7;
}

.operator-id {
    font-family: 'Monaco', 'Consolas', monospace;
    font-size: 0.85rem;
    color: var(--color-text-light);
}

.operator-name {
    font-weight: 500;
}

.operator-email {
    color: var(--color-text-light);
}

.status-badge {
    padding: 0.25rem 0.75rem;
    border-radius: 20px;
    font-size: 0.8rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.status-active {
    background-color: rgba(16, 185, 129, 0.2);
    color: var(--color-success);
}

.status-inactive {
    background-color: rgba(239, 68, 68, 0.2);
    color: var(--color-danger);
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
    
    .operators-table {
        font-size: 0.8rem;
    }
    
    .operators-table th,
    .operators-table td {
        padding: 0.75rem 0.5rem;
    }
    
    .actions {
        flex-direction: column;
    }
    
    .btn-edit,
    .btn-inactivate,
    .btn-activate {
        min-width: 80px;
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