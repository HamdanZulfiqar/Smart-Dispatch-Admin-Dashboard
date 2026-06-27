'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Driver, 
  Customer, 
  DispatchJob, 
  NotificationItem, 
  generateInitialDemoData 
} from '../lib/dispatchData';

export interface AdminProfile {
  name: string;
  email: string;
  role: string;
  avatarUrl: string;
}

export interface SystemSettings {
  theme: 'dark' | 'light' | 'system' | 'contrast';
  notificationsEnabled: boolean;
  autoOptimizeRoutes: boolean;
  simulationSpeed: 'paused' | 'normal' | 'fast';
  refreshInterval: number; // in seconds
}

function perturb(coords: { x: number; y: number }, maxOffset = 6): { x: number; y: number } {
  return {
    x: Math.max(5, Math.min(95, coords.x + (Math.random() * maxOffset * 2 - maxOffset))),
    y: Math.max(5, Math.min(95, coords.y + (Math.random() * maxOffset * 2 - maxOffset)))
  };
}

function pickRandom<T>(arr: T[] | readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function useDispatchStore() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [dispatches, setDispatches] = useState<DispatchJob[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  
  const [currentUser, setCurrentUser] = useState<{ email: string; name: string } | null>(null);
  const [adminProfile, setAdminProfile] = useState<AdminProfile>({
    name: 'Alex Rivera',
    email: 'alex.rivera@smartdispatch.com',
    role: 'Senior Logistics Director',
    avatarUrl: 'https://picsum.photos/seed/admin/200/200'
  });
  
  const [settings, setSettings] = useState<SystemSettings>({
    theme: 'dark',
    notificationsEnabled: true,
    autoOptimizeRoutes: true,
    simulationSpeed: 'normal',
    refreshInterval: 5
  });

  const [initialized, setInitialized] = useState(false);

  // Initialize data from localStorage or default
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const timer = setTimeout(() => {
      // Load auth
      const storedUser = localStorage.getItem('sd_user');
      if (storedUser) {
        try {
          setCurrentUser(JSON.parse(storedUser));
        } catch (e) {
          // ignore
        }
      }

      // Load settings
      const storedSettings = localStorage.getItem('sd_settings');
      if (storedSettings) {
        try {
          setSettings(JSON.parse(storedSettings));
        } catch (e) {
          // ignore
        }
      }

      // Load profile
      const storedProfile = localStorage.getItem('sd_profile');
      if (storedProfile) {
        try {
          setAdminProfile(JSON.parse(storedProfile));
        } catch (e) {
          // ignore
        }
      }

      // Load core lists
      const storedDrivers = localStorage.getItem('sd_drivers');
      const storedCustomers = localStorage.getItem('sd_customers');
      const storedDispatches = localStorage.getItem('sd_dispatches');
      const storedNotifications = localStorage.getItem('sd_notifications');

      if (storedDrivers && storedCustomers && storedDispatches && storedNotifications) {
        try {
          setDrivers(JSON.parse(storedDrivers));
          setCustomers(JSON.parse(storedCustomers));
          setDispatches(JSON.parse(storedDispatches));
          setNotifications(JSON.parse(storedNotifications));
          setInitialized(true);
          return;
        } catch (e) {
          // Corrupt localstorage, rebuild
        }
      }

      // Generate fresh demo data
      const demo = generateInitialDemoData();
      setDrivers(demo.drivers);
      setCustomers(demo.customers);
      setDispatches(demo.dispatches);
      setNotifications(demo.notifications);

      localStorage.setItem('sd_drivers', JSON.stringify(demo.drivers));
      localStorage.setItem('sd_customers', JSON.stringify(demo.customers));
      localStorage.setItem('sd_dispatches', JSON.stringify(demo.dispatches));
      localStorage.setItem('sd_notifications', JSON.stringify(demo.notifications));
      
      setInitialized(true);
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  // Save changes helper
  const syncState = useCallback((
    updatedDrivers: Driver[], 
    updatedCustomers: Customer[], 
    updatedDispatches: DispatchJob[], 
    updatedNotifications: NotificationItem[]
  ) => {
    setDrivers(updatedDrivers);
    setCustomers(updatedCustomers);
    setDispatches(updatedDispatches);
    setNotifications(updatedNotifications);

    localStorage.setItem('sd_drivers', JSON.stringify(updatedDrivers));
    localStorage.setItem('sd_customers', JSON.stringify(updatedCustomers));
    localStorage.setItem('sd_dispatches', JSON.stringify(updatedDispatches));
    localStorage.setItem('sd_notifications', JSON.stringify(updatedNotifications));
  }, []);

  // Reset demo data function
  const resetDemoData = useCallback(() => {
    const demo = generateInitialDemoData();
    syncState(demo.drivers, demo.customers, demo.dispatches, demo.notifications);
    
    // Add toast-like notification
    const newNotif: NotificationItem = {
      id: `ntf-reset-${Date.now()}`,
      type: 'system',
      message: 'System data reset to initial demo values.',
      timestamp: 'Just now',
      read: false,
      severity: 'low'
    };
    const nextNotifs = [newNotif, ...demo.notifications];
    setNotifications(nextNotifs);
    localStorage.setItem('sd_notifications', JSON.stringify(nextNotifs));
  }, [syncState]);

  // Authenticate user
  const login = useCallback((email: string, name: string) => {
    const user = { email, name };
    setCurrentUser(user);
    localStorage.setItem('sd_user', JSON.stringify(user));
  }, []);

  const signup = useCallback((email: string, name: string) => {
    const user = { email, name };
    setCurrentUser(user);
    localStorage.setItem('sd_user', JSON.stringify(user));
  }, []);

  const logout = useCallback(() => {
    setCurrentUser(null);
    localStorage.removeItem('sd_user');
  }, []);

  // Update Settings
  const updateSettings = useCallback((newSettings: Partial<SystemSettings>) => {
    setSettings(prev => {
      const merged = { ...prev, ...newSettings };
      localStorage.setItem('sd_settings', JSON.stringify(merged));
      return merged;
    });
  }, []);

  // Update Admin Profile
  const updateAdminProfile = useCallback((profile: Partial<AdminProfile>) => {
    setAdminProfile(prev => {
      const merged = { ...prev, ...profile };
      localStorage.setItem('sd_profile', JSON.stringify(merged));
      return merged;
    });
  }, []);

  // Add a new Dispatch job
  const addDispatchJob = useCallback((jobData: Omit<DispatchJob, 'id' | 'date' | 'time' | 'etaMinutes' | 'eta'>) => {
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];
    const timeStr = today.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    
    const newJob: DispatchJob = {
      ...jobData,
      id: `DSP-${300 + dispatches.length + 1}`,
      date: dateStr,
      time: timeStr,
      eta: jobData.status === 'Delivered' ? 'Completed' : '45 mins',
      etaMinutes: jobData.status === 'Delivered' ? 0 : 45
    };

    const nextDispatches = [newJob, ...dispatches];
    
    // Increment customer dispatch count
    const nextCustomers = customers.map(cust => {
      if (cust.id === jobData.customerId) {
        return {
          ...cust,
          dispatchesCount: cust.dispatchesCount + 1,
          lifetimeValue: cust.lifetimeValue + jobData.amount
        };
      }
      return cust;
    });

    // Update driver if assigned
    const nextDrivers = drivers.map(drv => {
      if (jobData.assignedDriverId && drv.id === jobData.assignedDriverId) {
        return {
          ...drv,
          status: jobData.status === 'En Route' ? ('On Delivery' as const) : ('Available' as const),
          activeJobId: newJob.id
        };
      }
      return drv;
    });

    // Generate notification
    const newNotif: NotificationItem = {
      id: `ntf-${Date.now()}`,
      type: 'dispatch',
      message: `New ${jobData.priority} dispatch created: ${newJob.id} for ${jobData.customerName}`,
      timestamp: 'Just now',
      read: false,
      severity: jobData.priority === 'Critical' ? 'high' : jobData.priority === 'High' ? 'medium' : 'low'
    };

    syncState(nextDrivers, nextCustomers, nextDispatches, [newNotif, ...notifications]);
    return newJob;
  }, [dispatches, customers, drivers, notifications, syncState]);

  // Update dispatch job details or status
  const updateDispatchStatus = useCallback((jobId: string, status: DispatchJob['status'], details?: Partial<DispatchJob>) => {
    let affectedDriverId: string | null = null;
    let oldDriverId: string | null = null;

    const nextDispatches = dispatches.map(job => {
      if (job.id === jobId) {
        oldDriverId = job.assignedDriverId || null;
        const updated = { 
          ...job, 
          status,
          eta: status === 'Delivered' ? 'Completed' : status === 'Cancelled' ? 'N/A' : job.eta,
          etaMinutes: status === 'Delivered' ? 0 : job.etaMinutes,
          ...details 
        };
        affectedDriverId = updated.assignedDriverId || null;
        return updated;
      }
      return job;
    });

    // Recompute driver states
    const nextDrivers = drivers.map(drv => {
      // Driver released
      if (oldDriverId && drv.id === oldDriverId && oldDriverId !== affectedDriverId) {
        return { ...drv, status: 'Available' as const, activeJobId: null };
      }
      // If completed
      if (oldDriverId && drv.id === oldDriverId && status === 'Delivered') {
        return { 
          ...drv, 
          status: 'Available' as const, 
          activeJobId: null,
          completedJobsCount: drv.completedJobsCount + 1,
          efficiencyScore: Math.min(100, drv.efficiencyScore + 1)
        };
      }
      // If cancelled
      if (oldDriverId && drv.id === oldDriverId && status === 'Cancelled') {
        return { ...drv, status: 'Available' as const, activeJobId: null };
      }
      // Driver newly assigned
      if (affectedDriverId && drv.id === affectedDriverId) {
        return {
          ...drv,
          status: status === 'En Route' ? ('On Delivery' as const) : ('Available' as const),
          activeJobId: jobId
        };
      }
      return drv;
    });

    // Generate Notification
    const jobRef = dispatches.find(j => j.id === jobId);
    const newNotif: NotificationItem = {
      id: `ntf-${Date.now()}`,
      type: 'dispatch',
      message: `Dispatch ${jobId} status updated to [${status}].`,
      timestamp: 'Just now',
      read: false,
      severity: status === 'Cancelled' ? 'high' : 'low'
    };

    syncState(nextDrivers, customers, nextDispatches, [newNotif, ...notifications]);
  }, [dispatches, drivers, customers, notifications, syncState]);

  // Assign Driver manual action
  const assignDriverToJob = useCallback((jobId: string, driverId: string | null) => {
    const job = dispatches.find(j => j.id === jobId);
    const driver = drivers.find(d => d.id === driverId);

    if (!job) return;

    const nextDispatches = dispatches.map(j => {
      if (j.id === jobId) {
        return {
          ...j,
          assignedDriverId: driverId,
          assignedDriverName: driver ? driver.name : null,
          status: driverId ? ('Assigned' as const) : ('Pending' as const)
        };
      }
      return j;
    });

    const nextDrivers = drivers.map(drv => {
      // If driver was previously assigned to this job, free them up
      if (job.assignedDriverId && drv.id === job.assignedDriverId && drv.id !== driverId) {
        return { ...drv, activeJobId: null, status: 'Available' as const };
      }
      // Assign the new driver
      if (driverId && drv.id === driverId) {
        return {
          ...drv,
          activeJobId: jobId,
          status: 'Available' as const // It remains available till route becomes En Route
        };
      }
      return drv;
    });

    const newNotif: NotificationItem = {
      id: `ntf-assign-${Date.now()}`,
      type: 'driver',
      message: driverId 
        ? `Driver ${driver?.name} manual assignment to dispatch ${jobId}.`
        : `Removed driver assignment from dispatch ${jobId}.`,
      timestamp: 'Just now',
      read: false,
      severity: 'low'
    };

    syncState(nextDrivers, customers, nextDispatches, [newNotif, ...notifications]);
  }, [dispatches, drivers, customers, notifications, syncState]);

  // Edit/Modify Driver profile (such as changing status)
  const updateDriverProfile = useCallback((driverId: string, details: Partial<Driver>) => {
    const nextDrivers = drivers.map(drv => {
      if (drv.id === driverId) {
        return { ...drv, ...details };
      }
      return drv;
    });

    const driverName = drivers.find(d => d.id === driverId)?.name || 'Driver';
    const newNotif: NotificationItem = {
      id: `ntf-drv-mod-${Date.now()}`,
      type: 'driver',
      message: `Driver ${driverName} profile or status updated by dispatcher.`,
      timestamp: 'Just now',
      read: false,
      severity: 'low'
    };

    syncState(nextDrivers, customers, dispatches, [newNotif, ...notifications]);
  }, [drivers, customers, dispatches, notifications, syncState]);

  // Dismiss notification
  const dismissNotification = useCallback((notifId: string) => {
    const nextNotifs = notifications.filter(n => n.id !== notifId);
    setNotifications(nextNotifs);
    localStorage.setItem('sd_notifications', JSON.stringify(nextNotifs));
  }, [notifications]);

  // Clear all notifications
  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
    localStorage.setItem('sd_notifications', JSON.stringify([]));
  }, []);

  // Mark all notifications read
  const markAllNotificationsRead = useCallback(() => {
    const nextNotifs = notifications.map(n => ({ ...n, read: true }));
    setNotifications(nextNotifs);
    localStorage.setItem('sd_notifications', JSON.stringify(nextNotifs));
  }, [notifications]);

  // Ref to hold state variables for simulation loop, avoiding stale-closure references
  const stateRef = useRef({ drivers, dispatches, customers, notifications, settings });
  useEffect(() => {
    stateRef.current = { drivers, dispatches, customers, notifications, settings };
  }, [drivers, dispatches, customers, notifications, settings]);

  // Periodic real-time updates simulation loop
  useEffect(() => {
    if (!initialized || settings.simulationSpeed === 'paused') return;

    const intervalSeconds = settings.simulationSpeed === 'fast' ? 2 : 6;
    
    const interval = setInterval(() => {
      const current = stateRef.current;
      if (current.settings.simulationSpeed === 'paused') return;

      let changed = false;
      let newNotifs: NotificationItem[] = [...current.notifications];

      // 1. Move drivers who are "On Delivery"
      const updatedDrivers = current.drivers.map(drv => {
        if (drv.status === 'On Delivery' && drv.activeJobId) {
          // Find the active dispatch job to move towards destination
          const job = current.dispatches.find(d => d.id === drv.activeJobId);
          if (job) {
            // Move a small fraction closer to destCoords
            const targetX = job.destCoords.x;
            const targetY = job.destCoords.y;
            const dx = targetX - drv.coords.x;
            const dy = targetY - drv.coords.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance > 1.5) {
              // Move speed based on simulation speed
              const step = current.settings.simulationSpeed === 'fast' ? 3.5 : 1.5;
              const ratio = Math.min(1, step / distance);
              const nextX = drv.coords.x + dx * ratio;
              const nextY = drv.coords.y + dy * ratio;

              changed = true;
              return {
                ...drv,
                coords: { x: nextX, y: nextY }
              };
            }
          }
        }
        return drv;
      });

      // 2. Decrement ETA of active dispatches and potentially deliver them
      const updatedDispatches = current.dispatches.map(job => {
        if (job.status === 'En Route') {
          const matchingDrv = updatedDrivers.find(d => d.activeJobId === job.id);
          
          if (matchingDrv) {
            // Check distance
            const dx = job.destCoords.x - matchingDrv.coords.x;
            const dy = job.destCoords.y - matchingDrv.coords.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance <= 1.8) {
              // Delivery complete!
              changed = true;
              
              // Trigger delivery completion event
              newNotifs = [
                {
                  id: `ntf-del-${Date.now()}-${job.id}`,
                  type: 'dispatch',
                  message: `Job ${job.id} successfully delivered to ${job.customerName} destination.`,
                  timestamp: 'Just now',
                  read: false,
                  severity: 'low'
                },
                ...newNotifs
              ];

              return {
                ...job,
                status: 'Delivered' as const,
                eta: 'Completed',
                etaMinutes: 0
              };
            } else {
              // Just decrement minutes
              const nextMins = Math.max(1, job.etaMinutes - (current.settings.simulationSpeed === 'fast' ? 4 : 1));
              changed = true;
              return {
                ...job,
                etaMinutes: nextMins,
                eta: `${nextMins} mins`
              };
            }
          }
        }
        return job;
      });

      // Update delivery count and release drivers for completed jobs
      const finalDrivers = updatedDrivers.map(drv => {
        if (drv.activeJobId) {
          const job = updatedDispatches.find(j => j.id === drv.activeJobId);
          if (job && job.status === 'Delivered') {
            return {
              ...drv,
              status: 'Available' as const,
              activeJobId: null,
              completedJobsCount: drv.completedJobsCount + 1,
              efficiencyScore: Math.min(100, drv.efficiencyScore + Math.floor(Math.random() * 2))
            };
          }
        }
        return drv;
      });

      // 3. Occasional spontaneous trigger (e.g. 15% chance to set Assigned driver En Route, or trigger a random route alert)
      let finalDispatches = [...updatedDispatches];
      let finalDrivers2 = [...finalDrivers];
      
      const rand = Math.random();
      
      if (rand < 0.12) {
        // Find an 'Assigned' job and transition to 'En Route'
        const assignedJob = finalDispatches.find(j => j.status === 'Assigned');
        if (assignedJob) {
          const drv = finalDrivers2.find(d => d.id === assignedJob.assignedDriverId);
          if (drv) {
            changed = true;
            finalDispatches = finalDispatches.map(j => {
              if (j.id === assignedJob.id) {
                return { ...j, status: 'En Route' as const };
              }
              return j;
            });
            finalDrivers2 = finalDrivers2.map(d => {
              if (d.id === drv.id) {
                return { ...d, status: 'On Delivery' as const, coords: perturb(assignedJob.originCoords, 2) };
              }
              return d;
            });

            newNotifs = [
              {
                id: `ntf-enroute-${Date.now()}`,
                type: 'driver',
                message: `Driver ${drv.name} is now en route with dispatch ${assignedJob.id}.`,
                timestamp: 'Just now',
                read: false,
                severity: 'low'
              },
              ...newNotifs
            ];
          }
        }
      } else if (rand > 0.94) {
        // Generate random emergency/alert notification
        const activeDrv = finalDrivers2.find(d => d.status === 'On Delivery');
        if (activeDrv) {
          changed = true;
          const alerts = [
            `Minor traffic delay reported on route for Driver ${activeDrv.name}.`,
            `Weather watch warning issued in Driver ${activeDrv.name}'s active area.`,
            `Route optimization applied dynamically for Driver ${activeDrv.name}.`
          ];
          newNotifs = [
            {
              id: `ntf-alert-${Date.now()}`,
              type: 'alert',
              message: pickRandom(alerts),
              timestamp: 'Just now',
              read: false,
              severity: 'medium'
            },
            ...newNotifs
          ];
        }
      }

      if (changed) {
        syncState(finalDrivers2, current.customers, finalDispatches, newNotifs);
      }
    }, intervalSeconds * 1000);

    return () => clearInterval(interval);
  }, [initialized, settings.simulationSpeed, syncState]);

  return {
    drivers,
    customers,
    dispatches,
    notifications,
    currentUser,
    adminProfile,
    settings,
    initialized,
    login,
    signup,
    logout,
    resetDemoData,
    addDispatchJob,
    updateDispatchStatus,
    assignDriverToJob,
    updateDriverProfile,
    dismissNotification,
    clearAllNotifications,
    markAllNotificationsRead,
    updateSettings,
    updateAdminProfile
  };
}
