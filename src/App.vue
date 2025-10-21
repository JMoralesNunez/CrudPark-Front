<template>
  <div id="app">
    <div class="app-container">
      <header class="app-header">
        <div class="header-content">
          <div class="header-left">
            <h1 class="app-title">Panel de Administración</h1>
            <p class="welcome-text">Bienvenido de nuevo, Admin</p>
          </div>
        </div>
        <nav class="main-nav">
          <router-link to="/" class="nav-link">
            <i class="nav-icon">📊</i>
            <span>Dashboard</span>
          </router-link>
          <router-link to="/operadores" class="nav-link">
            <i class="nav-icon">👥</i>
            <span>Operadores</span>
          </router-link>
          <router-link to="/mensualidades" class="nav-link">
            <i class="nav-icon">💰</i>
            <span>Mensualidades</span>
          </router-link>
          <router-link to="/tarifas" class="nav-link">
            <i class="nav-icon">📈</i>
            <span>Tarifas</span>
          </router-link>
          <router-link to="/reportes" class="nav-link">
            <i class="nav-icon">📋</i>
            <span>Reportes</span>
          </router-link>
        </nav>
      </header>
      
      <main class="main-content">
        <router-view/>
      </main>
    </div>
  </div>
</template>

<style>
:root {
  --color-primary: #1a1d29;
  --color-primary-light: #252a3a;
  --color-primary-hover: #2d3449;
  --color-secondary: #0f1117;
  --color-accent: #4361ee;
  --color-accent-light: #4f6bf5;
  --color-text: #e2e8f0;
  --color-text-light: #94a3b8;
  --color-text-muted: #64748b;
  --color-border: #2d3748;
  --color-background: #0f1322;
  --color-card: #1a1f33;
  --color-success: #10b981;
  --color-warning: #f59e0b;
  --color-danger: #ef4444;
  --shadow-light: 0 2px 10px rgba(0, 0, 0, 0.2);
  --shadow-medium: 0 4px 20px rgba(0, 0, 0, 0.25);
  --border-radius: 10px;
  --transition: all 0.3s ease;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  background-color: var(--color-background);
}

#app {
  font-family: 'Inter', 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: var(--color-text);
  background-color: var(--color-background);
  min-height: 100vh;
}

.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.app-header {
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%);
  color: var(--color-text);
  box-shadow: var(--shadow-medium);
  position: sticky;
  top: 0;
  z-index: 100;
  border-bottom: 1px solid var(--color-border);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1400px;
  margin: 0 auto;
  padding: 1rem 2rem;
}

.header-left .app-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 0.25rem;
  background: linear-gradient(90deg, var(--color-text) 0%, var(--color-accent-light) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.welcome-text {
  color: var(--color-text-light);
  font-size: 0.9rem;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--color-accent) 0%, var(--color-accent-light) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  color: white;
  box-shadow: var(--shadow-light);
}

.user-name {
  font-weight: 500;
  color: var(--color-text);
}

.main-nav {
  display: flex;
  gap: 0.5rem;
  padding: 0 2rem 1rem;
  max-width: 1400px;
  margin: 0 auto;
  overflow-x: auto;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  color: var(--color-text-light);
  text-decoration: none;
  font-weight: 500;
  border-radius: var(--border-radius);
  transition: var(--transition);
  white-space: nowrap;
  background-color: transparent;
}

.nav-link:hover {
  background-color: var(--color-primary-light);
  color: var(--color-text);
  transform: translateY(-2px);
}

.nav-link.router-link-exact-active {
  background-color: var(--color-primary-light);
  color: var(--color-accent-light);
  box-shadow: var(--shadow-light);
  border-left: 3px solid var(--color-accent);
}

.nav-icon {
  font-size: 1.1rem;
}

.main-content {
  flex: 1;
  max-width: 1400px;
  width: 100%;
  margin: 0 auto;
  padding: 2rem;
}

/* Responsive Design */
@media (min-width: 768px) {
  .app-title {
    font-size: 1.75rem;
  }
  
  .main-nav {
    gap: 1rem;
    overflow-x: visible;
  }
  
  .nav-link {
    padding: 0.75rem 1.5rem;
  }
}

@media (max-width: 767px) {
  .header-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .header-right {
    width: 100%;
    justify-content: flex-end;
    display: flex;
  }
  
  .main-nav {
    padding: 0 1rem 1rem;
  }
}

/* Scrollbar personalizado para navegación */
.main-nav::-webkit-scrollbar {
  height: 6px;
}

.main-nav::-webkit-scrollbar-track {
  background: var(--color-primary);
  border-radius: 3px;
}

.main-nav::-webkit-scrollbar-thumb {
  background: var(--color-primary-light);
  border-radius: 3px;
}

.main-nav::-webkit-scrollbar-thumb:hover {
  background: var(--color-accent);
}
</style>