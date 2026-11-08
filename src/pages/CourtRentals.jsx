import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Calendar, Plus, Search, Trash2, CheckCircle2, Clock } from 'lucide-react';

export const CourtRentals = () => {
  const { courtRentals, addCourtRental, updateCourtRentalStatus, deleteCourtRental } = useApp();

  const [customer, setCustomer] = useState('');
  const [contact, setContact] = useState('');
  const [court, setCourt] = useState('Court 1');
  const [persons, setPersons] = useState(4);
  const [personRate, setPersonRate] = useState(0);
  const [hourlyRate, setHourlyRate] = useState(350);
  const [duration, setDuration] = useState(1);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [startTime, setStartTime] = useState('14:00');
  const [search, setSearch] = useState('');

  const totalAmount = Number(duration || 0) * Number(hourlyRate || 0) + Number(persons || 0) * Number(personRate || 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!customer.trim()) return;

    addCourtRental({
      customer,
      contact_number: contact,
      court,
      person_count: persons,
      person_rate: personRate,
      hourly_rate: hourlyRate,
      duration,
      rental_date: date,
      start_time: startTime,
    });

    setCustomer('');
    setContact('');
  };

  const filtered = courtRentals.filter(r =>
    r.customer.toLowerCase().includes(search.toLowerCase()) ||
    r.contact_number.includes(search) ||
    r.court.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* KPI Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 18,
        }}
      >
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              width: 50,
              height: 50,
              borderRadius: 14,
              background: 'linear-gradient(135deg, #22c55e, #16a34a)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Calendar size={24} />
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              Total Bookings
            </div>
            <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-main)', margin: '2px 0' }}>
              {courtRentals.length}
            </div>
            <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
              All courts
            </div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              width: 50,
              height: 50,
              borderRadius: 14,
              background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Clock size={24} />
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              Ongoing
            </div>
            <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-main)', margin: '2px 0' }}>
              {courtRentals.filter(r => r.status === 'Ongoing').length}
            </div>
            <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
              Active on court
            </div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              width: 50,
              height: 50,
              borderRadius: 14,
              background: 'linear-gradient(135deg, #f59e0b, #d97706)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            💰
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              Total Revenue
            </div>
            <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-main)', margin: '2px 0' }}>
              ₱{courtRentals.reduce((sum, r) => sum + (r.amount || 0), 0).toLocaleString()}
            </div>
            <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
              From bookings
            </div>
          </div>
        </div>
      </div>

      {/* Booking Form & List Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(320px, 380px) 1fr',
          gap: 24,
          alignItems: 'start',
        }}
      >
        {/* Form */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <h3 style={{ fontSize: 16, fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
            📝 Book a Court
          </h3>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>
            Reserve a court for hourly group play.
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-main)' }}>Customer Name *</label>
              <input
                type="text"
                required
                placeholder="Full name"
                value={customer}
                onChange={e => setCustomer(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: 10,
                  border: '1px solid var(--border)',
                  background: 'var(--bg-surface-elevated)',
                  color: 'var(--text-main)',
                  marginTop: 4,
                  outline: 'none',
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-main)' }}>Contact Number *</label>
              <input
                type="tel"
                placeholder="09xx xxx xxxx"
                value={contact}
                onChange={e => setContact(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: 10,
                  border: '1px solid var(--border)',
                  background: 'var(--bg-surface-elevated)',
                  color: 'var(--text-main)',
                  marginTop: 4,
                  outline: 'none',
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-main)' }}>Court *</label>
                <select
                  value={court}
                  onChange={e => setCourt(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 10px',
                    borderRadius: 10,
                    border: '1px solid var(--border)',
                    background: 'var(--bg-surface-elevated)',
                    color: 'var(--text-main)',
                    marginTop: 4,
                    outline: 'none',
                  }}
                >
                  <option>Court 1</option>
                  <option>Court 2</option>
                  <option>Court 3</option>
                  <option>Court 4</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-main)' }}>Persons *</label>
                <input
                  type="number"
                  min="1"
                  value={persons}
                  onChange={e => setPersons(Number(e.target.value))}
                  style={{
                    width: '100%',
                    padding: '9px 10px',
                    borderRadius: 10,
                    border: '1px solid var(--border)',
                    background: 'var(--bg-surface-elevated)',
                    color: 'var(--text-main)',
                    marginTop: 4,
                    outline: 'none',
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-main)' }}>Date *</label>
                <input
                  type="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 10px',
                    borderRadius: 10,
                    border: '1px solid var(--border)',
                    background: 'var(--bg-surface-elevated)',
                    color: 'var(--text-main)',
                    marginTop: 4,
                    outline: 'none',
                  }}
                />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-main)' }}>Start Time *</label>
                <input
                  type="time"
                  value={startTime}
                  onChange={e => setStartTime(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 10px',
                    borderRadius: 10,
                    border: '1px solid var(--border)',
                    background: 'var(--bg-surface-elevated)',
                    color: 'var(--text-main)',
                    marginTop: 4,
                    outline: 'none',
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-main)' }}>Duration (hrs) *</label>
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  value={duration}
                  onChange={e => setDuration(Number(e.target.value))}
                  style={{
                    width: '100%',
                    padding: '9px 10px',
                    borderRadius: 10,
                    border: '1px solid var(--border)',
                    background: 'var(--bg-surface-elevated)',
                    color: 'var(--text-main)',
                    marginTop: 4,
                    outline: 'none',
                  }}
                />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-main)' }}>Rate/hr (₱) *</label>
                <input
                  type="number"
                  value={hourlyRate}
                  onChange={e => setHourlyRate(Number(e.target.value))}
                  style={{
                    width: '100%',
                    padding: '9px 10px',
                    borderRadius: 10,
                    border: '1px solid var(--border)',
                    background: 'var(--bg-surface-elevated)',
                    color: 'var(--text-main)',
                    marginTop: 4,
                    outline: 'none',
                  }}
                />
              </div>
            </div>

            <div
              style={{
                background: 'var(--bg-surface-elevated)',
                padding: '12px 14px',
                borderRadius: 10,
                border: '1px solid var(--border)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: 6,
              }}
            >
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)' }}>Estimated Total:</span>
              <span style={{ fontSize: 18, fontWeight: 800, color: 'var(--accent)' }}>
                ₱{totalAmount.toLocaleString()}
              </span>
            </div>

            <button type="submit" className="btn btn-primary" style={{ marginTop: 6 }}>
              <Plus size={16} /> Save Booking
            </button>
          </form>
        </div>

        {/* Bookings Table */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                📋 Bookings List
              </h3>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>
                {filtered.length} court bookings
              </p>
            </div>

            <div style={{ position: 'relative', width: 220 }}>
              <Search size={14} style={{ position: 'absolute', left: 10, top: 10, color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search customer, court..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '7px 10px 7px 30px',
                  borderRadius: 8,
                  border: '1px solid var(--border)',
                  background: 'var(--bg-surface-elevated)',
                  color: 'var(--text-main)',
                  fontSize: 12,
                  outline: 'none',
                }}
              />
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
              <thead>
                <tr style={{ background: 'var(--bg-surface-elevated)', borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '10px 12px', textAlign: 'left' }}>Customer</th>
                  <th style={{ padding: '10px 12px', textAlign: 'left' }}>Court</th>
                  <th style={{ padding: '10px 12px', textAlign: 'left' }}>Date / Time</th>
                  <th style={{ padding: '10px 12px', textAlign: 'left' }}>Duration</th>
                  <th style={{ padding: '10px 12px', textAlign: 'left' }}>Amount</th>
                  <th style={{ padding: '10px 12px', textAlign: 'left' }}>Status</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)' }}>
                      No court rentals found.
                    </td>
                  </tr>
                ) : (
                  filtered.map(r => (
                    <tr key={r.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                      <td style={{ padding: '12px' }}>
                        <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{r.customer}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{r.contact_number}</div>
                      </td>
                      <td style={{ padding: '12px', fontWeight: 700, color: 'var(--accent)' }}>
                        {r.court}
                      </td>
                      <td style={{ padding: '12px' }}>
                        <div>{r.rental_date}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{r.start_time}</div>
                      </td>
                      <td style={{ padding: '12px' }}>
                        {r.duration} hrs ({r.person_count} pax)
                      </td>
                      <td style={{ padding: '12px', fontWeight: 800 }}>
                        ₱{r.amount}
                      </td>
                      <td style={{ padding: '12px' }}>
                        <select
                          value={r.status}
                          onChange={e => updateCourtRentalStatus(r.id, e.target.value)}
                          style={{
                            padding: '4px 8px',
                            borderRadius: 6,
                            fontSize: 11.5,
                            fontWeight: 700,
                            border: '1px solid var(--border)',
                            background: 'var(--bg-surface-elevated)',
                            color: r.status === 'Ongoing' ? 'var(--blue)' : r.status === 'Booked' ? 'var(--accent)' : 'var(--text-muted)',
                            outline: 'none',
                          }}
                        >
                          <option>Booked</option>
                          <option>Ongoing</option>
                          <option>Completed</option>
                          <option>Canceled</option>
                        </select>
                      </td>
                      <td style={{ padding: '12px', textAlign: 'right' }}>
                        <button
                          onClick={() => deleteCourtRental(r.id)}
                          className="btn btn-sm btn-secondary"
                          style={{ padding: '4px 8px', color: 'var(--red)', borderColor: 'rgba(239,68,68,0.2)' }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
