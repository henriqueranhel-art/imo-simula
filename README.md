# ImoSimula

Simulador de investimento imobiliário para o mercado português. Analisa a rentabilidade de comprar um imóvel para arrendamento, considerando financiamento, impostos, despesas e projeções de valorização.

## Funcionalidades

- **Yields e métricas** — Yield bruta, Cap Rate, Yield líquida, Cash-on-Cash
- **Cash Flow** — Cálculo mensal e anual após despesas, IRS e prestação
- **Projeção temporal** — Evolução de equity, lucro e cash flow acumulado ao longo do tempo
- **Custos de aquisição** — IMT (tabela investimento), Imposto de Selo, registos e obras
- **P&L detalhado** — Demonstração de resultados anual (Ano 1)
- **Cenário de saída** — Lucro líquido na venda com comissão imobiliária e mais-valias
- **Gráficos interativos** — Evolução do investimento e cash flow anual

## Parâmetros configuráveis

| Grupo | Parâmetros |
|---|---|
| **Imóvel** | Preço, Renda mensal |
| **Rápidos** | Entrada (%), Obras (k€), Horizonte (anos) |
| **Financiamento** | Taxa de juro (%), Prazo (anos) |
| **Despesas** | IMI (%), Condomínio, Manutenção (%), Seguro, Gestão (%), Registos |
| **Projeção** | Valorização anual, Aumento renda, Ocupação (meses/ano), Duração contrato |

## Impostos calculados

- **IMT** — Tabela para segundas habitações / investimento (não HPP)
- **Imposto de Selo** — 0.8% sobre aquisição
- **IRS sobre rendas** — Taxa autónoma por duração de contrato (5% a 28%)
- **Mais-valias** — 50% tributado a 28%, com coeficiente de atualização monetária

## Tech Stack

- React 19 + TypeScript
- Vite
- Tailwind CSS
- Recharts (gráficos)
- Lucide React (ícones)

## Instalação

```bash
npm install
npm run dev
```

## Aviso

⚠️ Simulador informativo — não constitui aconselhamento financeiro.
