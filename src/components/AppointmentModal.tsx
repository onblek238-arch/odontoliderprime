import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  ChevronRight,
  ChevronLeft,
  Check,
  Calendar,
  MapPin,
  User,
  Smartphone,
  Send,
  ShieldCheck,
  ClipboardList,
  Info,
} from 'lucide-react';
import { db, AppointmentStatus } from '../lib/firebase';
import { collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { cn } from '../lib/utils';

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const steps = [
  { id: 1, title: 'Unidade', icon: MapPin },
  { id: 2, title: 'Horário', icon: Calendar },
  { id: 3, title: 'Cadastro', icon: ClipboardList },
];

const units = ['Unidade I', 'Unidade II'] as const;

export default function AppointmentModal({ isOpen, onClose }: AppointmentModalProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    treatment: 'Avaliação gratuita',
    unit: '' as 'Unidade I' | 'Unidade II' | '',
    date: '',
    time: '',
    patientName: '',
    patientWhatsApp: '',
    patientEmail: '',
    patientRG: '',
    patientCPF: '',
    patientAddress: '',
    patientBirthDate: '',
    guardianName: '',
    guardianCPF: '',
    notes: '',
  });

  const nextStep = () => setStep((s) => Math.min(s + 1, steps.length));
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  const clinicWhatsApp = formData.unit === 'Unidade II' ? '5581989635044' : '5581989635570';

  const whatsappMessage = encodeURIComponent(
    `Olá! Fiz uma solicitação de avaliação gratuita pelo site da Odonto Líder Prime.\n\n` +
      `Nome: ${formData.patientName}\n` +
      `WhatsApp: ${formData.patientWhatsApp}\n` +
      `Unidade: ${formData.unit}\n` +
      `Data: ${formData.date}\n` +
      `Horário: ${formData.time}\n\n` +
      `CPF: ${formData.patientCPF}\n` +
      `RG: ${formData.patientRG}\n` +
      `Endereço: ${formData.patientAddress}\n` +
      `Nascimento: ${formData.patientBirthDate}\n` +
      `${formData.guardianName ? `Responsável: ${formData.guardianName}\nCPF do responsável: ${formData.guardianCPF}\n` : ''}` +
      `${formData.notes ? `Observação: ${formData.notes}` : ''}`
  );

  const handleBooking = async () => {
    setLoading(true);

    try {
      const appointmentsRef = collection(db, 'appointments');
      const newDocRef = doc(appointmentsRef);

      await setDoc(newDocRef, {
        ...formData,
        treatment: 'Avaliação gratuita',
        status: AppointmentStatus.PENDING,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      setSuccess(true);
    } catch (error) {
      console.error('Booking error:', error);
      alert('Erro ao realizar solicitação. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const isStepValid = () => {
    if (step === 1) return Boolean(formData.unit);
    if (step === 2) return Boolean(formData.date && formData.time);
    if (step === 3) {
      return Boolean(
        formData.patientName &&
          formData.patientWhatsApp &&
          formData.patientRG &&
          formData.patientCPF &&
          formData.patientAddress &&
          formData.patientBirthDate
      );
    }

    return false;
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-5">
            <div className="rounded-[2rem] border border-brand-100 bg-brand-50/70 p-5 text-brand-900/70">
              <div className="mb-2 flex items-center gap-2 font-bold text-brand-900">
                <ShieldCheck size={18} className="text-brand-500" />
                Avaliação gratuita
              </div>
              <p className="text-sm leading-relaxed">
                A avaliação é gratuita e o atendimento acontece por ordem de chegada. Durante a avaliação, a equipe irá analisar seu caso e indicar o tratamento ideal.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {units.map((u) => (
                <button
                  key={u}
                  onClick={() => {
                    setFormData({ ...formData, unit: u });
                    nextStep();
                  }}
                  className={cn(
                    'group flex items-center gap-6 rounded-[2.5rem] border p-8 text-left transition-all',
                    formData.unit === u
                      ? 'border-brand-900 bg-brand-900 text-white shadow-2xl'
                      : 'border-brand-100 bg-white hover:border-brand-500'
                  )}
                >
                  <div
                    className={cn(
                      'flex h-14 w-14 shrink-0 items-center justify-center rounded-full',
                      formData.unit === u ? 'bg-brand-500' : 'bg-brand-50'
                    )}
                  >
                    <MapPin className={formData.unit === u ? 'text-white' : 'text-brand-500'} />
                  </div>

                  <div>
                    <div className="text-xl font-bold">{u}</div>
                    <div className="text-sm opacity-60">Caruaru - Pernambuco</div>
                  </div>

                  <ChevronRight className="ml-auto opacity-50 transition-transform group-hover:translate-x-1" />
                </button>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="rounded-[2rem] border border-brand-100 bg-white p-5 shadow-sm">
              <div className="mb-2 flex items-center gap-2 font-bold text-brand-900">
                <Info size={18} className="text-brand-500" />
                Ordem de chegada
              </div>
              <p className="text-sm leading-relaxed text-brand-900/60">
                O horário ajuda a clínica a organizar o fluxo, mas os atendimentos presenciais seguem por ordem de chegada.
              </p>
            </div>

            <div>
              <label className="mb-3 block text-sm font-bold uppercase tracking-widest text-brand-900/40">Selecione a data</label>
              <input
                type="date"
                min={new Date().toISOString().split('T')[0]}
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full rounded-2xl border border-brand-100 bg-brand-50/50 p-4 outline-none transition-all focus:border-brand-500"
              />
            </div>

            <div>
              <label className="mb-3 block text-sm font-bold uppercase tracking-widest text-brand-900/40">Selecione o horário de chegada</label>
              <div className="grid grid-cols-3 gap-2">
                {['08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'].map((h) => (
                  <button
                    key={h}
                    onClick={() => setFormData({ ...formData, time: h })}
                    className={cn(
                      'rounded-xl border py-3 text-sm font-bold transition-all',
                      formData.time === h
                        ? 'border-brand-500 bg-brand-500 text-white shadow-md'
                        : 'border-brand-100 bg-white hover:border-brand-500'
                    )}
                  >
                    {h}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div className="rounded-[2rem] border border-brand-100 bg-brand-50/70 p-5 text-sm leading-relaxed text-brand-900/65">
              <strong className="mb-2 block text-brand-900">Dados para cadastro</strong>
              A clínica precisa desses dados para realizar seu cadastro antes da avaliação. Se o paciente for menor de idade, preencha também os dados do responsável.
            </div>

            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-500" size={18} />
              <input
                placeholder="Nome completo"
                value={formData.patientName}
                onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                className="w-full rounded-2xl border border-brand-100 py-4 pl-12 pr-4 outline-none focus:border-brand-500"
              />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <input
                placeholder="RG"
                value={formData.patientRG}
                onChange={(e) => setFormData({ ...formData, patientRG: e.target.value })}
                className="w-full rounded-2xl border border-brand-100 p-4 outline-none focus:border-brand-500"
              />
              <input
                placeholder="CPF"
                value={formData.patientCPF}
                onChange={(e) => setFormData({ ...formData, patientCPF: e.target.value })}
                className="w-full rounded-2xl border border-brand-100 p-4 outline-none focus:border-brand-500"
              />
            </div>

            <input
              placeholder="Endereço completo"
              value={formData.patientAddress}
              onChange={(e) => setFormData({ ...formData, patientAddress: e.target.value })}
              className="w-full rounded-2xl border border-brand-100 p-4 outline-none focus:border-brand-500"
            />

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <input
                type="date"
                placeholder="Data de nascimento"
                value={formData.patientBirthDate}
                onChange={(e) => setFormData({ ...formData, patientBirthDate: e.target.value })}
                className="w-full rounded-2xl border border-brand-100 p-4 outline-none focus:border-brand-500"
              />
              <div className="relative">
                <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-500" size={18} />
                <input
                  placeholder="Telefone / WhatsApp"
                  value={formData.patientWhatsApp}
                  onChange={(e) => setFormData({ ...formData, patientWhatsApp: e.target.value })}
                  className="w-full rounded-2xl border border-brand-100 py-4 pl-12 pr-4 outline-none focus:border-brand-500"
                />
              </div>
            </div>

            <div className="rounded-[2rem] border border-brand-100 bg-white p-4">
              <strong className="mb-3 block text-sm text-brand-900">Se for menor de idade</strong>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <input
                  placeholder="Nome do responsável"
                  value={formData.guardianName}
                  onChange={(e) => setFormData({ ...formData, guardianName: e.target.value })}
                  className="w-full rounded-2xl border border-brand-100 p-4 outline-none focus:border-brand-500"
                />
                <input
                  placeholder="CPF do responsável"
                  value={formData.guardianCPF}
                  onChange={(e) => setFormData({ ...formData, guardianCPF: e.target.value })}
                  className="w-full rounded-2xl border border-brand-100 p-4 outline-none focus:border-brand-500"
                />
              </div>
            </div>

            <textarea
              placeholder="Observação opcional"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="h-28 w-full rounded-2xl border border-brand-100 p-4 outline-none focus:border-brand-500"
            />
          </div>
        );

      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-brand-900/40 backdrop-blur-md"
      />

      <motion.div
        layoutId="appointment-modal"
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-[3rem] bg-white shadow-2xl"
      >
        <AnimatePresence>
          {success && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white p-10 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-brand-50 text-brand-500"
              >
                <Check size={48} />
              </motion.div>

              <h2 className="mb-4 font-serif text-4xl font-bold text-brand-900">Solicitação enviada!</h2>
              <p className="mb-10 leading-relaxed text-brand-900/60">
                Olá, {formData.patientName.split(' ')[0] || 'paciente'}! Sua solicitação de avaliação gratuita foi enviada.
                <br />
                Nossa equipe entrará em contato via WhatsApp para confirmar as orientações.
              </p>

              <div className="flex w-full flex-col justify-center gap-3 sm:flex-row">
                <a
                  href={`https://wa.me/${clinicWhatsApp}?text=${whatsappMessage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full bg-brand-500 px-8 py-5 font-bold text-white shadow-xl transition-colors hover:bg-brand-600"
                >
                  Chamar no WhatsApp
                </a>

                <button
                  onClick={onClose}
                  className="rounded-full bg-brand-900 px-8 py-5 font-bold text-white shadow-xl transition-colors hover:bg-brand-500"
                >
                  Voltar ao início
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center justify-between border-b border-brand-100 bg-brand-50/50 p-8 md:p-12">
          <div>
            <h2 className="font-serif text-3xl font-bold text-brand-900">Agendar avaliação gratuita</h2>
            <p className="mt-1 text-sm font-medium uppercase tracking-widest text-brand-900/40">Atendimento por ordem de chegada</p>
          </div>

          <button onClick={onClose} className="rounded-full p-3 text-brand-900 transition-colors hover:bg-brand-100">
            <X size={24} />
          </button>
        </div>

        <div className="relative flex justify-between bg-white px-8 py-6 md:px-12">
          <div className="absolute left-12 right-12 top-1/2 z-0 h-0.5 -translate-y-1/2 bg-brand-100" />
          {steps.map((s) => (
            <div key={s.id} className="relative z-10 flex flex-col items-center">
              <div
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold transition-all duration-500',
                  step >= s.id ? 'bg-brand-500 text-white' : 'border-2 border-brand-100 bg-white text-brand-100'
                )}
              >
                {step > s.id ? <Check size={16} /> : s.id}
              </div>
              <span className={cn('mt-2 text-[10px] font-bold uppercase tracking-tighter', step >= s.id ? 'text-brand-500' : 'text-brand-100')}>
                {s.title}
              </span>
            </div>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-8 md:p-12">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderStep()}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex items-center justify-between border-t border-brand-100 bg-brand-50/30 p-8 md:p-12">
          {step > 1 ? (
            <button onClick={prevStep} className="flex items-center gap-2 font-bold text-brand-900 opacity-60 hover:opacity-100">
              <ChevronLeft size={20} /> Voltar
            </button>
          ) : (
            <div />
          )}

          {step < steps.length ? (
            <button
              disabled={!isStepValid()}
              onClick={nextStep}
              className="flex items-center gap-2 rounded-full bg-brand-900 px-10 py-4 font-bold text-white shadow-xl transition-all hover:bg-brand-500 disabled:opacity-30"
            >
              Próximo passo <ChevronRight size={18} />
            </button>
          ) : (
            <button
              disabled={loading || !isStepValid()}
              onClick={handleBooking}
              className="flex items-center gap-3 rounded-full bg-brand-500 px-12 py-4 font-bold text-white shadow-xl disabled:opacity-50"
            >
              {loading ? 'Processando...' : 'Enviar solicitação'}
              {!loading && <Send size={18} />}
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
