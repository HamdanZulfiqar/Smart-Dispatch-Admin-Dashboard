export interface Driver {
  id: string;
  name: string;
  status: 'Available' | 'On Delivery' | 'Off Duty';
  vehicleType: 'Semi Truck' | 'Box Truck' | 'Sprinter Van' | 'Flatbed';
  currentLocation: string;
  coords: { x: number; y: number }; // Percentage coordinate for the map grid (0-100)
  phone: string;
  rating: number;
  completedJobsCount: number;
  efficiencyScore: number; // Percentage 0-100
  activeJobId?: string | null;
}

export interface Customer {
  id: string;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  dispatchesCount: number;
  lifetimeValue: number;
  tier: 'Enterprise' | 'Premium' | 'Standard';
  status: 'Active' | 'Inactive';
  region: 'East' | 'West' | 'Midwest' | 'South';
}

export interface DispatchJob {
  id: string;
  customerId: string;
  customerName: string;
  assignedDriverId?: string | null;
  assignedDriverName?: string | null;
  status: 'Pending' | 'Assigned' | 'En Route' | 'Delivered' | 'Cancelled';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  origin: string;
  destination: string;
  originCoords: { x: number; y: number };
  destCoords: { x: number; y: number };
  eta: string; // e.g. "25 mins" or "1.5 hours"
  etaMinutes: number; // for sorting/updates
  amount: number;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
}

export interface NotificationItem {
  id: string;
  type: 'system' | 'driver' | 'dispatch' | 'alert';
  message: string;
  timestamp: string; // e.g., "3 mins ago"
  read: boolean;
  severity: 'low' | 'medium' | 'high';
}

// Predefined lists for realistic data generation
const FIRST_NAMES = ['Michael', 'James', 'David', 'Robert', 'William', 'John', 'Thomas', 'Joseph', 'Charles', 'Christopher'];
const LAST_NAMES = ['Miller', 'Smith', 'Jones', 'Taylor', 'Davis', 'Wilson', 'Anderson', 'Thomas', 'Jackson', 'White'];
const VEHICLE_TYPES = ['Semi Truck', 'Box Truck', 'Sprinter Van', 'Flatbed'] as const;
const REGIONS = ['East', 'West', 'Midwest', 'South'] as const;
const TIERS = ['Enterprise', 'Premium', 'Standard'] as const;

const COMPANIES = [
  { name: 'Apex Industrial', contact: 'Sarah Jenkins', domain: 'apexindustrial.com' },
  { name: 'Global Freight Corp', contact: 'Marcus Vance', domain: 'globalfreight.com' },
  { name: 'BioMed Logistics', contact: 'Elena Rostova', domain: 'biomedlog.com' },
  { name: 'Titan Manufacturing', contact: 'Arthur Pendelton', domain: 'titanmfg.com' },
  { name: 'Horizon Retailers', contact: 'Clara Oswald', domain: 'horizonretail.com' },
  { name: 'Vanguard Auto Parts', contact: 'Derek Jeter', domain: 'vanguardauto.com' },
  { name: 'Zenith Food Services', contact: 'Yuki Tanaka', domain: 'zenithfoods.com' },
  { name: 'Quantum Electronics', contact: 'Aria Sterling', domain: 'quantumelec.com' },
  { name: 'Evergreen Supply Co', contact: 'George McFly', domain: 'evergreensupply.com' },
  { name: 'Pioneer Pharma', contact: 'Dr. Linda Lovelace', domain: 'pioneerpharma.com' },
  { name: 'Summit Distributors', contact: 'Bruce Wayne', domain: 'summitdist.com' },
  { name: 'Interstellar Cargo', contact: 'Neil Armstrong', domain: 'interstellarcargo.com' },
  { name: 'Starlight E-Commerce', contact: 'Selena Kyle', domain: 'starlightshop.com' },
  { name: 'Atlas Construction', contact: 'Bob Builder', domain: 'atlasbuilds.com' },
  { name: 'Matrix Networking', contact: 'Neo Reeves', domain: 'matrixnet.com' },
  { name: 'Omega Agriculture', contact: 'Samwise Gamgee', domain: 'omegaagri.com' },
  { name: 'Velocity Courier', contact: 'Barry Allen', domain: 'velocitycourier.com' },
  { name: 'Echo Warehousing', contact: 'Peter Parker', domain: 'echowarehouse.com' },
  { name: 'Orion Chemicals', contact: 'Walter White', domain: 'orionchem.com' },
  { name: 'Genesis Beverages', contact: 'Tony Stark', domain: 'genesisbev.com' }
];

const CITIES = [
  { name: 'Chicago, IL', coords: { x: 55, y: 35 } },
  { name: 'Dallas, TX', coords: { x: 42, y: 78 } },
  { name: 'Los Angeles, CA', coords: { x: 12, y: 62 } },
  { name: 'New York, NY', coords: { x: 88, y: 28 } },
  { name: 'Atlanta, GA', coords: { x: 68, y: 68 } },
  { name: 'Denver, CO', coords: { x: 30, y: 44 } },
  { name: 'Seattle, WA', coords: { x: 10, y: 12 } },
  { name: 'Miami, FL', coords: { x: 78, y: 90 } },
  { name: 'Phoenix, AZ', coords: { x: 22, y: 68 } },
  { name: 'Boston, MA', coords: { x: 92, y: 22 } },
  { name: 'Kansas City, MO', coords: { x: 48, y: 46 } },
  { name: 'Indianapolis, IN', coords: { x: 58, y: 39 } },
  { name: 'Minneapolis, MN', coords: { x: 49, y: 24 } },
  { name: 'Nashville, TN', coords: { x: 62, y: 55 } },
  { name: 'Charlotte, NC', coords: { x: 76, y: 56 } }
];

// Helper to generate a random selection from an array
function pickRandom<T>(arr: T[] | readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Helper for coordinates variation
function perturb(coords: { x: number; y: number }, maxOffset = 6): { x: number; y: number } {
  return {
    x: Math.max(5, Math.min(95, coords.x + (Math.random() * maxOffset * 2 - maxOffset))),
    y: Math.max(5, Math.min(95, coords.y + (Math.random() * maxOffset * 2 - maxOffset)))
  };
}

export function generateInitialDemoData() {
  // 1. Generate 10 Drivers
  const drivers: Driver[] = Array.from({ length: 10 }, (_, i) => {
    const firstName = FIRST_NAMES[i % FIRST_NAMES.length];
    const lastName = LAST_NAMES[(i + 3) % LAST_NAMES.length];
    const status = i < 4 ? 'Available' : i < 8 ? 'On Delivery' : 'Off Duty';
    const vehicleType = VEHICLE_TYPES[i % VEHICLE_TYPES.length];
    const randomCity = pickRandom(CITIES);
    
    return {
      id: `DRV-${100 + i}`,
      name: `${firstName} ${lastName}`,
      status,
      vehicleType,
      currentLocation: randomCity.name,
      coords: perturb(randomCity.coords, 3),
      phone: `+1 (555) ${100 + i}-${2000 + i * 17}`,
      rating: parseFloat((4.2 + Math.random() * 0.8).toFixed(1)),
      completedJobsCount: 45 + Math.floor(Math.random() * 85),
      efficiencyScore: 78 + Math.floor(Math.random() * 21),
      activeJobId: null
    };
  });

  // 2. Generate 20 Customers
  const customers: Customer[] = COMPANIES.map((company, i) => {
    const region = REGIONS[i % REGIONS.length];
    const tier = i < 4 ? 'Enterprise' : i < 11 ? 'Premium' : 'Standard';
    const baseDispatches = tier === 'Enterprise' ? 45 : tier === 'Premium' ? 22 : 8;
    const dispatchesCount = baseDispatches + Math.floor(Math.random() * 15);
    const avgValue = tier === 'Enterprise' ? 2800 : tier === 'Premium' ? 1400 : 600;
    const lifetimeValue = dispatchesCount * avgValue;

    return {
      id: `CUST-${200 + i}`,
      companyName: company.name,
      contactPerson: company.contact,
      email: `${company.contact.toLowerCase().replace(' ', '.')}@${company.domain}`,
      phone: `+1 (800) 555-01${String(i).padStart(2, '0')}`,
      dispatchesCount,
      lifetimeValue,
      tier,
      status: i < 18 ? 'Active' : 'Inactive',
      region
    };
  });

  // 3. Generate 100 Dispatch Jobs
  const dispatches: DispatchJob[] = [];
  const startDaysAgo = 7;
  
  for (let i = 0; i < 100; i++) {
    const customer = pickRandom(customers);
    
    // Distribute statuses realistically
    // 0-9: Pending
    // 10-24: Assigned
    // 25-44: En Route
    // 45-94: Delivered
    // 95-99: Cancelled
    let status: DispatchJob['status'] = 'Delivered';
    if (i < 10) status = 'Pending';
    else if (i < 25) status = 'Assigned';
    else if (i < 45) status = 'En Route';
    else if (i >= 95) status = 'Cancelled';

    const originCity = pickRandom(CITIES);
    let destCity = pickRandom(CITIES);
    while (destCity.name === originCity.name) {
      destCity = pickRandom(CITIES);
    }

    const priority: DispatchJob['priority'] = i % 15 === 0 ? 'Critical' : i % 5 === 0 ? 'High' : i % 3 === 0 ? 'Medium' : 'Low';
    
    // Assign a driver if state requires it
    let assignedDriverId: string | null = null;
    let assignedDriverName: string | null = null;
    
    if (status === 'Assigned' || status === 'En Route' || status === 'Delivered') {
      // Pick a driver, preferably match and link
      const driverIndex = i % drivers.length;
      const driver = drivers[driverIndex];
      assignedDriverId = driver.id;
      assignedDriverName = driver.name;

      if (status === 'En Route' || status === 'Assigned') {
        driver.status = status === 'En Route' ? 'On Delivery' : 'Available';
        driver.activeJobId = `DSP-${300 + i}`;
      }
    }

    // Generate random timestamp inside last 7 days
    const dayOffset = Math.floor(Math.random() * startDaysAgo);
    const jobDate = new Date();
    jobDate.setDate(jobDate.getDate() - dayOffset);
    const dateStr = jobDate.toISOString().split('T')[0];
    
    const hour = String(Math.floor(Math.random() * 12) + 7).padStart(2, '0');
    const min = String(pickRandom([0, 15, 30, 45])).padStart(2, '0');
    const timeStr = `${hour}:${min}`;

    const etaMinutes = status === 'Delivered' ? 0 : status === 'Pending' ? Math.floor(Math.random() * 60) + 45 : Math.floor(Math.random() * 50) + 10;
    const etaStr = status === 'Delivered' ? 'Completed' : status === 'Cancelled' ? 'N/A' : `${etaMinutes} mins`;

    const amount = 300 + Math.floor(Math.random() * 2200);

    dispatches.push({
      id: `DSP-${300 + i}`,
      customerId: customer.id,
      customerName: customer.companyName,
      assignedDriverId,
      assignedDriverName,
      status,
      priority,
      origin: originCity.name,
      destination: destCity.name,
      originCoords: originCity.coords,
      destCoords: destCity.coords,
      eta: etaStr,
      etaMinutes,
      amount,
      date: dateStr,
      time: timeStr
    });
  }

  // Ensure driver active job assignments are correctly mapped to their profile
  drivers.forEach(drv => {
    const activeJob = dispatches.find(d => d.assignedDriverId === drv.id && (d.status === 'Assigned' || d.status === 'En Route'));
    if (activeJob) {
      drv.activeJobId = activeJob.id;
      drv.status = activeJob.status === 'En Route' ? 'On Delivery' : 'Available';
    } else {
      drv.activeJobId = null;
      if (drv.status === 'On Delivery') {
        drv.status = 'Available';
      }
    }
  });

  // 4. Generate some initial Notifications
  const notifications: NotificationItem[] = [
    {
      id: 'ntf-1',
      type: 'alert',
      message: 'Critical Latency Spike on Route DSP-302 (Driver James Taylor delayed on I-90).',
      timestamp: '5 mins ago',
      read: false,
      severity: 'high'
    },
    {
      id: 'ntf-2',
      type: 'driver',
      message: 'Driver Michael Miller has checked-in and status set to "Available".',
      timestamp: '15 mins ago',
      read: false,
      severity: 'low'
    },
    {
      id: 'ntf-3',
      type: 'dispatch',
      message: 'Route optimization generated for Apex Industrial (DSP-314). Saved 14% fuel.',
      timestamp: '32 mins ago',
      read: true,
      severity: 'medium'
    },
    {
      id: 'ntf-4',
      type: 'system',
      message: 'System Backup completed successfully. Cloud database in sync.',
      timestamp: '1 hour ago',
      read: true,
      severity: 'low'
    },
    {
      id: 'ntf-5',
      type: 'alert',
      message: 'New Critical priority dispatch received from Titan Manufacturing (DSP-399).',
      timestamp: '2 hours ago',
      read: false,
      severity: 'high'
    }
  ];

  return { drivers, customers, dispatches, notifications };
}
