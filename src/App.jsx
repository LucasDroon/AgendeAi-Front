import { useState, useEffect, useMemo } from "react";
import { 
  Scissors, Calendar, Users, Check, Trash2, Pencil, Menu, Search, X, LayoutGrid, LogOut, CheckCircle2, Inbox, Sparkles
} from "lucide-react";
import { useAuth } from "./AuthContext";
import { useFetch, useMutation } from "./useFetch";
import { 
  agendamentoService, 
  clienteService, 
  servicoService, 
  usuarioService,
  profissionalService,
  authService
} from "./api";

// ─── UTILITÁRIOS ──────────────────────────────────────────────────────────────
function initials(name) {
  return name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}
function fmtBRL(val) {
  return "R$ " + val.toFixed(2).replace(".", ",");
}

function getSlots() {
  const slots = [];
  for (let h = 8; h <= 20; h++) {
    slots.push(`${h.toString().padStart(2, '0')}:00`);
    slots.push(`${h.toString().padStart(2, '0')}:30`);
  }
  return slots;
}

const AGENDA_SLOTS = getSlots();

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
        <div className="text-xs font-medium text-zinc-800">{service.label || service.name}</div>
        <div className="text-xs text-zinc-400">{fmtBRL(service.price)}</div>
      </div>
    </label>
  );
}

function Avatar({ name, size = "sm" }) {
  if (!name) return null;
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

// const AGENDA_SLOTS = ["09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00","18:00"];

// ─── TELA DE AUTH ─────────────────────────────────────────────────────────────
function AuthScreen({ onLogin }) {
  const [profile, setProfile] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();

  const profiles = [
    { key: "profissional", icon: Scissors, title: "Sou profissional", desc: "Registro de atendimentos" },
    { key: "administrador", icon: LayoutGrid, title: "Sou administrador", desc: "Gestão completa" },
  ];

  async function handleLogin() {
    try {
      console.log("Iniciando login...");
      await login({ email, senha: password }, profile);
      console.log("Login bem sucedido!");
      onLogin();
    } catch (err) {
      console.error("Erro detalhado no login:", err);
      alert(`Erro ao logar: ${err.message}`);
    }
  }

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
              <input className={inputCls} type="email" placeholder="seu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            </Field>
            <Field label="Senha" required>
              <input className={inputCls} type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
            </Field>
            <button onClick={handleLogin} className="w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors">
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

function AdminLayout() {
  const { logout, user } = useAuth();
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
          <button onClick={logout} className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-red-400 hover:bg-red-400/10 transition-all">
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
            <Avatar name={user?.name || "Administrador"} size="sm" />
            <span className="hidden text-sm font-medium text-zinc-700 sm:block">{user?.name || "Administrador"}</span>
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
  const { data: agendamentos } = useFetch(agendamentoService.listar);
  const { data: clientes } = useFetch(clienteService.listar);
  const { data: pros } = useFetch(profissionalService.listar);
  const { data: services } = useFetch(servicoService.listar);
  
  const filaEspera = useMemo(() => {
    if (!agendamentos) return [];
    const agora = new Date();
    const hojeStr = agora.toISOString().split('T')[0];
    
    return agendamentos
      .filter(a => {
        const dataAgendamento = new Date(a.dataHora);
        return a.dataHora.startsWith(hojeStr) && dataAgendamento >= agora && a.status === 'Agendado';
      })
      .sort((a, b) => new Date(a.dataHora) - new Date(b.dataHora));
  }, [agendamentos]);

  const totalHoje = useMemo(() => {
    if (!agendamentos) return 0;
    const hoje = new Date().toISOString().split('T')[0];
    return agendamentos
      .filter(a => a.status === 'Confirmado' && a.dataHora.startsWith(hoje))
      .reduce((sum, a) => sum + (a.valorPago || 0), 0);
  }, [agendamentos]);

  const today = new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" });
  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-zinc-900">Dashboard</h1>
        <span className="text-xs text-zinc-400 capitalize">{today}</span>
      </div>
      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Faturamento hoje", value: fmtBRL(totalHoje), color: "text-emerald-600" },
          { label: "Agendamentos", value: agendamentos?.filter(a => a.status === 'Agendado').length || 0, color: "text-zinc-900" },
          { label: "Clientes ativos", value: clientes?.length || 0, color: "text-zinc-900" },
          { label: "Profissionais", value: pros?.length || 0, color: "text-zinc-900" },
        ].map((m) => (
          <div key={m.label} className="rounded-xl bg-white p-4 border border-zinc-100">
            <div className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-400">{m.label}</div>
            <div className={`text-2xl font-semibold tracking-tight ${m.color}`}>{m.value}</div>
          </div>
        ))}
      </div>
      <div className="rounded-xl bg-white border border-zinc-100 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100">
          <span className="text-sm font-semibold text-zinc-800">Próximos atendimentos — Lista de espera</span>
          <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs text-zinc-500">{filaEspera.length} na fila</span>
        </div>
        {filaEspera.length > 0 ? (
          <div className="divide-y divide-zinc-100">
            {filaEspera.map((a) => (
              <div key={a.id} className="px-4 py-3 text-sm flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-indigo-600 w-12">{new Date(a.dataHora).toLocaleTimeString("pt-BR", { hour: '2-digit', minute: '2-digit' })}</span>
                  <span className="text-zinc-900">{a.nomeCliente}</span>
                  <span className="text-zinc-400">•</span>
                  <span className="text-zinc-600">{a.nomeServico}</span>
                </div>
                <span className="text-zinc-500 text-xs font-medium">{a.nomeProfissional}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 text-zinc-400">
            <Inbox className="size-8 mb-2 opacity-50" />
            <p className="text-sm">Nenhum atendimento na fila no momento</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── AGENDA ───────────────────────────────────────────────────────────────────
function AgendaPage({ showToast }) {
  const { data: bookingsList, refetch } = useFetch(agendamentoService.listar);
  const { data: professionals } = useFetch(profissionalService.listar);
  const { data: services } = useFetch(servicoService.listar);
  const mutation = useMutation(agendamentoService.criar);
  const removerMutation = useMutation(agendamentoService.remover);
  
  const [modal, setModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date();
    const year = d.getFullYear();
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  });
  const [form, setForm] = useState({ 
    clienteId: "", 
    clienteBusca: "",
    proId: "", 
    date: selectedDate, 
    time: "", 
    servicoId: "" 
  });

  const pros = (professionals || []);
  const { data: clientes } = useFetch(clienteService.listar);
  const { user } = useAuth();

  const total = form.servicoId ? (services?.find((x) => x.id === parseInt(form.servicoId))?.price || 0) : 0;

  async function handleRemover() {
    console.log("Debug - handleRemover chamado com ID:", selectedBooking?.id);
    if (!selectedBooking?.id) {
      alert("Erro: ID do agendamento inválido.");
      return;
    }
    if (!confirm("Deseja remover este agendamento?")) return;
    try {
      // Garantimos que estamos passando o id numérico
      const idParaRemover = Number(selectedBooking.id);
      console.log("Debug - Chamando removerMutation.execute com:", idParaRemover);
      await removerMutation.execute(idParaRemover);
      
      setSelectedBooking(null);
      showToast("Agendamento removido com sucesso");
      refetch();
    } catch (err) {
      console.error("Erro na remoção:", err);
      alert(err.message);
    }
  }

  async function save() {
    console.log("Debug - User object:", user);
    try {
      const payload = {
        data_hora: `${form.date}T${form.time}:00`,
        id_cliente: parseInt(form.clienteId),
        id_profissional: form.proId ? parseInt(form.proId) : null,
        id_servico: parseInt(form.servicoId),
        id_usuario: user?.id
      };
      console.log("Debug - Payload sendo enviado:", payload);
      await mutation.execute(payload);
      setModal(false);
      setForm({ clienteId: "", proId: "", date: selectedDate, time: "", servicoId: "" });
      showToast("Agendamento salvo com sucesso");
      refetch();
    } catch (err) {
      alert(err.message);
    }
  }

  const bookingsBySlot = useMemo(() => {
    const map = {};
    (bookingsList || []).forEach(b => {
      const date = b.dataHora.split('T')[0];
      const timeParts = b.dataHora.split('T')[1].split(':');
      const hours = parseInt(timeParts[0]);
      const minutes = parseInt(timeParts[1]);

      // Snap para intervalo de 30 minutos
      const slotMinutes = minutes < 30 ? "00" : "30";
      const slotTime = `${hours.toString().padStart(2, '0')}:${slotMinutes}`;

      if (date === selectedDate) {
        map[`${slotTime}-${b.nomeProfissional}`] = b;
      }
    });
    return map;
  }, [bookingsList, selectedDate]);

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-zinc-900">Agenda</h1>
        <div className="flex items-center gap-3">
          <input 
            type="date" 
            className={`${inputCls} w-auto`} 
            value={selectedDate} 
            onChange={(e) => setSelectedDate(e.target.value)} 
          />
          <button onClick={() => setModal(true)} className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-700 transition-colors">
            + Novo agendamento
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-zinc-100 bg-white">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-zinc-50 border-b border-zinc-100">
              <th className="w-16 px-4 py-3 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wide">Hora</th>
              {pros.map((p) => (
                <th key={p.id} className="px-4 py-3 text-center text-xs font-semibold text-zinc-600">{p.name}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {AGENDA_SLOTS.map((slot, si) => (
              <tr key={slot} className={si < AGENDA_SLOTS.length - 1 ? "border-b border-zinc-50" : ""}>
                <td className="px-4 py-0 text-xs font-medium text-zinc-400 bg-zinc-50 h-12">{slot}</td>
                {pros.map((p) => {
                  const booking = bookingsBySlot[`${slot}-${p.name}`];
                  return (
                    <td key={p.id} className="h-12 border-l border-zinc-50 px-2 text-center align-middle hover:bg-indigo-50/50 cursor-pointer transition-colors"
                      onClick={() => booking && setSelectedBooking(booking)}>
                      {booking && (
                        <span className={`inline-block rounded-lg px-2.5 py-1 text-xs font-medium ${booking.status === 'Cancelado' ? 'bg-zinc-100 text-zinc-500 line-through' : 'bg-indigo-100 text-indigo-700'}`}>
                          {booking.nomeServico}
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

      {selectedBooking && (
        <Modal title="Detalhes do agendamento" onClose={() => setSelectedBooking(null)} onConfirm={handleRemover} confirmLabel="Remover agendamento">
          <div className="space-y-3 text-sm">
            <p><strong>Cliente:</strong> {selectedBooking.nomeCliente}</p>
            <p><strong>Serviço:</strong> {selectedBooking.nomeServico}</p>
            <p><strong>Profissional:</strong> {selectedBooking.nomeProfissional}</p>
            <p><strong>Data/Hora:</strong> {new Date(selectedBooking.dataHora).toLocaleString("pt-BR")}</p>
          </div>
        </Modal>
      )}

      {modal && (
        <Modal title="Novo agendamento" onClose={() => setModal(false)} onConfirm={save} confirmLabel="Salvar agendamento">
          <Field label="Cliente" required>
            <div className="relative">
              <input
                type="text"
                className={inputCls}
                placeholder="Pesquisar cliente..."
                value={form.clienteBusca || ""}
                onChange={(e) => setForm({ ...form, clienteBusca: e.target.value, clienteId: "" })}
              />
              {form.clienteBusca && !form.clienteId && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-zinc-200 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                  {(clientes || []).filter(c => c.name.toLowerCase().includes(form.clienteBusca.toLowerCase())).map((c) => (
                    <div
                      key={c.id}
                      className="px-3 py-2 text-xs hover:bg-indigo-50 cursor-pointer"
                      onClick={() => setForm({ ...form, clienteId: c.id, clienteBusca: c.name })}
                    >
                      {c.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Field>
          <Field label="Profissional" required>
            <select className={inputCls} value={form.proId} onChange={(e) => setForm({ ...form, proId: e.target.value })}>
              <option value="">Selecione o profissional</option>
              {pros.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
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
          <Field label="Serviço" required>
            <div className="grid grid-cols-1 gap-2 mt-1">
              {(services || []).map((svc) => (
                <ServiceCheckbox 
                  key={svc.id} 
                  service={svc} 
                  checked={form.servicoId === String(svc.id)} 
                  onChange={() => setForm({ ...form, servicoId: String(svc.id) })} 
                />
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
  const { data: clients, refetch } = useFetch(clienteService.listar);
  const mutation = useMutation(clienteService.criar);
  const deleteMutation = useMutation(clienteService.remover);

  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", email: "", dob: "" });

  async function save() {
    if (!form.name) return;
    try {
      await mutation.execute(form);
      setForm({ name: "", phone: "", email: "", dob: "" });
      setModal(false);
      showToast("Cliente cadastrado com sucesso");
      refetch();
    } catch (err) {
      alert(err.message);
    }
  }

  async function remove(id) {
    try {
      await deleteMutation.execute(id);
      showToast("Cliente removido");
      refetch();
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-zinc-900">Meus clientes</h1>
        <button onClick={() => setModal(true)} className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-700 transition-colors">
          + Cadastrar cliente
        </button>
      </div>

      {!clients ? <p>Carregando...</p> : (
        <>
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
                    <td className="px-4 py-3 text-xs text-zinc-400">{c.lastVisit || "—"}</td>
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
                  <div className="text-zinc-400">Último: {c.lastVisit || "—"}</div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

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
  const { data: pros, refetch } = useFetch(profissionalService.listar);
  const mutation = useMutation(profissionalService.criar);
  const updateMutation = useMutation(profissionalService.atualizar);
  const deleteMutation = useMutation(profissionalService.inativar);

  const [modal, setModal] = useState(null); // null | 'new' | id para editar
  const [form, setForm] = useState({ nome: "", percentual_comissao: "", cor_agenda: "#FF5733", ativo: true });

  function openNew() {
    setForm({ nome: "", percentual_comissao: "", cor_agenda: "#FF5733", ativo: true });
    setModal("new");
  }

  function openEdit(p) {
    setForm({ nome: p.nome, percentual_comissao: String(p.percentual_comissao), cor_agenda: p.cor_agenda, ativo: p.ativo });
    setModal(p.id_profissional);
  }

  async function remove(id) {
    if (!confirm("Deseja realmente inativar este profissional?")) return;
    try {
      await deleteMutation.execute(id);
      showToast("Profissional inativado");
      refetch();
    } catch (err) {
      alert(err.message);
    }
  }

  async function save() {
    if (!form.nome) return;
    const payload = {
        nome: form.nome,
        percentual_comissao: Number(form.percentual_comissao),
        cor_agenda: form.cor_agenda,
        ativo: form.ativo
    };
    try {
      console.log("Payload enviado para API:", JSON.stringify(payload));
      if (modal === "new") {
        await mutation.execute(payload);
        showToast("Profissional cadastrado com sucesso");
      } else {
        await updateMutation.execute(modal, payload);
        showToast("Profissional atualizado");
      }
      setModal(null);
      refetch();
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-zinc-900">Profissionais</h1>
        <button onClick={openNew} className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-700 transition-colors">
          + Cadastrar profissional
        </button>
      </div>

      {!pros ? <p>Carregando...</p> : (
        <div className="rounded-xl border border-zinc-100 bg-white overflow-hidden">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-zinc-50 border-b border-zinc-100">
                {["Nome", "Comissão", "Cor Agenda", "Status", "Ações"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pros.map((p, i) => (
                <tr key={p.id_profissional} className={i < pros.length - 1 ? "border-b border-zinc-50 hover:bg-zinc-50/80" : "hover:bg-zinc-50/80"}>
                  <td className="px-4 py-3 font-medium text-zinc-800">{p.nome}</td>
                  <td className="px-4 py-3 text-zinc-600">{p.percentual_comissao}%</td>
                  <td className="px-4 py-3">
                    <div className="size-6 rounded-lg border border-zinc-200" style={{ backgroundColor: p.cor_agenda }} />
                  </td>
                  <td className="px-4 py-3">
                    <Chip label={p.ativo ? "Ativo" : "Inativo"} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <IconBtn title="Editar" onClick={() => openEdit(p)}><Pencil className="size-4" /></IconBtn>
                      <IconBtn danger title="Excluir" onClick={() => remove(p.id_profissional)}><Trash2 className="size-4" /></IconBtn>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal !== null && (
        <Modal title={modal === "new" ? "Cadastrar profissional" : "Editar profissional"} onClose={() => setModal(null)} onConfirm={save} confirmLabel="Salvar">
          <Field label="Nome" required>
            <input className={inputCls} value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
          </Field>
          <Field label="Comissão (%)" required>
            <input className={inputCls} type="number" value={form.percentual_comissao} onChange={(e) => setForm({ ...form, percentual_comissao: e.target.value })} />
          </Field>
          <Field label="Cor na agenda" required>
            <input className="w-full h-10 rounded-lg cursor-pointer" type="color" value={form.cor_agenda} onChange={(e) => setForm({ ...form, cor_agenda: e.target.value })} />
          </Field>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.ativo} onChange={(e) => setForm({ ...form, ativo: e.target.checked })} />
            <span className="text-sm text-zinc-700">Profissional ativo</span>
          </label>
        </Modal>
      )}
    </div>
  );
}

// ─── SERVIÇOS ─────────────────────────────────────────────────────────────────
function ServicosPage({ showToast }) {
  const { data: services, refetch } = useFetch(servicoService.listar);
  const mutation = useMutation(servicoService.criar);
  const updateMutation = useMutation(servicoService.atualizar);
  const deleteMutation = useMutation(servicoService.remover);

  const [modal, setModal] = useState(null); // null | 'new' | number(id para editar)
  const [deleteConfirmId, setDeleteConfirmId] = useState(null); // null | number(id para excluir)
  const [form, setForm] = useState({ name: "", price: "", duration: "" });

  function openNew() {
    setForm({ name: "", price: "", duration: "" });
    setModal("new");
  }

  function openEdit(svc) {
    setForm({ name: svc.label || svc.name, price: String(svc.price), duration: String(svc.duration) });
    setModal(svc.id);
  }

  async function save() {
    try {
      if (modal === "new") {
        await mutation.execute({ label: form.name, price: Number(form.price), duration: Number(form.duration) });
        showToast("Serviço cadastrado com sucesso");
      } else {
        await updateMutation.execute(modal, { label: form.name, price: Number(form.price), duration: Number(form.duration) });
        showToast("Serviço atualizado");
      }
      refetch();
      setModal(null);
    } catch (err) {
      alert(err.message);
    }
  }

  async function remove() {
    if (!deleteConfirmId) return;
    try {
      await deleteMutation.execute(deleteConfirmId);
      showToast("Serviço removido");
      refetch();
    } catch (err) {
      alert(err.message);
    } finally {
      setDeleteConfirmId(null);
    }
  }

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-zinc-900">Catálogo de serviços</h1>
        <button onClick={openNew} className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-700 transition-colors">
          + Cadastrar serviço
        </button>
      </div>

      {!services ? <p>Carregando...</p> : (
        <div className="rounded-xl border border-zinc-100 bg-white overflow-hidden">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-zinc-50 border-b border-zinc-100">
                {["Nome","Preço","Duração","Ações"].map((h) => (
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
                  <td className="px-4 py-3"><div className="flex gap-1">
                    <IconBtn title="Editar" onClick={() => openEdit(s)}><Pencil className="size-4" /></IconBtn>
                    <IconBtn danger title="Excluir" onClick={() => setDeleteConfirmId(s.id)}><Trash2 className="size-4" /></IconBtn>
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {deleteConfirmId && (
        <Modal title="Confirmar exclusão" onClose={() => setDeleteConfirmId(null)} onConfirm={remove} confirmLabel="Excluir serviço">
          <p className="text-sm text-zinc-600">Tem certeza que deseja excluir este serviço? Esta ação não pode ser desfeita.</p>
        </Modal>
      )}

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
        </Modal>
      )}
    </div>
  );
}

// ─── TELA DO PROFISSIONAL ─────────────────────────────────────────────────────
function ProfScreen({ onLogout }) {
  const { user } = useAuth();
  const { data: services } = useFetch(servicoService.listar);
  const { data: clientes } = useFetch(clienteService.listar);
  const { data: pros } = useFetch(profissionalService.listar);
  const mutation = useMutation(agendamentoService.criar);
  
  const SERVICES = services || [];
  const PROS = pros || [];
  const [clientBusca, setClientBusca] = useState("");
  const [clienteId, setClienteId] = useState("");
  const [profissionalId, setProfissionalId] = useState("");
  const [selected, setSelected] = useState([]);
  const [sent, setSent] = useState(false);

  const total = selected.reduce((s, id) => s + (SERVICES.find((x) => x.id === id)?.price || 0), 0);
  const ready = clienteId && profissionalId && selected.length > 0;

  function toggleSvc(id) {
    setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  }

  async function enviar() {
    if (!ready) return;
    try {
      const payload = {
        data_hora: new Date().toISOString().slice(0, 19),
        id_cliente: parseInt(clienteId),
        id_profissional: parseInt(profissionalId),
        id_servico: selected[0],
        id_usuario: user?.id,
        status: "Confirmado"
      };
      await mutation.execute(payload);
      setSent(true);
      setTimeout(() => {
        setSent(false);
        setClientBusca("");
        setClienteId("");
        setProfissionalId("");
        setSelected([]);
      }, 2000);
    } catch (err) {
      alert("Erro ao registrar atendimento: " + err.message);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 flex items-start justify-center p-4 pt-8 pb-20">
      {sent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 p-4">
          <div className="rounded-2xl bg-white p-8 text-center shadow-xl animate-fade-in">
            <div className="mb-4 flex justify-center text-emerald-500">
              <CheckCircle2 className="size-12" />
            </div>
            <h2 className="text-lg font-semibold text-zinc-900">Sucesso!</h2>
            <p className="text-sm text-zinc-500">Serviço enviado para o caixa.</p>
          </div>
        </div>
      )}
      <div className="w-full max-w-sm">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-indigo-600 text-white text-lg font-semibold">{initials(user?.name || "P")}</div>
            <div>
              <div className="text-base font-semibold text-zinc-900">Olá, {user?.name || "Profissional"}!</div>
              <div className="text-xs text-zinc-500">Registre o atendimento</div>
            </div>
          </div>
          <button onClick={onLogout} className="text-xs text-zinc-400 hover:text-zinc-600 flex items-center gap-1 transition-colors"><LogOut className="size-3.5" /> Sair</button>
        </div>

        <div className="mb-5 space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-zinc-500">Profissional responsável</label>
            <select className={inputCls} value={profissionalId} onChange={(e) => setProfissionalId(e.target.value)}>
              <option value="">Selecione o profissional</option>
              {PROS.filter(p => p.ativo).map(p => (
                <option key={p.id_profissional} value={p.id_profissional}>{p.nome}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-zinc-500">Cliente</label>
            <div className="relative">
              <input
                className={inputCls + " bg-white"}
                placeholder="Pesquisar cliente..."
                value={clientBusca}
                onChange={(e) => { setClientBusca(e.target.value); setClienteId(""); }}
              />
              {clientBusca && !clienteId && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-zinc-200 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                  {(clientes || []).filter(c => c.name.toLowerCase().includes(clientBusca.toLowerCase())).map((c) => (
                    <div key={c.id} className="px-3 py-2 text-xs hover:bg-indigo-50 cursor-pointer" onClick={() => { setClienteId(c.id); setClientBusca(c.name); }}>
                      {c.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mb-5">
          <label className="mb-2.5 block text-xs font-medium text-zinc-500">Serviços</label>
          <div className="grid grid-cols-2 gap-3">
            {SERVICES.map((svc) => {
              const active = selected.includes(svc.id);
              return (
                <button key={svc.id} onClick={() => toggleSvc(svc.id)}
                  className={`rounded-xl border-2 p-4 text-left transition-all ${active ? "border-indigo-500 bg-indigo-50" : "border-zinc-100 bg-white hover:border-indigo-300"}`}>
                  <div className="mb-2 text-indigo-600"><Sparkles className="size-5" /></div>
                  <div className="text-sm font-semibold text-zinc-800">{svc.label || svc.name}</div>
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
          {sent ? "✓ Enviado!" : "Enviar para o caixa"}
        </button>
      </div>
    </div>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────
export default function App() {
  const { isAuthenticated, user, logout } = useAuth();

  if (!isAuthenticated) return <AuthScreen onLogin={() => {}} />;
  if (user?.role === "ADMIN") return <AdminLayout />;
  return <ProfScreen onLogout={logout} />;
}
