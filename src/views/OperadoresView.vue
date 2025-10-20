<template>
    <div class="operadores-view">
        <h1>Gestión de Operadores</h1>

        <!-- Formulario para Crear/Editar Operador -->
        <div class="form-card">
            <h2>{{ editingOperator.operatorId ? 'Editar Operador' : 'Registrar Nuevo Operador' }}</h2>
            <form @submit.prevent="saveOperator">
                <div class="form-group">
                    <label for="fullName">Nombre Completo:</label>
                    <input type="text" id="fullName" v-model="operatorForm.fullName" required>
                </div>
                <div class="form-group">
                    <label for="email">Correo Electrónico (Opcional):</label>
                    <input type="email" id="email" v-model="operatorForm.email">
                </div>
                <!-- El campo password solo para el registro -->
                <div class="form-group" v-if="!editingOperator.operatorId">
                    <label for="password">Contraseña:</label>
                    <input type="password" id="password" v-model="operatorForm.password" required>
                </div>
                <!-- Solo para edición, para cambiar el estado de activo -->
                <div class="form-group" v-if="editingOperator.operatorId">
                    <label for="isActive">Activo:</label>
                    <input type="checkbox" id="isActive" v-model="operatorForm.isActive">
                </div>

                <button type="submit" :disabled="formLoading">{{ editingOperator.operatorId ? 'Guardar Cambios' :
                    'Registrar Operador' }}</button>
                <button type="button" @click="cancelEdit" v-if="editingOperator.operatorId">Cancelar</button>
            </form>
            <p v-if="formError" class="error-message">{{ formError }}</p>
        </div>

        <!-- Listado de Operadores -->
        <div class="list-card">
            <h2>Listado de Operadores</h2>
            <p v-if="loading">Cargando operadores...</p>
            <p v-else-if="error" class="error-message">Error al cargar operadores: {{ error }}</p>
            <table v-else-if="operadores.length">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nombre</th>
                        <th>Correo</th>
                        <th>Activo</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="operador in operadores" :key="operador.operatorId">
                        <td>{{ operador.operatorId }}</td>
                        <td>{{ operador.fullName }}</td>
                        <td>{{ operador.email || 'N/A' }}</td>
                        <td>
                            <span :class="{ 'status-active': operador.isActive, 'status-inactive': !operador.isActive }">
                                {{ operador.isActive ? 'Sí' : 'No' }}
                            </span>
                        </td>
                        <td>
                            <button @click="editOperator(operador)">Editar</button>
                            <button @click="toggleOperatorStatus(operador)"
                                :class="{ 'button-inactivate': operador.isActive, 'button-activate': !operador.isActive }">
                                {{ operador.isActive ? 'Inactivar' : 'Activar' }}
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
            <p v-else>No hay operadores registrados.</p>
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
            operatorForm: { // Datos para el formulario de registro/edición
                password: '',
                fullName: '',
                email: '',
                isActive: true, // Por defecto al editar, o para PUT
            },
            editingOperator: {}, // Objeto para mantener el operador que se está editando
            operatorApiUrl: 'https://parkingcrud.onrender.com/api/Operators'
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
                    // EDITAR operador existente (PUT)
                    const payload = {
                        fullName: this.operatorForm.fullName,
                        email: this.operatorForm.email,
                        isActive: this.operatorForm.isActive
                    };
                    await this.$axios.put(`/Operators/${this.editingOperator.operatorId}`, payload);
                    alert('Operador actualizado con éxito!');
                } else {
                    // CREAR nuevo operador (POST)
                    const payload = {
                        password: this.operatorForm.password,
                        fullName: this.operatorForm.fullName,
                        email: this.operatorForm.email
                    };
                    await this.$axios.post('/Operators', payload);
                    alert('Operador registrado con éxito!');
                }
                this.resetForm(); // Limpiar formulario
                await this.fetchOperadores(); // Recargar la lista
            } catch (err) {
                this.formError = err.response?.data || err.message || 'Error al guardar operador.';
                console.error('Error al guardar operador:', err.response?.data || err.message);
                // Puedes añadir un manejo de errores más específico, por ejemplo si la contraseña es débil, etc.
            } finally {
                this.formLoading = false;
            }
        },

        editOperator(operador) {
            // Cargar los datos del operador en el formulario para edición
            this.editingOperator = { ...operador }; // Copia el operador para no modificar el original directamente
            this.operatorForm.fullName = operador.fullName;
            this.operatorForm.email = operador.email;
            this.operatorForm.isActive = operador.isActive;
            this.operatorForm.password = ''; // La contraseña no se edita directamente
            // Opcional: Desplazarse al formulario
            window.scrollTo({ top: 0, behavior: 'smooth' });
        },

        async toggleOperatorStatus(operador) {
            if (!confirm(`¿Estás seguro de ${operador.isActive ? 'inactivar' : 'activar'} al operador ${operador.fullName}?`)) {
                return;
            }

            try {
                // El DELETE de esta API cambia isActive a false, y el PUT puede cambiarlo a true
                // Para "activar" (isActive = true) usaremos PUT con el ID y isActive: true
                if (!operador.isActive) {
                    await this.$axios.put(`/Operators/${operador.operatorId}`, {
                        fullName: operador.fullName, // Se requiere el nombre completo
                        email: operador.email, // Se requiere el email
                        isActive: true
                    });
                    alert('Operador activado con éxito!');
                } else {
                    // Para "inactivar" (isActive = false) usaremos DELETE
                    await this.$axios.delete(`/Operators/${operador.operatorId}`);
                    alert('Operador inactivado con éxito!');
                }
                await this.fetchOperadores(); // Recargar la lista
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
        this.fetchOperadores(); // Cargar operadores al iniciar el componente
    }
};
</script>

<style scoped>
.operadores-view {
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
.form-group input[type="password"] {
    width: calc(100% - 20px);
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 5px;
    font-size: 1em;
}

.form-group input[type="checkbox"] {
    margin-top: 5px;
    transform: scale(1.2);
    /* Para hacer el checkbox un poco más grande */
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
    /* Rojo para inactivar */
}

.button-inactivate:hover {
    background-color: #c0392b;
}

.button-activate {
    background-color: #3498db;
    /* Azul para activar */
}

.button-activate:hover {
    background-color: #2980b9;
}

.error-message {
    color: red;
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
    /* Verde para activo */
    font-weight: bold;
}

.status-inactive {
    color: #dc3545;
    /* Rojo para inactivo */
    font-weight: bold;
}
</style>