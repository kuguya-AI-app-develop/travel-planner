import { useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api';
import { Plan, PlanStatus } from '../types';

interface PlanListItem {
  id: number;
  name: string;
  status: PlanStatus;
  startDate: string;
  endDate: string;
  data?: Partial<Plan>;
}

interface PlansResponse {
  plans: PlanListItem[];
}

function toFullPlan(item: PlanListItem): Plan {
  return {
    id: item.id,
    name: item.name,
    status: item.status,
    startDate: item.startDate,
    endDate: item.endDate,
    trips: item.data?.trips ?? [],
    flights: item.data?.flights ?? [],
    destinations: item.data?.destinations ?? [],
    hotels: item.data?.hotels ?? [],
    expenses: item.data?.expenses ?? [],
    checklist: item.data?.checklist ?? [],
    itinerary: item.data?.itinerary ?? [],
    packing: item.data?.packing ?? [],
    documents: item.data?.documents ?? [],
  };
}

export function usePlans() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPlans = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.get<PlansResponse>('/api/plans');
      setPlans(data.plans.map(toFullPlan));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : '加载失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  const createPlan = useCallback(async (name: string, data?: Partial<Plan>) => {
    const result = await api.post<{ plan: PlanListItem }>('/api/plans', { name, data });
    setPlans(prev => [...prev, toFullPlan(result.plan)]);
    return result.plan;
  }, []);

  const updatePlan = useCallback(async (id: number, updates: { name?: string; status?: PlanStatus; startDate?: string; endDate?: string; data?: Partial<Plan> }) => {
    await api.put('/api/plans', { id, ...updates });
    setPlans(prev =>
      prev.map(p => {
        if (p.id !== id) return p;
        const merged = { ...p, ...updates };
        if (updates.data) {
          merged.trips = updates.data.trips ?? p.trips;
          merged.flights = updates.data.flights ?? p.flights;
          merged.destinations = updates.data.destinations ?? p.destinations;
          merged.hotels = updates.data.hotels ?? p.hotels;
          merged.expenses = updates.data.expenses ?? p.expenses;
          merged.checklist = updates.data.checklist ?? p.checklist;
          merged.itinerary = updates.data.itinerary ?? p.itinerary;
          merged.packing = updates.data.packing ?? p.packing;
          merged.documents = updates.data.documents ?? p.documents;
        }
        return merged;
      })
    );
  }, []);

  const deletePlan = useCallback(async (id: number) => {
    await api.delete(`/api/plans?id=${id}`);
    setPlans(prev => prev.filter(p => p.id !== id));
  }, []);

  return { plans, loading, error, fetchPlans, createPlan, updatePlan, deletePlan };
}
