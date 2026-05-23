import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  LogOut,
  Search,
  Stethoscope,
  MapPin,
  RefreshCw,
  Trash2,
  Phone,
  User,
  IdCard,
  Home,
  Cake,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';
import { db, auth, googleProvider, AppointmentStatus, type Appointment } from '../lib/firebase';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  getDocs,
  where,
  serverTimestamp,
} from 'firebase/firestore';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

function safeFormatDate(date: string) {
  if (!date) return 'Sem data';

  try {
    const [year, month, day] = date.split('-').map(Number);
    return format(new Date(year, month - 1, day), "dd 'de' MMM", { locale: ptBR });
  } catch {
    return date;
  }
}

function onlyNumbers(value: string) {
  return (value || '').replace(/\D/g, '');
}

function whatsappUrl(phone: string) {
  const digits = onlyNumbers(phone);
  const normalized = digits.startsWith('55') ? digits : `55${digits}`;
  return `https://wa.me/${normalized}`;
}

function confirmationWhatsappUrl(app: Appointment) {
  const digits = onlyNumbers(app.patientWhatsApp);
  const normalized = digits.startsWith('55') ? digits : `55${digits}`;
  const firstName = (app.patientName || 'Olá').split(' ')[0];
  const unit = app.unit || 'unidade selecionada';
  const date = safeFormatDate(app.date);
  const time = app.time ? `${app.time}h` : 'horário selecionado';

  const message = encodeURIComponent(
    `Olá, ${firstName}! Sua avaliação gratuita na Odonto Líder Prime foi confirmada na ${unit}, para ${date} às ${time}.\n\n` +
      `O atendimento é por ordem de chegada. Qualquer dúvida, pode responder por aqui.`
  );

  return `https://wa.me/${normalized}?text=${message}`;
}

async function confirmAndOpenWhatsApp(app: Appointment, updateStatus: (id: string, status: AppointmentStatus) => Promise<void>) {
  await updateStatus(app.id, AppointmentStatus.CONFIRMED);
  window.open(confirmationWhatsappUrl(app), '_blank', 'noopener,noreferrer');
}

function statusLabel(status: AppointmentStatus | string) {
  if (status === AppointmentStatus.PATIENT_CONFIRMED) return 'Confirmado pela clínica';
  if (status === AppointmentStatus.PATIENT_CANCELLED) return 'Cancelado pelo paciente';
  if (status === AppointmentStatus.CONFIRMED) return 'Confirmado pela clínica';
  if (status === AppointmentStatus.COMPLETED) return 'Concluído';
  if (status === AppointmentStatus.CANCELLED) return 'Cancelado pela clínica';
  return 'Pendente';
}

function statusShortLabel(status: AppointmentStatus | 'all') {
  if (status === 'all') return 'Todos';
  if (status === AppointmentStatus.PENDING) return 'Pendentes';
  if (status === AppointmentStatus.PATIENT_CANCELLED) return 'Canc. paciente';
  if (status === AppointmentStatus.CONFIRMED) return 'Conf. clínica';
  if (status === AppointmentStatus.COMPLETED) return 'Concluídos';
  return 'Canc. clínica';
}

function statusClass(status: AppointmentStatus | string) {
  if (status === AppointmentStatus.PATIENT_CONFIRMED) return 'is-green';
  if (status === AppointmentStatus.PATIENT_CANCELLED || status === AppointmentStatus.CANCELLED) return 'is-red';
  if (status === AppointmentStatus.CONFIRMED) return 'is-emerald';
  if (status === AppointmentStatus.COMPLETED) return 'is-blue';
  return 'is-orange';
}

export default function AdminDashboard() {
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filter, setFilter] = useState<AppointmentStatus | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    let unsubAppointments: undefined | (() => void);

    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);

      if (u) {
        const isAdminUser = u.email === 'onblek238@gmail.com';

        const adminRef = collection(db, 'admins');
        const adminSnap = await getDocs(query(adminRef, where('__name__', '==', u.uid)));

        if (isAdminUser || !adminSnap.empty) {
          setIsAdmin(true);
          unsubAppointments = fetchAppointments();
        } else {
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }

      setLoading(false);
    });

    return () => {
      unsub();
      if (unsubAppointments) unsubAppointments();
    };
  }, []);

  const fetchAppointments = () => {
    const q = query(collection(db, 'appointments'), orderBy('createdAt', 'desc'));

    return onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((item) => ({ id: item.id, ...item.data() }) as Appointment);
      setAppointments(data);
    });
  };

  const updateStatus = async (id: string, status: AppointmentStatus) => {
    const docRef = doc(db, 'appointments', id);
    await updateDoc(docRef, { status, updatedAt: serverTimestamp() });
  };

  const deleteAppointment = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este agendamento?')) {
      await deleteDoc(doc(db, 'appointments', id));
    }
  };

  const login = () => signInWithPopup(auth, googleProvider);
  const logout = () => signOut(auth);

  const filteredAppointments = appointments.filter((app) => {
    const extra = app as any;
    const matchesFilter = filter === 'all' || app.status === filter;
    const searchable = `${app.patientName || ''} ${app.patientWhatsApp || ''} ${app.treatment || ''} ${extra.patientCPF || ''} ${extra.patientRG || ''}`.toLowerCase();
    const matchesSearch = searchable.includes(searchTerm.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const stats = {
    total: appointments.length,
    pending: appointments.filter((a) => a.status === AppointmentStatus.PENDING).length,
    patientCancelled: appointments.filter((a) => a.status === AppointmentStatus.PATIENT_CANCELLED).length,
    confirmed: appointments.filter((a) => a.status === AppointmentStatus.CONFIRMED).length,
    completed: appointments.filter((a) => a.status === AppointmentStatus.COMPLETED).length,
    today: appointments.filter((a) => a.date === new Date().toISOString().split('T')[0]).length,
  };

  const conversionRate = stats.total > 0 ? Math.round(((stats.confirmed + stats.completed) / stats.total) * 100) : 0;

  if (loading) {
    return (
      <div className="admin-login">
        <RefreshCw className="admin-spinner" size={42} />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="admin-login">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="admin-login-card"
        >
          <div className="admin-login-icon">
            <MapPin size={30} />
          </div>

          <p className="admin-eyebrow">Área restrita</p>
          <h1>Painel Administrativo</h1>
          <p>Acesse o gerenciamento de avaliações e pacientes.</p>

          {user ? (
            <div className="admin-denied">
              <p>
                Acesso negado para <strong>{user.email}</strong>.
                <br />
                Entre em contato para liberação.
              </p>

              <button onClick={logout} className="admin-link-button">
                Sair da conta
              </button>
            </div>
          ) : (
            <button onClick={login} className="admin-primary-button">
              Entrar com Google
            </button>
          )}
        </motion.div>
      </div>
    );
  }

  const statCards = [
    { label: 'Hoje', val: stats.today, icon: Clock, tone: 'orange' },
    { label: 'Pendentes', val: stats.pending, icon: RefreshCw, tone: 'amber' },
    { label: 'Confirmadas', val: stats.confirmed, icon: CheckCircle, tone: 'green' },
    { label: 'Conversão', val: `${conversionRate}%`, icon: TrendingUp, tone: 'dark' },
  ];

  const filters = ['all', AppointmentStatus.PENDING, AppointmentStatus.PATIENT_CANCELLED, AppointmentStatus.CONFIRMED, AppointmentStatus.COMPLETED, AppointmentStatus.CANCELLED] as const;

  return (
    <div className="admin-shell">
      <header className="admin-topbar">
        <div className="admin-brand">
          <div className="admin-brand-mark">O</div>
          <div>
            <strong>Odonto Admin Prime</strong>
            <span>Sistema de avaliações</span>
          </div>
        </div>

        <div className="admin-top-actions">
          <div className="admin-online">
            <span />
            Sistema online
          </div>

          <div className="admin-user">
            <strong>{user?.displayName || 'Administrador'}</strong>
            <span>Administrador</span>
          </div>

          <button onClick={logout} className="admin-logout" aria-label="Sair">
            <LogOut size={20} />
          </button>
        </div>
      </header>

      <main className="admin-main">
        <section className="admin-hero-panel">
          <div>
            <p className="admin-eyebrow">Avaliação gratuita</p>
            <h1>Atendimento por ordem de chegada</h1>
          </div>

          <p>
            Os pacientes solicitam uma avaliação gratuita pelo site e os dados de cadastro chegam aqui organizados para a equipe.
          </p>
        </section>

        <section className="admin-stats-grid">
          {statCards.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className={`admin-stat-card admin-stat-${s.tone}`}
            >
              <div>
                <span>{s.label}</span>
                <strong>{s.val}</strong>
              </div>

              <div className="admin-stat-icon">
                <s.icon size={24} />
              </div>
            </motion.div>
          ))}
        </section>

        <section className="admin-toolbar">
          <div>
            <p className="admin-eyebrow">Controle</p>
            <h2>Avaliações solicitadas</h2>
          </div>

          <div className="admin-tools">
            <label className="admin-search">
              <Search size={18} />
              <input
                placeholder="Buscar nome, CPF, RG ou WhatsApp..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </label>

            <div className="admin-filter-tabs">
              {filters.map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f as any)}
                  className={filter === f ? 'is-active' : ''}
                >
                  {statusShortLabel(f)}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="admin-appointments">
          <AnimatePresence>
            {filteredAppointments.map((app) => {
              const extra = app as any;

              return (
                <motion.article
                  key={app.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="admin-appointment-card"
                >
                  <div className="admin-patient-main">
                    <div className="admin-patient-name">
                      <User size={18} />
                      <h3>{app.patientName}</h3>
                    </div>

                    <div className="admin-patient-tags">
                      <a href={whatsappUrl(app.patientWhatsApp)} target="_blank" rel="noreferrer">
                        <Phone size={13} /> {app.patientWhatsApp}
                      </a>
                      <span>
                        <MapPin size={13} /> {app.unit}
                      </span>
                      <span>
                        <Calendar size={13} /> {safeFormatDate(app.date)} às {app.time}h
                      </span>
                      {extra.protocol && <span>Protocolo: {extra.protocol}</span>}
                    </div>
                  </div>

                  <div className="admin-patient-details">
                    <div>
                      <Stethoscope size={15} />
                      <strong>{app.treatment || 'Avaliação gratuita'}</strong>
                    </div>
                    <div>
                      <Cake size={15} />
                      <span>Nasc.: {extra.patientBirthDate || 'Não informado'}</span>
                    </div>
                    <div>
                      <IdCard size={15} />
                      <span>RG: {extra.patientRG || 'Não informado'}</span>
                    </div>
                    <div>
                      <IdCard size={15} />
                      <span>CPF: {extra.patientCPF || 'Não informado'}</span>
                    </div>
                    <div className="admin-detail-wide">
                      <Home size={15} />
                      <span>End.: {extra.patientAddress || 'Não informado'}</span>
                    </div>
                    {(extra.guardianName || extra.guardianCPF) && (
                      <div className="admin-detail-wide">
                        <ShieldCheck size={15} />
                        <span>Responsável: {extra.guardianName || 'Não informado'} • CPF: {extra.guardianCPF || 'Não informado'}</span>
                      </div>
                    )}
                  </div>

                  <div className="admin-card-actions">
                    <span className={`admin-status-badge ${statusClass(app.status)}`}>
                      {statusLabel(app.status)}
                    </span>

                    <div className="admin-action-buttons">
                      {(app.status === AppointmentStatus.PENDING || app.status === AppointmentStatus.PATIENT_CONFIRMED) && (
                        <button
                          onClick={() => confirmAndOpenWhatsApp(app, updateStatus)}
                          title="Confirmar e chamar no WhatsApp"
                          className="admin-whatsapp-confirm"
                        >
                          <Phone size={18} />
                        </button>
                      )}
                      {app.status !== AppointmentStatus.COMPLETED && app.status !== AppointmentStatus.CANCELLED && app.status !== AppointmentStatus.PATIENT_CANCELLED && (
                        <button onClick={() => updateStatus(app.id, AppointmentStatus.COMPLETED)} title="Concluir">
                          <ShieldCheck size={18} />
                        </button>
                      )}
                      {app.status !== AppointmentStatus.CANCELLED && (
                        <button onClick={() => updateStatus(app.id, AppointmentStatus.CANCELLED)} title="Cancelar">
                          <XCircle size={18} />
                        </button>
                      )}
                      <button onClick={() => deleteAppointment(app.id)} title="Excluir">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>

                  {app.notes && <p className="admin-notes">Observação: {app.notes}</p>}
                </motion.article>
              );
            })}
          </AnimatePresence>

          {filteredAppointments.length === 0 && (
            <div className="admin-empty-state">
              Nenhuma avaliação encontrada
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
