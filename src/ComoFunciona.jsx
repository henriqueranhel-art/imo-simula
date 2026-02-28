import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, ChevronRight, Calculator, TrendingUp, PiggyBank, Clock, Home, Receipt, Percent, HelpCircle, ArrowLeft, ExternalLink } from "lucide-react";
import Footer from "./Footer";

/* ═══ COMPONENTS ═══ */
const Section = ({ icon: Icon, title, children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden mb-4">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
            <Icon size={20} className="text-green-600" />
          </div>
          <h2 className="text-lg font-bold text-gray-800">{title}</h2>
        </div>
        {isOpen ? <ChevronDown size={20} className="text-gray-400" /> : <ChevronRight size={20} className="text-gray-400" />}
      </button>
      {isOpen && (
        <div className="px-6 pb-6 pt-2 border-t border-gray-100">
          {children}
        </div>
      )}
    </div>
  );
};

const Formula = ({ name, formula, description, example }) => (
  <div className="bg-gray-50 rounded-lg p-4 mb-4">
    <div className="flex items-center gap-2 mb-2">
      <span className="text-sm font-bold text-gray-700">{name}</span>
    </div>
    <div className="bg-white rounded-lg px-4 py-3 font-mono text-sm text-green-700 border border-gray-200 mb-2">
      {formula}
    </div>
    <p className="text-sm text-gray-600 mb-2">{description}</p>
    {example && (
      <div className="text-xs text-gray-500 bg-gray-100 rounded px-3 py-2">
        <strong>Exemplo:</strong> {example}
      </div>
    )}
  </div>
);

const Table = ({ headers, rows }) => (
  <div className="overflow-x-auto">
    <table className="w-full text-sm">
      <thead>
        <tr className="bg-gray-50">
          {headers.map((h, i) => (
            <th key={i} className="px-4 py-2 text-left font-semibold text-gray-700 border-b border-gray-200">{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
            {row.map((cell, j) => (
              <td key={j} className="px-4 py-2 text-gray-600">{cell}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const Callout = ({ type = "info", children }) => {
  const styles = {
    info: "bg-blue-50 border-blue-200 text-blue-800",
    warning: "bg-amber-50 border-amber-200 text-amber-800",
    success: "bg-green-50 border-green-200 text-green-800",
  };
  
  return (
    <div className={`rounded-lg border px-4 py-3 text-sm mb-4 ${styles[type]}`}>
      {children}
    </div>
  );
};

/* ═══ MAIN PAGE ═══ */
export default function ComoFunciona() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-40 shadow-sm">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center text-xs font-extrabold text-white">IS</div>
            <span className="text-lg font-bold text-gray-800">ImoSimula</span>
          </Link>
          <Link
            to="/"
            className="flex items-center gap-2 text-sm text-green-600 hover:text-green-700 font-medium"
          >
            <ArrowLeft size={16} />
            Voltar ao Simulador
          </Link>
        </div>
      </header>

      {/* Hero */}
      <div className="bg-gradient-to-b from-green-600 to-green-700 text-white px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-extrabold mb-4">Como Funciona o ImoSimula</h1>
          <p className="text-green-100 text-lg max-w-2xl">
            Aprende como calcular a rentabilidade de um investimento imobiliário em Portugal. 
            Explicamos todas as métricas, fórmulas e impostos considerados no simulador.
          </p>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        
        {/* Intro */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-3">O que é o ImoSimula?</h2>
          <p className="text-gray-600 mb-4">
            O ImoSimula é um <strong>simulador gratuito de investimento imobiliário</strong> focado no mercado português. 
            Permite calcular a rentabilidade de comprar um imóvel para arrendar, considerando todos os custos reais: 
            impostos (IMT, IRS), despesas operacionais, financiamento bancário e custos de venda futura.
          </p>
          <p className="text-gray-600">
            Ao contrário de calculadoras simples que mostram apenas a yield bruta, o ImoSimula mostra o 
            <strong> lucro líquido real</strong> que podes esperar ao fim de X anos — incluindo o cenário de venda do imóvel.
          </p>
        </div>

        {/* Métricas principais */}
        <Section icon={Calculator} title="Métricas Principais" defaultOpen={true}>
          <p className="text-gray-600 mb-4">
            O simulador calcula 6 métricas-chave que te ajudam a avaliar se um investimento vale a pena:
          </p>
          
          <Formula 
            name="Yield Bruta"
            formula="Yield Bruta = (Renda Anual ÷ Valor do Imóvel) × 100"
            description="Métrica mais simples. Útil para comparar imóveis rapidamente, mas não considera despesas nem impostos."
            example="€10.800/ano ÷ €200.000 = 5.4%"
          />
          
          <Formula 
            name="Cap Rate (Capitalization Rate)"
            formula="Cap Rate = (NOI ÷ Valor do Imóvel) × 100"
            description="Padrão internacional. NOI = Renda - Despesas operacionais (antes de impostos). Permite comparar com investimentos noutros países."
            example="€8.500 NOI ÷ €200.000 = 4.25%"
          />
          
          <Formula 
            name="Yield Líquida"
            formula="Yield Líquida = (NOI Líquido ÷ Valor do Imóvel) × 100"
            description="NOI Líquido = NOI - IRS sobre rendas. Mostra o retorno real após impostos, antes do financiamento."
            example="€7.225 NOI líq. ÷ €200.000 = 3.6%"
          />
          
          <Formula 
            name="Cash Flow Mensal"
            formula="Cash Flow = NOI Líquido - Prestação Bancária"
            description="Dinheiro que sobra (ou falta) todos os meses após pagar tudo. Se for negativo, tens de meter dinheiro do bolso."
            example="€7.225/ano - €6.840/ano = €385/ano = €32/mês"
          />
          
          <Formula 
            name="Payback"
            formula="Payback = Capital Investido ÷ Cash Flow Anual"
            description="Anos até recuperares o dinheiro investido (entrada + impostos + custos) apenas com o cash flow."
            example="€50.000 investidos ÷ €385/ano = 130 anos (mau exemplo!)"
          />
          
          <Formula 
            name="Lucro Líquido (à saída)"
            formula="Lucro = Equity Líquida + CF Acumulado - Capital Investido"
            description="Dinheiro real no bolso se venderes ao fim de X anos. Equity Líquida = Valor do imóvel - Dívida - Custos de venda."
            example="€180.000 equity líq. + €5.000 CF - €50.000 invest. = €135.000"
          />
          
          <Callout type="success">
            <strong>Dica:</strong> O ROI Anualizado (Lucro/ano ÷ Capital Investido) permite comparar diretamente 
            com outros investimentos como ETFs, depósitos ou certificados de aforro.
          </Callout>
        </Section>

        {/* Impostos */}
        <Section icon={Receipt} title="Impostos em Portugal">
          <h3 className="font-bold text-gray-800 mb-3">IMT (Imposto Municipal sobre Transmissões)</h3>
          <p className="text-gray-600 mb-3">
            O IMT para <strong>investimento/segundas habitações</strong> usa uma tabela diferente (mais cara) 
            do que para habitação própria permanente (HPP):
          </p>
          
          <Table 
            headers={["Valor do Imóvel", "Taxa", "Parcela a Abater"]}
            rows={[
              ["Até €101.917", "1%", "€0"],
              ["€101.917 - €139.412", "2%", "€1.019,17"],
              ["€139.412 - €190.086", "5%", "€5.201,53"],
              ["€190.086 - €316.772", "7%", "€9.009,25"],
              ["€316.772 - €633.453", "8%", "€12.176,97"],
              ["€633.453 - €1.102.920", "6%", "€-532,09*"],
              ["Acima de €1.102.920", "7.5%", "€0"],
            ]}
          />
          <p className="text-xs text-gray-500 mt-2 mb-4">* Taxa efetiva sobe neste escalão</p>
          
          <Callout type="warning">
            <strong>Atenção:</strong> Muitos simuladores usam a tabela de HPP por engano, o que subestima 
            o IMT em milhares de euros para investimento.
          </Callout>
          
          <h3 className="font-bold text-gray-800 mb-3 mt-6">Imposto de Selo</h3>
          <p className="text-gray-600 mb-4">
            Taxa fixa de <strong>0.8%</strong> sobre o valor de compra. Ex: €200.000 × 0.8% = €1.600
          </p>
          
          <h3 className="font-bold text-gray-800 mb-3">IRS sobre Rendas</h3>
          <p className="text-gray-600 mb-3">
            Em Portugal, podes optar pela <strong>taxa autónoma</strong> que varia conforme a duração do contrato:
          </p>
          
          <Table 
            headers={["Duração do Contrato", "Taxa IRS"]}
            rows={[
              ["Menos de 2 anos", "28%"],
              ["2 a 5 anos", "25%"],
              ["5 a 10 anos", "15%"],
              ["10 a 20 anos", "10%"],
              ["20 anos ou mais", "5%"],
            ]}
          />
          
          <Callout type="info">
            <strong>Nota:</strong> Contratos mais longos pagam menos imposto, mas tens menos flexibilidade 
            para ajustar rendas ou recuperar o imóvel.
          </Callout>
        </Section>

        {/* Despesas */}
        <Section icon={PiggyBank} title="Despesas Consideradas">
          <p className="text-gray-600 mb-4">
            O simulador considera todas as despesas típicas de um imóvel arrendado:
          </p>
          
          <Table 
            headers={["Despesa", "Tipo", "Valor Típico"]}
            rows={[
              ["IMI", "% do VPT", "0.3% - 0.45%"],
              ["Condomínio", "Fixo/mês", "€30 - €100"],
              ["Manutenção", "% do valor", "0.5% - 1%/ano"],
              ["Seguro", "Fixo/ano", "€80 - €150"],
              ["Gestão", "% da renda", "0% - 10%"],
            ]}
          />
          
          <h3 className="font-bold text-gray-800 mb-3 mt-6">Custos de Aquisição (únicos)</h3>
          <ul className="list-disc list-inside text-gray-600 space-y-1 mb-4">
            <li><strong>Entrada:</strong> Tipicamente 10-20% do valor</li>
            <li><strong>IMT:</strong> Calculado pela tabela de investimento</li>
            <li><strong>Imposto de Selo:</strong> 0.8% do valor</li>
            <li><strong>Escritura/Registos:</strong> €500 - €1.500</li>
            <li><strong>Obras:</strong> Variável (renovação inicial)</li>
          </ul>
          
          <h3 className="font-bold text-gray-800 mb-3">Custos de Venda (à saída)</h3>
          <ul className="list-disc list-inside text-gray-600 space-y-1">
            <li><strong>Comissão imobiliária:</strong> ~5% do valor de venda</li>
            <li><strong>Mais-valias:</strong> 50% da mais-valia tributada à taxa marginal (~28%)</li>
          </ul>
        </Section>

        {/* Financiamento */}
        <Section icon={Percent} title="Financiamento Bancário">
          <p className="text-gray-600 mb-4">
            O simulador usa a fórmula padrão de prestação constante (sistema francês):
          </p>
          
          <Formula 
            name="Prestação Mensal"
            formula="PMT = P × [r(1+r)^n] / [(1+r)^n - 1]"
            description="Onde P = empréstimo, r = taxa mensal, n = número de prestações. A prestação mantém-se constante, mas a proporção juros/amortização muda ao longo do tempo."
            example="€160.000 a 2.8% durante 30 anos = €657/mês"
          />
          
          <Callout type="info">
            A <strong>Equity</strong> aumenta ao longo do tempo porque vais amortizando o empréstimo. 
            Mesmo com cash flow zero, estás a construir património.
          </Callout>
        </Section>

        {/* Projeção temporal */}
        <Section icon={TrendingUp} title="Projeção Temporal">
          <p className="text-gray-600 mb-4">
            O simulador projeta a evolução do investimento ano a ano, considerando:
          </p>
          
          <ul className="list-disc list-inside text-gray-600 space-y-2 mb-4">
            <li><strong>Valorização do imóvel:</strong> Percentagem anual configurável (default: 1%)</li>
            <li><strong>Aumento de renda:</strong> Percentagem anual configurável (default: 2%)</li>
            <li><strong>Amortização do empréstimo:</strong> Calculada mês a mês</li>
            <li><strong>Cash flow acumulado:</strong> Soma dos cash flows anuais</li>
          </ul>
          
          <Callout type="warning">
            <strong>Importante:</strong> As projeções são estimativas baseadas nos parâmetros configurados. 
            O mercado imobiliário é imprevisível — usa cenários conservadores (1-2% de valorização).
          </Callout>
        </Section>

        {/* Glossário */}
        <Section icon={HelpCircle} title="Glossário">
          <div className="space-y-3">
            {[
              ["NOI", "Net Operating Income — Renda menos despesas operacionais, antes de impostos e financiamento."],
              ["Cap Rate", "Capitalization Rate — NOI dividido pelo valor do imóvel. Padrão internacional."],
              ["Yield", "Retorno percentual do investimento. Pode ser bruta (simples) ou líquida (após custos)."],
              ["Cash Flow", "Dinheiro que entra ou sai efetivamente. Positivo = lucro, Negativo = prejuízo."],
              ["Equity", "Valor do imóvel menos a dívida ao banco. É o teu património líquido no imóvel."],
              ["DSCR", "Debt Service Coverage Ratio — NOI dividido pela prestação. Bancos exigem > 1.2."],
              ["Payback", "Tempo para recuperar o investimento inicial através do cash flow."],
              ["ROI", "Return on Investment — Lucro total dividido pelo capital investido."],
              ["Alavancagem", "Usar dinheiro emprestado para amplificar retornos (e riscos)."],
              ["Mais-valias", "Lucro na venda do imóvel, sujeito a tributação em IRS."],
            ].map(([term, def]) => (
              <div key={term} className="flex gap-3">
                <span className="font-bold text-green-600 min-w-[100px]">{term}</span>
                <span className="text-gray-600">{def}</span>
              </div>
            ))}
          </div>
        </Section>

        {/* CTA */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-xl p-6 text-center text-white">
          <h2 className="text-2xl font-bold mb-2">Pronto para simular?</h2>
          <p className="text-green-100 mb-4">Experimenta o simulador gratuitamente, sem registo.</p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-white text-green-700 px-6 py-3 rounded-lg font-bold hover:bg-green-50 transition"
          >
            <Calculator size={20} />
            Abrir Simulador
          </Link>
        </div>

      </main>

      <Footer />
    </div>
  );
}
