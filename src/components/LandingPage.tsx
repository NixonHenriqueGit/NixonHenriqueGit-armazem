import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Sparkles, 
  CheckCircle, 
  Layers, 
  BarChart3, 
  Database, 
  Cpu, 
  ArrowRight, 
  Zap, 
  Shield, 
  Clock, 
  Smartphone, 
  FileSpreadsheet, 
  ClipboardList, 
  TrendingUp, 
  Check, 
  RefreshCw, 
  Trash2, 
  Truck, 
  AlertTriangle, 
  Calendar, 
  Search, 
  Package,
  Users,
  ChevronRight,
  FileText
} from 'lucide-react';

interface LandingPageProps {
  onEnterApp: () => void;
}

export default function LandingPage({ onEnterApp }: LandingPageProps) {
  const [counts, setCounts] = useState({ modulos: 0, skus: 0, uptime: 0 });

  // Countup animation effect
  useEffect(() => {
    const endMods = 7;
    const endSkus = 280;
    const endUptime = 100;
    
    let currentMods = 0;
    let currentSkus = 0;
    let currentUptime = 0;
    
    const interval = setInterval(() => {
      let isDone = true;
      if (currentMods < endMods) {
        currentMods += 1;
        isDone = false;
      }
      if (currentSkus < endSkus) {
        currentSkus += 10;
        if (currentSkus > endSkus) currentSkus = endSkus;
        isDone = false;
      }
      if (currentUptime < endUptime) {
        currentUptime += 5;
        if (currentUptime > endUptime) currentUptime = endUptime;
        isDone = false;
      }

      setCounts({ modulos: currentMods, skus: currentSkus, uptime: currentUptime });
      if (isDone) clearInterval(interval);
    }, 40);

    return () => clearInterval(interval);
  }, []);

  // Operational modules list
  const modulosLanding = [
    {
      nome: 'Repack (Reembalagem)',
      icon: <RefreshCw className="w-6 h-6 text-[#f5a623]" />,
      desc: 'Monitore a reembalagem de produtos avariados e acompanhe o rendimento individual de cada colaborador.',
      cor: '#f5a623',
      badge: 'Produtividade'
    },
    {
      nome: 'Despejo & Descarte',
      icon: <Trash2 className="w-6 h-6 text-[#06b6d4]" />,
      desc: 'Controle rigoroso dos produtos descartados com fluxo de aprovações para eliminar desperdícios.',
      cor: '#06b6d4',
      badge: 'Auditoria'
    },
    {
      nome: 'Abastecimento & Empilhador',
      icon: <Truck className="w-6 h-6 text-[#3b82f6]" />,
      desc: 'Monitore as ordens de reabastecimento de picking e controle os checklists de segurança das empilhadeiras em tempo real.',
      cor: '#3b82f6',
      badge: 'Eficiência'
    },
    {
      nome: 'Quebras & Perdas',
      icon: <AlertTriangle className="w-6 h-6 text-[#ef4444]" />,
      desc: 'Registre na hora avarias físicas, vazamentos e quebras, identificando instantaneamente as causas.',
      cor: '#ef4444',
      badge: 'Redução de Custos'
    },
    {
      nome: 'Validades (FEFO/PVPS)',
      icon: <Calendar className="w-6 h-6 text-[#8b5cf6]" />,
      desc: 'Evite a perda de mercadorias no estoque. Alertas inteligentes notificam os produtos mais próximos do vencimento.',
      cor: '#8b5cf6',
      badge: 'Prevenção'
    },
    {
      nome: 'Blitz de Refugo',
      icon: <Search className="w-6 h-6 text-[#eab308]" />,
      desc: 'Inspeções técnicas preventivas nos paletes de refugo para resgatar itens bons e treinar as equipes.',
      cor: '#eab308',
      badge: 'Qualidade'
    },
    {
      nome: 'Picking (Separação)',
      icon: <Package className="w-6 h-6 text-[#10b981]" />,
      desc: 'Acompanhe as metas e a performance dos operadores de picking, garantindo agilidade na expedição.',
      cor: '#10b981',
      badge: 'Operação'
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] text-[#1e293b] relative z-10 selection:bg-[#f5a623] selection:text-white">
      
      {/* ── TOP NAV BAR ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 h-16 px-6 md:px-12 bg-white/95 backdrop-blur-md border-b border-slate-200 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#f5a623] to-[#d4780a] flex items-center justify-center text-lg shadow-[0_2px_10px_rgba(245,166,35,0.2)]">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <span className="font-sans font-extrabold text-xs tracking-[2px] text-[#f5a623] uppercase">
            Armazém Fácil
          </span>
        </div>

        <div className="hidden md:flex items-center gap-8">
          <a href="#como" className="text-[11px] font-bold tracking-wider text-[#64748b] hover:text-[#0f172a] transition-colors uppercase">O que é?</a>
          <a href="#modulos" className="text-[11px] font-bold tracking-wider text-[#64748b] hover:text-[#0f172a] transition-colors uppercase">Módulos</a>
          <a href="#fluxo" className="text-[11px] font-bold tracking-wider text-[#64748b] hover:text-[#0f172a] transition-colors uppercase">Funcionamento</a>
          <a href="#vantagens" className="text-[11px] font-bold tracking-wider text-[#64748b] hover:text-[#0f172a] transition-colors uppercase">Vantagens</a>
          <button 
            onClick={onEnterApp}
            className="font-sans text-xs font-black tracking-[1.5px] uppercase bg-[#f5a623] text-white px-5 py-2.5 rounded-lg hover:bg-[#e09112] hover:shadow-[0_4px_15px_rgba(245,166,35,0.3)] transition-all cursor-pointer flex items-center gap-1.5 border-none"
          >
            Acessar Sistema <ArrowRight className="w-3.5 h-3.5 stroke-[3px]" />
          </button>
        </div>

        {/* Mobile quick action */}
        <div className="flex md:hidden">
          <button 
            onClick={onEnterApp}
            className="text-xs font-black tracking-[1px] uppercase bg-[#f5a623] text-white px-4 py-2 rounded-lg border-none"
          >
            Entrar
          </button>
        </div>
      </nav>

      {/* ── HERO SECTION ── */}
      <header className="min-h-screen flex flex-col items-center justify-center pt-28 pb-16 px-6 text-center max-w-5xl mx-auto">
        <div className="inline-flex items-center gap-2 font-mono text-[9px] uppercase tracking-[3px] text-[#f5a623] border border-[#f5a623]/35 bg-[#f5a623]/5 px-4 py-1.5 rounded-full mb-6">
          <span className="w-1.5 h-1.5 bg-[#f5a623] rounded-full"></span>
          GESTÃO E RELATÓRIOS LOGÍSTICOS SEM PAPÉIS OU COMPLEXIDADE
        </div>

        <h1 className="font-sans font-black text-4xl sm:text-5xl md:text-6xl leading-[1.1] tracking-tight mb-6 text-[#0f172a]">
          Sua Operação de Armazém <br />
          <span className="text-[#f5a623] bg-gradient-to-r from-[#f5a623] to-[#d4780a] bg-clip-text text-transparent">Digital, Monitorada e em Ordem.</span>
        </h1>

        <p className="text-sm sm:text-base md:text-lg text-[#475569] max-w-3xl leading-relaxed mb-8">
          Substitua de vez as pranchetas de papel e o controle manual. O <strong className="text-[#0f172a]">Armazém Fácil</strong> permite que sua equipe de operação registre tarefas em tempo real diretamente do celular ou coletor de dados, consolidando tudo de forma instantânea em um <strong>banco de dados robusto em nuvem</strong> e gerando automaticamente acompanhamentos e gráficos atualizados nos dashboards operacionais para toda a gerência.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14 w-full sm:w-auto">
          <button 
            onClick={onEnterApp} 
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#f5a623] text-white font-black text-xs uppercase tracking-wider px-8 py-4 rounded-xl shadow-[0_4px_15px_rgba(245,166,35,0.25)] hover:bg-[#e09112] hover:shadow-[0_8px_25px_rgba(245,166,35,0.35)] hover:-translate-y-0.5 transition-all text-center cursor-pointer border-none"
          >
            Entrar na Plataforma <ArrowRight className="w-4 h-4 stroke-[2.5px]" />
          </button>
          <a 
            href="#como" 
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-bold text-xs uppercase tracking-wider px-6 py-4 rounded-xl transition-all text-center"
          >
            Entenda Como Funciona
          </a>
        </div>

        {/* Dynamic visual dashboard teaser */}
        <div className="app-preview w-full max-w-4xl bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xl">
          <div className="preview-bar bg-slate-50 border-b border-slate-200 px-4 py-3.5 flex items-center justify-between">
            <div className="flex gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-400"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
            </div>
            <div className="flex-1 bg-white border border-slate-200 rounded-lg py-1 px-4 text-[9px] font-mono text-slate-400 max-w-md mx-auto">
              armazemfacil.com/painel/visao-geral
            </div>
            <div className="w-12 text-right">
              <span className="text-[9px] font-mono text-emerald-600 font-bold">● ONLINE</span>
            </div>
          </div>
          <div className="bg-[#fafbfc] p-6 text-left">
            <div className="mb-4 flex items-center justify-between border-b border-slate-200 pb-3">
              <span className="text-xs font-black uppercase tracking-wider text-slate-700">💡 Painel Geral de Performance</span>
              <span className="text-[10px] text-slate-400 font-mono">Atualizado em tempo real</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-white border border-slate-200 rounded-xl relative overflow-hidden shadow-sm">
                <span className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Rendimento Repack</span>
                <span className="font-sans font-black text-3xl text-emerald-600">92.4%</span>
                <span className="block text-[9px] text-emerald-600 mt-1.5">▲ +4% acima da meta hoje</span>
                <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
              </div>
              <div className="p-4 bg-white border border-slate-200 rounded-xl relative overflow-hidden shadow-sm">
                <span className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Validades Críticas</span>
                <span className="font-sans font-black text-3xl text-red-500">02</span>
                <span className="block text-[9px] text-red-500 mt-1.5">⚠ FEFO: Alerta de vencimento</span>
                <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-red-500 rounded-full animate-ping"></div>
              </div>
              <div className="p-4 bg-white border border-slate-200 rounded-xl relative overflow-hidden shadow-sm">
                <span className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Avarias Detectadas</span>
                <span className="font-sans font-black text-3xl text-amber-500">0.88%</span>
                <span className="block text-[9px] text-slate-500 mt-1.5">Blitz: Perdas sob controle</span>
                <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-amber-500 rounded-full"></div>
              </div>
              <div className="p-4 bg-white border border-slate-200 rounded-xl relative overflow-hidden shadow-sm">
                <span className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Quebras Monitoradas (R$)</span>
                <span className="font-sans font-black text-3xl text-blue-600">R$ 14.850</span>
                <span className="block text-[9px] text-blue-600 mt-1.5">✓ Monitorado em tempo real</span>
                <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ── SEÇÃO EXPLICATIVA: O QUE É O SISTEMA? ── */}
      <section id="como" className="py-20 border-t border-b border-slate-200 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
            
            <div className="md:col-span-6 space-y-5 text-left">
              <span className="font-sans font-bold text-xs uppercase tracking-[3px] text-[#f5a623]">SOBRE O ARMAZÉM FÁCIL</span>
              <h2 className="font-sans font-black text-3xl md:text-4xl tracking-tight leading-tight text-slate-900">
                Qualquer pessoa consegue usar. <br />
                Toda a empresa consegue gerenciar.
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                Nós sabemos que a rotina de um centro de distribuição é extremamente acelerada. Por isso, criamos uma ferramenta focada em <strong className="text-slate-900">simplicidade total no chão do armazém</strong> e <strong className="text-slate-900">inteligência completa na mesa de controle</strong>.
              </p>
              <div className="space-y-4 pt-2">
                <div className="flex items-start gap-3">
                  <div className="mt-1 w-5 h-5 rounded-full bg-[#f5a623]/15 text-[#f5a623] flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 stroke-[3px]" />
                  </div>
                  <div>
                    <strong className="text-xs uppercase text-slate-800 tracking-wider block">Para o Ajudante & Operador</strong>
                    <span className="text-xs text-slate-500">Botões grandes e campos intuitivos. Sem burocracia ou senhas complexas para começar a trabalhar.</span>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-1 w-5 h-5 rounded-full bg-[#f5a623]/15 text-[#f5a623] flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 stroke-[3px]" />
                  </div>
                  <div>
                    <strong className="text-xs uppercase text-slate-800 tracking-wider block">Para o Conferente & Supervisor</strong>
                    <span className="text-xs text-slate-500">Acompanhamento em tempo real dos paletes conferidos, validades registradas e perdas salvas.</span>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-1 w-5 h-5 rounded-full bg-[#f5a623]/15 text-[#f5a623] flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 stroke-[3px]" />
                  </div>
                  <div>
                    <strong className="text-xs uppercase text-slate-800 tracking-wider block">Para a Gerência & Diretoria</strong>
                    <span className="text-xs text-slate-500">Acompanhamento automático por dashboards interativos, análises de produtividade histórica e a segurança de um banco de dados centralizado em nuvem.</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="md:col-span-6 bg-slate-50 border border-slate-200 p-6 rounded-2xl relative shadow-sm">
              <div className="absolute -top-3 -right-3 bg-gradient-to-br from-[#f5a623] to-[#d4780a] text-white text-[10px] font-black uppercase px-3 py-1 rounded-full shadow-md">
                ★ 100% Digital
              </div>
              <h3 className="font-sans font-black text-xs uppercase tracking-widest text-[#f5a623] mb-4">💡 FIM DOS ATRASOS DE PREENCHIMENTO DE ACOMPANHAMENTOS:</h3>
              
              <div className="space-y-4">
                <div className="p-4 bg-white border border-slate-200 rounded-xl flex gap-3 items-start shadow-xs">
                  <span className="text-xl">📄</span>
                  <div>
                    <h4 className="font-sans font-bold text-xs uppercase text-slate-700">Como era antes: Registros Manuais e Planilhas</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">Anotações em papéis perdidos, redigitação manual e demorada de dados em planilhas isoladas e atraso de dias para compilar métricas.</p>
                  </div>
                </div>

                <div className="p-4 bg-[#f5a623]/5 border border-[#f5a623]/20 rounded-xl flex gap-3 items-start shadow-xs">
                  <span className="text-xl">📱</span>
                  <div>
                    <h4 className="font-sans font-bold text-xs uppercase text-[#f5a623]">Com o Armazém Fácil: Acompanhamento Automático</h4>
                    <p className="text-[11px] text-slate-700 mt-0.5">O registro alimenta instantaneamente nosso banco de dados, preenchendo os dashboards de forma automatizada e em tempo real para tomada de decisão.</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── COUNTERS / STATS SECTION ── */}
      <section className="border-b border-slate-200 bg-slate-50 py-16">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div className="flex flex-col items-center">
            <span className="font-sans font-black text-5xl md:text-6xl text-[#f5a623]">{counts.modulos}</span>
            <span className="text-slate-600 text-xs uppercase font-bold mt-2.5 text-center tracking-wide">Módulos Logísticos <br />operacionais</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="font-sans font-black text-5xl md:text-6xl text-[#06b6d4]">{counts.skus}</span>
            <span className="text-slate-600 text-xs uppercase font-bold mt-2.5 text-center tracking-wide">Categorias de SKUs <br />configuradas</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="font-sans font-black text-5xl md:text-6xl text-purple-600">{counts.uptime}%</span>
            <span className="text-slate-600 text-xs uppercase font-bold mt-2.5 text-center tracking-wide">Integração em Nuvem <br />segura</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="font-sans font-black text-5xl md:text-6xl text-emerald-600">100%</span>
            <span className="text-slate-600 text-xs uppercase font-bold mt-2.5 text-center tracking-wide">Operação em Ordem <br />e auditável</span>
          </div>
        </div>
      </section>

      {/* ── MODULE CARDS SECTION ── */}
      <section id="modulos" className="py-24 px-6 max-w-6xl mx-auto bg-white rounded-3xl my-10 shadow-sm border border-slate-200/60">
        <div className="text-center mb-16">
          <span className="font-sans font-bold text-xs uppercase tracking-[3px] text-[#f5a623] mb-3 block">Módulos Operacionais</span>
          <h2 className="font-sans font-black text-3xl md:text-5xl tracking-tight text-slate-950 mb-4">Feito para resolver problemas logísticos reais.</h2>
          <p className="text-slate-600 text-sm md:text-base max-w-3xl mx-auto leading-relaxed">
            Cada pilar operacional da sua distribuidora possui uma tela limpa e de rápido lançamento para os ajudantes, além de relatórios analíticos para os supervisores.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modulosLanding.map((m, index) => (
            <div key={index} className="bg-slate-50 border border-slate-200 hover:border-[#f5a623]/40 p-6 flex flex-col justify-between hover:bg-white hover:-translate-y-1 relative transition-all duration-300 rounded-2xl group shadow-xs">
              <div>
                <div className="mb-4 bg-white border border-slate-200 p-3 rounded-xl w-fit group-hover:bg-[#f5a623]/10 transition-colors">
                  {m.icon}
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-sans font-black text-xs uppercase tracking-wider text-slate-800">{m.nome}</h3>
                  <span className="text-[8px] px-1.5 py-0.5 rounded bg-white border border-slate-200 font-mono text-slate-500 uppercase font-bold tracking-wider">{m.badge}</span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed mb-6">{m.desc}</p>
              </div>
              <div className="space-y-2 mt-auto border-t border-slate-200 pt-4 text-[10px] text-slate-400">
                <div className="flex items-center gap-1.5">
                  <span className="text-emerald-500 font-bold">✓</span>
                  <span>Histórico completo & exportação fácil</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-emerald-500 font-bold">✓</span>
                  <span>Layout adaptado para coletores de dados</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FLUXO DE OPERAÇÃO ── */}
      <section id="fluxo" className="py-24 bg-white border-t border-b border-slate-200 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <span className="font-sans font-bold text-xs uppercase tracking-[3px] text-[#f5a623] mb-3 block">MÉTODO ARMAZÉM FÁCIL</span>
          <h2 className="font-sans font-black text-3xl md:text-5xl tracking-tight text-slate-900 mb-16">
            Como funciona na prática do dia a dia?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            <div className="flex flex-col items-center relative">
              <div className="w-12 h-12 bg-white border-2 border-[#f5a623] text-[#f5a623] font-sans font-black rounded-full flex items-center justify-center text-md mb-6 shadow-sm">
                1
              </div>
              <h3 className="font-sans font-black text-xs tracking-wider uppercase mb-2 text-slate-800">Lançamento Rápido</h3>
              <p className="text-slate-500 text-xs leading-relaxed max-w-xs">Os colaboradores registram as tarefas operacionais de reembalagem, validades ou avarias em segundos pelo celular, agilizando todo o processo.</p>
            </div>
            
            <div className="flex flex-col items-center relative">
              <div className="w-12 h-12 bg-white border-2 border-[#f5a623] text-[#f5a623] font-sans font-black rounded-full flex items-center justify-center text-md mb-6 shadow-sm">
                2
              </div>
              <h3 className="font-sans font-black text-xs tracking-wider uppercase mb-2 text-slate-800">Sincronização Segura</h3>
              <p className="text-slate-500 text-xs leading-relaxed max-w-xs">Nenhum registro se perde. O sistema processa tudo em nuvem, consolidando de forma automática os totais.</p>
            </div>

            <div className="flex flex-col items-center relative">
              <div className="w-12 h-12 bg-white border-2 border-[#f5a623] text-[#f5a623] font-sans font-black rounded-full flex items-center justify-center text-md mb-6 shadow-sm">
                3
              </div>
              <h3 className="font-sans font-black text-xs tracking-wider uppercase mb-2 text-slate-800">Decisão Inteligente</h3>
              <p className="text-slate-500 text-xs leading-relaxed max-w-xs">A supervisão acompanha o andamento instantaneamente nos dashboards operacionais alimentados pelo banco de dados em tempo real.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── ADVANTAGES SECTION ── */}
      <section id="vantagens" className="py-24 px-6 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <span className="font-sans font-bold text-xs uppercase tracking-[3px] text-[#f5a623] mb-3 block">RETORNO REAL DA OPERAÇÃO</span>
          <h2 className="font-sans font-black text-3xl md:text-5xl tracking-tight text-slate-900">
            Benefícios para a eficiência do seu CD
          </h2>
          <p className="text-slate-600 text-sm max-w-3xl mx-auto mt-4 leading-relaxed">
            Muito mais do que coletar dados: geramos cultura de produtividade, organização impecável de estoque e redução comprovada de desperdício.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          <div className="bg-white border border-slate-200 p-6 rounded-2xl flex gap-4 items-start hover:border-[#f5a623]/30 transition-all duration-300 shadow-sm">
            <div className="bg-[#f5a623]/10 border border-[#f5a623]/20 p-2.5 rounded-xl text-[#f5a623] shrink-0">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-sans font-bold text-xs uppercase tracking-wider text-slate-800 mb-2">Aumento de Produtividade</h3>
              <p className="text-xs text-slate-500 leading-relaxed">Acompanhe individualmente o rendimento da equipe de reembalagem e separação. Quem trabalha bem ganha destaque, e os gargalos são eliminados.</p>
            </div>
          </div>

          <div className="bg-white border border-slate-200 p-6 rounded-2xl flex gap-4 items-start hover:border-[#f5a623]/30 transition-all duration-300 shadow-sm">
            <div className="bg-[#f5a623]/10 border border-[#f5a623]/20 p-2.5 rounded-xl text-[#f5a623] shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-sans font-bold text-xs uppercase tracking-wider text-slate-800 mb-2">Visão em Tempo Real</h3>
              <p className="text-xs text-slate-500 leading-relaxed">Os gráficos mostram exatamente o que está acontecendo na operação neste exato momento. Monitore abastecimentos, quebras e validades com agilidade.</p>
            </div>
          </div>

          <div className="bg-white border border-slate-200 p-6 rounded-2xl flex gap-4 items-start hover:border-[#f5a623]/30 transition-all duration-300 shadow-sm">
            <div className="bg-[#f5a623]/10 border border-[#f5a623]/20 p-2.5 rounded-xl text-[#f5a623] shrink-0">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-sans font-bold text-xs uppercase tracking-wider text-slate-800 mb-2">Vantagem do Banco de Dados</h3>
              <p className="text-xs text-slate-500 leading-relaxed">A grande vantagem de possuir um banco de dados robusto e unificado em nuvem: dados seguros, organizados e históricos sempre acessíveis.</p>
            </div>
          </div>

          <div className="bg-white border border-slate-200 p-6 rounded-2xl flex gap-4 items-start hover:border-[#f5a623]/30 transition-all duration-300 shadow-sm">
            <div className="bg-[#f5a623]/10 border border-[#f5a623]/20 p-2.5 rounded-xl text-[#f5a623] shrink-0">
              <ClipboardList className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-sans font-bold text-xs uppercase tracking-wider text-slate-800 mb-2">Auditoria Rápida</h3>
              <p className="text-xs text-slate-500 leading-relaxed">Saiba exatamente quem registrou cada quebra, quem autorizou cada descarte ou quem catalogou validades, tudo documentado de forma segura.</p>
            </div>
          </div>

          <div className="bg-white border border-slate-200 p-6 rounded-2xl flex gap-4 items-start hover:border-[#f5a623]/30 transition-all duration-300 shadow-sm">
            <div className="bg-[#f5a623]/10 border border-[#f5a623]/20 p-2.5 rounded-xl text-[#f5a623] shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-sans font-bold text-xs uppercase tracking-wider text-slate-800 mb-2">Prevenção de Vencimentos</h3>
              <p className="text-xs text-slate-500 leading-relaxed">O sistema alerta com inteligência quando produtos se aproximam do prazo crítico de validade, facilitando ações promocionais ou de desova rápida.</p>
            </div>
          </div>

          <div className="bg-white border border-slate-200 p-6 rounded-2xl flex gap-4 items-start hover:border-[#f5a623]/30 transition-all duration-300 shadow-sm">
            <div className="bg-[#f5a623]/10 border border-[#f5a623]/20 p-2.5 rounded-xl text-[#f5a623] shrink-0">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-sans font-bold text-xs uppercase tracking-wider text-slate-800 mb-2">Pronto para Coletores</h3>
              <p className="text-xs text-slate-500 leading-relaxed">Funciona diretamente pelo navegador web em qualquer dispositivo (celulares antigos, tablets ou coletores de dados robustos).</p>
            </div>
          </div>

        </div>

        <div className="mt-16 text-center">
          <button 
            onClick={onEnterApp}
            className="inline-flex items-center gap-2 bg-[#f5a623] text-white font-black text-xs uppercase tracking-wider px-10 py-5 rounded-xl shadow-[0_4px_25px_rgba(245,166,35,0.25)] hover:bg-[#e09112] hover:shadow-[0_8px_35px_rgba(245,166,35,0.45)] hover:-translate-y-0.5 transition-all text-center cursor-pointer border-none"
          >
            Acessar o Painel Operacional <ArrowRight className="w-4 h-4 stroke-[3px]" />
          </button>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-slate-200 py-8 text-center text-[10px] text-slate-400 tracking-wider uppercase font-semibold bg-white shadow-inner">
        Armazém Fácil © Todos os Direitos Reservados · Sistema de Gestão, Produtividade e Controle de Armazém
      </footer>
    </div>
  );
}
