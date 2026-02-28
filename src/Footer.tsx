export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 px-4 py-6 mt-8">
      <div className="max-w-4xl mx-auto text-center">
        <p className="text-xs text-gray-400 mb-2">
          <a href="mailto:suporte@imosimula.pt" className="text-green-600 hover:text-green-700 transition">suporte@imosimula.pt</a>
        </p>
        <p className="text-sm text-gray-500 mb-2">
          ⚠️ O ImoSimula é uma ferramenta informativa. Não constitui aconselhamento financeiro ou fiscal.
        </p>
        <p className="text-xs text-gray-400 mb-2">
          Consulta sempre um profissional qualificado antes de tomar decisões de investimento.
        </p>
      </div>
    </footer>
  );
}
