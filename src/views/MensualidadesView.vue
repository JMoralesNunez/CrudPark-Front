<template>
    <div class="mensualidades-view">
        <h1>Gestión de Mensualidades</h1>

        <!-- Formulario para Registrar/Editar Mensualidad -->
        <div class="form-card">
            <h2>{{ editingMembership.membershipId ? 'Editar Mensualidad' : 'Registrar Nueva Mensualidad' }}</h2>
            <form @submit.prevent="saveMembership">
                <!-- Campos para registro -->
                <div v-if="!editingMembership.membershipId">
                    <div class="form-group">
                        <label for="customerName">Nombre del Cliente:</label>
                        <input type="text" id="customerName" v-model="membershipForm.customerName" required>
                    </div>
                    <div class="form-group">
                        <label for="customerEmail">Correo Electrónico del Cliente:</label>
                        <input type="email" id="customerEmail" v-model="membershipForm.customerEmail" required>
                    </div>
                    <div class="form-group">
                        <label for="licensePlate">Placa del Vehículo:</label>
                        <input type="text" id="licensePlate" v-model="membershipForm.licensePlate" required>
                    </div>
                    <div class="form-group">
                        <label for="vehicleType">Tipo de Vehículo:</label>
                        <select id="vehicleType" v-model="membershipForm.vehicleType" required>
                            <option value="">Seleccione...</option>
                            <option value="Carro">Carro</option>
                            <option value="Moto">Moto</option>
                        </select>
                    </div>
                </div>

                <!-- Campos para registro y edición -->
                <div class="form-group">
                    <label for="startDate">Fecha de Inicio:</label>
                    <input type="date" id="startDate" v-model="membershipForm.startDate" required>
                </div>
                <div class="form-group">
                    <label for="endDate">Fecha de Fin:</label>
                    <input type="date" id="endDate" v-model="membershipForm.endDate" required>
                </div>

                <!-- Solo para edición -->
                <div class="form-group" v-if="editingMembership.membershipId">
                    <label for="isActive">Activa:</label>
                    <input type="checkbox" id="isActive" v-model="membershipForm.isActive">
                </div>

                <button type="submit" :disabled="formLoading">{{ editingMembership.membershipId ? 'Guardar Cambios' :
                    'Registrar Mensualidad' }}</button>
                <button type="button" @click="cancelEdit" v-if="editingMembership.membershipId">Cancelar</button>
            </form>
            <p v-if="formError" class="error-message">{{ formError }}</p>
            <p v-if="formSuccess" class="success-message">{{ formSuccess }}</p>
        </div>

        <!-- Listado de Mensualidades -->
        <div class="list-card">
            <h2>Listado de Mensualidades</h2>
            <p v-if="loading">Cargando mensualidades...</p>
            <p v-else-if="error" class="error-message">Error al cargar mensualidades: {{ error }}</p>
            <table v-else-if="memberships.length">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Cliente</th>
                        <th>Email Cliente</th>
                        <th>Placa</th>
                        <th>Tipo Vehículo</th>
                        <th>Inicio</th>
                        <th>Fin</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="membership in memberships" :key="membership.membershipId">
                        <td>{{ membership.membershipId }}</td>
                        <td>{{ membership.customerName }}</td>
                        <td>{{ membership.customerEmail }}</td>
                        <td>{{ membership.licensePlate }}</td>
                        <td>{{ membership.vehicleType }}</td>
                        <td>{{ formatDate(membership.startDate) }}</td>
                        <td>{{ formatDate(membership.endDate) }}</td>
                        <td>
                            <span
                                :class="{ 'status-active': membership.isActive, 'status-inactive': !membership.isActive }">
                                {{ membership.isActive ? 'Activa' : 'Inactiva' }}
                            </span>
                        </td>
                        <td>
                            <button @click="editMembership(membership)">Editar</button>
                            <button @click="toggleMembershipStatus(membership)"
                                :class="{ 'button-inactivate': membership.isActive, 'button-activate': !membership.isActive }">
                                {{ membership.isActive ? 'Inactivar' : 'Activar' }}
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
            <p v-else>No hay mensualidades registradas.</p>
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
                startDate: this.formatDateForInput(new Date()), // Fecha actual por defecto
                endDate: this.formatDateForInput(new Date(new Date().setMonth(new Date().getMonth() + 1))), // Un mes después
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
                    // EDITAR mensualidad existente (PUT)
                    const payload = {
                        startDate: this.membershipForm.startDate + 'T00:00:00.000Z', // Formato ISO 8601
                        endDate: this.membershipForm.endDate + 'T00:00:00.000Z', // Formato ISO 8601
                        isActive: this.membershipForm.isActive
                    };
                    await this.$axios.put(`/Memberships/${this.editingMembership.membershipId}`, payload);
                    this.formSuccess = 'Mensualidad actualizada con éxito!';
                } else {
                    // CREAR nueva mensualidad (POST)
                    const payload = {
                        customerName: this.membershipForm.customerName,
                        customerEmail: this.membershipForm.customerEmail,
                        licensePlate: this.membershipForm.licensePlate,
                        vehicleType: this.membershipForm.vehicleType,
                        startDate: this.membershipForm.startDate + 'T00:00:00.000Z', // Formato ISO 8601
                        endDate: this.membershipForm.endDate + 'T00:00:00.000Z', // Formato ISO 8601
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
                    // Inactivar (DELETE)
                    await this.$axios.delete(`/Memberships/${membership.membershipId}`);
                    this.formSuccess = 'Mensualidad inactivada con éxito!';
                } else {
                    // Activar (PUT)
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
            return date.toLocaleDateString('es-CO'); // Formato de fecha local
        },
        formatDateForInput(date) {
            const year = date.getFullYear();
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const day = date.getDate().toString().padStart(2, '0');
            return `${year}-${month}-${day}`;
        }
    },
    mounted() {
        this.fetchMemberships();
    }
};
</script>

<style scoped>
.mensualidades-view {
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
    max-width: 800px;
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
.form-group input[type="email"],
.form-group input[type="date"],
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

.status-active {
    color: #28a745;
    font-weight: bold;
}

.status-inactive {
    color: #dc3545;
    font-weight: bold;
}
</style>