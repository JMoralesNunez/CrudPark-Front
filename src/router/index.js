import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

import VehiculosView from '../views/VehiculosView.vue'
import ClientesView from '../views/ClientesView.vue'
import AlquileresView from '../views/AlquileresView.vue'
import OperadoresView from '../views/OperadoresView.vue'
import MensualidadesView from '../views/MensualidadesView.vue'
import TarifasView from '../views/TarifasView.vue'
import ReportesView from '../views/ReportesView.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/vehiculos',
    name: 'vehiculos',
    component: VehiculosView
  },
  {
    path: '/clientes',
    name: 'clientes',
    component: ClientesView
  },
  {
    path: '/alquileres',
    name: 'alquileres',
    component: AlquileresView
  },
  {
    path: '/operadores',
    name: 'operadores',
    component: OperadoresView
  },
  {
    path: '/mensualidades',
    name: 'mensualidades',
    component: MensualidadesView
  },
  {
    path: '/tarifas',
    name: 'tarifas',
    component: TarifasView
  }
  ,
  {
    path: '/reportes',
    name: 'reportes',
    component: ReportesView
  }
]

const router = createRouter({
  history: createWebHistory('/'),
  routes
})

export default router