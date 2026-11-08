// Shared in-memory and persistent database for Vercel Serverless Functions
const todayStr = new Date().toISOString().slice(0, 10);
const nowTimeStr = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

export let currentUser = { id: 1, email: 'admin@pickleball.local', name: 'Admin', role: 'Administrator' };

export let session = {
  id: 1,
  started_at: new Date().toISOString(),
  start_time: nowTimeStr,
  status: 'ongoing',
  total_players: 8,
  total_courts: 3,
  notes: 'North Yard Session'
};

export let players = [
  { id: 1, name: 'Prince Miguel', playerType: 'Beginner', registeredAt: '1:00 PM', courtNumber: '2', gamesPlayed: 2, expired: false },
  { id: 2, name: 'Sarah Jenkins', playerType: 'Beginner', registeredAt: '1:05 PM', courtNumber: '2', gamesPlayed: 1, expired: false },
  { id: 3, name: 'David Chen', playerType: 'Newbie', registeredAt: '1:10 PM', courtNumber: '1', gamesPlayed: 3, expired: false },
  { id: 4, name: 'Maria Santos', playerType: 'Newbie', registeredAt: '1:15 PM', courtNumber: '1', gamesPlayed: 2, expired: false },
  { id: 5, name: 'John Doe', playerType: 'Beginner', registeredAt: '1:20 PM', courtNumber: null, gamesPlayed: 0, expired: false },
  { id: 6, name: 'Elena Cruz', playerType: 'Beginner', registeredAt: '1:22 PM', courtNumber: null, gamesPlayed: 0, expired: false },
  { id: 7, name: 'Carlos Ramos', playerType: 'Newbie', registeredAt: '1:25 PM', courtNumber: null, gamesPlayed: 1, expired: false },
  { id: 8, name: 'Hannah Lee', playerType: 'Beginner', registeredAt: '1:30 PM', courtNumber: null, gamesPlayed: 0, expired: false },
];

export let courtState = [
  { courtNumber: '1', players: [3, 4] },
  { courtNumber: '2', players: [1, 2] },
  { courtNumber: '3', players: [] }
];

export let courtTimers = {
  '1': { court_number: '1', started_at: new Date(Date.now() - 300000).toISOString(), paused_at: null },
  '2': { court_number: '2', started_at: new Date(Date.now() - 450000).toISOString(), paused_at: null },
  '3': { court_number: '3', started_at: null, paused_at: null }
};

export let queue = [
  { id: 101, session_id: 1, queue_number: 1, player_id: 5, playerName: 'John Doe', playerType: 'Beginner', position_in_queue: 1 },
  { id: 102, session_id: 1, queue_number: 1, player_id: 6, playerName: 'Elena Cruz', playerType: 'Beginner', position_in_queue: 2 },
  { id: 103, session_id: 1, queue_number: 2, player_id: 7, playerName: 'Carlos Ramos', playerType: 'Newbie', position_in_queue: 1 },
  { id: 104, session_id: 1, queue_number: 2, player_id: 8, playerName: 'Hannah Lee', playerType: 'Beginner', position_in_queue: 2 }
];

export let syncedTimers = {
  1: { player_id: 1, remaining: 12500, roundRemaining: 600, running: true, roundRunning: true, updatedAt: Date.now() },
  2: { player_id: 2, remaining: 11200, roundRemaining: 450, running: true, roundRunning: true, updatedAt: Date.now() },
  3: { player_id: 3, remaining: 10800, roundRemaining: 300, running: true, roundRunning: true, updatedAt: Date.now() },
  4: { player_id: 4, remaining: 9400, roundRemaining: 300, running: true, roundRunning: true, updatedAt: Date.now() },
  5: { player_id: 5, remaining: 14000, roundRemaining: 900, running: true, roundRunning: false, updatedAt: Date.now() },
  6: { player_id: 6, remaining: 13900, roundRemaining: 900, running: true, roundRunning: false, updatedAt: Date.now() },
  7: { player_id: 7, remaining: 13500, roundRemaining: 900, running: true, roundRunning: false, updatedAt: Date.now() },
  8: { player_id: 8, remaining: 14400, roundRemaining: 900, running: true, roundRunning: false, updatedAt: Date.now() }
};

export let matchResults = [];

export let logbook = [
  { id: 1, player_id: 1, session_id: 1, player_name: 'Prince Miguel', player_type: 'Beginner', registered_at: todayStr + ' 13:00:00', expired_at: null, amount: 200, payment_status: 'paid' },
  { id: 2, player_id: 2, session_id: 1, player_name: 'Sarah Jenkins', player_type: 'Beginner', registered_at: todayStr + ' 13:05:00', expired_at: null, amount: 200, payment_status: 'paid' },
  { id: 3, player_id: 3, session_id: 1, player_name: 'David Chen', player_type: 'Newbie', registered_at: todayStr + ' 13:10:00', expired_at: null, amount: 200, payment_status: 'unpaid' },
  { id: 4, player_id: 4, session_id: 1, player_name: 'Maria Santos', player_type: 'Newbie', registered_at: todayStr + ' 13:15:00', expired_at: null, amount: 200, payment_status: 'paid' },
  { id: 5, player_id: 5, session_id: 1, player_name: 'John Doe', player_type: 'Beginner', registered_at: todayStr + ' 13:20:00', expired_at: null, amount: 200, payment_status: 'unpaid' },
  { id: 6, player_id: 6, session_id: 1, player_name: 'Elena Cruz', player_type: 'Beginner', registered_at: todayStr + ' 13:22:00', expired_at: null, amount: 200, payment_status: 'paid' },
  { id: 7, player_id: 7, session_id: 1, player_name: 'Carlos Ramos', player_type: 'Newbie', registered_at: todayStr + ' 13:25:00', expired_at: null, amount: 200, payment_status: 'unpaid' },
  { id: 8, player_id: 8, session_id: 1, player_name: 'Hannah Lee', player_type: 'Beginner', registered_at: todayStr + ' 13:30:00', expired_at: null, amount: 200, payment_status: 'paid' },
];

export let courtRentals = [
  {
    id: 1, customer: 'Michael Reyes', contact_number: '+63 917 123 4567', person_count: 4, hourly_rate: 350, person_rate: 0,
    court: 'Court 1', rental_date: todayStr, start_time: '14:00', duration: 2, amount: 700, status: 'Booked', created_at: todayStr + ' 10:00:00'
  },
  {
    id: 2, customer: 'Anna Bautista', contact_number: '+63 920 987 6543', person_count: 6, hourly_rate: 400, person_rate: 50,
    court: 'Court 3', rental_date: todayStr, start_time: '16:00', duration: 1, amount: 700, status: 'Ongoing', created_at: todayStr + ' 11:30:00'
  }
];

export let paddleRentals = [
  {
    id: 1, customer: 'Leo Fernandez', contact_number: '+63 918 555 1234', paddles: 2, balls: 3, paddle_rate: 50, ball_rate: 20,
    amount: 160, return_time: '18:00', status: 'Rented', returned_at: null, created_at: todayStr + ' 13:00:00'
  },
  {
    id: 2, customer: 'Sophia Ramos', contact_number: '+63 922 444 8888', paddles: 1, balls: 1, paddle_rate: 50, ball_rate: 20,
    amount: 70, return_time: '15:30', status: 'Returned', returned_at: todayStr + ' 15:25:00', created_at: todayStr + ' 14:00:00'
  }
];

export let products = [
  { id: 1, name: 'Franklin X-40 Pickleball Balls (3-pack)', sku: 'BALL-FX40-3', category: 'Balls', price: 450, stock: 24, min_stock: 10, unit: 'pack', status: 'Active' },
  { id: 2, name: 'Selkirk Vanguard 2.0 Paddle', sku: 'PAD-SLK-VG2', category: 'Paddles', price: 8500, stock: 6, min_stock: 3, unit: 'pcs', status: 'Active' },
  { id: 3, name: 'North Yard Club Tour Grip', sku: 'ACC-NY-GRP', category: 'Accessories', price: 180, stock: 45, min_stock: 15, unit: 'pcs', status: 'Active' }
];

export let stockIn = [];
export let stockOut = [];
export let suppliers = [
  { id: 1, name: 'Pickleball Central PH', contact_person: 'Mark Tan', phone: '+63 917 555 0192', email: 'sales@pickleballcentral.ph', status: 'Active' }
];
export let users = [
  { id: 1, name: 'Admin', email: 'admin@pickleball.local', role: 'Administrator', status: 'Active', created_at: todayStr }
];

export function getGamesPlayed(playerId) {
  return matchResults.filter(m => m.session_id === session.id && Number(m.player_id) === Number(playerId)).length;
}

export function setQueue(newQ) { queue = newQ; }
export function setPlayers(newP) { players = newP; }
export function setCourtState(newC) { courtState = newC; }
export function setCourtTimers(newT) { courtTimers = newT; }
export function setCourtRentals(newR) { courtRentals = newR; }
export function setPaddleRentals(newR) { paddleRentals = newR; }
export function setCurrentUser(newU) { currentUser = newU; }
