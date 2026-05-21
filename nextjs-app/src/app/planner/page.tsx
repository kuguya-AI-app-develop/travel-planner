'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import type { Plan, Trip, Flight, Hotel, Destination, Expense, ChecklistItem, ItineraryItem, PackingCategory, Document, TabType, PlanStatus } from '@/types'
import Sidebar from '@/components/Sidebar'
import CoverImage from '@/components/CoverImage'
import CalendarView from '@/components/CalendarView'
import TripModal from '@/components/TripModal'
import FlightsView from '@/components/FlightsView'
import CriteriaModal from '@/components/CriteriaModal'
import HotelsView from '@/components/HotelsView'
import DestinationsView from '@/components/DestinationsView'
import ExpensesView from '@/components/ExpensesView'
import ItineraryView from '@/components/ItineraryView'
import PackingView from '@/components/PackingView'
import DocumentsView from '@/components/DocumentsView'
import PlanOverviewView from '@/components/PlanOverviewView'
import SummaryView from '@/components/SummaryView'
import MobileNav from '@/components/MobileNav'
import Toast from '@/components/Toast'
import PlanMgmtBar from '@/components/PlanMgmtBar'
import { useRouter } from 'next/navigation'

function createDefaultPlan(name: string, id: number): Plan {
  return {
    id,
    name,
    status: 'draft',
    startDate: '2026-05-18',
    endDate: '2026-05-22',
    trips: [
      { id: 1, name: '东京购物之旅', start: '2026-05-18', end: '2026-05-22', color: 'oklch(56% 0.2 265)' },
      { id: 2, name: '京都赏樱', start: '2026-05-10', end: '2026-05-13', color: 'oklch(60% 0.18 150)' },
    ],
    flights: [
      { id: 1, airline: '全日空航空', code: 'NH919', route: '上海 → 东京', dep: '08:30', arr: '12:45', price: 3280, cls: '经济舱', status: 'booked', selected: true, notes: { 0: '直飞', 1: '23kg' } },
      { id: 2, airline: '春秋航空', code: '9C6215', route: '东京 → 上海', dep: '19:00', arr: '21:30', price: 1899, cls: '经济舱', status: 'pending', selected: false, notes: { 0: '直飞', 1: '15kg' } },
    ],
    destinations: [
      { id: 1, name: '东京', country: '日本', notes: '购物天堂，交通便利', scores: [4, 4, 5, 5, 5, 4], selected: true },
      { id: 2, name: '京都', country: '日本', notes: '古都风情，文化深厚', scores: [5, 5, 4, 3, 5, 4], selected: false },
    ],
    hotels: [
      { id: 1, name: '东京新宿酒店', location: '新宿', price: '¥680/晚', priceNum: 680, scores: [4, 5, 4, 4, 3], selected: true },
      { id: 2, name: '银座高端酒店', location: '银座', price: '¥1200/晚', priceNum: 1200, scores: [3, 5, 5, 5, 5], selected: false },
    ],
    expenses: [
      { id: 1, name: '东京迪士尼门票', category: '门票', amount: 580, status: 'booked', note: '成人一日票', selected: true },
    ],
    checklist: [
      { id: 1, text: '购买上海→东京机票', done: true },
      { id: 2, text: '办理日本签证', done: true },
      { id: 3, text: '预订东京新宿酒店', done: false },
      { id: 4, text: '购买旅行保险', done: false },
    ],
    itinerary: [],
    packingCategories: [
      { id: 1, name: '证件', items: [{ id: 1, text: '护照', done: true }, { id: 2, text: '签证', done: false }] },
      { id: 2, name: '电子产品', items: [{ id: 3, text: '手机充电器', done: false }, { id: 4, text: '充电宝', done: false }] },
    ],
    documents: [
      { id: 1, name: '日本签证', type: '签证', number: 'E12345678', expiry: '2027-05-01', status: 'valid' },
    ],
  }
}

export default function PlannerPage() {
  const router = useRouter()
  const [plans, setPlans] = useState<Plan[]>([])
  const [currentPlanId, setCurrentPlanId] = useState(1)
  const [activeTab, setActiveTab] = useState<TabType>('calendar')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [coverVisible, setCoverVisible] = useState(() => {
    if (typeof window !== 'undefined') return localStorage.getItem('tp-cover-visible') !== 'false'
    return true
  })
  const [loading, setLoading] = useState(true)

  const [tripModalShow, setTripModalShow] = useState(false)
  const [tripModalEdit, setTripModalEdit] = useState<Trip | null>(null)
  const [tripModalDate, setTripModalDate] = useState('')

  const [criteriaModalShow, setCriteriaModalShow] = useState(false)
  const [destCriteriaModalShow, setDestCriteriaModalShow] = useState(false)
  const [flightCriteriaModalShow, setFlightCriteriaModalShow] = useState(false)
  const [modalKey, setModalKey] = useState(0)

  const [toastMsg, setToastMsg] = useState('')
  const [toastShow, setToastShow] = useState(false)
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Load plans from API
  useEffect(() => {
    fetch('/api/plans')
      .then(r => r.json())
      .then(data => {
        if (data.plans && data.plans.length > 0) {
          const parsed = data.plans.map((p: { id: number; name: string; status: string; startDate?: string; endDate?: string; data?: string }) => {
            if (p.data) {
              try {
                const planData = JSON.parse(p.data)
                return { ...planData, id: p.id, name: p.name, status: p.status }
              } catch { /* fallback */ }
            }
            return createDefaultPlan(p.name, p.id)
          })
          setPlans(parsed)
          setCurrentPlanId(parsed[0].id)
        } else {
          // Create default plan for new user
          const defaultPlan = createDefaultPlan('东京购物之旅', 1)
          setPlans([defaultPlan])
          // Save to backend
          fetch('/api/plans', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: defaultPlan.name, data: defaultPlan })
          }).then(r => r.json()).then(saved => {
            if (saved.plan) {
              setPlans([{ ...defaultPlan, id: saved.plan.id }])
              setCurrentPlanId(saved.plan.id)
            }
          })
        }
        setLoading(false)
      })
      .catch(() => {
        const defaultPlan = createDefaultPlan('东京购物之旅', 1)
        setPlans([defaultPlan])
        setLoading(false)
      })
  }, [])

  const currentPlan = plans.find(p => p.id === currentPlanId) || plans[0]

  // Save plan to API
  const savePlanToApi = useCallback((plan: Plan) => {
    fetch('/api/plans', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: plan.id,
        name: plan.name,
        status: plan.status,
        startDate: plan.startDate,
        endDate: plan.endDate,
        data: plan
      })
    }).catch(err => console.error('Save failed:', err))
  }, [])

  const updateCurrentPlan = useCallback((updater: (plan: Plan) => Plan) => {
    setPlans(prev => {
      const next = prev.map(p => {
        if (p.id === currentPlanId) {
          const updated = updater(p)
          savePlanToApi(updated)
          return updated
        }
        return p
      })
      return next
    })
  }, [currentPlanId, savePlanToApi])

  const showToast = useCallback((msg: string) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
    setToastMsg(msg)
    setToastShow(true)
    toastTimerRef.current = setTimeout(() => setToastShow(false), 2000)
  }, [])

  const handleTabChange = useCallback((tab: TabType) => {
    setActiveTab(tab)
    setSidebarOpen(false)
  }, [])

  const handleToggleCover = useCallback(() => {
    setCoverVisible(prev => {
      const next = !prev
      if (typeof window !== 'undefined') localStorage.setItem('tp-cover-visible', String(next))
      return next
    })
  }, [])

  const handleAddPlan = useCallback((name: string) => {
    fetch('/api/plans', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, data: createDefaultPlan(name, 0) })
    }).then(r => r.json()).then(data => {
      if (data.plan) {
        const newPlan = createDefaultPlan(name, data.plan.id)
        setPlans(prev => [...prev, newPlan])
        setCurrentPlanId(data.plan.id)
        showToast('已创建新计划')
      }
    })
  }, [showToast])

  const handleRenamePlan = useCallback((planId: number, name: string) => {
    setPlans(prev => prev.map(p => p.id === planId ? { ...p, name } : p))
    fetch('/api/plans', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: planId, name })
    })
    showToast('计划已重命名')
  }, [showToast])

  const handleDeletePlan = useCallback((planId: number) => {
    if (plans.length <= 1) {
      showToast('至少保留一个计划')
      return
    }
    setPlans(prev => prev.filter(p => p.id !== planId))
    if (currentPlanId === planId) {
      setCurrentPlanId(plans[0].id)
    }
    fetch(`/api/plans?id=${planId}`, { method: 'DELETE' })
    showToast('计划已删除')
  }, [plans, currentPlanId, showToast])

  const handlePlanStatusChange = useCallback((status: PlanStatus) => {
    updateCurrentPlan(p => ({ ...p, status }))
    showToast('状态已更新')
  }, [updateCurrentPlan, showToast])

  const handleAddTrip = useCallback((date: string) => {
    setTripModalEdit(null)
    setTripModalDate(date)
    setTripModalShow(true)
    setModalKey(k => k + 1)
  }, [])

  const handleEditTrip = useCallback((trip: Trip) => {
    setTripModalEdit(trip)
    setTripModalDate(trip.start)
    setTripModalShow(true)
    setModalKey(k => k + 1)
  }, [])

  const handleSaveTrip = useCallback((tripData: Omit<Trip, 'id'> & { id?: number }) => {
    updateCurrentPlan(plan => {
      if (tripData.id) {
        return { ...plan, trips: plan.trips.map(t => t.id === tripData.id ? { ...t, ...tripData } : t) }
      } else {
        const newId = Math.max(0, ...plan.trips.map(t => t.id)) + 1
        return { ...plan, trips: [...plan.trips, { ...tripData, id: newId }] }
      }
    })
    setTripModalShow(false)
    showToast(tripData.id ? '行程已更新' : '行程已添加')
  }, [updateCurrentPlan, showToast])

  const handleDeleteTrip = useCallback((id: number) => {
    updateCurrentPlan(p => ({ ...p, trips: p.trips.filter(t => t.id !== id) }))
    setTripModalShow(false)
    showToast('行程已删除')
  }, [updateCurrentPlan, showToast])

  const handleSaveCriteria = useCallback((name: string) => {
    updateCurrentPlan(p => ({
      ...p,
      criteria: [...((p as unknown as Record<string, unknown>).criteria as string[] || []), name],
      hotels: p.hotels.map(h => ({ ...h, scores: [...h.scores, 3] })),
    }))
    setCriteriaModalShow(false)
    showToast('已添加维度：' + name)
  }, [updateCurrentPlan, showToast])

  const handleSaveDestCriteria = useCallback((name: string) => {
    updateCurrentPlan(p => ({
      ...p,
      destCriteria: [...((p as unknown as Record<string, unknown>).destCriteria as string[] || []), name],
      destinations: p.destinations.map(d => ({ ...d, scores: [...d.scores, 3] })),
    }))
    setDestCriteriaModalShow(false)
    showToast('已添加维度：' + name)
  }, [updateCurrentPlan, showToast])

  const handleSaveFlightCriteria = useCallback((name: string) => {
    updateCurrentPlan(p => ({
      ...p,
      flightCriteria: [...((p as unknown as Record<string, unknown>).flightCriteria as string[] || []), name],
      flights: p.flights.map(f => ({ ...f, notes: { ...f.notes, [((p as unknown as Record<string, unknown>).flightCriteria as string[] || []).length]: '' } })),
    }))
    setFlightCriteriaModalShow(false)
    showToast('已添加维度：' + name)
  }, [updateCurrentPlan, showToast])

  const handleLogout = useCallback(async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }, [router])

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', gap: 16 }}>
        <div style={{
          width: 36,
          height: 36,
          border: '3px solid var(--border)',
          borderTopColor: 'var(--accent)',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite'
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        <p style={{ color: 'var(--muted)', fontSize: '15px', fontWeight: 500 }}>加载中...</p>
      </div>
    )
  }

  if (!currentPlan) return null

  return (
    <div style={{ width: '100%', minHeight: '100vh' }}>
      <Sidebar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        coverVisible={coverVisible}
        onToggleCover={handleToggleCover}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        plans={plans}
        currentPlanId={currentPlanId}
        onPlanChange={setCurrentPlanId}
        onAddPlan={handleAddPlan}
        onRenamePlan={handleRenamePlan}
        onDeletePlan={handleDeletePlan}
        onLogout={handleLogout}
      />
      <div className="main">
        <CoverImage visible={coverVisible} onToast={showToast} />
        {['calendar', 'flights', 'destinations', 'hotels', 'expenses', 'itinerary', 'packing', 'documents', 'plan-overview', 'summary'].includes(activeTab) && (
          <PlanMgmtBar
            plan={currentPlan}
            onStatusChange={handlePlanStatusChange}
            onEdit={() => {}}
            onDelete={() => handleDeletePlan(currentPlan.id)}
            onDuplicate={() => handleAddPlan(currentPlan.name + ' (副本)')}
          />
        )}
        {activeTab === 'calendar' && (
          <CalendarView
            trips={currentPlan.trips}
            onUpdateTrips={(trips) => updateCurrentPlan(p => ({ ...p, trips }))}
            onAddTrip={handleAddTrip}
            onEditTrip={handleEditTrip}
            onDeleteTrip={handleDeleteTrip}
            onToast={showToast}
          />
        )}
        {activeTab === 'flights' && (
          <FlightsView
            flights={currentPlan.flights}
            criteria={(currentPlan as unknown as Record<string, unknown>).flightCriteria as string[] || ['中转', '行李额度', '准点率', '舒适度']}
            onUpdateFlights={(flights) => updateCurrentPlan(p => ({ ...p, flights }))}
            onOpenCriteriaModal={() => { setFlightCriteriaModalShow(true); setModalKey(k => k + 1) }}
            onToast={showToast}
          />
        )}
        {activeTab === 'destinations' && (
          <DestinationsView
            destinations={currentPlan.destinations}
            criteria={(currentPlan as unknown as Record<string, unknown>).destCriteria as string[] || ['景色', '文化', '美食', '交通便利', '安全性', '性价比']}
            onUpdateDestinations={(destinations) => updateCurrentPlan(p => ({ ...p, destinations }))}
            onOpenCriteriaModal={() => { setDestCriteriaModalShow(true); setModalKey(k => k + 1) }}
            onToast={showToast}
          />
        )}
        {activeTab === 'hotels' && (
          <HotelsView
            hotels={currentPlan.hotels}
            criteria={(currentPlan as unknown as Record<string, unknown>).criteria as string[] || ['性价比', '位置', '卫生', '设施', '服务']}
            onUpdateHotels={(hotels) => updateCurrentPlan(p => ({ ...p, hotels }))}
            onUpdateCriteria={(criteria) => updateCurrentPlan(p => ({ ...p, criteria }))}
            onOpenCriteriaModal={() => { setCriteriaModalShow(true); setModalKey(k => k + 1) }}
            onToast={showToast}
          />
        )}
        {activeTab === 'expenses' && (
          <ExpensesView
            expenses={currentPlan.expenses}
            onUpdateExpenses={(expenses) => updateCurrentPlan(p => ({ ...p, expenses }))}
            onToast={showToast}
          />
        )}
        {activeTab === 'itinerary' && (
          <ItineraryView
            itinerary={currentPlan.itinerary}
            trips={currentPlan.trips}
            onUpdateItinerary={(itinerary) => updateCurrentPlan(p => ({ ...p, itinerary }))}
            onToast={showToast}
          />
        )}
        {activeTab === 'packing' && (
          <PackingView
            categories={currentPlan.packingCategories}
            onUpdateCategories={(packingCategories) => updateCurrentPlan(p => ({ ...p, packingCategories }))}
            onToast={showToast}
          />
        )}
        {activeTab === 'documents' && (
          <DocumentsView
            documents={currentPlan.documents}
            onUpdateDocuments={(documents) => updateCurrentPlan(p => ({ ...p, documents }))}
            onToast={showToast}
          />
        )}
        {activeTab === 'plan-overview' && (
          <PlanOverviewView
            plans={plans}
            currentPlanId={currentPlanId}
            onSelectPlan={setCurrentPlanId}
          />
        )}
        {activeTab === 'summary' && (
          <SummaryView
            trips={currentPlan.trips}
            flights={currentPlan.flights}
            hotels={currentPlan.hotels}
            destinations={currentPlan.destinations}
            expenses={currentPlan.expenses}
            checklist={currentPlan.checklist}
            onUpdateChecklist={(checklist) => updateCurrentPlan(p => ({ ...p, checklist }))}
          />
        )}
      </div>
      <TripModal
        key={modalKey}
        show={tripModalShow}
        editTrip={tripModalEdit}
        defaultDate={tripModalDate}
        onSave={handleSaveTrip}
        onDelete={handleDeleteTrip}
        onClose={() => setTripModalShow(false)}
        onToast={showToast}
      />
      <CriteriaModal
        key={`criteria-${modalKey}`}
        show={criteriaModalShow}
        onSave={handleSaveCriteria}
        onClose={() => setCriteriaModalShow(false)}
        onToast={showToast}
        title="添加评分维度"
      />
      <CriteriaModal
        key={`dest-criteria-${modalKey}`}
        show={destCriteriaModalShow}
        onSave={handleSaveDestCriteria}
        onClose={() => setDestCriteriaModalShow(false)}
        onToast={showToast}
        title="添加评估维度"
      />
      <CriteriaModal
        key={`flight-criteria-${modalKey}`}
        show={flightCriteriaModalShow}
        onSave={handleSaveFlightCriteria}
        onClose={() => setFlightCriteriaModalShow(false)}
        onToast={showToast}
        title="添加评估维度"
      />
      <MobileNav
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onOpenSidebar={() => setSidebarOpen(true)}
      />
      <Toast message={toastMsg} show={toastShow} />
    </div>
  )
}
