import { useState, useEffect } from "react";
import { 
  Scissors, Calendar, Users, Check, Trash2, Pencil, Menu, Search, X, LayoutGrid, LogOut, CheckCircle2, Inbox, Sparkles
} from "lucide-react";

// ─── DADOS INICIAIS ────────────────────────────────────────────────────────────
const SERVICES = [
  { id: "corte", label: "Corte de cabelo", price: 35, duration: 30, commission: 10 },
  { id: "barba", label: "Barba", price: 25, duration: 20, commission: 10 },
  { id: "pezinho", label: "Pezinho", price: 15, duration: 15, commission: 10 },
  { id: "sobrancelha", label: "Sobrancelha", price: 10, duration: 10, commission: 10 },
];

const INITIAL_CLIENTS = [
  { id: 1, name: "José Silva", phone: "(65) 98765-4321", email: "zesilva@email.com", lastVisit: "28/05/2025" },
  { id: 2, name: "Pedro Santos", phone: "(65) 99632-8742", email: "psantos@email.com", lastVisit: "02/06/2025" },
  { id: 3, name: "André Oliveira", phone: "(65) 99951-5656", email: "aoli@email.com", lastVisit: "10/06/2025" },
];

const INITIAL_PROS = [
  { id: 1, name: "Ricardo Silva", role: "Barbeiro", specialties: ["Barba"], phone: "(65) 99887-4982", commission: 10 },
  { id: 2, name: "Mariana Santos", role: "Cabeleireira", specialties: ["Cabelo"], phone: "(65) 92522-8456", commission: 10 },
  { id: 3, name: "João Oliveira", role: "Barbeiro", specialties: ["Barba", "Cabelo"], phone: "(65) 99312-2899", commission: 10 },
];

const AGENDA_SLOTS = ["09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00","18:00"];
const AGENDA_PROS  = ["Joelison", "Marisa", "Everton"];
const INITIAL_BOOKINGS = { "10:00-0": { label: "Corte", type: "booked" }, "12:00-2": { label: "Almoço", type: "blocked" } };

// ─── UTILITÁRIOS ──────────────────────────────────────────────────────────────
function initials(name) {
  return name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}
function fmtBRL(val) {
  return "R$ " + val.toFixed(2).replace(".", ",");
}

// ─── COMPONENTES BASE ─────────────────────────────────────────────────────────

function Toast({ msg, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 2800);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-xl bg-zinc-900 px-4 py-3 text-sm font-medium text-white shadow-lg animate-fade-in">
      <Check className="size-4 text-green-400" /> {msg}
    </div>
  );
}

function Modal({ title, children, onClose, onConfirm, confirmLabel = "Salvar" }) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-base font-semibold text-zinc-900">{title}</h2>
          <button onClick={onClose} className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-100 text-zinc-500 hover:bg-zinc-200 transition-colors">
            <X className="size-4" />
          </button>
        </div>
        <div className="space-y-4">{children}</div>
        <div className="mt-5 flex justify-end gap-2 border-t border-zinc-100 pt-4">
          <button onClick={onClose} className="rounded-lg border border-zinc-200 px-4 py-2 text-sm text-zinc-600 hover:bg-zinc-50 transition-colors">Cancelar</button>
          <button onClick={onConfirm} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors">{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, required, children }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-zinc-500">
        {label}{required && <span className="ml-0.5 text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputCls = "w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-sm text-zinc-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all placeholder:text-zinc-400";

function ServiceCheckbox({ service, checked, onChange }) {
  return (
    <label className={`flex cursor-pointer items-center gap-2.5 rounded-lg border p-2.5 transition-all ${checked ? "border-indigo-500 bg-indigo-50" : "border-zinc-200 hover:border-indigo-300"}`}>
      <input type="checkbox" className="hidden" checked={checked} onChange={onChange} />
      <div className={`h-4 w-4 rounded flex items-center justify-center border transition-colors text-xs ${checked ? "bg-indigo-600 border-indigo-600 text-white" : "border-zinc-300"}`}>{checked && <Check className="size-3" />}</div>
      <div>
        <div className="text-xs font-medium text-zinc-800">{service.label}</div>
        <div className="text-xs text-zinc-400">{fmtBRL(service.price)}</div>
      </div>
    </label>
  );
}

function Avatar({ name, size = "sm" }) {
  const colors = ["bg-indigo-100 text-indigo-700","bg-emerald-100 text-emerald-700","bg-amber-100 text-amber-700","bg-pink-100 text-pink-700","bg-sky-100 text-sky-700"];
  const color = colors[name.charCodeAt(0) % colors.length];
  const sz = size === "sm" ? "h-8 w-8 text-xs" : "h-10 w-10 text-sm";
  return <div className={`${sz} ${color} flex items-center justify-center rounded-full font-semibold shrink-0`}>{initials(name)}</div>;
}

function Chip({ label }) {
  return <span className="inline-block rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-600">{label}</span>;
}

function IconBtn({ onClick, danger, title, children }) {
  return (
    <button onClick={onClick} title={title}
      className={`flex h-8 w-8 items-center justify-center rounded-lg border border-transparent text-zinc-400 transition-all hover:border-zinc-200 hover:bg-zinc-50 ${danger ? "hover:!border-red-200 hover:!bg-red-50 hover:!text-red-500" : "hover:text-zinc-700"}`}>
      {children}
    </button>
  );
}

// ─── TELA DE AUTH ─────────────────────────────────────────────────────────────
function AuthScreen({ onLogin }) {
  const [profile, setProfile] = useState(null);

  const profiles = [
    { key: "profissional", icon: Scissors, title: "Sou profissional", desc: "Registro de atendimentos" },
    { key: "administrador", icon: LayoutGrid, title: "Sou administrador", desc: "Gestão completa" },
  ];

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-sm border border-zinc-100">
        {/* Logo */}
        <div className="mb-6 flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white text-lg">
            <Calendar className="size-5" />
          </div>
          <span className="text-xl font-semibold tracking-tight text-zinc-900">Agende<span className="text-indigo-600">.ai</span></span>
        </div>

        <h1 className="mb-1 text-lg font-semibold text-zinc-900">Bem-vindo!</h1>
        <p className="mb-5 text-sm text-zinc-500">Selecione seu perfil para continuar</p>

        <div className="mb-5 grid grid-cols-2 gap-3">
          {profiles.map((p) => (
            <button key={p.key} onClick={() => setProfile(p.key)}
              className={`rounded-xl border-2 p-4 text-left transition-all ${profile === p.key ? "border-indigo-500 bg-indigo-50" : "border-zinc-100 hover:border-indigo-300 hover:bg-zinc-50"}`}>
              <div className="mb-2 text-indigo-600"><p.icon className="size-5" /></div>
              <div className="text-xs font-semibold text-zinc-800">{p.title}</div>
              <div className="mt-0.5 text-xs text-zinc-400">{p.desc}</div>
            </button>
          ))}
        </div>

        {profile && (
          <div className="animate-fade-in space-y-4">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
                <Check className="size-3" />
                {profile.charAt(0).toUpperCase() + profile.slice(1)}
              </span>
              <button onClick={() => setProfile(null)} className="text-xs text-zinc-400 hover:text-zinc-600 transition-colors">Alterar</button>
            </div>
            <Field label="E-mail" required>
              <input className={inputCls} type="email" placeholder="seu@email.com" />
            </Field>
            <Field label="Senha" required>
              <input className={inputCls} type="password" placeholder="••••••••" />
            </Field>
            <button onClick={() => onLogin(profile)} className="w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors">
              Entrar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── LAYOUT ADMIN ─────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutGrid },
  { id: "agenda",    label: "Agenda",    icon: Calendar },
  { id: "clientes",  label: "Clientes",  icon: Users },
  { id: "profissionais", label: "Profissionais", icon: CheckCircle2 },
  { id: "servicos",  label: "Serviços",  icon: Scissors },
];

const SEARCH_PLACEHOLDERS = {
  dashboard: "clientes, atendimentos...",
  agenda: "agendamentos...",
  clientes: "clientes...",
  profissionais: "profissionais...",
  servicos: "serviços e produtos...",
};

function AdminLayout({ onLogout }) {
  const [page, setPage] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg) => setToast(msg);

  return (
    <div className="flex h-screen bg-zinc-100 overflow-hidden">
      {/* Overlay mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-20 bg-black/40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed z-30 flex h-full w-56 flex-col bg-zinc-950 transition-transform duration-200 lg:static lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex items-center gap-2.5 px-4 py-5 border-b border-white/5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-white text-sm"><Calendar className="size-4" /></div>
          <span className="text-[15px] font-semibold text-white tracking-tight">Agende<span className="text-indigo-400">.ai</span></span>
        </div>

        <nav className="flex-1 px-2 py-3 space-y-0.5">
          {NAV_ITEMS.map((item) => (
            <button key={item.id} onClick={() => { setPage(item.id); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all relative
                ${page === item.id
                  ? "bg-indigo-600/20 text-white font-medium before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-5 before:w-0.5 before:bg-indigo-500 before:rounded-r"
                  : "text-zinc-400 hover:bg-white/5 hover:text-zinc-200"}`}>
              <item.icon className="size-4" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="px-2 py-3 border-t border-white/5">
          <button onClick={onLogout} className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-red-400 hover:bg-red-400/10 transition-all">
            <LogOut className="size-4" /> Sair
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        {/* Topbar */}
        <header className="flex items-center gap-3 bg-white px-4 py-3 border-b border-zinc-100 shrink-0">
          <button className="lg:hidden flex items-center justify-center h-8 w-8 rounded-lg border border-zinc-200 text-zinc-500 hover:bg-zinc-50 transition-colors"
            onClick={() => setSidebarOpen(true)}><Menu className="size-4" /></button>
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 size-4" />
            <input className="w-full rounded-lg border border-zinc-200 bg-zinc-50 py-2 pl-9 pr-3 text-xs text-zinc-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 transition-all placeholder:text-zinc-400"
              placeholder={"Buscar " + SEARCH_PLACEHOLDERS[page]} readOnly />
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Avatar name="Administrador" size="sm" />
            <span className="hidden text-sm font-medium text-zinc-700 sm:block">Administrador</span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {page === "dashboard"    && <DashboardPage />}
          {page === "agenda"       && <AgendaPage showToast={showToast} />}
          {page === "clientes"     && <ClientesPage showToast={showToast} />}
          {page === "profissionais"&& <ProfissionaisPage showToast={showToast} />}
          {page === "servicos"     && <ServicosPage showToast={showToast} />}
        </main>
      </div>

      {/* Bottom nav mobile */}
      <nav className="fixed bottom-0 left-0 right-0 z-20 flex bg-white border-t border-zinc-100 lg:hidden">
        {NAV_ITEMS.map((item) => (
          <button key={item.id} onClick={() => setPage(item.id)}
            className={`flex flex-1 flex-col items-center gap-0.5 py-2.5 text-xs transition-colors ${page === item.id ? "text-indigo-600 font-medium" : "text-zinc-400"}`}>
            <item.icon className="size-4" />
            <span className="text-[10px]">{item.label}</span>
          </button>
        ))}
      </nav>

      {toast && <Toast msg={toast} onClose={() => setToast(null)} />}
    </div>
  );
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
function DashboardPage() {
  const today = new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" });
  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-zinc-900">Dashboard</h1>
        <span className="text-xs text-zinc-400 capitalize">{today}</span>
      </div>
      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Faturamento hoje", value: "R$ 0,00", color: "text-emerald-600" },
          { label: "Agendamentos", value: "0", color: "text-zinc-900" },
          { label: "Clientes ativos", value: "3", color: "text-zinc-900" },
          { label: "Profissionais", value: "3", color: "text-zinc-900" },
        ].map((m) => (
          <div key={m.label} className="rounded-xl bg-white p-4 border border-zinc-100">
            <div className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-400">{m.label}</div>
            <div className={`text-2xl font-semibold tracking-tight ${m.color}`}>{m.value}</div>
          </div>
        ))}
      </div>
      <div className="rounded-xl bg-white border border-zinc-100 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100">
          <span className="text-sm font-semibold text-zinc-800">Lista de espera — Caixa</span>
          <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs text-zinc-500">0 na fila</span>
        </div>
        <div className="flex flex-col items-center justify-center py-10 text-zinc-400">
          <Inbox className="size-8 mb-2 opacity-50" />
          <p className="text-sm">Nenhum atendimento na fila no momento</p>
        </div>
      </div>
    </div>
  );
}

// ─── AGENDA ───────────────────────────────────────────────────────────────────
function AgendaPage({ showToast }) {
  const [bookings] = useState(INITIAL_BOOKINGS);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ client: "", pro: "", date: "", time: "", services: [] });

  const total = form.services.reduce((s, id) => s + (SERVICES.find((x) => x.id === id)?.price || 0), 0);

  function save() {
    setModal(false);
    setForm({ client: "", pro: "", date: "", time: "", services: [] });
    showToast("Agendamento salvo com sucesso");
  }

  function toggleSvc(id) {
    setForm((f) => ({ ...f, services: f.services.includes(id) ? f.services.filter((x) => x !== id) : [...f.services, id] }));
  }

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-zinc-900">Agenda</h1>
        <button onClick={() => setModal(true)} className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-700 transition-colors">
          + Novo agendamento
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-zinc-100 bg-white">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-zinc-50 border-b border-zinc-100">
              <th className="w-16 px-4 py-3 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wide">Hora</th>
              {AGENDA_PROS.map((p) => (
                <th key={p} className="px-4 py-3 text-center text-xs font-semibold text-zinc-600">{p}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {AGENDA_SLOTS.map((slot, si) => (
              <tr key={slot} className={si < AGENDA_SLOTS.length - 1 ? "border-b border-zinc-50" : ""}>
                <td className="px-4 py-0 text-xs font-medium text-zinc-400 bg-zinc-50 h-12">{slot}</td>
                {AGENDA_PROS.map((_, pi) => {
                  const key = `${slot}-${pi}`;
                  const booking = bookings[key];
                  return (
                    <td key={pi} className="h-12 border-l border-zinc-50 px-2 text-center align-middle hover:bg-indigo-50/50 cursor-pointer transition-colors">
                      {booking && (
                        <span className={`inline-block rounded-lg px-2.5 py-1 text-xs font-medium ${booking.type === "booked" ? "bg-indigo-100 text-indigo-700" : "bg-amber-50 text-amber-700"}`}>
                          {booking.label}
                        </span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && (
        <Modal title="Novo agendamento" onClose={() => setModal(false)} onConfirm={save} confirmLabel="Salvar agendamento">
          <Field label="Buscar cliente" required>
            <input className={inputCls} placeholder="Digite o nome do cliente" value={form.client} onChange={(e) => setForm({ ...form, client: e.target.value })} />
          </Field>
          <Field label="Profissional" required>
            <select className={inputCls} value={form.pro} onChange={(e) => setForm({ ...form, pro: e.target.value })}>
              <option value="">Selecione o profissional</option>
              {AGENDA_PROS.map((p) => <option key={p}>{p}</option>)}
            </select>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Data" required>
              <input className={inputCls} type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            </Field>
            <Field label="Horário" required>
              <input className={inputCls} type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} />
            </Field>
          </div>
          <Field label="Serviços" required>
            <div className="grid grid-cols-2 gap-2">
              {SERVICES.map((svc) => (
                <ServiceCheckbox key={svc.id} service={svc} checked={form.services.includes(svc.id)} onChange={() => toggleSvc(svc.id)} />
              ))}
            </div>
          </Field>
          <div className="flex items-center justify-between border-t border-zinc-100 pt-3">
            <span className="text-xs text-zinc-500">Total estimado</span>
            <span className="text-base font-semibold text-indigo-600">{fmtBRL(total)}</span>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── CLIENTES ─────────────────────────────────────────────────────────────────
function ClientesPage({ showToast }) {
  const [clients, setClients] = useState(INITIAL_CLIENTS);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", email: "", dob: "" });

  function save() {
    if (!form.name) return;
    setClients([...clients, { id: Date.now(), name: form.name, phone: form.phone, email: form.email, lastVisit: "—" }]);
    setForm({ name: "", phone: "", email: "", dob: "" });
    setModal(false);
    showToast("Cliente cadastrado com sucesso");
  }

  function remove(id) {
    setClients(clients.filter((c) => c.id !== id));
    showToast("Cliente removido");
  }

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-zinc-900">Meus clientes</h1>
        <button onClick={() => setModal(true)} className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-700 transition-colors">
          + Cadastrar cliente
        </button>
      </div>

      <div className="hidden sm:block rounded-xl border border-zinc-100 bg-white overflow-hidden">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-zinc-50 border-b border-zinc-100">
              {["Nome","Whatsapp","E-mail","Último agend.","Ações"].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {clients.map((c, i) => (
              <tr key={c.id} className={i < clients.length - 1 ? "border-b border-zinc-50 hover:bg-zinc-50/80" : "hover:bg-zinc-50/80"}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5"><Avatar name={c.name} /><span className="font-medium text-zinc-800">{c.name}</span></div>
                </td>
                <td className="px-4 py-3 text-zinc-600">{c.phone}</td>
                <td className="px-4 py-3 text-zinc-600">{c.email}</td>
                <td className="px-4 py-3 text-xs text-zinc-400">{c.lastVisit}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <IconBtn title="Editar"><Pencil className="size-4" /></IconBtn>
                    <IconBtn danger title="Excluir" onClick={() => remove(c.id)}><Trash2 className="size-4" /></IconBtn>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="sm:hidden space-y-3">
        {clients.map((c) => (
          <div key={c.id} className="rounded-xl bg-white border border-zinc-100 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5"><Avatar name={c.name} /><span className="font-medium text-zinc-800">{c.name}</span></div>
              <div className="flex gap-1">
                <IconBtn title="Editar"><Pencil className="size-4" /></IconBtn>
                <IconBtn danger title="Excluir" onClick={() => remove(c.id)}><Trash2 className="size-4" /></IconBtn>
              </div>
            </div>
            <div className="space-y-1 text-xs text-zinc-500">
              <div>{c.phone}</div>
              <div>{c.email}</div>
              <div className="text-zinc-400">Último: {c.lastVisit}</div>
            </div>
          </div>
        ))}
      </div>

      {modal && (
        <Modal title="Cadastrar cliente" onClose={() => setModal(false)} onConfirm={save} confirmLabel="Salvar cliente">
          <Field label="Nome completo" required>
            <input className={inputCls} placeholder="Digite o nome completo" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Whatsapp" required>
              <input className={inputCls} placeholder="(00) 00000-0000" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </Field>
            <Field label="Data de nascimento" required>
              <input className={inputCls} type="date" value={form.dob} onChange={(e) => setForm({ ...form, dob: e.target.value })} />
            </Field>
          </div>
          <Field label="E-mail" required>
            <input className={inputCls} type="email" placeholder="email@exemplo.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </Field>
        </Modal>
      )}
    </div>
  );
}

// ─── PROFISSIONAIS ────────────────────────────────────────────────────────────
function ProfissionaisPage({ showToast }) {
  const [pros, setPros] = useState(INITIAL_PROS);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ name: "", role: "", commission: "", phone: "", specialties: [] });

  function toggleSpec(s) {
    setForm((f) => ({ ...f, specialties: f.specialties.includes(s) ? f.specialties.filter((x) => x !== s) : [...f.specialties, s] }));
  }

  function save() {
    if (!form.name) return;
    setPros([...pros, { id: Date.now(), name: form.name, role: form.role, specialties: form.specialties, phone: form.phone, commission: Number(form.commission) }]);
    setForm({ name: "", role: "", commission: "", phone: "", specialties: [] });
    setModal(false);
    showToast("Profissional cadastrado com sucesso");
  }

  function remove(id) {
    setPros(pros.filter((p) => p.id !== id));
    showToast("Profissional removido");
  }

  const specialtyOptions = ["Corte", "Barba", "Pezinho", "Sobrancelha", "Cabelo"];

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-zinc-900">Profissionais</h1>
        <button onClick={() => setModal(true)} className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-700 transition-colors">
          + Cadastrar profissional
        </button>
      </div>

      <div className="hidden sm:block rounded-xl border border-zinc-100 bg-white overflow-hidden">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-zinc-50 border-b border-zinc-100">
              {["Nome","Especialidade","Cargo","Whatsapp","Comissão","Ações"].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pros.map((p, i) => (
              <tr key={p.id} className={i < pros.length - 1 ? "border-b border-zinc-50 hover:bg-zinc-50/80" : "hover:bg-zinc-50/80"}>
                <td className="px-4 py-3"><div className="flex items-center gap-2.5"><Avatar name={p.name} /><span className="font-medium text-zinc-800">{p.name}</span></div></td>
                <td className="px-4 py-3"><div className="flex flex-wrap gap-1">{p.specialties.map((s) => <Chip key={s} label={s} />)}</div></td>
                <td className="px-4 py-3 text-xs text-zinc-500">{p.role}</td>
                <td className="px-4 py-3 text-zinc-600">{p.phone}</td>
                <td className="px-4 py-3"><Chip label={p.commission + "%"} /></td>
                <td className="px-4 py-3"><div className="flex gap-1">
                  <IconBtn title="Editar"><Pencil className="size-4" /></IconBtn>
                  <IconBtn danger title="Excluir" onClick={() => remove(p.id)}><Trash2 className="size-4" /></IconBtn>
                </div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="sm:hidden space-y-3">
        {pros.map((p) => (
          <div key={p.id} className="rounded-xl bg-white border border-zinc-100 p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2.5"><Avatar name={p.name} /><div><div className="font-medium text-zinc-800 text-sm">{p.name}</div><div className="text-xs text-zinc-400">{p.role}</div></div></div>
              <div className="flex gap-1">
                <IconBtn title="Editar"><Pencil className="size-4" /></IconBtn>
                <IconBtn danger title="Excluir" onClick={() => remove(p.id)}><Trash2 className="size-4" /></IconBtn>
              </div>
            </div>
            <div className="flex flex-wrap gap-1 mt-2">{p.specialties.map((s) => <Chip key={s} label={s} />)}</div>
            <div className="mt-2 text-xs text-zinc-400">{p.phone} · Comissão: {p.commission}%</div>
          </div>
        ))}
      </div>

      {modal && (
        <Modal title="Cadastrar profissional" onClose={() => setModal(false)} onConfirm={save} confirmLabel="Salvar profissional">
          <Field label="Nome completo" required>
            <input className={inputCls} placeholder="Digite o nome completo" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Cargo" required>
              <input className={inputCls} placeholder="Ex.: Barbeiro" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} />
            </Field>
            <Field label="Comissão (%)" required>
              <input className={inputCls} type="number" placeholder="0" value={form.commission} onChange={(e) => setForm({ ...form, commission: e.target.value })} />
            </Field>
          </div>
          <Field label="Whatsapp" required>
            <input className={inputCls} placeholder="(00) 00000-0000" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </Field>
          <Field label="Especialidades" required>
            <div className="grid grid-cols-2 gap-2 mt-1">
              {specialtyOptions.map((s) => (
                <label key={s} className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-xs transition-all ${form.specialties.includes(s) ? "border-indigo-500 bg-indigo-50 text-indigo-700" : "border-zinc-200 text-zinc-600 hover:border-indigo-300"}`}>
                  <input type="checkbox" className="hidden" checked={form.specialties.includes(s)} onChange={() => toggleSpec(s)} />
                  <span className={`h-3.5 w-3.5 rounded border flex items-center justify-center text-[10px] ${form.specialties.includes(s) ? "bg-indigo-600 border-indigo-600 text-white" : "border-zinc-300"}`}>{form.specialties.includes(s) && <Check className="size-2.5" />}</span>
                  {s}
                </label>
              ))}
            </div>
          </Field>
        </Modal>
      )}
    </div>
  );
}

// ─── SERVIÇOS ─────────────────────────────────────────────────────────────────
function ServicosPage({ showToast }) {
  const [services, setServices] = useState(
    SERVICES.map((s) => ({ ...s, name: s.label }))
  );
  const [modal, setModal] = useState(null); // null | 'new' | number(id para editar)
  const [form, setForm] = useState({ name: "", price: "", duration: "", commission: "" });

  function openNew() {
    setForm({ name: "", price: "", duration: "", commission: "" });
    setModal("new");
  }

  function openEdit(svc) {
    setForm({ name: svc.label || svc.name, price: String(svc.price), duration: String(svc.duration), commission: String(svc.commission) });
    setModal(svc.id);
  }

  function save() {
    if (modal === "new") {
      setServices([...services, { id: Date.now(), label: form.name, name: form.name, price: Number(form.price), duration: Number(form.duration), commission: Number(form.commission) }]);
      showToast("Serviço cadastrado com sucesso");
    } else {
      setServices(services.map((s) => s.id === modal ? { ...s, label: form.name, name: form.name, price: Number(form.price), duration: Number(form.duration), commission: Number(form.commission) } : s));
      showToast("Serviço atualizado");
    }
    setModal(null);
  }

  function remove(id) {
    setServices(services.filter((s) => s.id !== id));
    showToast("Serviço removido");
  }

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-zinc-900">Catálogo de serviços</h1>
        <button onClick={openNew} className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-700 transition-colors">
          + Cadastrar serviço
        </button>
      </div>

      <div className="rounded-xl border border-zinc-100 bg-white overflow-hidden">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-zinc-50 border-b border-zinc-100">
              {["Nome","Preço","Duração","Comissão","Ações"].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {services.map((s, i) => (
              <tr key={s.id} className={i < services.length - 1 ? "border-b border-zinc-50 hover:bg-zinc-50/80" : "hover:bg-zinc-50/80"}>
                <td className="px-4 py-3 font-medium text-zinc-800">{s.label || s.name}</td>
                <td className="px-4 py-3 font-semibold text-emerald-600">{fmtBRL(s.price)}</td>
                <td className="px-4 py-3 text-xs text-zinc-500 flex items-center gap-1.5"><Calendar className="size-3.5" /> {s.duration} min</td>
                <td className="px-4 py-3"><Chip label={s.commission + "%"} /></td>
                <td className="px-4 py-3"><div className="flex gap-1">
                  <IconBtn title="Editar" onClick={() => openEdit(s)}><Pencil className="size-4" /></IconBtn>
                  <IconBtn danger title="Excluir" onClick={() => remove(s.id)}><Trash2 className="size-4" /></IconBtn>
                </div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal !== null && (
        <Modal title={modal === "new" ? "Cadastrar serviço" : "Editar serviço"} onClose={() => setModal(null)} onConfirm={save} confirmLabel={modal === "new" ? "Salvar serviço" : "Salvar atualização"}>
          <Field label="Nome do serviço" required>
            <input className={inputCls} placeholder="Ex.: Corte de cabelo" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Valor (R$)" required>
              <input className={inputCls} type="number" placeholder="0,00" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
            </Field>
            <Field label="Duração (min)" required>
              <input className={inputCls} type="number" placeholder="30" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} />
            </Field>
          </div>
          <Field label="Comissão (%)" required>
            <input className={inputCls} type="number" placeholder="0" value={form.commission} onChange={(e) => setForm({ ...form, commission: e.target.value })} />
          </Field>
        </Modal>
      )}
    </div>
  );
}

// ─── TELA DO PROFISSIONAL ─────────────────────────────────────────────────────
function ProfScreen({ onLogout }) {
  const [clientName, setClientName] = useState("");
  const [selected, setSelected] = useState([]);
  const [sent, setSent] = useState(false);

  const total = selected.reduce((s, id) => s + (SERVICES.find((x) => x.id === id)?.price || 0), 0);
  const ready = clientName.trim().length > 0 && selected.length > 0;

  function toggleSvc(id) {
    setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  }

  function enviar() {
    setSent(true);
    setTimeout(() => {
      setSent(false);
      setClientName("");
      setSelected([]);
    }, 2000);
  }

  return (
    <div className="min-h-screen bg-zinc-50 flex items-start justify-center p-4 pt-8 pb-20">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-indigo-600 text-white text-lg font-semibold">BJ</div>
            <div>
              <div className="text-base font-semibold text-zinc-900">Olá, Barbeiro João!</div>
              <div className="text-xs text-zinc-500">Registre o atendimento rapidamente</div>
            </div>
          </div>
          <button onClick={onLogout} className="text-xs text-zinc-400 hover:text-zinc-600 flex items-center gap-1 transition-colors"><LogOut className="size-3.5" /> Sair</button>
        </div>

        <div className="mb-5">
          <label className="mb-1.5 block text-xs font-medium text-zinc-500">Nome do cliente</label>
          <input className={inputCls + " bg-white"} placeholder="Digite o nome do cliente" value={clientName} onChange={(e) => setClientName(e.target.value)} />
        </div>

        <div className="mb-5">
          <label className="mb-2.5 block text-xs font-medium text-zinc-500">Selecione os serviços</label>
          <div className="grid grid-cols-2 gap-3">
            {SERVICES.map((svc) => {
              const active = selected.includes(svc.id);
              return (
                <button key={svc.id} onClick={() => toggleSvc(svc.id)}
                  className={`rounded-xl border-2 p-4 text-left transition-all ${active ? "border-indigo-500 bg-indigo-50" : "border-zinc-100 bg-white hover:border-indigo-300"}`}>
                  <div className="mb-2 text-indigo-600"><Sparkles className="size-5" /></div>
                  <div className="text-sm font-semibold text-zinc-800">{svc.label}</div>
                  <div className="text-xs text-zinc-400 mt-0.5">{fmtBRL(svc.price)}</div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mb-4 flex items-center justify-between rounded-xl bg-white border border-zinc-100 px-4 py-3">
          <span className="text-sm text-zinc-500">Total</span>
          <span className="text-xl font-semibold text-zinc-900">{fmtBRL(total)}</span>
        </div>

        <button onClick={enviar} disabled={!ready}
          className={`w-full rounded-xl py-3 text-sm font-semibold text-white transition-all ${ready ? "bg-indigo-600 hover:bg-indigo-700" : "bg-zinc-200 text-zinc-400 cursor-not-allowed"}`}>
          {sent ? "✓ Enviado para o caixa!" : "Enviar para o caixa"}
        </button>
        {!ready && (
          <p className="mt-2.5 text-center text-xs text-zinc-400">Preencha o nome e selecione pelo menos um serviço</p>
        )}
      </div>
    </div>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [session, setSession] = useState(null); // null | 'administrador' | 'profissional'

  if (!session) return <AuthScreen onLogin={setSession} />;
  if (session === "administrador") return <AdminLayout onLogout={() => setSession(null)} />;
  return <ProfScreen onLogout={() => setSession(null)} />;
}
