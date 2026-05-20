import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  BarChart,
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
import { cn } from '../lib/utils';
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


function statusLabel(status: AppointmentStatus | string) {
  if (status === AppointmentStatus.PATIENT_CONFIRMED) return 'Confirmado pelo paciente';
  if (status === AppointmentStatus.PATIENT_CANCELLED) return 'Cancelado pelo paciente';
  if (status === AppointmentStatus.CONFIRMED) return 'Confirmado pela clínica';
  if (status === AppointmentStatus.COMPLETED) return 'Concluído';
  if (status === AppointmentStatus.CANCELLED) return 'Cancelado pela clínica';
  return 'Pendente';
}

function statusBadgeClass(status: AppointmentStatus | string) {
  if (status === AppointmentStatus.PATIENT_CONFIRMED) return 'bg-green-100 text-green-700';
  if (status === AppointmentStatus.PATIENT_CANCELLED) return 'bg-red-100 text-red-700';
  if (status === AppointmentStatus.CONFIRMED) return 'bg-emerald-100 text-emerald-700';
  if (status === AppointmentStatus.COMPLETED) return 'bg-blue-100 text-blue-700';
  if (status === AppointmentStatus.CANCELLED) return 'bg-zinc-100 text-zinc-700';
  return 'bg-amber-100 text-amber-700';
}

function statusShortLabel(status: AppointmentStatus | 'all') {
  if (status === 'all') return 'Todos';
  if (status === AppointmentStatus.PENDING) return 'Pendentes';
  if (status === AppointmentStatus.PATIENT_CONFIRMED) return 'Conf. paciente';
  if (status === AppointmentStatus.PATIENT_CANCELLED) return 'Canc. paciente';
  if (status === AppointmentStatus.CONFIRMED) return 'Conf. clínica';
  if (status === AppointmentStatus.COMPLETED) return 'Concluídos';
  return 'Cancelados';
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
    patientConfirmed: appointments.filter((a) => a.status === AppointmentStatus.PATIENT_CONFIRMED).length,
    patientCancelled: appointments.filter((a) => a.status === AppointmentStatus.PATIENT_CANCELLED).length,
    confirmed: appointments.filter((a) => a.status === AppointmentStatus.CONFIRMED).length,
    completed: appointments.filter((a) => a.status === AppointmentStatus.COMPLETED).length,
    today: appointments.filter((a) => a.date === new Date().toISOString().split('T')[0]).length,
  };

  const conversionRate = stats.total > 0 ? Math.round(((stats.patientConfirmed + stats.confirmed + stats.completed) / stats.total) * 100) : 0;

  if (loading) {
    return (
      <div className="fixed inset-0 z-[200] flex items-center justify-center bg-brand-50">
        <RefreshCw className="animate-spin text-brand-500" size={40} />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="fixed inset-0 z-[200] flex items-center justify-center bg-brand-50 p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md rounded-[3.5rem] border border-brand-100 bg-white p-12 text-center shadow-2xl"
        >
          <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-brand-50">
            <MapPin size={32} className="text-brand-500" />
          </div>
          <h1 className="mb-4 font-serif text-3xl font-bold">Painel Administrativo</h1>
          <p className="mb-10 text-brand-900/60">Acesse o gerenciamento de avaliações e pacientes.</p>

          {user ? (
            <div className="space-y-4">
              <p className="rounded-2xl bg-red-50 p-4 text-sm font-bold text-red-500">
                Acesso negado para {user.email}. <br />
                Entre em contato para liberação.
              </p>
              <button onClick={logout} className="font-bold text-brand-900 underline">
                Sair da conta
              </button>
            </div>
          ) : (
            <button
              onClick={login}
              className="flex w-full items-center justify-center gap-3 rounded-full bg-brand-900 py-5 font-bold text-white shadow-xl transition-all hover:bg-brand-500"
            >
              Entrar com Google
            </button>
          )}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[200] flex flex-col overflow-hidden bg-brand-50 text-brand-900">
      <div className="flex items-center justify-between border-b border-brand-100 bg-white px-8 py-4 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500 font-bold text-white">O</div>
          <h1 className="font-serif text-xl font-bold tracking-tight">
            Odonto <span className="text-brand-500">Admin Prime</span>
          </h1>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden items-center gap-2 rounded-full border border-brand-100 bg-brand-50 px-4 py-2 md:flex">
            <div className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
            <span className="text-xs font-bold uppercase tracking-wider text-brand-900/40">Sistema Online</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <div className="text-sm font-bold">{user?.displayName}</div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-brand-500">Administrador</div>
            </div>
            <button onClick={logout} className="rounded-full p-2 text-brand-900/40 transition-colors hover:bg-brand-50 hover:text-brand-500">
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-7xl flex-1 overflow-y-auto p-8">
        <div className="mb-8 rounded-[2rem] border border-brand-100 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-500">Avaliação gratuita</p>
              <h2 className="font-serif text-3xl font-bold">Atendimento por ordem de chegada</h2>
            </div>
            <p className="max-w-xl text-sm leading-relaxed text-brand-900/60">
              Os pacientes solicitam uma avaliação gratuita pelo site e os dados de cadastro chegam aqui organizados para a equipe.
            </p>
          </div>
        </div>

        <div className="mb-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: 'Hoje', val: stats.today, icon: Clock, color: 'bg-orange-500' },
            { label: 'Pendentes', val: stats.pending, icon: RefreshCw, color: 'bg-amber-400' },
            { label: 'Conf. paciente', val: stats.patientConfirmed, icon: CheckCircle, color: 'bg-green-500' },
            { label: 'Conversão', val: `${conversionRate}%`, icon: TrendingUp, color: 'bg-brand-900' },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex items-center justify-between rounded-[2rem] border border-brand-100 bg-white p-6 shadow-sm"
            >
              <div>
                <p className="mb-1 text-xs font-bold uppercase tracking-widest text-brand-900/40">{s.label}</p>
                <h3 className="font-serif text-3xl font-bold">{s.val}</h3>
              </div>
              <div className={cn('flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-lg', s.color)}>
                <s.icon size={24} />
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mb-8 flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <h2 className="font-serif text-3xl font-bold">Avaliações solicitadas</h2>

          <div className="flex w-full flex-wrap gap-3 md:w-auto">
            <div className="relative flex-1 md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-900/20" size={18} />
              <input
                placeholder="Buscar nome, CPF, RG ou WhatsApp..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-full border border-brand-100 bg-white py-3 pl-12 pr-4 text-sm outline-none transition-all focus:border-brand-500"
              />
            </div>

            <div className="flex max-w-full overflow-x-auto rounded-full border border-brand-100 bg-white p-1">
              {(['all', AppointmentStatus.PENDING, AppointmentStatus.PATIENT_CONFIRMED, AppointmentStatus.PATIENT_CANCELLED, AppointmentStatus.CONFIRMED, AppointmentStatus.COMPLETED, AppointmentStatus.CANCELLED] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f as any)}
                  className={cn(
                    'rounded-full px-4 py-2 text-[10px] font-bold uppercase tracking-widest transition-all',
                    filter === f ? 'bg-brand-900 text-white shadow-xl' : 'text-brand-900/40 hover:text-brand-900'
                  )}
                >
                  {statusShortLabel(f)}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <AnimatePresence>
            {filteredAppointments.map((app) => {
              const extra = app as any;

              return (
                <motion.article
                  key={app.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="rounded-[2rem] border border-brand-100 bg-white p-5 shadow-sm transition-all hover:shadow-xl"
                >
                  <div className="grid gap-5 lg:grid-cols-[1.1fr_1.2fr_auto] lg:items-center">
                    <div>
                      <div className="mb-2 flex items-center gap-2">
                        <User size={16} className="text-brand-500" />
                        <h3 className="font-serif text-2xl font-bold leading-none">{app.patientName}</h3>
                      </div>

                      <div className="flex flex-wrap gap-2 text-xs font-bold text-brand-900/55">
                        <a href={whatsappUrl(app.patientWhatsApp)} target="_blank" rel="noreferrer" className="flex items-center gap-1 rounded-full bg-brand-50 px-3 py-1 text-brand-500">
                          <Phone size={12} /> {app.patientWhatsApp}
                        </a>
                        <span className="flex items-center gap-1 rounded-full bg-brand-50 px-3 py-1">
                          <MapPin size={12} /> {app.unit}
                        </span>
                        <span className="flex items-center gap-1 rounded-full bg-brand-50 px-3 py-1">
                          <Calendar size={12} /> {safeFormatDate(app.date)} às {app.time}h
                        </span>
                        {extra.protocol && (
                          <span className="flex items-center gap-1 rounded-full bg-brand-50 px-3 py-1">
                            Protocolo: {extra.protocol}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="grid gap-2 text-sm text-brand-900/70 sm:grid-cols-2">
                      <div className="flex items-center gap-2">
                        <Stethoscope size={14} className="text-brand-500" />
                        <strong>{app.treatment || 'Avaliação gratuita'}</strong>
                      </div>
                      <div className="flex items-center gap-2">
                        <Cake size={14} className="text-brand-500" />
                        <span>Nasc.: {extra.patientBirthDate || 'Não informado'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <IdCard size={14} className="text-brand-500" />
                        <span>RG: {extra.patientRG || 'Não informado'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <IdCard size={14} className="text-brand-500" />
                        <span>CPF: {extra.patientCPF || 'Não informado'}</span>
                      </div>
                      <div className="flex items-center gap-2 sm:col-span-2">
                        <Home size={14} className="text-brand-500" />
                        <span>End.: {extra.patientAddress || 'Não informado'}</span>
                      </div>
                      {(extra.guardianName || extra.guardianCPF) && (
                        <div className="flex items-center gap-2 sm:col-span-2">
                          <ShieldCheck size={14} className="text-brand-500" />
                          <span>Responsável: {extra.guardianName || 'Não informado'} • CPF: {extra.guardianCPF || 'Não informado'}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-3 lg:items-end">
                      <span
                        className={cn(
                          'w-fit rounded-full px-4 py-1.5 text-[9px] font-bold uppercase tracking-widest',
                          statusBadgeClass(app.status)
                        )}
                      >
                        {statusLabel(app.status)}
                      </span>

                      <div className="flex items-center gap-2">
                        {(app.status === AppointmentStatus.PENDING || app.status === AppointmentStatus.PATIENT_CONFIRMED) && (
                          <button onClick={() => updateStatus(app.id, AppointmentStatus.CONFIRMED)} className="rounded-lg bg-green-50 p-2 text-green-600 transition-all hover:bg-green-600 hover:text-white">
                            <CheckCircle size={18} />
                          </button>
                        )}
                        {app.status !== AppointmentStatus.COMPLETED && app.status !== AppointmentStatus.CANCELLED && app.status !== AppointmentStatus.PATIENT_CANCELLED && (
                          <button onClick={() => updateStatus(app.id, AppointmentStatus.COMPLETED)} className="rounded-lg bg-blue-50 p-2 text-blue-600 transition-all hover:bg-blue-600 hover:text-white">
                            <ShieldCheck size={18} />
                          </button>
                        )}
                        {app.status !== AppointmentStatus.CANCELLED && (
                          <button onClick={() => updateStatus(app.id, AppointmentStatus.CANCELLED)} className="rounded-lg bg-red-50 p-2 text-red-600 transition-all hover:bg-red-600 hover:text-white">
                            <XCircle size={18} />
                          </button>
                        )}
                        <button onClick={() => deleteAppointment(app.id)} className="rounded-lg bg-brand-100 p-2 text-brand-900 transition-all hover:bg-brand-900 hover:text-white">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {app.notes && <p className="mt-4 rounded-2xl bg-brand-50 p-4 text-sm text-brand-900/60">Observação: {app.notes}</p>}
                </motion.article>
              );
            })}
          </AnimatePresence>

          {filteredAppointments.length === 0 && (
            <div className="rounded-[2rem] border border-brand-100 bg-white px-8 py-20 text-center text-xs font-bold uppercase tracking-widest text-brand-900/40">
              Nenhuma avaliação encontrada
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
