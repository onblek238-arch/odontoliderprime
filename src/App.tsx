
import React, { useEffect, useState, type ReactNode } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'motion/react';
import {
  ArrowRight,
  Award,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock,  Instagram,
  MapPin,
  Menu,
  Phone,  Sparkles,
  Star,
  X,} from 'lucide-react';
import AppointmentModal from './components/AppointmentModal';
import AdminDashboard from './components/AdminDashboard';

const clinicAssets = {
  logo: 'https://res.cloudinary.com/dhzbbhahz/image/upload/f_auto,q_auto/v1778903793/logo-odonto-lider-prime_wqd2ww.png',
  avaliacao: 'https://res.cloudinary.com/dhzbbhahz/image/upload/f_auto,q_auto/v1778903782/consultorio-avaliacao_bywe91.png',
  consultorioOdonto: 'https://res.cloudinary.com/dhzbbhahz/image/upload/f_auto,q_auto/v1778903782/consultorio-odontologico_jt4nwy.png',
  drFlavio: 'https://res.cloudinary.com/dhzbbhahz/image/upload/f_auto,q_auto/v1778903785/dr-flavio-implante_etmipt.png',
 
  draAnnyProfissional: 'https://res.cloudinary.com/dhzbbhahz/image/upload/v1779303232/dra_b8bf7t.png',
  lavabo: 'https://res.cloudinary.com/dhzbbhahz/image/upload/f_auto,q_auto/v1778903792/lavabo-detalhes_wem0jr.png',
  recepcao: 'https://res.cloudinary.com/dhzbbhahz/image/upload/f_auto,q_auto/v1778903803/recepcao-principal_h7eest.png',
  salaEspera: 'https://res.cloudinary.com/dhzbbhahz/image/upload/v1779315672/foda_sdbz7j.png',
  consultorioPremium: 'https://res.cloudinary.com/dhzbbhahz/image/upload/f_auto,q_auto/v1778903805/sala-consultorio-premium_ymxyu4.png',

  procFacetas: 'https://res.cloudinary.com/dhzbbhahz/image/upload/f_auto,q_auto/v1778903844/tratamento-facetas-card_toopqx.jpg',
  procClareamento: 'https://res.cloudinary.com/dhzbbhahz/image/upload/f_auto,q_auto/v1778903843/tratamento-clareamento-card_xazdoz.jpg',
  procBotox: 'https://res.cloudinary.com/dhzbbhahz/image/upload/f_auto,q_auto/v1778903806/tratamento-botox-card_rwu4zq.jpg',
  procImplante: 'https://res.cloudinary.com/dhzbbhahz/image/upload/f_auto,q_auto/v1778903846/tratamento-implante-card_zinzx1.jpg',
  procAparelho: 'https://res.cloudinary.com/dhzbbhahz/image/upload/f_auto,q_auto/v1778903805/tratamento-aparelho-card_eso6og.jpg',
  procGingivoplastia: 'https://res.cloudinary.com/dhzbbhahz/image/upload/f_auto,q_auto/v1778903845/tratamento-gengivoplastia-card_lwl1nz.jpg',

  estruturaRecepcao: 'https://res.cloudinary.com/dhzbbhahz/image/upload/f_auto,q_auto/v1778903790/estrutura-recepcao-card_rbbwbl.jpg',
  estruturaSalaEspera: 'https://res.cloudinary.com/dhzbbhahz/image/upload/f_auto,q_auto/v1778903791/estrutura-sala-espera-card_oy1uf8.jpg',
  estruturaConsultorio: 'https://res.cloudinary.com/dhzbbhahz/image/upload/f_auto,q_auto/v1778903788/estrutura-consultorio-card_btw9yr.jpg',
  estruturaAvaliacao: 'https://res.cloudinary.com/dhzbbhahz/image/upload/f_auto,q_auto/v1778903787/estrutura-avaliacao-card_gy5g62.jpg',
  estruturaPremium: 'https://res.cloudinary.com/dhzbbhahz/image/upload/f_auto,q_auto/v1778903790/estrutura-premium-card_vvc7pz.jpg',
  estruturaLavabo: 'https://res.cloudinary.com/dhzbbhahz/image/upload/f_auto,q_auto/v1778903789/estrutura-lavabo-card_xhoxoi.jpg',

  feedback1: 'https://res.cloudinary.com/dhzbbhahz/image/upload/v1778903783/depoimento-real-1_dpyt5l.jpg',
  feedback2: 'https://res.cloudinary.com/dhzbbhahz/image/upload/f_auto,q_auto/v1778903784/depoimento-real-2_fhjjru.jpg',
  feedback3: 'https://res.cloudinary.com/dhzbbhahz/image/upload/f_auto,q_auto/v1778903784/depoimento-real-3_rag6ng.jpg',

  videoTour: 'https://res.cloudinary.com/dhzbbhahz/video/upload/v1778939114/tour_n7gwkg.mp4',
  videoEstrutura: 'https://res.cloudinary.com/dhzbbhahz/video/upload/f_auto,q_auto/v1778903848/estrutura_rlx251.mp4',
  videoComoChegar: 'https://res.cloudinary.com/dhzbbhahz/video/upload/f_auto,q_auto/v1778903847/como-chegar_cu3rnw.mp4',
  videoHistoria: 'https://res.cloudinary.com/dhzbbhahz/video/upload/f_auto,q_auto/v1778903849/odonto-lider-14-anos_i5hnck.mp4',
};

const whatsappOne = '5581989635570';
const whatsappTwo = '5581989635044';

function useAdminRoute() {
  const [isAdminRoute, setIsAdminRoute] = useState(window.location.hash === '#admin');

  useEffect(() => {
    const handleHashChange = () => {
      setIsAdminRoute(window.location.hash === '#admin');
    };

    window.addEventListener('hashchange', handleHashChange);

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  return isAdminRoute;
}


function Navbar({ onSchedule }: { onSchedule: () => void }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  const links = [
    ['Tratamentos', '#tratamentos'],
    ['Estrutura', '#estrutura'],
    ['Doutores', '#doutores'],
    ['Depoimentos', '#depoimentos'],
    ['Unidades', '#unidades'],
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 28);
    onScroll();

    window.addEventListener('scroll', onScroll, { passive: true });

    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={`prime-nav ${scrolled ? 'prime-nav--scrolled' : ''}`}>
      <button className="brand" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
        <span className="brand-mark brand-mark-logo">
          <img src={clinicAssets.logo} alt="Odonto Líder Prime" />
        </span>

        <span className="brand-text">
          <strong>
            Odonto Líder <em>Prime</em>
          </strong>
          <small>Centro odontológico</small>
        </span>
      </button>

      <nav className="nav-links" aria-label="Navegação principal">
        {links.map(([name, href]) => (
          <a key={name} href={href}>
            {name}
          </a>
        ))}
      </nav>

      <div className="nav-actions">

        <button onClick={onSchedule} className="btn btn-dark btn-nav">
          Agendar avaliação
        </button>
      </div>

      <button className="mobile-toggle" onClick={() => setOpen(true)} aria-label="Abrir menu">
        <Menu />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div className="mobile-menu" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div
              className="mobile-panel"
              initial={{ y: -28, scale: 0.98 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: -28, scale: 0.98 }}
            >
              <div className="mobile-head">
                <strong>Odonto Líder Prime</strong>

                <button onClick={() => setOpen(false)} aria-label="Fechar menu">
                  <X />
                </button>
              </div>

              {links.map(([name, href]) => (
                <a key={name} href={href} onClick={() => setOpen(false)} className="mobile-link">
                  {name}
                  <ChevronRight size={18} />
                </a>
              ))}

              <button
                className="btn btn-orange w-full mt-4"
                onClick={() => {
                  setOpen(false);
                  onSchedule();
                }}
              >
                Agendar avaliação <ArrowRight size={18} />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}


function MediaModal({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}) {
  if (!open) return null;

  return (
    <div
      className="media-modal"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,.88)',
        zIndex: 999999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Fechar mídia"
        style={{
          position: 'absolute',
          top: 20,
          right: 20,
          width: 48,
          height: 48,
          borderRadius: 999,
          border: 'none',
          background: 'white',
          cursor: 'pointer',
          fontSize: 22,
          fontWeight: 700,
          zIndex: 2,
        }}
      >
        ×
      </button>

      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '1200px',
          maxHeight: '92vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {children}
      </div>
    </div>
  );
}

function Hero({ onSchedule }: { onSchedule: () => void }) {
  const [logoMove, setLogoMove] = useState({ x: 0, y: 0 });
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 600], [0, 120]);
  const opacity = useTransform(scrollY, [0, 520], [1, 0.35]);
  const orbY = useTransform(scrollY, [0, 600], [0, -90]);

  return (
    <section className="hero" id="topo">
      <video className="hero-video" autoPlay muted loop playsInline poster={clinicAssets.recepcao}>
        <source src={clinicAssets.videoTour} type="video/mp4" />
      </video>

      <div className="hero-wash" />

      <motion.div className="hero-orb hero-orb-a" style={{ y }} />
      <motion.div className="hero-orb hero-orb-b" style={{ y: orbY }} />

      <div className="hero-grid">
        <motion.div
          className="hero-copy"
          style={{ opacity }}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9 }}
        >
<h1>
            Seu sorriso merece uma experiência <em>à altura.</em>
          </h1>

          <p>
            Uma clínica criada para unir estética, tecnologia, acolhimento e precisão em cada etapa do seu atendimento.
          </p>

          <div className="hero-buttons">
            <button className="btn btn-orange btn-large" onClick={onSchedule}>
              Agendar avaliação <ArrowRight size={20} />
            </button>

            <a className="btn btn-glass btn-large" href="#estrutura">
              Conhecer estrutura
            </a>
          </div>

          <div className="hero-stats">
            <div>
              <strong>14+</strong>
              <span>anos em Caruaru</span>
            </div>

            <div>
              <strong>2</strong>
              <span>unidades em Caruaru</span>
            </div>

            <div>
              <strong>Multi</strong>
              <span>clínica multidisciplinar</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="hero-visual"
          onMouseMove={(event) => {
            const rect = event.currentTarget.getBoundingClientRect();
            const x = ((event.clientX - rect.left) / rect.width - 0.5) * 22;
            const y = ((event.clientY - rect.top) / rect.height - 0.5) * 22;
            setLogoMove({ x, y });
          }}
          onMouseLeave={() => setLogoMove({ x: 0, y: 0 })}
          initial={{ opacity: 0, x: 44, rotate: 1.5 }}
          animate={{ opacity: 1, x: 0, rotate: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
        >
          <div className="phone-card">
            <img src={clinicAssets.salaEspera} alt="Recepção e sala de espera da Odonto Líder Prime" />
          </div>

          <div
            className="floating-card floating-card-a hero-logo-card"
            style={{ "--mx": `${logoMove.x}px`, "--my": `${logoMove.y}px` } as React.CSSProperties}
          >
            <img src={clinicAssets.logo} alt="Odonto Líder Prime" />
          </div>

          <div className="floating-card floating-card-b">
            <CheckCircle2 size={20} />
            <span>Experiência humanizada e segura</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function SignatureBar() {
  const items = ['Implantes', 'Harmonização', 'Botox', 'Odontologia estética', 'Avaliação completa'];

  return (
    <section className="signature-bar">
      {items.map((item) => (
        <span key={item}>{item}</span>
      ))}
    </section>
  );
}

function Treatments({ onSchedule }: { onSchedule: () => void }) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showAllTreatments, setShowAllTreatments] = useState(false);

  const services = [
    {
      title: 'Facetas / Facetas em resina',
      tag: 'Estética do sorriso',
      text: 'Transformação estética para corrigir cor, formato e proporção com naturalidade.',
      image: clinicAssets.procFacetas,
    },
    {
      title: 'Clareamento',
      tag: 'Sorriso iluminado',
      text: 'Sorriso mais claro e luminoso com acompanhamento profissional e segurança.',
      image: clinicAssets.procClareamento,
    },
    {
      title: 'Botox / Harmonização',
      tag: 'Equilíbrio facial',
      text: 'Suavização de expressões e estética planejada para valorizar sua beleza.',
      image: clinicAssets.procBotox,
    },
    {
      title: 'Implante',
      tag: 'Função e confiança',
      text: 'Recupere segurança para sorrir, mastigar e falar com mais conforto.',
      image: clinicAssets.procImplante,
    },
    {
      title: 'Aparelho',
      tag: 'Alinhamento dental',
      text: 'Correção do alinhamento dental com planejamento, conforto e previsibilidade.',
      image: clinicAssets.procAparelho,
    },
    {
      title: 'Gengivoplastia',
      tag: 'Harmonia gengival',
      text: 'Contorno gengival para um sorriso mais proporcional, leve e elegante.',
      image: clinicAssets.procGingivoplastia,
    },
  ];

  return (
    <section className="section treatments" id="tratamentos">
      <div className="section-heading">
        <span className="kicker">Tratamentos</span>
        <h2>Especialidades para uma transformação completa.</h2>
        <p>Procedimentos reais, planejamento cuidadoso e estética com naturalidade.</p>
      </div>

      <div className={`treatment-grid treatment-grid-real mobile-collapsible-grid ${showAllTreatments ? "mobile-expanded" : "mobile-collapsed"}`}>
        {services.map((service, idx) => (
          <motion.article
            key={service.title}
            className="treatment-real-card"
            initial={{ opacity: 0, y: 36 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            viewport={{ once: true }}
          >
            <div className="treatment-real-image">
              <img src={service.image} alt={service.title} />
              <span className="treatment-real-index">{String(idx + 1).padStart(2, '0')}</span>
            </div>

            <div className="treatment-real-body">
              <span>{service.tag}</span>
              <h3>{service.title}</h3>
              <p>{service.text}</p>

              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => setSelectedImage(service.image)}
                  style={{
                    background: '#fff3eb',
                    color: '#2b1208',
                    border: '1px solid #f0d5c4',
                    borderRadius: '999px',
                    padding: '12px 18px',
                    cursor: 'pointer',
                    fontWeight: 700,
                  }}
                >
                  Ver imagem completa
                </button>

                <button type="button" onClick={onSchedule}>
                  Agendar <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </motion.article>
        ))}
      </div>

      <div className="mobile-section-toggle">
        <button type="button" onClick={() => setShowAllTreatments((value) => !value)}>
          {showAllTreatments ? 'Ver menos tratamentos' : 'Ver todos os tratamentos'}
        </button>
      </div>

      <MediaModal open={!!selectedImage} onClose={() => setSelectedImage(null)}>
        {selectedImage && (
          <img
            src={selectedImage}
            alt="Imagem completa do procedimento"
            style={{
              width: '100%',
              maxHeight: '90vh',
              objectFit: 'contain',
              borderRadius: '28px',
            }}
          />
        )}
      </MediaModal>
    </section>
  );
}


function Structure() {
  const [openTour, setOpenTour] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showAllStructure, setShowAllStructure] = useState(false);

  const gallery = [
    { src: clinicAssets.estruturaRecepcao, title: 'Recepção principal', desc: 'Primeiro contato acolhedor e elegante.' },
    { src: clinicAssets.estruturaSalaEspera, title: 'Sala de espera', desc: 'Conforto, climatização e tons suaves.' },
    { src: clinicAssets.estruturaConsultorio, title: 'Consultório odontológico', desc: 'Tecnologia e precisão no atendimento.' },
    { src: clinicAssets.estruturaAvaliacao, title: 'Sala de avaliação', desc: 'Diagnóstico claro e planejamento individual.' },
    { src: clinicAssets.estruturaPremium, title: 'Consultório premium', desc: 'Ambiente reservado e sofisticado.' },
    { src: clinicAssets.estruturaLavabo, title: 'Lavabo e detalhes', desc: 'Cuidado visual até nos mínimos detalhes.' },
  ];

  return (
    <section className="section structure" id="estrutura">
      <div className="split-heading split-heading-polished">
        <div>
          <span className="kicker">Estrutura</span>
        <h2>
            Um espaço que já transmite{' '}
            <span className="orange-word">confiança.</span>
          </h2>
        </div>

        <p>
          Arquitetura clean, tons claros, madeira natural e tecnologia para transformar o atendimento em uma experiência
          premium.
        </p>
      </div>

      <div className="video-stage video-stage-main video-stage-clean">
        <video autoPlay muted loop playsInline poster={clinicAssets.recepcao}>
          <source src={clinicAssets.videoTour} type="video/mp4" />
          <source src={clinicAssets.videoEstrutura} type="video/mp4" />
        </video>

        <div>
          <strong>Tour visual da clínica</strong>
          <span>Ambientes reais da Odonto Líder Prime.</span>

          <button
            type="button"
            onClick={() => setOpenTour(true)}
            style={{
              marginTop: '14px',
              border: 'none',
              background: '#2b1208',
              color: 'white',
              padding: '12px 20px',
              borderRadius: '999px',
              cursor: 'pointer',
              fontWeight: 700,
            }}
          >
            Ver tour completo
          </button>
        </div>
      </div>

      <div className={`structure-card-grid mobile-collapsible-grid ${showAllStructure ? "mobile-expanded" : "mobile-collapsed"}`}>
        {gallery.map((item, idx) => (
          <motion.figure
            key={item.title}
            className="structure-card"
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.04 }}
            viewport={{ once: true }}
          >
            <img
              src={item.src}
              alt={item.title}
              onClick={() => setSelectedImage(item.src)}
              style={{ cursor: 'zoom-in' }}
            />

            <figcaption>
              <span>{item.title}</span>
              <small>{item.desc}</small>
            </figcaption>
          </motion.figure>
        ))}
      </div>

      <div className="mobile-section-toggle">
        <button type="button" onClick={() => setShowAllStructure((value) => !value)}>
          {showAllStructure ? 'Ver menos estrutura' : 'Ver estrutura completa'}
        </button>
      </div>

      <MediaModal open={openTour} onClose={() => setOpenTour(false)}>
        <video
          controls
          autoPlay
          style={{
            width: '100%',
            maxHeight: '90vh',
            borderRadius: '28px',
            background: 'black',
          }}
        >
          <source src={clinicAssets.videoTour} type="video/mp4" />
        </video>
      </MediaModal>

      <MediaModal open={!!selectedImage} onClose={() => setSelectedImage(null)}>
        {selectedImage && (
          <img
            src={selectedImage}
            alt="Imagem completa da estrutura"
            style={{
              width: '100%',
              maxHeight: '90vh',
              objectFit: 'contain',
              borderRadius: '28px',
            }}
          />
        )}
      </MediaModal>
    </section>
  );
}


function Doctors() {
  return (
    <section className="section doctors" id="doutores">
      <div className="doctor-layout">
        <motion.div
          className="doctor-photo doctor-photo-professional"
          initial={{ opacity: 0, x: -42 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
        >
          <div className="doctor-name-tag">
            <strong>Dra. Anny Maia</strong>
            <span>Odontologia estética</span>
          </div>

          <img src={clinicAssets.draAnnyProfissional} alt="Dra. Anny Maia" />

          <div className="doctor-badge">
            <Award size={18} /> Founder Odonto Líder Prime
          </div>
        </motion.div>

        <motion.div
          className="doctor-copy"
          initial={{ opacity: 0, x: 42 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
        >
          <span className="kicker">Corpo clínico</span>

          <h2>Liderança, estética e cuidado humano em uma só experiência.</h2>

          <p>
            À frente da Odonto Líder Prime, a Dra. Anny Maia une experiência, gestão e visão humanizada para elevar o
            padrão de atendimento odontológico em Caruaru.
          </p>

          <div className="doctor-facts">
            <span>17 anos de formação</span>
            <span>15 anos de gestão</span>
            <span>CRO 9695 PE</span>
            <span>+8 mil seguidores</span>
          </div>

          <article className="team-card doctor-mini-card">
            <img src={clinicAssets.drFlavio} alt="Dr. Flávio Rodrigues" />

            <div>
              <strong>Dr. Flávio Rodrigues</strong>
              <span>Responsável técnico • CRO 9711 PE</span>
              <p>Atuação em planejamento odontológico, implantes e tratamentos de alta precisão.</p>
            </div>
          </article>
        </motion.div>
      </div>
    </section>
  );
}

function Process({ onSchedule }: { onSchedule: () => void }) {
  const steps = [
    ['01', 'Avaliação', 'Entendemos sua necessidade, histórico, rotina e objetivo estético.'],
    ['02', 'Planejamento', 'Definimos o caminho ideal com clareza, segurança e previsibilidade.'],
    ['03', 'Tratamento', 'Executamos com técnica, conforto, tecnologia e acompanhamento próximo.'],
    ['04', 'Resultado', 'Você volta a sorrir com mais confiança, segurança e naturalidade.'],
  ];

  return (
    <section className="section process">
      <div className="section-heading">
        <span className="kicker">Jornada do paciente</span>
        <h2>Do primeiro contato ao sorriso final.</h2>
      </div>

      <div className="process-line">
        {steps.map(([n, title, text]) => (
          <article key={n}>
            <span>{n}</span>
            <strong>{title}</strong>
            <p>{text}</p>
          </article>
        ))}
      </div>

      <button className="btn btn-orange mx-auto mt-12" onClick={onSchedule}>
        Começar minha avaliação <ArrowRight size={18} />
      </button>
    </section>
  );
}

function Proof() {
  const realFeedbacks = [
    [clinicAssets.feedback1, 'Relato de pós-atendimento'],
    [clinicAssets.feedback2, 'Paciente perdeu o medo de extração'],
    [clinicAssets.feedback3, 'Agradecimento pelo profissionalismo'],
  ];

  return (
    <section className="section proof" id="depoimentos">
      <div className="proof-grid">
        <div>
          <span className="kicker">Depoimentos</span>
          <h2>Medo sendo substituído por confiança.</h2>
          <p>Feedbacks reais e uma experiência que acolhe quem procura segurança antes, durante e depois do tratamento.</p>

          <div className="rating">
            {[...Array(5)].map((_, i) => (
              <Star key={i} fill="currentColor" />
            ))}
            <span>Experiência premium</span>
          </div>
        </div>

        <div className="testimonial-card">
          <p>
            “Graças a Deus e à Dra. Mariany, estou super bem. Nenhuma dor, só um leve incômodo na região do dente. Muito
            obrigada, perdi o medo de extração.”
          </p>
          <strong>Paciente Odonto Líder</strong>
          <span>Relato de pós-atendimento</span>
        </div>
      </div>

      <div className="feedback-real-grid">
        {realFeedbacks.map(([src, title], idx) => (
          <motion.figure
            key={title}
            className="feedback-real-card"
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.08 }}
            viewport={{ once: true }}
          >
            <img src={src} alt={title} />
            <figcaption>{title}</figcaption>
          </motion.figure>
        ))}
      </div>
    </section>
  );
}

function Units() {
  const units = [
    {
      name: 'Unidade I',
      address: 'Praça Teotônio Vilela, 75 — Caruaru - PE',
      phone: '(81) 98963-5570',
      wa: whatsappOne,
      mapUrl: 'https://www.google.com/maps/search/?api=1&query=Praça+Teotônio+Vilela+75+Caruaru+PE',
    },
    {
      name: 'Unidade II',
      address: 'Rua Sete de Setembro, 36 — Caruaru - PE',
      phone: '(81) 98963-5044',
      wa: whatsappTwo,
      mapUrl: 'https://www.google.com/maps/search/?api=1&query=Rua+Sete+de+Setembro+36+Caruaru+PE',
    },
  ];

  return (
    <section className="section units" id="unidades">
      <div className="section-heading">
        <span className="kicker">Unidades</span>
        <h2>Duas unidades para atender você em Caruaru.</h2>
      </div>

      <div className="units-grid">
        {units.map((unit) => (
          <article className="unit-card" key={unit.name}>
            <MapPin size={28} />

            <h3>{unit.name}</h3>

            <p>{unit.address}</p>

            <strong>
              <Phone size={16} /> {unit.phone}
            </strong>

            <div>
              <a href={`https://wa.me/${unit.wa}`} target="_blank" rel="noreferrer">
                WhatsApp
              </a>

              <a href={unit.mapUrl} target="_blank" rel="noreferrer">
                Mapa
              </a>
            </div>
          </article>
        ))}
      </div>

      <div className="hours">
        <Clock size={22} />
        <strong>Horário de atendimento</strong>
        <span>Segunda a sexta: 08h às 18h • Sábado: 08h às 13h</span>
      </div>
    </section>
  );
}


function FinalCTA({ onSchedule }: { onSchedule: () => void }) {
  return (
    <section className="final-cta">
      <span className="kicker">Sua nova experiência começa aqui</span>

      <h2>Pronto para sorrir com mais segurança?</h2>

      <p>Agende sua avaliação e descubra o tratamento ideal para o seu sorriso.</p>

      <button className="btn btn-orange btn-large" onClick={onSchedule}>
        Agendar avaliação <CalendarDays size={20} />
      </button>
    </section>
  );
}

function Footer() {
  return (
    <footer className="footer" id="footer">
      <div>
        <strong>Odonto Líder Prime</strong>
        <p>Centro odontológico premium em Caruaru.</p>
      </div>

      <div>
        <span>CRO Certificado nº 448</span>
        <span>RT Anny Maia • CRO 9695 PE</span>
        <span>RT Flávio Rodrigues • CRO 9711 PE</span>
      </div>

      <a href="https://www.instagram.com/odontoliderprime" target="_blank" rel="noreferrer">
        <Instagram size={18} /> Instagram
      </a>
    </footer>
  );
}

export default function App() {
  useEffect(() => {
    document.body.classList.remove('modal-open');
  }, []);

  const [scheduleOpen, setScheduleOpen] = useState(false);
  const isAdminRoute = useAdminRoute();

  if (isAdminRoute) return <AdminDashboard />;

  return (
    <>
      <Navbar onSchedule={() => setScheduleOpen(true)} />

      <main>
        <Hero onSchedule={() => setScheduleOpen(true)} />
        <SignatureBar />
        <Treatments onSchedule={() => setScheduleOpen(true)} />
        <Structure />
        <Doctors />
        <Process onSchedule={() => setScheduleOpen(true)} />
        <Proof />
        <Units />
        <FinalCTA onSchedule={() => setScheduleOpen(true)} />
      </main>

      <Footer />

      <a className="wa-float" href={`https://wa.me/${whatsappOne}`} target="_blank" rel="noreferrer">
        WhatsApp
      </a>

      <AppointmentModal isOpen={scheduleOpen} onClose={() => setScheduleOpen(false)} />
    </>
  );
}