import React, { useState, useEffect } from 'react';
import { BrandLogo } from './BrandLogo';
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
      icon: <RefreshCw className="w-6 h-6 text-blue-700" />,
      desc: 'Monitore a reembalagem de produtos avariados e acompanhe o rendimento individual de cada colaborador com dados agregados na hora.',
      badge: 'Produtividade'
    },
    {
      nome: 'Despejo & Descarte',
      icon: <Trash2 className="w-6 h-6 text-blue-700" />,
      desc: 'Controle em tempo real de produtos descartados com fluxo de aprovações automáticas para eliminar tempos mortos.',
      badge: 'Auditoria'
    },
    {
      nome: 'Abastecimento & Empilhador',
      icon: <Truck className="w-6 h-6 text-blue-700" />,
      desc: 'Monitore ordens de reabastecimento de picking e vistorias de segurança das empilhadeiras instantaneamente.',
      badge: 'Eficiência'
    },
    {
      nome: 'Quebras & Perdas',
      icon: <AlertTriangle className="w-6 h-6 text-red-600" />,
      desc: 'Registre avarias físicas, vazamentos e quebras na mesma hora. Sem planilhas locais lentas, os dados vão direto para o dashboard.',
      badge: 'Redução de Custos'
    },
    {
      nome: 'Validades (FEFO/PVPS)',
      icon: <Calendar className="w-6 h-6 text-blue-700" />,
      desc: 'Evite perdas no estoque por vencimento. Alertas inteligentes atualizam de forma rápida para ações preventivas de venda.',
      badge: 'Prevenção'
    },
    {
      nome: 'Blitz de Refugo',
      icon: <Search className="w-6 h-6 text-blue-700" />,
      desc: 'Inspeções técnicas nos paletes para resgate de itens e geração imediata de indicadores de treinamento de equipe.',
      badge: 'Qualidade'
    },
    {
      nome: 'Picking (Separação)',
      icon: <Package className="w-6 h-6 text-blue-700" />,
      desc: 'Acompanhe metas e performance dos operadores em tempo real para tomada de decisão ágil na expedição.',
      badge: 'Operação'
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-blue-50/40 text-blue-900 relative z-10 selection:bg-blue-600 selection:text-white">
      
      {/* ── TOP NAV BAR ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 h-16 px-6 md:px-12 bg-white/95 backdrop-blur-md border-b border-blue-100 flex items-center justify-between shadow-xs select-none">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center shadow-xs border border-blue-100">
            <BrandLogo size="sm" variant="icon-only" />
          </div>
          <div className="flex items-center gap-1 font-sans">
            <span className="font-semibold text-blue-900 text-sm tracking-wider">PAU</span>
            <span className="font-black text-sm text-blue-700 tracking-wider border-l border-blue-200 pl-1 ml-1">BRASIL</span>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-8">
          <a href="#como" className="text-[11px] font-bold tracking-wider text-blue-600 hover:text-blue-950 transition-colors uppercase">Agilidade</a>
          <a href="#modulos" className="text-[11px] font-bold tracking-wider text-blue-600 hover:text-blue-950 transition-colors uppercase">Acompanhamento</a>
          <a href="#fluxo" className="text-[11px] font-bold tracking-wider text-blue-600 hover:text-blue-950 transition-colors uppercase">Registrou, Atualizou</a>
          <a href="#vantagens" className="text-[11px] font-bold tracking-wider text-blue-600 hover:text-blue-950 transition-colors uppercase">Benefícios</a>
          <button 
            onClick={onEnterApp}
            className="font-sans text-xs font-black tracking-[1.5px] uppercase bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 hover:shadow-md hover:shadow-blue-200 transition-all cursor-pointer flex items-center gap-1.5 border-none"
          >
            Acessar Painel de Controle <ArrowRight className="w-3.5 h-3.5 stroke-[3px]" />
          </button>
        </div>

        {/* Mobile quick action */}
        <div className="flex md:hidden">
          <button 
            onClick={onEnterApp}
            className="text-xs font-black tracking-[1px] uppercase bg-blue-600 text-white px-4 py-2 rounded-lg border-none"
          >
            Entrar
          </button>
        </div>
      </nav>


      {/* ── HERO SECTION ── */}
      <header className="min-h-screen flex flex-col items-center justify-center pt-28 pb-16 px-6 text-center max-w-5xl mx-auto">

        <div className="inline-flex items-center gap-2.5 font-sans text-[10px] font-black uppercase tracking-[4px] text-blue-700 bg-blue-50 border border-blue-100 px-5 py-2 rounded-full mb-6 select-none shadow-xs">
          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
          <span>Mesa de Controle Logístico • Alta Velocidade</span>
        </div>

        <h1 className="font-sans font-black text-4xl sm:text-5xl md:text-6xl leading-[1.1] tracking-tight mb-6 text-blue-950">
          DECISÕES EM SEGUNDOS.<br />
          <span className="text-blue-600 bg-gradient-to-r from-blue-700 to-blue-500 bg-clip-text text-transparent">ACOMPANHAMENTOS REAL-TIME.</span>
        </h1>

        <p className="text-sm sm:text-base md:text-lg text-blue-700/80 max-w-3xl leading-relaxed mb-8 font-medium">
          Diga adeus à lentidão operacional e à burocracia. Uma plataforma sob medida desenhada para garantir <strong className="text-blue-950">agilidade de resposta máxima</strong> na logística do pátio: <span className="text-blue-700 font-black underline decoration-2 decoration-emerald-500">Registrou, atualizou!</span> Informações consolidadas na mesma hora para decisões automáticas.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14 w-full sm:w-auto">
          <button 
            onClick={onEnterApp} 
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-blue-600 text-white font-black text-xs uppercase tracking-wider px-8 py-4 rounded-xl shadow-md shadow-blue-200 hover:bg-blue-700 hover:-translate-y-0.5 transition-all text-center cursor-pointer border-none"
          >
            Acessar Sistema Agora <ArrowRight className="w-4 h-4 stroke-[2.5px]" />
          </button>

          <a 
            href="#como" 
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 bg-white hover:bg-blue-50 border border-blue-150 text-blue-700 hover:text-blue-900 font-bold text-xs uppercase tracking-wider px-6 py-4 rounded-xl transition-all text-center"
          >
            Como Funciona a Velocidade?
          </a>
        </div>

        {/* Dynamic visual dashboard teaser */}
        <div className="app-preview w-full max-w-4xl bg-white border border-blue-100 rounded-2xl overflow-hidden shadow-xl shadow-blue-100/40">
          <div className="preview-bar bg-blue-50/50 border-b border-blue-100 px-4 py-3.5 flex items-center justify-between">
            <div className="flex gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-200"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-blue-200"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-blue-200"></span>
            </div>
            <div className="flex-1 bg-white border border-blue-100 rounded-lg py-1 px-4 text-[9px] font-mono text-blue-400 max-w-md mx-auto">
              paubrasil.com/mesa-de-controle/operacoes-fefo-repack
            </div>
            <div className="w-12 text-right flex items-center justify-end gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[9px] font-mono text-emerald-600 font-bold">REAL-TIME</span>
            </div>
          </div>
          <div className="bg-white p-6 text-left">
            <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between border-b border-blue-50 pb-3 gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-blue-900">📊 Estatísticas e Indicadores Consolidados</span>
              <span className="text-[10px] text-emerald-600 font-mono flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                Nuvem Ativa & Sincronizada
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-blue-50/30 border border-blue-100 rounded-xl relative overflow-hidden">
                <span className="block text-[10px] uppercase font-bold text-blue-500 mb-1">Velocidade Analítica</span>
                <span className="font-sans font-black text-2xl text-blue-950">Sub-Segundo</span>
                <span className="block text-[9px] text-blue-500 mt-1.5">✓ Sem redigitação de dados</span>
                <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
              </div>
              <div className="p-4 bg-blue-50/30 border border-blue-100 rounded-xl relative overflow-hidden">
                <span className="block text-[10px] uppercase font-bold text-blue-500 mb-1">Acompanhamento</span>
                <span className="font-sans font-black text-2xl text-emerald-600">100% Direto</span>
                <span className="block text-[9px] text-blue-500 mt-1.5">✓ Salvou, atualizou os gráficos</span>
                <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
              </div>
              <div className="p-4 bg-blue-50/30 border border-blue-100 rounded-xl relative overflow-hidden">
                <span className="block text-[10px] uppercase font-bold text-blue-500 mb-1">Tendência de Desvios</span>
                <span className="font-sans font-black text-2xl text-blue-950">Mapeada</span>
                <span className="block text-[9px] text-blue-500 mt-1.5">✓ Visualização imediata de gargalos</span>
                <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
              </div>
              <div className="p-4 bg-blue-50/30 border border-blue-100 rounded-xl relative overflow-hidden">
                <span className="block text-[10px] uppercase font-bold text-blue-500 mb-1">Sincronização de Pátio</span>
                <span className="font-sans font-black text-2xl text-blue-900">Automatizada</span>
                <span className="block text-blue-600 text-[9px] mt-1.5">✓ Ligação direta com a Mesa</span>
                <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ── SEÇÃO EXPLICATIVA: O QUE É O SISTEMA? ── */}
      <section id="como" className="py-24 border-t border-b border-blue-100 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
            
            <div className="md:col-span-6 space-y-5 text-left">
              <span className="font-sans font-bold text-xs uppercase tracking-[3px] text-blue-600">MÁXIMA VELOCIDADE DE RETORNO</span>
              <h2 className="font-sans font-black text-3xl md:text-4xl tracking-tight leading-tight text-blue-950">
                Não é sobre ser fácil.<br />
                É sobre ser Extremamente Ágil.
              </h2>
              <p className="text-sm text-blue-800/80 leading-relaxed">
                No CD da Pau Brasil Distribuidora Ambev, o fluxo do Retorno de Rota demanda reações rápidas. Nossa ferramenta foi desenvolvida para <strong className="text-blue-950">aniquilar o desperdício de tempo</strong>. Cada reembalagem registrada ou descarte lançado sincroniza em nuvem no mesmo milissegundo, permitindo monitoramento de metas em tempo real pela Mesa de Controle.
              </p>
              <div className="space-y-4 pt-2">
                <div className="flex items-start gap-3">
                  <div className="mt-1 w-5 h-5 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 border border-blue-100">
                    <Check className="w-3 h-3 stroke-[3px]" />
                  </div>
                  <div>
                    <strong className="text-xs uppercase text-blue-950 tracking-wider block font-black">Acompanhamentos Automáticos e Diretos</strong>
                    <span className="text-xs text-blue-600/80">Esqueça a necessidade de compilar ou enviar relatórios semanais. Ao registrar qualquer ocorrência ou blitz, os rankings e dashboards de quebras se atualizam instantaneamente.</span>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-1 w-5 h-5 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 border border-blue-100">
                    <Check className="w-3 h-3 stroke-[3px]" />
                  </div>
                  <div>
                    <strong className="text-xs uppercase text-blue-950 tracking-wider block font-black">Mapeamento Imediato de Tendências</strong>
                    <span className="text-xs text-blue-600/80">Veja de forma ágil onde ocorrem os maiores gargalos, quais rotas trazem mais produtos avariados e quem são os operadores mais produtivos.</span>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-1 w-5 h-5 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 border border-blue-100">
                    <Check className="w-3 h-3 stroke-[3px]" />
                  </div>
                  <div>
                    <strong className="text-xs uppercase text-blue-950 tracking-wider block font-black">Planos de Ação e Resoluções no Ato</strong>
                    <span className="text-xs text-blue-600/80">Abra tratativas e planos de ação 5W2H rápidos para solucionar anomalias recorrentes diretamente no sistema, sem perder o foco na operação física.</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="md:col-span-6 bg-blue-50/50 border border-blue-100 p-6 rounded-2xl relative shadow-xs">
              <div className="absolute -top-3 -right-3 bg-blue-600 text-white text-[10px] font-black uppercase px-3 py-1 rounded-full shadow-sm">
                ⚡ PRODUTIVIDADE OPERACIONAL
              </div>
              <h3 className="font-sans font-black text-xs uppercase tracking-widest text-blue-800 mb-4">💡 DIFERENÇA EM AGILIDADE:</h3>
              
              <div className="space-y-4">
                <div className="p-4 bg-white border border-blue-100 rounded-xl flex gap-3 items-start shadow-xs">
                  <span className="text-xl">⏳</span>
                  <div>
                    <h4 className="font-sans font-bold text-xs uppercase text-blue-500">Método Tradicional (Lento e Burocrático)</h4>
                    <p className="text-[11px] text-blue-500 mt-0.5">Esperar o fim do turno para compilar validades vencidas no Excel, transcrever notas fiscais de quebras, e consolidar os dados dias depois.</p>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl flex gap-3 items-start shadow-xs">
                  <span className="text-xl">🚀</span>
                  <div>
                    <h4 className="font-sans font-bold text-xs uppercase text-blue-900 flex items-center gap-1.5">
                      Método Mesa de Controle (Ágil e Real-Time)
                    </h4>
                    <p className="text-[11px] text-blue-800 mt-0.5">O operador registra no pátio, a Mesa visualiza as tendências imediatas na tela e toma decisões de venda, descarte ou roteirização no mesmo instante.</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── COUNTERS / STATS SECTION ── */}
      <section className="border-b border-blue-100 bg-blue-50/20 py-16">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div className="flex flex-col items-center">
            <span className="font-sans font-black text-5xl md:text-6xl text-blue-600">{counts.modulos}</span>
            <span className="text-blue-600 font-bold text-xs uppercase mt-2.5 text-center tracking-wide">Módulos de Alta <br />Performance</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="font-sans font-black text-5xl md:text-6xl text-blue-700">{counts.skus}</span>
            <span className="text-blue-600 font-bold text-xs uppercase mt-2.5 text-center tracking-wide">SKUs Monitorados <br />Constantemente</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="font-sans font-black text-5xl md:text-6xl text-emerald-600">{counts.uptime}%</span>
            <span className="text-blue-600 font-bold text-xs uppercase mt-2.5 text-center tracking-wide">Sincronização Direta <br />com Banco de Dados</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="font-sans font-black text-5xl md:text-6xl text-blue-900">Zero</span>
            <span className="text-blue-600 font-bold text-xs uppercase mt-2.5 text-center tracking-wide">Tempo Perdido <br />no Retorno de Rota</span>
          </div>
        </div>
      </section>

      {/* ── MODULE CARDS SECTION ── */}
      <section id="modulos" className="py-24 px-6 max-w-6xl mx-auto bg-white rounded-3xl my-10 shadow-xs border border-blue-100">
        <div className="text-center mb-16">
          <span className="font-sans font-bold text-xs uppercase tracking-[3px] text-blue-600 mb-3 block">Acompanhamento e Integração</span>
          <h2 className="font-sans font-black text-3xl md:text-5xl tracking-tight text-blue-950 mb-4">Todo o Fluxo Logístico em um Só Lugar.</h2>
          <p className="text-blue-700/80 text-sm md:text-base max-w-3xl mx-auto leading-relaxed">
            Cada área do armazém envia relatórios em tempo real de forma extremamente ágil, consolidando dados operacionais e de segurança.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modulosLanding.map((m, index) => (
            <div key={index} className="bg-blue-50/20 border border-blue-100 hover:border-blue-300 p-6 flex flex-col justify-between hover:bg-white hover:-translate-y-1 transition-all duration-300 rounded-2xl group shadow-xs">
              <div>
                <div className="mb-4 bg-white border border-blue-100 p-3 rounded-xl w-fit group-hover:bg-blue-50 transition-colors">
                  {m.icon}
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-sans font-black text-xs uppercase tracking-wider text-blue-900">{m.nome}</h3>
                  <span className="text-[8px] px-1.5 py-0.5 rounded bg-white border border-blue-100 font-mono text-blue-600 uppercase font-bold tracking-wider">{m.badge}</span>
                </div>
                <p className="text-xs text-blue-700/80 leading-relaxed mb-6">{m.desc}</p>
              </div>
              <div className="space-y-2 mt-auto border-t border-blue-100 pt-4 text-[10px] text-blue-500">
                <div className="flex items-center gap-1.5">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span>Registrou, Atualizou na Hora</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-blue-700 font-bold">✓</span>
                  <span>Disponível para tomadas de decisões</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FLUXO DE OPERAÇÃO: REGISTROU, ATUALIZOU! ── */}
      <section id="fluxo" className="py-24 bg-blue-50/30 border-t border-b border-blue-100 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <span className="font-sans font-bold text-xs uppercase tracking-[3px] text-blue-600 mb-3 block">FLUXO OPERACIONAL EM ALTA PERFORMANCE</span>
          <h2 className="font-sans font-black text-3xl md:text-5xl tracking-tight text-blue-950 mb-16">
            O Ciclo "Registrou, Atualizou"
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            <div className="flex flex-col items-center relative">
              <div className="w-12 h-12 bg-white border-2 border-blue-600 text-blue-600 font-sans font-black rounded-full flex items-center justify-center text-md mb-6 shadow-xs">
                1
              </div>
              <h3 className="font-sans font-black text-xs tracking-wider uppercase mb-2 text-blue-900">1. Lançamento Imediato no Pátio</h3>
              <p className="text-blue-600/80 text-xs leading-relaxed max-w-xs">Os colaboradores registram quebras, validades ou descarte em campo rapidamente, via coletor ou celular.</p>
            </div>
            
            <div className="flex flex-col items-center relative">
              <div className="w-12 h-12 bg-white border-2 border-emerald-500 text-emerald-600 font-sans font-black rounded-full flex items-center justify-center text-md mb-6 shadow-xs">
                2
              </div>
              <h3 className="font-sans font-black text-xs tracking-wider uppercase mb-2 text-blue-900">2. Consolidação Automática</h3>
              <p className="text-blue-600/80 text-xs leading-relaxed max-w-xs">Sem retrabalho ou digitação em planilhas locais. O banco de dados em nuvem processa os dados e compila metas instantaneamente.</p>
            </div>

            <div className="flex flex-col items-center relative">
              <div className="w-12 h-12 bg-white border-2 border-blue-400 text-blue-700 font-sans font-black rounded-full flex items-center justify-center text-md mb-6 shadow-xs">
                3
              </div>
              <h3 className="font-sans font-black text-xs tracking-wider uppercase mb-2 text-blue-900">3. Decisão Ágil e Direta</h3>
              <p className="text-blue-600/80 text-xs leading-relaxed max-w-xs">A Mesa de Controle acompanha os gráficos de tendência unificados, agindo imediatamente para reverter gargalos de produtividade.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── ADVANTAGES SECTION ── */}
      <section id="vantagens" className="py-24 px-6 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <span className="font-sans font-bold text-xs uppercase tracking-[3px] text-blue-600 mb-3 block">BENEFÍCIOS DA MESA DE CONTROLE</span>
          <h2 className="font-sans font-black text-3xl md:text-5xl tracking-tight text-blue-950">
            Principais Benefícios da Plataforma
          </h2>
          <p className="text-blue-700/80 text-sm max-w-3xl mx-auto mt-4 leading-relaxed font-medium">
            Entenda por que a agilidade e o sincronismo imediato de dados criam resultados incomparáveis para a gestão de estoques e retorno de rota.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          <div className="bg-white border border-blue-100 p-6 rounded-2xl flex gap-4 items-start hover:border-blue-300 transition-all duration-300 shadow-xs">
            <div className="bg-blue-50 border border-blue-100 p-2.5 rounded-xl text-blue-700 shrink-0">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-sans font-bold text-xs uppercase tracking-wider text-blue-950 mb-2 font-black">Tomada de Decisão Imediata</h3>
              <p className="text-xs text-blue-600 leading-relaxed">Não espere reuniões semanais para saber quais rotas avariam mais. Veja as tendências calculadas na hora e mude as diretrizes no mesmo dia.</p>
            </div>
          </div>

          <div className="bg-white border border-blue-100 p-6 rounded-2xl flex gap-4 items-start hover:border-blue-300 transition-all duration-300 shadow-xs">
            <div className="bg-blue-50 border border-blue-100 p-2.5 rounded-xl text-blue-700 shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-sans font-bold text-xs uppercase tracking-wider text-blue-950 mb-2 font-black">Acompanhamentos Automáticos</h3>
              <p className="text-xs text-blue-600 leading-relaxed">Esqueça os atrasos e planilhas offline. As informações de repack, quebras, validades e auditorias são consolidadas na mesma hora.</p>
            </div>
          </div>

          <div className="bg-white border border-blue-100 p-6 rounded-2xl flex gap-4 items-start hover:border-blue-300 transition-all duration-300 shadow-xs">
            <div className="bg-blue-50 border border-blue-100 p-2.5 rounded-xl text-blue-700 shrink-0">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-sans font-bold text-xs uppercase tracking-wider text-blue-950 mb-2 font-black">Banco de Dados em Nuvem</h3>
              <p className="text-xs text-blue-600 leading-relaxed">Toda a base operacional é compilada em gráficos de tendências dinâmicos, rankings individuais de produtividade e logs confiáveis de dados.</p>
            </div>
          </div>

          <div className="bg-white border border-blue-100 p-6 rounded-2xl flex gap-4 items-start hover:border-blue-300 transition-all duration-300 shadow-xs">
            <div className="bg-blue-50 border border-blue-100 p-2.5 rounded-xl text-blue-700 shrink-0">
              <ClipboardList className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-sans font-bold text-xs uppercase tracking-wider text-slate-950 mb-2 font-black">Monitoramento de Tendências</h3>
              <p className="text-xs text-slate-500 leading-relaxed">A mesa de controle consolida as médias históricas para que a coordenação identifique padrões crônicos de quebras e planeje soluções rápidas.</p>
            </div>
          </div>

          <div className="bg-white border border-blue-100 p-6 rounded-2xl flex gap-4 items-start hover:border-blue-300 transition-all duration-300 shadow-xs">
            <div className="bg-blue-50 border border-blue-100 p-2.5 rounded-xl text-blue-700 shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-sans font-bold text-xs uppercase tracking-wider text-slate-950 mb-2 font-black">Auditoria Operacional Rápida</h3>
              <p className="text-xs text-slate-500 leading-relaxed">Todos os descartes e reembalagens passam por validações seguras, reduzindo riscos de fraudes ou furos físicos de estoque com total rastreabilidade.</p>
            </div>
          </div>

          <div className="bg-white border border-blue-100 p-6 rounded-2xl flex gap-4 items-start hover:border-blue-300 transition-all duration-300 shadow-xs">
            <div className="bg-blue-50 border border-blue-100 p-2.5 rounded-xl text-blue-700 shrink-0">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-sans font-bold text-xs uppercase tracking-wider text-slate-950 mb-2 font-black">Compatibilidade com Coletores</h3>
              <p className="text-xs text-slate-500 leading-relaxed">Desenvolvido sob medida para smartphones, tablets e coletores de dados de pátio para que a equipe lance dados diretamente do local da operação.</p>
            </div>
          </div>

        </div>

        <div className="mt-16 text-center">
          <button 
            onClick={onEnterApp}
            className="inline-flex items-center gap-2 bg-blue-600 text-white font-black text-xs uppercase tracking-wider px-10 py-5 rounded-xl shadow-md hover:bg-blue-700 hover:-translate-y-0.5 transition-all text-center cursor-pointer border-none"
          >
            Acessar o Painel Operacional Real-Time <ArrowRight className="w-4 h-4 stroke-[3px]" />
          </button>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-blue-100 py-8 text-center text-[10px] text-blue-600 tracking-wider uppercase font-semibold bg-white shadow-inner">
        Pau Brasil Distribuidora © Todos os Direitos Reservados · Gestão de Retorno de Rota em Tempo Real — Ambev Guarabira
      </footer>
    </div>
  );
}
