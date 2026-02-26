import { useState, useMemo, useRef, useEffect, type ReactNode } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, BarChart, Bar, Cell, ReferenceLine } from "recharts";
import { ChevronDown, X, HelpCircle } from "lucide-react";

/* ═══ UTILS ═══ */
const fmt = (v: number) => new Intl.NumberFormat("pt-PT", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(v);
const fmtK = (v: number) => Math.abs(v) >= 1000 ? (v/1000).toFixed(0) + "k€" : v.toFixed(0) + "€";
const pct = (v: number, d = 1) => v.toFixed(d) + "%";

// IMT para segundas habitações / investimento (não HPP)
const calcIMT = (p: number) => {
  if (p <= 101917) return p * 0.01;
  if (p <= 139412) return p * 0.02 - 1019.17;
  if (p <= 190086) return p * 0.05 - 5201.53;
  if (p <= 316772) return p * 0.07 - 9009.25;
  if (p <= 633453) return p * 0.08 - 12176.97;
  if (p <= 1102920) return p * 0.06 + 532.09;
  return p * 0.075;
};

// Imposto de Selo sobre aquisição
const calcIS = (p: number) => p * 0.008;

// IRS sobre rendas - taxa autónoma por duração de contrato
const irsRate = (d: number) => {
  if (d >= 20) return 0.05;
  if (d >= 10) return 0.10;
  if (d >= 5) return 0.15;
  if (d >= 2) return 0.25;
  return 0.28; // < 2 anos
};

// Coeficiente de atualização monetária (simplificado - média ~1.02/ano)
const coefAtualizacao = (anos: number) => Math.pow(1.02, anos);

/* ═══ COMPONENTS ═══ */

// Info Tooltip component
const InfoTooltip = ({ text }: { text: string }) => {
  const [show, setShow] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setShow(false);
      }
    };
    if (show) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [show]);

  return (
    <div ref={ref} className="relative inline-flex items-center">
      <button
        onClick={(e) => { e.stopPropagation(); setShow(!show); }}
        className="text-gray-300 hover:text-gray-500 transition ml-1 p-0.5"
        type="button"
      >
        <HelpCircle size={12} />
      </button>
      {show && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShow(false)} />
          <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-64 p-3 bg-gray-900 text-white text-[11px] rounded-lg shadow-xl z-50 leading-relaxed">
            {text}
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-[6px] border-transparent border-t-gray-900" />
          </div>
        </>
      )}
    </div>
  );
};

interface SliderProps {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step: number;
  suffix?: string;
  info?: string;
  hint?: string;
}

const MiniSlider = ({ label, value, onChange, min, max, step, suffix = "", info }: SliderProps) => (
  <div className="flex items-center gap-2">
    <span className="text-xs text-gray-500 whitespace-nowrap flex items-center">
      {label}
      {info && <InfoTooltip text={info} />}
    </span>
    <input
      type="range"
      min={min} max={max} step={step}
      value={value}
      onChange={e => onChange(Number(e.target.value))}
      className="w-20 h-1 bg-gray-300 rounded-full appearance-none cursor-pointer accent-green-600"
    />
    <span className="text-xs font-bold text-gray-800 font-mono w-12">{value}{suffix}</span>
  </div>
);

const Slider = ({ label, value, onChange, min, max, step, suffix = "", hint }: SliderProps) => (
  <div className="mb-3">
    <div className="flex justify-between items-center mb-1">
      <span className="text-xs text-gray-500 font-medium">{label}</span>
      <span className="text-xs font-bold text-gray-800 font-mono">{value}{suffix}</span>
    </div>
    <input
      type="range"
      min={min} max={max} step={step}
      value={value}
      onChange={e => onChange(Number(e.target.value))}
      className="w-full h-1.5 bg-gray-200 rounded-full appearance-none cursor-pointer accent-green-600"
    />
    {hint && <div className="text-[10px] text-gray-400 mt-0.5">{hint}</div>}
  </div>
);

const Dropdown = ({ label, isOpen, onToggle, children }: { label: string; isOpen: boolean; onToggle: (v: boolean) => void; children: ReactNode }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onToggle(false);
      }
    };
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onToggle]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => onToggle(!isOpen)}
        className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition
          ${isOpen ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-gray-100 text-gray-600 border border-transparent hover:bg-gray-200'}`}
      >
        {label}
        <ChevronDown size={14} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-72 bg-white border border-gray-200 rounded-xl shadow-xl z-50 p-4">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-100">
            <span className="text-xs font-bold text-gray-700 uppercase">{label}</span>
            <button onClick={() => onToggle(false)} className="text-gray-400 hover:text-gray-600">
              <X size={14} />
            </button>
          </div>
          {children}
        </div>
      )}
    </div>
  );
};

const KPI = ({ label, value, sub, accent, large, info }: { label: string; value: string; sub?: string; accent?: string; large?: boolean; info?: string }) => (
  <div className={`bg-white border border-gray-200 rounded-xl p-3 ${large ? '' : ''} relative`}>
    {accent && <div className="absolute top-0 left-0 right-0 h-1 rounded-t-xl" style={{ background: accent }} />}
    <div className="flex items-center text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-0.5">
      {label}
      {info && <InfoTooltip text={info} />}
    </div>
    <div className={`font-extrabold font-mono ${large ? 'text-xl' : 'text-lg'}`} style={{ color: accent || '#1a1a2e' }}>
      {value}
    </div>
    {sub && <div className="text-[10px] text-gray-400">{sub}</div>}
  </div>
);

type PLRowType = "income" | "expense" | "subtotal" | "total" | "negative";

const PLRow = ({ label, value, type, hint }: { label: string; value: string; type?: PLRowType; hint?: string }) => {
  const styles: Record<PLRowType, string> = {
    income: "text-green-600 font-semibold",
    expense: "text-gray-500",
    subtotal: "text-gray-800 font-semibold border-t border-gray-100 pt-1.5 mt-1.5",
    total: "text-green-600 font-bold border-t-2 border-gray-200 pt-2 mt-2",
    negative: "text-red-500 font-bold border-t-2 border-gray-200 pt-2 mt-2",
  };
  return (
    <div className={`flex justify-between py-0.5 text-sm ${(type && styles[type]) || 'text-gray-600'}`}>
      <span>{label}{hint && <span className="text-[10px] text-gray-400 ml-1">({hint})</span>}</span>
      <span className="font-mono">{value}</span>
    </div>
  );
};

interface ChartTooltipPayload {
  color: string;
  name: string;
  value: number;
}

const ChartTooltip = ({ active, payload, label }: { active?: boolean; payload?: ChartTooltipPayload[]; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white/95 border border-gray-200 rounded-lg p-2 shadow-lg">
      <div className="text-[10px] text-gray-400 font-bold mb-1">Ano {label}</div>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2 text-[11px]">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-gray-500">{p.name}:</span>
          <span className="font-mono font-bold text-gray-800">{fmt(p.value)}</span>
        </div>
      ))}
    </div>
  );
};

/* ═══ MAIN APP ═══ */
export default function ImoSimula() {
  // Valores do imóvel
  const [preco, setPreco] = useState(200000);
  const [renda, setRenda] = useState(900);

  // Quick params (always visible)
  const [entradaPct, setEntradaPct] = useState(20);
  const [obras, setObras] = useState(0);
  const [horizonte, setHorizonte] = useState(10);

  // Financiamento (dropdown)
  const [taxa, setTaxa] = useState(2.8);
  const [prazo, setPrazo] = useState(30);

  // Despesas (dropdown)
  const [registos, setRegistos] = useState(750);
  const [imiPct, setImiPct] = useState(0.35);
  const [condominio, setCondominio] = useState(40);
  const [manutencao, setManutencao] = useState(1.0);
  const [seguro, setSeguro] = useState(100);
  const [gestao, setGestao] = useState(0);

  // Projeção (dropdown)
  const [valoriz, setValoriz] = useState(1);
  const [aumentoRenda, setAumentoRenda] = useState(2);
  const [ocupacao, setOcupacao] = useState(12);
  const [durContrato, setDurContrato] = useState(5);

  // Dropdown states
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  // ═══ CÁLCULOS ═══
  const analise = useMemo(() => {
    const valorImovelInicial = preco + obras;
    const entrada = preco * entradaPct / 100;
    const imt = calcIMT(preco);
    const impSelo = calcIS(preco);
    const totalInvestido = entrada + imt + impSelo + registos + obras;

    const emprestimo = preco - entrada;
    const taxaMensal = taxa / 100 / 12;
    const nPagamentos = prazo * 12;
    const prestacaoMensal = taxaMensal > 0
      ? (emprestimo * taxaMensal * Math.pow(1 + taxaMensal, nPagamentos)) / (Math.pow(1 + taxaMensal, nPagamentos) - 1)
      : emprestimo / nPagamentos;
    const prestacaoAnual = prestacaoMensal * 12;

    const rendaBruta = renda * ocupacao;
    const imiAnual = preco * imiPct / 100;
    const condAnual = condominio * 12;
    const manutAnual = preco * manutencao / 100;
    const despesasTotal = imiAnual + condAnual + manutAnual + seguro + (rendaBruta * gestao / 100);

    const noi = rendaBruta - despesasTotal;
    const irsT = irsRate(durContrato);
    const irsAnual = noi > 0 ? noi * irsT : 0;
    const noiLiquido = noi - irsAnual;
    const cashFlowAnual = noiLiquido - prestacaoAnual;
    const cashFlowMensal = cashFlowAnual / 12;

    // Yields e Cap Rate
    const yieldBruta = (rendaBruta / valorImovelInicial) * 100;
    const yieldLiquida = (noiLiquido / valorImovelInicial) * 100;
    const capRate = (noi / valorImovelInicial) * 100; // NOI antes de IRS
    const cashOnCash = totalInvestido > 0 ? (cashFlowAnual / totalInvestido) * 100 : 0;

    // DSCR (Debt Service Coverage Ratio)
    const dscr = prestacaoAnual > 0 ? noi / prestacaoAnual : 999;

    // Projeção temporal
    const dados: { ano: number; equity: number; equityLiquida: number; cfAcumulado: number; lucro: number; roiPct: number; cfAnual: number; valorImovel: number; saldoDevedor: number; custosVenda: number }[] = [];
    let saldoDevedor = emprestimo;
    let valorImovel = valorImovelInicial;
    let rendaAtual = renda;
    let cfAcumulado = 0;

    // Despesas fixas baseadas no preço inicial (IMI usa VPT, não valor de mercado)
    const despesasFixasAnuais = imiAnual + condAnual + manutAnual + seguro;

    for (let ano = 1; ano <= horizonte; ano++) {
      let prestacaoAno = 0;

      for (let m = 0; m < 12; m++) {
        if (saldoDevedor > 0 && (ano - 1) * 12 + m < nPagamentos) {
          const juro = saldoDevedor * taxaMensal;
          const amort = prestacaoMensal - juro;
          saldoDevedor = Math.max(0, saldoDevedor - amort);
          prestacaoAno += prestacaoMensal;
        }
      }

      const rendaAno = rendaAtual * ocupacao;
      const gestaoAno = rendaAno * gestao / 100;
      const despAno = despesasFixasAnuais + gestaoAno;
      const noiAno = rendaAno - despAno;
      const irsAno = noiAno > 0 ? noiAno * irsT : 0;
      const cfAno = noiAno - irsAno - prestacaoAno;
      cfAcumulado += cfAno;

      // Valorização (só afeta equity, não despesas)
      valorImovel *= (1 + valoriz / 100);
      rendaAtual *= (1 + aumentoRenda / 100);

      // Custos de venda (se vendesse neste ano)
      const comissaoVenda = valorImovel * 0.05; // 5% comissão imobiliária
      const custoAquisicaoAtualizado = (preco + obras) * coefAtualizacao(ano);
      const maisValia = Math.max(0, valorImovel - custoAquisicaoAtualizado);
      const irsMaisValias = maisValia * 0.5 * 0.28; // 50% tributado a 28% (simplificado)
      const custosVenda = comissaoVenda + irsMaisValias;

      const equity = valorImovel - saldoDevedor;
      const equityLiquida = equity - custosVenda; // Equity após custos de venda
      const lucroLiquido = equityLiquida + cfAcumulado - totalInvestido;
      const roiPct = totalInvestido > 0 ? (lucroLiquido / totalInvestido) * 100 : 0;

      dados.push({
        ano,
        equity: Math.round(equity),
        equityLiquida: Math.round(equityLiquida),
        cfAcumulado: Math.round(cfAcumulado),
        lucro: Math.round(lucroLiquido),
        roiPct: Math.round(roiPct * 10) / 10,
        cfAnual: Math.round(cfAno),
        valorImovel: Math.round(valorImovel),
        saldoDevedor: Math.round(saldoDevedor),
        custosVenda: Math.round(custosVenda),
      });
    }

    let payback: number | null = null;
    for (const d of dados) { if (d.cfAcumulado >= totalInvestido) { payback = d.ano; break; } }

    const final_ = dados[dados.length - 1];

    const lucroAnualizado = horizonte > 0 ? (final_?.lucro ?? 0) / horizonte : 0;
    const roiAnualizado = totalInvestido > 0 ? (lucroAnualizado / totalInvestido) * 100 : 0;

    return {
      entrada, imt, impSelo, registos, obras, totalInvestido, emprestimo, prestacaoMensal, prestacaoAnual,
      rendaBruta, despesasTotal, imiAnual, condAnual, manutAnual, seguro,
      noi, irsT, irsAnual, noiLiquido, cashFlowAnual, cashFlowMensal,
      yieldBruta, yieldLiquida, capRate, cashOnCash, dscr, payback, dados,
      roiFinal: final_?.roiPct ?? 0,
      valorFinal: final_?.valorImovel ?? preco,
      lucroLiquido: final_?.lucro ?? 0,
      lucroAnualizado,
      roiAnualizado,
      equityFinal: final_?.equity ?? 0,
      equityLiquidaFinal: final_?.equityLiquida ?? 0,
      custosVendaFinal: final_?.custosVenda ?? 0,
    };
  }, [preco, renda, entradaPct, taxa, prazo, obras, registos, imiPct, condominio, manutencao, seguro, gestao, valoriz, aumentoRenda, horizonte, ocupacao, durContrato]);

  const isPositivo = analise.cashFlowMensal >= 0;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-2.5 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center text-xs font-extrabold text-white">IS</div>
            <span className="text-base font-bold text-gray-800">ImoSimula</span>
            <span className="text-xs text-gray-400 ml-1">Simulador de Investimento</span>
          </div>
        </div>
      </header>

      {/* Sticky Control Bar */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 sticky top-[52px] z-30 shadow-sm">
        <div className="max-w-7xl mx-auto">
          {/* Valores + Quick Params */}
          <div className="flex flex-wrap items-center gap-4">
            {/* Preço e Renda */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <span className="text-xs text-gray-500 font-medium">Preço</span>
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-400">€</span>
                  <input
                    type="number"
                    value={preco}
                    onChange={e => setPreco(parseInt(e.target.value) || 0)}
                    className="w-36 border border-gray-200 rounded-lg pl-6 pr-2 py-1.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                  />
                </div>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-xs text-gray-500 font-medium">Renda</span>
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-400">€</span>
                  <input
                    type="number"
                    value={renda}
                    onChange={e => setRenda(parseInt(e.target.value) || 0)}
                    className="w-32 border border-gray-200 rounded-lg pl-6 pr-10 py-1.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                  />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-gray-400">/mês</span>
                </div>
              </div>
            </div>

            <div className="w-px h-6 bg-gray-200" />

            {/* Quick Params */}
            <div className="flex items-center gap-4 px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-100">
              <MiniSlider
                label="Entrada"
                value={entradaPct}
                onChange={setEntradaPct}
                min={0} max={100} step={5} suffix="%"
                info="Percentagem do preço paga de início. Mínimo bancário geralmente 10-20%. Mais entrada = menos prestação e melhor cash flow."
              />
              <div className="w-px h-4 bg-gray-200" />
              <MiniSlider
                label="Obras"
                value={obras / 1000}
                onChange={(v: number) => setObras(v * 1000)}
                min={0} max={100} step={5} suffix="k"
                info="Investimento em renovação. Valoriza o imóvel e é incluído no cálculo das yields e equity."
              />
              <div className="w-px h-4 bg-gray-200" />
              <MiniSlider
                label="Horizonte"
                value={horizonte}
                onChange={setHorizonte}
                min={1} max={30} step={1} suffix="a"
                info="Período de análise em anos. Define até quando calcular o lucro e projetar os gráficos."
              />
            </div>

            <div className="flex items-center gap-2">
              <Dropdown label="Financiamento" isOpen={openDropdown === 'fin'} onToggle={(v: boolean) => setOpenDropdown(v ? 'fin' : null)}>
                <Slider label="Taxa de juro" value={taxa} onChange={setTaxa} min={1} max={8} step={0.1} suffix="%" hint="Spread + Euribor. Varia conforme banco e perfil." />
                <Slider label="Prazo empréstimo" value={prazo} onChange={setPrazo} min={5} max={40} step={1} suffix=" anos" hint="Maior prazo = menor prestação, mas mais juros pagos" />
                <div className="text-[10px] text-gray-400 mt-2 pt-2 border-t border-gray-100">
                  Empréstimo: {fmt(analise.emprestimo)} · Prestação: {fmt(analise.prestacaoMensal)}/mês
                </div>
              </Dropdown>

              <Dropdown label="Despesas" isOpen={openDropdown === 'desp'} onToggle={(v: boolean) => setOpenDropdown(v ? 'desp' : null)}>
                <Slider label="Registos/Escritura" value={registos} onChange={setRegistos} min={500} max={5000} step={100} suffix="€" hint="Notário, registo predial, etc." />
                <Slider label="IMI" value={imiPct} onChange={setImiPct} min={0.2} max={0.8} step={0.05} suffix="%" hint={`${fmt(preco * imiPct / 100)}/ano · Imposto municipal sobre imóveis`} />
                <Slider label="Condomínio" value={condominio} onChange={setCondominio} min={0} max={400} step={10} suffix="€/mês" hint="Quota mensal do prédio" />
                <Slider label="Manutenção" value={manutencao} onChange={setManutencao} min={0} max={3} step={0.1} suffix="%" hint="Reserva anual para reparações (% do valor)" />
                <Slider label="Seguro" value={seguro} onChange={setSeguro} min={50} max={1000} step={25} suffix="€/ano" hint="Seguro multirriscos obrigatório" />
                <Slider label="Gestão" value={gestao} onChange={setGestao} min={0} max={15} step={1} suffix="%" hint="Comissão se usares empresa de gestão" />
              </Dropdown>

              <Dropdown label="Projeção" isOpen={openDropdown === 'proj'} onToggle={(v: boolean) => setOpenDropdown(v ? 'proj' : null)}>
                <Slider label="Valorização anual" value={valoriz} onChange={setValoriz} min={-2} max={10} step={0.5} suffix="%" hint="Estimativa de aumento do valor do imóvel" />
                <Slider label="Aumento renda anual" value={aumentoRenda} onChange={setAumentoRenda} min={0} max={10} step={0.5} suffix="%" hint="Atualização anual da renda (inflação + mercado)" />
                <Slider label="Ocupação" value={ocupacao} onChange={setOcupacao} min={6} max={12} step={1} suffix=" meses/ano" hint="Meses com inquilino (12 = sem vacância)" />
                <Slider label="Duração contrato" value={durContrato} onChange={setDurContrato} min={1} max={25} step={1} suffix=" anos" hint={`IRS: ${pct(irsRate(durContrato) * 100, 0)} · Contratos longos = menos imposto`} />
              </Dropdown>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 py-4 w-full">
        {/* KPIs */}
        <div className="grid grid-cols-3 lg:grid-cols-6 gap-2 mb-4">
          <KPI
            label="Yield Bruta"
            value={pct(analise.yieldBruta)}
            accent={analise.yieldBruta >= 5 ? "#16a34a" : analise.yieldBruta >= 4 ? "#ca8a04" : "#dc2626"}
            sub={`${fmt(analise.rendaBruta)}/ano`}
            info="Renda anual ÷ Valor do imóvel. Métrica simples para comparar imóveis. Não considera despesas, impostos ou financiamento. Boa: >5%"
          />
          <KPI
            label="Cap Rate"
            value={pct(analise.capRate)}
            accent={analise.capRate >= 4.5 ? "#16a34a" : analise.capRate >= 3.5 ? "#ca8a04" : "#dc2626"}
            sub={`NOI ${fmt(analise.noi)}/ano`}
            info="NOI (renda - despesas, antes de IRS) ÷ Valor do imóvel. Padrão internacional para comparar imóveis. Bom Cap Rate: >4.5%"
          />
          <KPI
            label="Yield Líquida"
            value={pct(analise.yieldLiquida)}
            accent={analise.yieldLiquida >= 3.5 ? "#16a34a" : analise.yieldLiquida >= 2.5 ? "#ca8a04" : "#dc2626"}
            sub={`IRS ${pct(analise.irsT * 100, 0)} (${durContrato}a)`}
            info={`NOI líquido (após IRS de ${pct(analise.irsT * 100, 0)}) ÷ Valor do imóvel. Retorno real antes do financiamento. Boa: >3.5%`}
          />
          <KPI
            label="Cash Flow"
            value={fmt(analise.cashFlowMensal)}
            accent={isPositivo ? "#16a34a" : "#dc2626"}
            sub={`${fmt(analise.cashFlowAnual)}/ano`}
            large
            info={`Dinheiro que sobra por mês após despesas, IRS e prestação. Anual: ${fmt(analise.cashFlowAnual)}. CoC (Cash-on-Cash): ${pct(analise.cashOnCash)} = CF anual ÷ Capital investido.`}
          />
          <KPI
            label="Payback"
            value={analise.payback ? `${analise.payback} anos` : `>${horizonte}a`}
            accent={analise.payback && analise.payback <= 10 ? "#16a34a" : analise.payback && analise.payback <= 15 ? "#ca8a04" : "#dc2626"}
            sub={`Invest. ${fmtK(analise.totalInvestido)}`}
            info={`Anos até o cash flow acumulado (${fmt(analise.cashFlowAnual)}/ano) recuperar o capital investido (${fmt(analise.totalInvestido)}). Bom: <10 anos.`}
          />
          <KPI
            label={`Lucro ${horizonte}a`}
            value={fmtK(analise.lucroLiquido)}
            accent={analise.lucroLiquido > 0 ? "#16a34a" : "#dc2626"}
            sub={`~${fmtK(analise.lucroAnualizado)}/ano (${pct(analise.roiAnualizado)})`}
            info={`Lucro líquido total se venderes ao ano ${horizonte}. Anualizado: ${fmt(analise.lucroAnualizado)}/ano = ${pct(analise.roiAnualizado)} sobre os ${fmtK(analise.totalInvestido)} investidos. Comparável com outros investimentos (ETFs, depósitos, etc).`}
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <h3 className="text-xs font-bold text-gray-600 mb-2 flex items-center">
              📈 Evolução do Investimento
              <InfoTooltip text="Equity = Valor imóvel - Dívida. Lucro líq. = Equity - Custos venda (5% + mais-valias) + CF Acum. - Investido. CF Acum. = soma dos cash flows até ao ano." />
            </h3>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={analise.dados} margin={{ top: 5, right: 5, left: -15, bottom: 5 }}>
                <defs>
                  <linearGradient id="gEq" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#16a34a" stopOpacity={0.15} /><stop offset="95%" stopColor="#16a34a" stopOpacity={0} /></linearGradient>
                  <linearGradient id="gRoi" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#2563eb" stopOpacity={0.12} /><stop offset="95%" stopColor="#2563eb" stopOpacity={0} /></linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="ano" stroke="#e5e7eb" tick={{ fontSize: 9, fill: "#9ca3af" }} />
                <YAxis stroke="#e5e7eb" tick={{ fontSize: 9, fill: "#9ca3af" }} tickFormatter={fmtK} />
                <Tooltip content={<ChartTooltip />} />
                <Area type="monotone" dataKey="equity" name="Equity" stroke="#16a34a" strokeWidth={2} fill="url(#gEq)" />
                <Area type="monotone" dataKey="lucro" name="Lucro líq." stroke="#2563eb" strokeWidth={2} fill="url(#gRoi)" />
                <Area type="monotone" dataKey="cfAcumulado" name="CF Acum." stroke="#ca8a04" strokeWidth={1.5} fill="none" strokeDasharray="4 2" />
                <ReferenceLine y={0} stroke="#9ca3af" strokeDasharray="2 2" />
                <Legend wrapperStyle={{ fontSize: 9, paddingTop: 4 }} iconType="circle" iconSize={5} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <h3 className="text-xs font-bold text-gray-600 mb-2 flex items-center">
              💰 Cash Flow Anual
              <InfoTooltip text="Dinheiro líquido por ano. Verde = anos com lucro. Vermelho = anos com prejuízo. Normalmente melhora com o tempo porque a renda sobe mas a prestação mantém-se fixa." />
            </h3>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={analise.dados} margin={{ top: 5, right: 5, left: -15, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="ano" stroke="#e5e7eb" tick={{ fontSize: 9, fill: "#9ca3af" }} />
                <YAxis stroke="#e5e7eb" tick={{ fontSize: 9, fill: "#9ca3af" }} tickFormatter={fmtK} />
                <Tooltip content={<ChartTooltip />} />
                <ReferenceLine y={0} stroke="#9ca3af" />
                <Bar dataKey="cfAnual" name="Cash Flow" radius={[2, 2, 0, 0]}>
                  {analise.dados.map((d, i) => <Cell key={i} fill={d.cfAnual >= 0 ? "#16a34a" : "#dc2626"} fillOpacity={0.7} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* P&L + Custos */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <h3 className="text-xs font-bold text-gray-600 mb-2 flex items-center">
              🏷️ Custos de Aquisição
              <InfoTooltip text="Capital inicial necessário. IMT usa tabela de investimento (não HPP). Este é o dinheiro que precisas ter disponível no dia 0." />
            </h3>
            <PLRow label="Entrada" value={fmt(analise.entrada)} hint={`${entradaPct}%`} />
            <PLRow label="IMT" value={fmt(analise.imt)} type="expense" hint="Investimento" />
            <PLRow label="Imposto de Selo" value={fmt(analise.impSelo)} type="expense" />
            <PLRow label="Registos" value={fmt(registos)} type="expense" />
            {obras > 0 && <PLRow label="Obras" value={fmt(obras)} type="expense" />}
            <PLRow label="TOTAL INVESTIDO" value={fmt(analise.totalInvestido)} type="subtotal" />
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <h3 className="text-xs font-bold text-gray-600 mb-2 flex items-center">
              📊 P&L Anual (Ano 1)
              <InfoTooltip text="Demonstração de resultados do primeiro ano. Renda - Despesas = NOI. NOI - IRS = NOI líquido. NOI líquido - Prestação = Cash Flow." />
            </h3>
            <PLRow label="Renda bruta" value={fmt(analise.rendaBruta)} type="income" hint={`${fmt(renda)} × ${ocupacao}m`} />
            <PLRow label="Despesas" value={`-${fmt(analise.despesasTotal)}`} type="expense" />
            <PLRow label="NOI" value={fmt(analise.noi)} type="subtotal" />
            <PLRow label={`IRS (${pct(analise.irsT * 100, 0)})`} value={`-${fmt(analise.irsAnual)}`} type="expense" hint={`${durContrato}a contrato`} />
            <PLRow label="Prestação" value={`-${fmt(analise.prestacaoAnual)}`} type="expense" hint={`${fmt(analise.prestacaoMensal)}/m`} />
            <PLRow label="CASH FLOW" value={fmt(analise.cashFlowAnual)} type={analise.cashFlowAnual >= 0 ? "total" : "negative"} />
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <h3 className="text-xs font-bold text-gray-600 mb-2 flex items-center">
              🚪 Saída (Ano {horizonte})
              <InfoTooltip text={`Projeção se venderes ao ano ${horizonte}. Inclui comissão imobiliária (5%) e mais-valias (50% tributado a 28%). Estes custos são deduzidos no cálculo do Lucro líquido.`} />
            </h3>
            <PLRow label="Valor do imóvel" value={fmt(analise.valorFinal)} type="income" hint={`+${valoriz}%/ano`} />
            <PLRow label="Dívida restante" value={`-${fmt(analise.valorFinal - analise.equityFinal)}`} type="expense" />
            <PLRow label="Equity bruta" value={fmt(analise.equityFinal)} type="subtotal" />
            <PLRow label="Comissão + Mais-valias" value={`-${fmt(analise.custosVendaFinal)}`} type="expense" hint="~5% + IRS" />
            <PLRow label="Equity líquida" value={fmt(analise.equityLiquidaFinal)} type="subtotal" />
            <PLRow label="+ CF acumulado" value={fmt(analise.dados[analise.dados.length - 1]?.cfAcumulado || 0)} type="income" />
            <PLRow label="- Investido" value={`-${fmt(analise.totalInvestido)}`} type="expense" />
            <PLRow label="LUCRO LÍQUIDO" value={fmt(analise.lucroLiquido)} type={analise.lucroLiquido >= 0 ? "total" : "negative"} />
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 px-4 py-2 text-center mt-auto">
        <p className="text-[10px] text-gray-400">⚠️ Simulador informativo — não constitui aconselhamento financeiro.</p>
      </footer>
    </div>
  );
}
