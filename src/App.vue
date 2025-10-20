<template>
  <div id="app">
    <nav>
      <router-link to="/">Inicio</router-link> |
      <!-- <router-link to="/vehiculos">Vehículos</router-link> |
      <router-link to="/clientes">Clientes</router-link> |
      <router-link to="/alquileres">Alquileres</router-link> | -->
      <router-link to="/operadores">Operadores</router-link> |
      <router-link to="/mensualidades">Mensualidades</router-link> |
      <router-link to="/tarifas">Tarifas</router-link> |
      <router-link to="/reportes">Reportes</router-link>
    </nav>
    <router-view/>
  </div>
</template>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px; 
}

nav {
  padding: 30px;
}

nav a {
  font-weight: bold;
  color: #2c3e50;
  text-decoration: none;
}

nav a.router-link-exact-active {
  color: #42b983; 
}
</style>