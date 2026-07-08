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
      icon: <RefreshCw className="w-6 h-6 text-[#1e56f0]" />,
      desc: 'Monitore a reembalagem de produtos avariados e acompanhe o rendimento individual de cada colaborador.',
      cor: '#1e56f0',
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
      icon: <Search className="w-6 h-6 text-[#3b82f6]" />,
      desc: 'Inspeções técnicas preventivas nos paletes de refugo para resgatar itens bons e treinar as equipes.',
      cor: '#3b82f6',
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
    <div className="min-h-screen flex flex-col bg-[#f8fafc] text-[#1e293b] relative z-10 selection:bg-[#1e56f0] selection:text-white">
      
      {/* ── TOP NAV BAR ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 h-16 px-6 md:px-12 bg-white/95 backdrop-blur-md border-b border-slate-200 flex items-center justify-between shadow-sm select-none">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center shadow-sm border border-slate-100">
            <BrandLogo size="sm" variant="icon-only" />
          </div>
          <div className="flex items-center gap-1 font-sans">
            <span className="font-light text-slate-800 text-sm font-semibold tracking-wider">PAU</span>
            <span className="font-black text-sm text-[#1e56f0] tracking-wider">BRASIL</span>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-8">
          <a href="#como" className="text-[11px] font-bold tracking-wider text-[#64748b] hover:text-[#0f172a] transition-colors uppercase">O que é?</a>
          <a href="#modulos" className="text-[11px] font-bold tracking-wider text-[#64748b] hover:text-[#0f172a] transition-colors uppercase">Módulos</a>
          <a href="#fluxo" className="text-[11px] font-bold tracking-wider text-[#64748b] hover:text-[#0f172a] transition-colors uppercase">Funcionamento</a>
          <a href="#vantagens" className="text-[11px] font-bold tracking-wider text-[#64748b] hover:text-[#0f172a] transition-colors uppercase">Vantagens</a>
          <button 
            onClick={onEnterApp}
            className="font-sans text-xs font-black tracking-[1.5px] uppercase bg-[#1e56f0] text-white px-5 py-2.5 rounded-lg hover:bg-[#1848c8] hover:shadow-[0_4px_15px_rgba(30,86,240,0.25)] transition-all cursor-pointer flex items-center gap-1.5 border-none"
          >
            Acessar Sistema <ArrowRight className="w-3.5 h-3.5 stroke-[3px]" />
          </button>
        </div>

        {/* Mobile quick action */}
        <div className="flex md:hidden">
          <button 
            onClick={onEnterApp}
            className="text-xs font-black tracking-[1px] uppercase bg-[#1e56f0] text-white px-4 py-2 rounded-lg border-none"
          >
            Entrar
          </button>
        </div>
      </nav>


      {/* ── HERO SECTION ── */}
      <header className="min-h-screen flex flex-col items-center justify-center pt-28 pb-16 px-6 text-center max-w-5xl mx-auto">

        <div className="inline-flex items-center gap-2 font-mono text-[9px] uppercase tracking-[3px] text-[#1e56f0] border border-[#1e56f0]/35 bg-[#1e56f0]/5 px-4 py-1.5 rounded-full mb-6">
          <span className="w-1.5 h-1.5 bg-[#1e56f0] rounded-full animate-ping"></span>
          GESTÃO DE RETORNO DE ROTA — GUARABIRA — 100% TEMPO REAL
        </div>

        <h1 className="font-sans font-black text-4xl sm:text-5xl md:text-6xl leading-[1.1] tracking-tight mb-6 text-[#0f172a]">
          Decisões Rápidas e <br />
          <span className="text-[#1e56f0] bg-gradient-to-r from-[#1e56f0] to-[#1848c8] bg-clip-text text-transparent">Operação 100% Real-Time.</span>
        </h1>

        <p className="text-sm sm:text-base md:text-lg text-[#475569] max-w-3xl leading-relaxed mb-8">
          Substitua o preenchimento manual de planilhas por <strong className="text-[#0f172a]">automação instantânea</strong>. Tudo que é registrado pelos operadores no pátio atualiza em tempo real, gerando <strong className="text-[#1e56f0]">linhas de tendência</strong> automáticas, <strong className="text-[#1e56f0]">alertas de anomalia</strong> imediatos e total validação pela Mesa de Controle.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14 w-full sm:w-auto">
          <button 
            onClick={onEnterApp} 
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#1e56f0] text-white font-black text-xs uppercase tracking-wider px-8 py-4 rounded-xl shadow-[0_4px_15px_rgba(30,86,240,0.25)] hover:bg-[#1848c8] hover:shadow-[0_8px_25px_rgba(30,86,240,0.35)] hover:-translate-y-0.5 transition-all text-center cursor-pointer border-none"
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
              paubrasil.com/painel/tempo-real
            </div>
            <div className="w-12 text-right flex items-center justify-end gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[9px] font-mono text-emerald-600 font-bold">LIVE</span>
            </div>
          </div>
          <div className="bg-[#fafbfc] p-6 text-left">
            <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-3 gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-slate-700">📊 Painel Geral de Performance e Tomada de Decisão</span>
              <span className="text-[10px] text-slate-400 font-mono">Sincronizado em tempo real</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-white border border-slate-200 rounded-xl relative overflow-hidden shadow-sm">
                <span className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Status Operação</span>
                <span className="font-sans font-black text-2xl text-[#1e56f0]">100% Ativa</span>
                <span className="block text-[9px] text-emerald-600 mt-1.5">✓ Atualizações em milissegundos</span>
                <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-[#1e56f0] rounded-full"></div>
              </div>
              <div className="p-4 bg-white border border-slate-200 rounded-xl relative overflow-hidden shadow-sm">
                <span className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Preenchimento</span>
                <span className="font-sans font-black text-2xl text-emerald-600">Automático</span>
                <span className="block text-[9px] text-slate-500 mt-1.5">✓ Fim das planilhas manuais</span>
                <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
              </div>
              <div className="p-4 bg-white border border-slate-200 rounded-xl relative overflow-hidden shadow-sm">
                <span className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Alertas Anomalias</span>
                <span className="font-sans font-black text-2xl text-red-500">Monitorado</span>
                <span className="block text-[9px] text-red-500 mt-1.5">⚠ Detecção rápida de falhas</span>
                <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-red-500 rounded-full animate-ping"></div>
              </div>
              <div className="p-4 bg-white border border-slate-200 rounded-xl relative overflow-hidden shadow-sm">
                <span className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Mesa de Controle</span>
                <span className="font-sans font-black text-2xl text-slate-800">Verificado</span>
                <span className="block text-[#1e56f0] text-[9px] mt-1.5">✓ Dados auditáveis em nuvem</span>
                <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-[#1e56f0] rounded-full"></div>
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
              <span className="font-sans font-bold text-xs uppercase tracking-[3px] text-[#1e56f0]">SOBRE A DISTRIBUIDORA PAU BRASIL</span>
              <h2 className="font-sans font-black text-3xl md:text-4xl tracking-tight leading-tight text-slate-900">
                Agilidade no pátio, <br />
                Decisão rápida no controle.
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                Nós sabemos que o Retorno de Rota exige agilidade absoluta. Nossa plataforma foi feita para <strong className="text-slate-900">acelerar o preenchimento de planilhas</strong> que agora é feito de forma 100% automática, trazendo foco à <strong className="text-slate-900">tomada de decisões ágeis</strong> baseadas em dados em tempo real.
              </p>
              <div className="space-y-4 pt-2">
                <div className="flex items-start gap-3">
                  <div className="mt-1 w-5 h-5 rounded-full bg-[#1e56f0]/15 text-[#1e56f0] flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 stroke-[3px]" />
                  </div>
                  <div>
                    <strong className="text-xs uppercase text-slate-800 tracking-wider block">Preenchimento Automático</strong>
                    <span className="text-xs text-slate-500">Esqueça a redigitação manual de planilhas. Todo registro no pátio alimenta o banco de dados e calcula as métricas de forma automatizada.</span>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-1 w-5 h-5 rounded-full bg-[#1e56f0]/15 text-[#1e56f0] flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 stroke-[3px]" />
                  </div>
                  <div>
                    <strong className="text-xs uppercase text-slate-800 tracking-wider block">Monitoramento 100% Real-Time</strong>
                    <span className="text-xs text-slate-500">Toda quebra, avaria ou palete conferido atualiza na hora, permitindo que a mesa de controle Ambev acompanhe a operação ao vivo.</span>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-1 w-5 h-5 rounded-full bg-[#1e56f0]/15 text-[#1e56f0] flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 stroke-[3px]" />
                  </div>
                  <div>
                    <strong className="text-xs uppercase text-slate-800 tracking-wider block">Tendências & Alertas de Anomalia</strong>
                    <span className="text-xs text-slate-500">Com linhas de tendência inteligentes e alertas visuais de anomalias, sua distribuidora antecipa problemas e age imediatamente no controle físico.</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="md:col-span-6 bg-slate-50 border border-slate-200 p-6 rounded-2xl relative shadow-sm">
              <div className="absolute -top-3 -right-3 bg-gradient-to-br from-[#1e56f0] to-[#12389d] text-white text-[10px] font-black uppercase px-3 py-1 rounded-full shadow-md">
                ★ 100% Digital e Real-Time
              </div>
              <h3 className="font-sans font-black text-xs uppercase tracking-widest text-[#1e56f0] mb-4">💡 FIM DOS ATRASOS E CONTROLE MANUAL:</h3>
              
              <div className="space-y-4">
                <div className="p-4 bg-white border border-slate-200 rounded-xl flex gap-3 items-start shadow-xs">
                  <span className="text-xl">📄</span>
                  <div>
                    <h4 className="font-sans font-bold text-xs uppercase text-slate-700">Como era antes: Registros Manuais e Planilhas Lentas</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">Anotações em papéis perdidos, redigitação manual de dados que demorava horas e atrasava as tomadas de decisão.</p>
                  </div>
                </div>

                <div className="p-4 bg-[#1e56f0]/5 border border-[#1e56f0]/20 rounded-xl flex gap-3 items-start shadow-xs">
                  <span className="text-xl">⚡</span>
                  <div>
                    <h4 className="font-sans font-bold text-xs uppercase text-[#1e56f0]">Com o Sistema Real-Time: Automação Imediata</h4>
                    <p className="text-[11px] text-slate-700 mt-0.5">O registro alimenta instantaneamente os painéis operacionais, preenche as planilhas e permite decisões imediatas validadas pelo controle.</p>
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
            <span className="font-sans font-black text-5xl md:text-6xl text-[#1e56f0]">{counts.modulos}</span>
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
          <span className="font-sans font-bold text-xs uppercase tracking-[3px] text-[#1e56f0] mb-3 block">Módulos Operacionais</span>
          <h2 className="font-sans font-black text-3xl md:text-5xl tracking-tight text-slate-950 mb-4">Feito para resolver problemas logísticos reais.</h2>
          <p className="text-slate-600 text-sm md:text-base max-w-3xl mx-auto leading-relaxed">
            Cada pilar operacional da sua distribuidora possui uma tela limpa e de rápido lançamento para os ajudantes, além de relatórios analíticos para os supervisores.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modulosLanding.map((m, index) => (
            <div key={index} className="bg-slate-50 border border-slate-200 hover:border-[#1e56f0]/40 p-6 flex flex-col justify-between hover:bg-white hover:-translate-y-1 relative transition-all duration-300 rounded-2xl group shadow-xs">
              <div>
                <div className="mb-4 bg-white border border-slate-200 p-3 rounded-xl w-fit group-hover:bg-[#1e56f0]/10 transition-colors">
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
          <span className="font-sans font-bold text-xs uppercase tracking-[3px] text-[#1e56f0] mb-3 block">SISTEMA INTEGRADO PAU BRASIL</span>
          <h2 className="font-sans font-black text-3xl md:text-5xl tracking-tight text-slate-900 mb-16">
            Como funciona na prática do dia a dia?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            <div className="flex flex-col items-center relative">
              <div className="w-12 h-12 bg-white border-2 border-[#1e56f0] text-[#1e56f0] font-sans font-black rounded-full flex items-center justify-center text-md mb-6 shadow-sm">
                1
              </div>
              <h3 className="font-sans font-black text-xs tracking-wider uppercase mb-2 text-slate-800">Lançamento Rápido no Pátio</h3>
              <p className="text-slate-500 text-xs leading-relaxed max-w-xs">Os colaboradores e motoristas registram tarefas de retorno físico, reembalagem ou validades em segundos direto do celular, sem perda de dados.</p>
            </div>
            
            <div className="flex flex-col items-center relative">
              <div className="w-12 h-12 bg-white border-2 border-[#1e56f0] text-[#1e56f0] font-sans font-black rounded-full flex items-center justify-center text-md mb-6 shadow-sm">
                2
              </div>
              <h3 className="font-sans font-black text-xs tracking-wider uppercase mb-2 text-slate-800">Automação de Planilhas</h3>
              <p className="text-slate-500 text-xs leading-relaxed max-w-xs">Todo o preenchimento de planilhas é automatizado pelo sistema. Sem digitação manual ou planilhas locais lentas.</p>
            </div>

            <div className="flex flex-col items-center relative">
              <div className="w-12 h-12 bg-white border-2 border-[#1e56f0] text-[#1e56f0] font-sans font-black rounded-full flex items-center justify-center text-md mb-6 shadow-sm">
                3
              </div>
              <h3 className="font-sans font-black text-xs tracking-wider uppercase mb-2 text-slate-800">Monitoramento Real-Time</h3>
              <p className="text-slate-500 text-xs leading-relaxed max-w-xs">A mesa de controle visualiza as informações na hora com linhas de tendência automáticas, alertas instantâneos de anomalias e rápida tomada de decisão.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── ADVANTAGES SECTION ── */}
      <section id="vantagens" className="py-24 px-6 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <span className="font-sans font-bold text-xs uppercase tracking-[3px] text-[#1e56f0] mb-3 block">RETORNO REAL DA OPERAÇÃO</span>
          <h2 className="font-sans font-black text-3xl md:text-5xl tracking-tight text-slate-900">
            Benefícios para a eficiência do seu CD
          </h2>
          <p className="text-slate-600 text-sm max-w-3xl mx-auto mt-4 leading-relaxed">
            Muito mais do que coletar dados: geramos cultura de produtividade, organização impecável de estoque e tomada rápida de decisões operacionais.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          <div className="bg-white border border-slate-200 p-6 rounded-2xl flex gap-4 items-start hover:border-[#1e56f0]/30 transition-all duration-300 shadow-sm">
            <div className="bg-[#1e56f0]/10 border border-[#1e56f0]/20 p-2.5 rounded-xl text-[#1e56f0] shrink-0">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-sans font-bold text-xs uppercase tracking-wider text-slate-800 mb-2">Aumento de Produtividade</h3>
              <p className="text-xs text-slate-500 leading-relaxed">Acompanhe individualmente o rendimento da equipe de reembalagem e retorno de rota. Identifique gargalos logísticos e otimize os processos diários.</p>
            </div>
          </div>

          <div className="bg-white border border-slate-200 p-6 rounded-2xl flex gap-4 items-start hover:border-[#1e56f0]/30 transition-all duration-300 shadow-sm">
            <div className="bg-[#1e56f0]/10 border border-[#1e56f0]/20 p-2.5 rounded-xl text-[#1e56f0] shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-sans font-bold text-xs uppercase tracking-wider text-slate-800 mb-2">Operação 100% em Tempo Real</h3>
              <p className="text-xs text-slate-500 leading-relaxed">Os gráficos e tabelas atualizam em milissegundos. Tudo o que é registrado pelos operadores no pátio é refletido instantaneamente na tela da mesa de controle.</p>
            </div>
          </div>

          <div className="bg-white border border-slate-200 p-6 rounded-2xl flex gap-4 items-start hover:border-[#1e56f0]/30 transition-all duration-300 shadow-sm">
            <div className="bg-[#1e56f0]/10 border border-[#1e56f0]/20 p-2.5 rounded-xl text-[#1e56f0] shrink-0">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-sans font-bold text-xs uppercase tracking-wider text-slate-800 mb-2">Automação de Planilhas</h3>
              <p className="text-xs text-slate-500 leading-relaxed">Todo o preenchimento de planilhas de avarias, perdas e retornos é feito automaticamente em nuvem, garantindo agilidade e eliminando o erro humano.</p>
            </div>
          </div>

          <div className="bg-white border border-slate-200 p-6 rounded-2xl flex gap-4 items-start hover:border-[#1e56f0]/30 transition-all duration-300 shadow-sm">
            <div className="bg-[#1e56f0]/10 border border-[#1e56f0]/20 p-2.5 rounded-xl text-[#1e56f0] shrink-0">
              <ClipboardList className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-sans font-bold text-xs uppercase tracking-wider text-slate-800 mb-2">Verificação & Auditoria</h3>
              <p className="text-xs text-slate-500 leading-relaxed">Toda quebra, avaria e validades do pátio são verificados ativamente pela supervisão e mesa de controle, com histórico auditável permanente.</p>
            </div>
          </div>

          <div className="bg-white border border-slate-200 p-6 rounded-2xl flex gap-4 items-start hover:border-[#1e56f0]/30 transition-all duration-300 shadow-sm">
            <div className="bg-[#1e56f0]/10 border border-[#1e56f0]/20 p-2.5 rounded-xl text-[#1e56f0] shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-sans font-bold text-xs uppercase tracking-wider text-slate-800 mb-2">Linhas de Tendência e Anomalias</h3>
              <p className="text-xs text-slate-500 leading-relaxed">O sistema alerta com inteligência quando desvios ou anomalias no pátio ocorrem, auxiliando na rápida tomada de decisões preventivas nas rotas.</p>
            </div>
          </div>

          <div className="bg-white border border-slate-200 p-6 rounded-2xl flex gap-4 items-start hover:border-[#1e56f0]/30 transition-all duration-300 shadow-sm">
            <div className="bg-[#1e56f0]/10 border border-[#1e56f0]/20 p-2.5 rounded-xl text-[#1e56f0] shrink-0">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-sans font-bold text-xs uppercase tracking-wider text-slate-800 mb-2">Desenvolvido para Mobile e Coletores</h3>
              <p className="text-xs text-slate-500 leading-relaxed">Funciona diretamente via web em qualquer smartphone (Android ou iOS), tablet ou coletores de dados de pátio.</p>
            </div>
          </div>

        </div>

        <div className="mt-16 text-center">
          <button 
            onClick={onEnterApp}
            className="inline-flex items-center gap-2 bg-[#1e56f0] text-white font-black text-xs uppercase tracking-wider px-10 py-5 rounded-xl shadow-[0_4px_25px_rgba(30,86,240,0.25)] hover:bg-[#1848c8] hover:shadow-[0_8px_35px_rgba(30,86,240,0.45)] hover:-translate-y-0.5 transition-all text-center cursor-pointer border-none"
          >
            Acessar o Painel Operacional <ArrowRight className="w-4 h-4 stroke-[3px]" />
          </button>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-slate-200 py-8 text-center text-[10px] text-slate-400 tracking-wider uppercase font-semibold bg-white shadow-inner">
        Pau Brasil Distribuidora © Todos os Direitos Reservados · Gestão de Retorno de Rota em Tempo Real — Ambev Guarabira
      </footer>
    </div>
  );
}
