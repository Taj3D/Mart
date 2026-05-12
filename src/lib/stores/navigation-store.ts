import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Navigation types for the ERP modules
export type ERPModule = 'dashboard' | 'inventory' | 'sales' | 'purchase' | 'reports' | 'settings'

export type InventoryPage = 'products' | 'categories' | 'brands' | 'stock'
export type SalesPage = 'orders' | 'invoices' | 'payments' | 'customers' | 'returns'
export type PurchasePage = 'purchase-orders' | 'suppliers' | 'supplier-payments' | 'goods-receipt'
export type ReportsPage = 'sales-report' | 'inventory-report' | 'financial-report' | 'audit-log'
export type SettingsPage = 'company' | 'users' | 'system' | 'emi-plans'

export interface NavigationState {
  activeModule: ERPModule
  activeSubPage: string
  sidebarCollapsed: boolean

  // Actions
  setActiveModule: (module: ERPModule) => void
  setActiveSubPage: (page: string) => void
  setSidebarCollapsed: (collapsed: boolean) => void
  toggleSidebar: () => void
  navigate: (module: ERPModule, subPage: string) => void
}

const defaultSubPages: Record<ERPModule, string> = {
  dashboard: 'overview',
  inventory: 'products',
  sales: 'orders',
  purchase: 'purchase-orders',
  reports: 'sales-report',
  settings: 'company',
}

export const useNavigationStore = create<NavigationState>()(
  persist(
    (set) => ({
      activeModule: 'dashboard',
      activeSubPage: 'overview',
      sidebarCollapsed: false,

      setActiveModule: (module) =>
        set((state) => ({
          activeModule: module,
          activeSubPage: state.activeModule !== module ? defaultSubPages[module] : state.activeSubPage,
        })),

      setActiveSubPage: (page) => set({ activeSubPage: page }),

      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),

      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

      navigate: (module, subPage) => set({ activeModule: module, activeSubPage: subPage }),
    }),
    {
      name: 'ims-navigation',
      partialize: (state) => ({
        activeModule: state.activeModule,
        activeSubPage: state.activeSubPage,
        sidebarCollapsed: state.sidebarCollapsed,
      }),
    }
  )
)
