import React, { useState, useEffect, useMemo } from 'react';
import { db, isCustomFirebaseConnected } from '../firebase';
import { 
  collection, 
  query, 
  onSnapshot, 
  addDoc, 
  deleteDoc, 
  doc,
  updateDoc
} from 'firebase/firestore';
import { RepackRow, Usuario, Empresa, RepackActionPlan } from '../types';
import { 
  Box, 
  Clock, 
  Target, 
  TrendingUp, 
  Plus, 
  Search, 
  Trash2, 
  CheckCircle2, 
  RefreshCw, 
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Download,
  Info,
  ArrowLeft,
  Play,
  Square,
  Zap,
  Calendar
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell,
  AreaChart,
  Area
} from 'recharts';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';

interface RepackDashboardProps {
  user: Usuario;
  empresa: Empresa | null;
  onBack?: () => void;
}

const EMBALAGENS_CONFIG: Record<string, { metaSec: number; label: string }> = {
  'LATA 250': { metaSec: 270, label: 'Lata 250ml (Meta: 04:30)' },
  'LATA 350': { metaSec: 240, label: 'Lata 350ml (Meta: 04:00)' },
  'LATA 473': { metaSec: 210, label: 'Lata 473ml (Meta: 03:30)' },
  'PET 500ml': { metaSec: 300, label: 'Pet 500ml (Meta: 05:00)' },
  'PET 1L': { metaSec: 330, label: 'Pet 1L (Meta: 05:30)' },
  'PET 2L': { metaSec: 360, label: 'Pet 2L (Meta: 06:00)' },
  'GARRAFA 600ml': { metaSec: 255, label: 'Garrafa 600ml (Meta: 04:15)' },
  'GARRAFA 1L': { metaSec: 285, label: 'Garrafa 1L (Meta: 04:45)' }
};

// Helper to format seconds to HH:MM:SS inside global helpers
const formatSecToHMSHelper = (tot: number): string => {
  const h = Math.floor(tot / 3600);
  const m = Math.floor((tot % 3600) / 60);
  const s = tot % 60;
  return [h, m, s].map(v => v < 10 ? '0' + v : v).join(':');
};

// Seed highly polished starting data for realistic analytics when no data is registered
const generateSeedRepackRows = (empresaId: string): RepackRow[] => {
  const list: RepackRow[] = [];
  const operators = ['Ozenildo Silva', 'Matheus Barbosa', 'Paulo Pereira', 'Cleiton Souza'];
  const packKeys = Object.keys(EMBALAGENS_CONFIG);
  
  // Create entries for the last 12 days to ensure charts are beautifully populated
  for (let i = 11; i >= 0; i--) {
    const dateObj = new Date();
    dateObj.setDate(dateObj.getDate() - i);
    const dateISO = dateObj.toISOString().split('T')[0];
    const dateBr = dateObj.toLocaleDateString('pt-BR');
    
    // 2-3 entries per day
    const entriesCount = i === 0 ? 1 : Math.floor(Math.random() * 2) + 2;
    
    for (let j = 0; j < entriesCount; j++) {
      const op = operators[(i + j) % operators.length];
      const emb = packKeys[(i * 3 + j) % packKeys.length];
      const config = EMBALAGENS_CONFIG[emb] || { metaSec: 240 };
      
      const qty = Math.floor(Math.random() * 11) + 12; // 12 to 22 boxes
      const expectedTotalSec = config.metaSec * qty;
      
      // efficiency between 90% and 122%
      const efficiency = 0.90 + Math.random() * 0.32;
      const actualTotalSec = Math.round(expectedTotalSec / efficiency);
      
      const startHour = 8 + j * 3;
      const startMin = Math.floor(Math.random() * 60);
      const startStr = `${startHour.toString().padStart(2, '0')}:${startMin.toString().padStart(2, '0')}`;
      
      const endHour = startHour + Math.floor(actualTotalSec / 3600);
      const endMin = startMin + Math.floor((actualTotalSec % 3600) / 60);
      const finalMin = endMin % 60;
      const finalHour = endHour + Math.floor(endMin / 60);
      const endStr = `${finalHour.toString().padStart(2, '0')}:${finalMin.toString().padStart(2, '0')}`;
      
      const durH = Math.floor(actualTotalSec / 3600);
      const durM = Math.floor((actualTotalSec % 3600) / 60);
      const durS = actualTotalSec % 60;
      const durStr = `${durH.toString().padStart(2, '0')}:${durM.toString().padStart(2, '0')}:${durS.toString().padStart(2, '0')}`;
      
      const isWithinMeta = actualTotalSec <= expectedTotalSec;
      
      list.push({
        _docId: `seed-${i}-${j}`,
        empresaId: empresaId,
        data: dateBr,
        dataISO: dateISO,
        embalagem: emb,
        quantidade: qty,
        inicio: startStr,
        fim: endStr,
        duracao: durStr,
        meta: formatSecToHMSHelper(expectedTotalSec),
        resultado: isWithinMeta ? 'Dentro da Meta' : 'Fora da Meta',
        operador: op,
        _criadoEm: dateObj.toISOString()
      });
    }
  }
  
  return list.sort((a, b) => b.dataISO.localeCompare(a.dataISO) || b.inicio.localeCompare(a.inicio));
};

const generateSeedActionPlans = (empresaId: string): RepackActionPlan[] => {
  return [
    {
      _docId: 'seed-ap-1',
      empresaId: empresaId,
      descricao: 'Treinamento prático de reembalagem rápida para Lata 350ml visando reduzir tempo médio de 04:30 para 04:00.',
      causaRaiz4M: 'Mão de Obra',
      responsavel: 'Matheus Barbosa',
      prazo: '15/07/2026',
      status: 'Em Andamento',
      dataCriacaoISO: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString().split('T')[0],
      _criadoEm: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString()
    },
    {
      _docId: 'seed-ap-2',
      empresaId: empresaId,
      descricao: 'Substituição das caixas organizadoras danificadas na bancada de reembalagem do corredor 4.',
      causaRaiz4M: 'Material',
      responsavel: 'Ozenildo Silva',
      prazo: '10/07/2026',
      status: 'Pendente',
      dataCriacaoISO: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString().split('T')[0],
      _criadoEm: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString()
    },
    {
      _docId: 'seed-ap-3',
      empresaId: empresaId,
      descricao: 'Padronização do checklist de inspeção de paletes retrabalhados de PET 2L (Procedimento VPO 14).',
      causaRaiz4M: 'Método',
      responsavel: 'Paulo Pereira',
      prazo: '05/07/2026',
      status: 'Concluído',
      dataCriacaoISO: new Date(Date.now() - 8 * 24 * 3600 * 1000).toISOString().split('T')[0],
      _criadoEm: new Date(Date.now() - 8 * 24 * 3600 * 1000).toISOString()
    }
  ];
};

// Colors scheme matching the platform design templates
const COLORS = {
  bg: '#07090d',      // var(--ink)
  card: '#0f1318',    // var(--surf)
  hover: '#151b23',   // var(--surf2)
  azul: '#f5a623',    // var(--amber) - Amber platform color
  verde: '#22c55e',   // var(--green)
  amarelo: '#eab308', // var(--yellow)
  roxo: '#8b5cf6',    // var(--purple)
  vermelho: '#ef4444',// var(--red)
  cinza: '#6a7d92'    // var(--dim)
};

const PIE_COLORS = [COLORS.azul, COLORS.verde, COLORS.amarelo, COLORS.roxo, COLORS.vermelho];

export default function RepackDashboard({ user, empresa, onBack }: RepackDashboardProps) {
  const [activeSubTab, setActiveSubTab] = useState<'produtividade' | 'planos'>('produtividade');
  const [actualRepackRows, setActualRepackRows] = useState<RepackRow[]>([]);
  const [actualActionPlans, setActualActionPlans] = useState<RepackActionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);

  const seedRows = useMemo(() => {
    return generateSeedRepackRows(empresa?.id || 'demo');
  }, [empresa?.id]);

  const seedActionPlans = useMemo(() => {
    return generateSeedActionPlans(empresa?.id || 'demo');
  }, [empresa?.id]);

  const repackRows = useMemo(() => {
    if (actualRepackRows.length === 0) {
      return seedRows;
    }
    return actualRepackRows;
  }, [actualRepackRows, seedRows]);

  const actionPlans = useMemo(() => {
    if (actualActionPlans.length === 0) {
      return seedActionPlans;
    }
    return actualActionPlans;
  }, [actualActionPlans, seedActionPlans]);

  // Filters State
  const [filterColaborador, setFilterColaborador] = useState('todos');
  const [filterEmbalagem, setFilterEmbalagem] = useState('todos');
  const [filterPeriodo, setFilterPeriodo] = useState<'hoje' | 'semana' | 'mes' | 'personalizado'>('semana');
  const [filterDataInicio, setFilterDataInicio] = useState('');
  const [filterDataFim, setFilterDataFim] = useState('');
  const [filterHoraInicio, setFilterHoraInicio] = useState('00:00');
  const [filterHoraFim, setFilterHoraFim] = useState('23:59');

  // Active filters (applied after click)
  const [activeColaborador, setActiveColaborador] = useState('todos');
  const [activeEmbalagem, setActiveEmbalagem] = useState('todos');
  const [activePeriodo, setActivePeriodo] = useState<'hoje' | 'semana' | 'mes' | 'personalizado'>('semana');
  const [activeDataInicio, setActiveDataInicio] = useState('');
  const [activeDataFim, setActiveDataFim] = useState('');
  const [activeHoraInicio, setActiveHoraInicio] = useState('00:00');
  const [activeHoraFim, setActiveHoraFim] = useState('23:59');

  // Search & Pagination in Linha 7 Table
  const [tableSearch, setTableSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Selected Row for calculations panel
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);

  // New Record Form / Stopwatch Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formEmbalagem, setFormEmbalagem] = useState('LATA 250');
  const [formQuantidade, setFormQuantidade] = useState<number>(10);
  const [formInicio, setFormInicio] = useState('');
  const [formFim, setFormFim] = useState('');
  const [formOperador, setFormOperador] = useState(user.nome || 'Operador');
  const [timerActive, setTimerActive] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);

  // Action Plans form
  const [apDesc, setApDesc] = useState('');
  const [apCausa, setApCausa] = useState<'Método' | 'Mão de Obra' | 'Máquina' | 'Material'>('Método');
  const [apResp, setApResp] = useState('');
  const [apPrazo, setApPrazo] = useState('');

  // Clock state
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('pt-BR') + ' - ' + now.toLocaleDateString('pt-BR'));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Timer loop
  useEffect(() => {
    let interval: any = null;
    if (timerActive) {
      interval = setInterval(() => {
        setTimerSeconds(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [timerActive]);

  const timeToSec = (hms: string): number => {
    if (!hms) return 0;
    const parts = hms.split(':').map(Number);
    if (parts.length === 2) return (parts[0] * 3600) + (parts[1] * 60);
    if (parts.length === 3) return (parts[0] * 3600) + (parts[1] * 60) + parts[2];
    return 0;
  };

  const formatSecToHMS = (tot: number): string => {
    const h = Math.floor(tot / 3600);
    const m = Math.floor((tot % 3600) / 60);
    const s = tot % 60;
    return [h, m, s].map(v => v < 10 ? '0' + v : v).join(':');
  };

  const todayISO = useMemo(() => new Date().toISOString().split('T')[0], []);
  
  const getDaysAgoISO = (days: number): string => {
    const d = new Date();
    d.setDate(d.getDate() - days);
    return d.toISOString().split('T')[0];
  };

  // Fetch Firestore entries
  useEffect(() => {
    const companyId = empresa?.id || 'demo';
    const q = query(collection(db, 'repack'));
    const unsub = onSnapshot(q, (snap) => {
      const rows = snap.docs.map(docSnap => ({
        _docId: docSnap.id,
        ...docSnap.data()
      } as RepackRow));
      rows.sort((a, b) => (b.dataISO || '').localeCompare(a.dataISO || '') || (b.inicio || '').localeCompare(a.inicio || ''));
      const filtered = isCustomFirebaseConnected() ? rows : rows.filter(r => r.empresaId === companyId);
      setActualRepackRows(filtered);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });
    return () => unsub();
  }, [empresa?.id]);

  // Fetch Action Plans
  useEffect(() => {
    const q = query(collection(db, 'repack_action_plans'));
    const unsub = onSnapshot(q, (snap) => {
      const plans = snap.docs.map(docSnap => ({
        _docId: docSnap.id,
        ...docSnap.data()
      } as RepackActionPlan));
      plans.sort((a, b) => (b.dataCriacaoISO || '').localeCompare(a.dataCriacaoISO || ''));
      setActualActionPlans(plans);
    });
    return () => unsub();
  }, []);

  const distinctOperadores = useMemo(() => {
    const ops = new Set<string>();
    repackRows.forEach(r => { if (r.operador) ops.add(r.operador); });
    return Array.from(ops).sort();
  }, [repackRows]);

  // Active filtered rows
  const filteredRows = useMemo(() => {
    return repackRows.filter(row => {
      if (activeColaborador !== 'todos' && row.operador !== activeColaborador) return false;
      if (activeEmbalagem !== 'todos' && row.embalagem !== activeEmbalagem) return false;
      
      if (activePeriodo === 'hoje') {
        if (row.dataISO !== todayISO) return false;
      } else if (activePeriodo === 'semana') {
        if (row.dataISO < getDaysAgoISO(7)) return false;
      } else if (activePeriodo === 'mes') {
        if (row.dataISO < getDaysAgoISO(30)) return false;
      } else if (activePeriodo === 'personalizado') {
        if (activeDataInicio && row.dataISO < activeDataInicio) return false;
        if (activeDataFim && row.dataISO > activeDataFim) return false;
      }

      if (row.inicio) {
        const h = row.inicio.substring(0, 5);
        if (h < activeHoraInicio || h > activeHoraFim) return false;
      }
      return true;
    });
  }, [repackRows, activeColaborador, activeEmbalagem, activePeriodo, activeDataInicio, activeDataFim, activeHoraInicio, activeHoraFim, todayISO]);

  // Calculations for KPIs
  const totalCaixas = useMemo(() => {
    return filteredRows.reduce((sum, r) => sum + (Number(r.quantidade) || 0), 0);
  }, [filteredRows]);

  const totalTempoGastoSec = useMemo(() => {
    return filteredRows.reduce((sum, r) => sum + timeToSec(r.duracao), 0);
  }, [filteredRows]);

  const tempoMedioPorCaixaSec = useMemo(() => {
    if (totalCaixas === 0) return 0;
    return Math.round(totalTempoGastoSec / totalCaixas);
  }, [totalTempoGastoSec, totalCaixas]);

  const tempoMedioPorCaixaStr = useMemo(() => formatSecToHMS(tempoMedioPorCaixaSec), [tempoMedioPorCaixaSec]);

  const produtividadeCxHora = useMemo(() => {
    if (totalTempoGastoSec === 0) return 0;
    return Math.round((totalCaixas / (totalTempoGastoSec / 3600)) * 10) / 10;
  }, [totalCaixas, totalTempoGastoSec]);

  const totalTempoEsperadoSec = useMemo(() => {
    return filteredRows.reduce((sum, r) => {
      const metaUnit = EMBALAGENS_CONFIG[r.embalagem]?.metaSec || 240;
      return sum + (metaUnit * (Number(r.quantidade) || 1));
    }, 0);
  }, [filteredRows]);

  const eficienciaMedia = useMemo(() => {
    if (totalTempoGastoSec === 0) return 0;
    return Math.round((totalTempoEsperadoSec / totalTempoGastoSec) * 100);
  }, [totalTempoEsperadoSec, totalTempoGastoSec]);

  // Chart 1: Produtividade por Dia
  const chartProdutividadeDia = useMemo(() => {
    const days = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex'];
    const values = [0, 0, 0, 0, 0];
    filteredRows.forEach(r => {
      if (r.dataISO) {
        const d = new Date(r.dataISO + 'T00:00:00').getDay();
        if (d >= 1 && d <= 5) values[d - 1] += Number(r.quantidade) || 0;
      }
    });
    if (values.every(v => v === 0)) {
      return [
        { name: 'Seg', Caixas: 22 },
        { name: 'Ter', Caixas: 25 },
        { name: 'Qua', Caixas: 27 },
        { name: 'Qui', Caixas: 31 },
        { name: 'Sex', Caixas: 30 }
      ];
    }
    return days.map((day, idx) => ({ name: day, Caixas: values[idx] }));
  }, [filteredRows]);

  // Chart 2: Tempo Médio por Dia
  const chartTempoMedioDia = useMemo(() => {
    const days = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex'];
    const seconds = [0, 0, 0, 0, 0];
    const counts = [0, 0, 0, 0, 0];
    filteredRows.forEach(r => {
      if (r.dataISO) {
        const d = new Date(r.dataISO + 'T00:00:00').getDay();
        if (d >= 1 && d <= 5) {
          seconds[d - 1] += timeToSec(r.duracao);
          counts[d - 1] += Number(r.quantidade) || 1;
        }
      }
    });
    if (counts.every(c => c === 0)) {
      return [
        { name: 'Seg', Minutos: 4.5 },
        { name: 'Ter', Minutos: 4.35 },
        { name: 'Qua', Minutos: 4.2 },
        { name: 'Qui', Minutos: 4.1 },
        { name: 'Sex', Minutos: 4.05 }
      ];
    }
    return days.map((day, idx) => {
      const avgMin = counts[idx] > 0 ? (seconds[idx] / counts[idx]) / 60 : 0;
      return { name: day, Minutos: parseFloat(avgMin.toFixed(2)) };
    });
  }, [filteredRows]);

  // Ranking Embalagens
  const chartRankingEmbalagens = useMemo(() => {
    const map: Record<string, number> = {};
    filteredRows.forEach(r => { map[r.embalagem] = (map[r.embalagem] || 0) + (Number(r.quantidade) || 0); });
    const sorted = Object.entries(map).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
    if (sorted.length === 0) {
      return [
        { name: 'PET 500ml', value: 148 },
        { name: 'Lata 250ml', value: 124 },
        { name: 'PET 2L', value: 86 },
        { name: 'Lata 473ml', value: 62 },
        { name: '300 OW', value: 36 }
      ];
    }
    return sorted.slice(0, 5);
  }, [filteredRows]);

  // Comparativo Meta x Real (caixas)
  const chartComparativoMetaReal = useMemo(() => {
    const map: Record<string, { meta: number; real: number }> = {};
    filteredRows.forEach(r => {
      if (!map[r.embalagem]) map[r.embalagem] = { meta: 0, real: 0 };
      const unitMeta = EMBALAGENS_CONFIG[r.embalagem]?.metaSec || 240;
      map[r.embalagem].meta += unitMeta * (Number(r.quantidade) || 1);
      map[r.embalagem].real += timeToSec(r.duracao);
    });
    const result = Object.entries(map).map(([name, v]) => ({
      name,
      Meta: Math.round(v.meta / 60),
      Real: Math.round(v.real / 60)
    }));
    if (result.length === 0) {
      return [
        { name: 'Lata 250', Meta: 100, Real: 85 },
        { name: 'PET 500ml', Meta: 100, Real: 120 }
      ];
    }
    return result.slice(0, 4);
  }, [filteredRows]);

  // Heatmap static mock / real matrix
  const heatmapData = useMemo(() => {
    return {
      '08h': { SEG: 'green', TER: 'green', QUA: 'green', QUI: 'green', SEX: 'yellow' },
      '09h': { SEG: 'green', TER: 'green', QUA: 'yellow', QUI: 'green', SEX: 'red' },
      '10h': { SEG: 'green', TER: 'green', QUA: 'green', QUI: 'green', SEX: 'red' },
      '11h': { SEG: 'red', TER: 'yellow', QUA: 'yellow', QUI: 'yellow', SEX: 'yellow' },
      '12h': { SEG: 'yellow', TER: 'yellow', QUA: 'yellow', QUI: 'green', SEX: 'red' }
    };
  }, []);

  // Distribuição do Trabalho Pizza
  const chartDistribuicaoTrabalho = useMemo(() => {
    const map: Record<string, number> = {};
    filteredRows.forEach(r => { map[r.embalagem] = (map[r.embalagem] || 0) + (Number(r.quantidade) || 0); });
    const entries = Object.entries(map).map(([name, value]) => ({ name, value }));
    if (entries.length === 0) {
      return [
        { name: 'Lata 250', value: 40 },
        { name: 'PET 500ml', value: 25 },
        { name: 'PET 2L', value: 15 },
        { name: 'Lata 473', value: 12 },
        { name: 'Outros', value: 8 }
      ];
    }
    const tot = entries.reduce((s, e) => s + e.value, 0);
    return entries.map(e => ({ name: e.name, value: Math.round((e.value / tot) * 100) }));
  }, [filteredRows]);

  // Evolução Semanal Eficiência
  const chartEvolucaoSemanal = [
    { name: 'S1', Eficiencia: 100 },
    { name: 'S2', Eficiencia: 105 },
    { name: 'S3', Eficiencia: 110 },
    { name: 'S4', Eficiencia: 115 },
    { name: 'S5', Eficiencia: 120 }
  ];

  // Table paging and filtering
  const tableFilteredRows = useMemo(() => {
    return filteredRows.filter(r => {
      const term = tableSearch.toLowerCase();
      return (
        r.embalagem.toLowerCase().includes(term) ||
        (r.operador || '').toLowerCase().includes(term) ||
        (r.resultado || '').toLowerCase().includes(term)
      );
    });
  }, [filteredRows, tableSearch]);

  const totalPages = Math.ceil(tableFilteredRows.length / itemsPerPage) || 1;
  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return tableFilteredRows.slice(start, start + itemsPerPage);
  }, [tableFilteredRows, currentPage]);

  // Active calculations based on selected row or average
  const selectedRowDetails = useMemo(() => {
    const r = repackRows.find(x => x._docId === selectedRowId) || paginatedRows[0] || null;
    if (!r) return null;
    const unitMeta = EMBALAGENS_CONFIG[r.embalagem]?.metaSec || 240;
    const expectedSec = unitMeta * (Number(r.quantidade) || 1);
    const spentSec = timeToSec(r.duracao);
    const diffSec = expectedSec - spentSec;
    const eff = spentSec > 0 ? Math.round((expectedSec / spentSec) * 100) : 100;
    const cxH = spentSec > 0 ? Math.round(((Number(r.quantidade) || 0) / (spentSec / 3600)) * 10) / 10 : 0;
    const mediaUnit = spentSec > 0 ? formatSecToHMS(Math.round(spentSec / (Number(r.quantidade) || 1))) : '—';

    return {
      row: r,
      expected: formatSecToHMS(expectedSec),
      spent: r.duracao,
      diff: formatSecToHMS(Math.abs(diffSec)),
      diffPositive: diffSec >= 0,
      efficiency: eff,
      caixasHora: cxH,
      tempoMedioUnit: mediaUnit
    };
  }, [repackRows, selectedRowId, paginatedRows]);

  // Register Production Submit
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formInicio || !formFim) {
      alert('Selecione os horários inicial e final');
      return;
    }
    const today = new Date();
    const activeMeta = EMBALAGENS_CONFIG[formEmbalagem]?.metaSec || 240;
    const totalMetaSec = activeMeta * formQuantidade;
    const durSec = timeToSec(formFim) - timeToSec(formInicio);
    const spentSec = durSec < 0 ? durSec + 86400 : durSec;
    const result = spentSec <= totalMetaSec ? 'Dentro da meta' : 'Abaixo da meta';

    const newEntry: Omit<RepackRow, '_docId'> = {
      empresaId: empresa?.id || 'demo',
      data: today.toLocaleDateString('pt-BR'),
      dataISO: today.toISOString().split('T')[0],
      embalagem: formEmbalagem,
      quantidade: formQuantidade,
      inicio: formInicio,
      fim: formFim,
      duracao: formatSecToHMS(spentSec),
      meta: formatSecToHMS(totalMetaSec),
      resultado: result,
      operador: formOperador,
      _criadoEm: today.toISOString()
    };

    try {
      await addDoc(collection(db, 'repack'), newEntry);
      setIsModalOpen(false);
      setFormInicio('');
      setFormFim('');
      setFormQuantidade(10);
      setTimerSeconds(0);
      setTimerActive(false);
    } catch(err) {
      console.error(err);
    }
  };

  const handleStartStopwatch = () => {
    const hhmm = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    setFormInicio(hhmm);
    setTimerSeconds(0);
    setTimerActive(true);
  };

  const handleStopStopwatch = () => {
    const hhmm = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    setFormFim(hhmm);
    setTimerActive(false);
  };

  const handleDeleteRow = async (id: string) => {
    if (!window.confirm('Excluir este registro permanentemente?')) return;
    try {
      await deleteDoc(doc(db, 'repack', id));
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apDesc || !apResp || !apPrazo) return;
    const today = new Date();
    const newPlan: Omit<RepackActionPlan, '_docId'> = {
      dataCriacao: today.toLocaleDateString('pt-BR'),
      dataCriacaoISO: today.toISOString().split('T')[0],
      descricao: apDesc,
      causaRaiz4M: apCausa,
      responsavel: apResp,
      prazo: apPrazo,
      status: 'Pendente',
      _criadoEm: today.toISOString()
    };
    try {
      await addDoc(collection(db, 'repack_action_plans'), newPlan);
      setApDesc('');
      setApResp('');
      setApPrazo('');
    } catch (e) {
      console.error(e);
    }
  };

  const handleChangeApStatus = async (id: string, next: 'Pendente' | 'Em Andamento' | 'Concluído') => {
    try {
      await updateDoc(doc(db, 'repack_action_plans', id), { status: next });
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteAp = async (id: string) => {
    if (!window.confirm('Deletar plano de ação?')) return;
    try {
      await deleteDoc(doc(db, 'repack_action_plans', id));
    } catch (e) {
      console.error(e);
    }
  };

  const handleApplyFilters = () => {
    setActiveColaborador(filterColaborador);
    setActiveEmbalagem(filterEmbalagem);
    setActivePeriodo(filterPeriodo);
    setActiveDataInicio(filterDataInicio);
    setActiveDataFim(filterDataFim);
    setActiveHoraInicio(filterHoraInicio);
    setActiveHoraFim(filterHoraFim);
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setFilterColaborador('todos');
    setFilterEmbalagem('todos');
    setFilterPeriodo('semana');
    setFilterDataInicio('');
    setFilterDataFim('');
    setFilterHoraInicio('00:00');
    setFilterHoraFim('23:59');

    setActiveColaborador('todos');
    setActiveEmbalagem('todos');
    setActivePeriodo('semana');
    setActiveDataInicio('');
    setActiveDataFim('');
    setActiveHoraInicio('00:00');
    setActiveHoraFim('23:59');
    setCurrentPage(1);
  };

  const handleExportXLSX = () => {
    const data = filteredRows.map(r => ({
      'Data': r.data,
      'Colaborador': r.operador || '—',
      'Embalagem': r.embalagem,
      'Quantidade': r.quantidade,
      'Hora Inicial': r.inicio,
      'Hora Final': r.fim,
      'Duração': r.duracao,
      'Resultado': r.resultado
    }));
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, 'Repack');
    XLSX.writeFile(wb, 'Produtividade_Repack.xlsx');
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, 210, 30, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('REPAD DASHBOARD - PRODUTIVIDADE', 14, 18);
    doc.setFontSize(9);
    doc.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, 14, 25);
    
    let y = 40;
    doc.setTextColor(0, 0, 0);
    doc.text('HISTÓRICO DE LANÇAMENTOS', 14, y);
    y += 10;
    
    filteredRows.slice(0, 30).forEach(r => {
      doc.text(`${r.data} - ${r.operador || '—'} - ${r.embalagem} - ${r.quantidade}un - ${r.duracao} [${r.resultado}]`, 14, y);
      y += 6;
    });
    doc.save('Relatorio_Repack.pdf');
  };

  return (
    <div className="w-full bg-[#f8fafc] min-h-screen text-[#0f172a] p-6 rounded-2xl shadow-sm border border-gray-200/80 relative">

      {/* ── BARRA SUPERIOR (70px) ── */}
      <header className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 border-b border-gray-200 pb-5 mb-5">
        <div className="flex items-center gap-3">
          {onBack && (
            <button 
              onClick={onBack}
              className="p-1.5 hover:bg-gray-200/80 rounded-lg transition-colors cursor-pointer text-gray-500 border-none bg-transparent"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-xl shadow-[0_0_20px_rgba(245,166,35,0.25)]">
            📦
          </div>
          <div>
            <h1 className="font-sans font-black text-2xl tracking-tight text-[#032b5e] uppercase">
              PRODUTIVIDADE DO REPACK
            </h1>
            <p className="text-[10px] text-gray-500 tracking-wider font-bold uppercase mt-0.5">
              INDICADORES ESTRATÉGICOS, METAS DE DESEMPENHO E CRONOMETRAGEM DE REEMBALAGEM
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center bg-gray-100 p-1 rounded-xl border border-gray-200/60">
            <button 
              onClick={() => setActiveSubTab('produtividade')}
              className={`px-4 py-1.5 rounded-lg font-sans font-bold text-[10px] uppercase tracking-wider transition-all border-none cursor-pointer ${activeSubTab === 'produtividade' ? 'bg-[#032b5e] text-white shadow-sm' : 'text-gray-500 hover:text-[#032b5e] bg-transparent'}`}
            >
              Produtividade & BI
            </button>
            <button 
              onClick={() => setActiveSubTab('planos')}
              className={`px-4 py-1.5 rounded-lg font-sans font-bold text-[10px] uppercase tracking-wider transition-all border-none cursor-pointer ${activeSubTab === 'planos' ? 'bg-[#032b5e] text-white shadow-sm' : 'text-gray-500 hover:text-[#032b5e] bg-transparent'}`}
            >
              Planos de Ação VPO
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs text-gray-500 bg-white px-3 py-1.5 rounded-xl border border-gray-200 shadow-sm font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>{currentTime || 'Sincronizando...'}</span>
          </div>
        </div>
      </header>

      {activeSubTab === 'produtividade' && (
        <div className="space-y-6">
          
          {/* ── LINHA DE FILTROS (70px) ── */}
          <section className="bg-white border border-gray-200 p-4 rounded-xl flex flex-wrap items-center justify-between gap-4 shadow-sm">
            <div className="flex flex-wrap items-center gap-4">
              {/* Colaborador */}
              <div className="flex flex-col gap-1 w-[180px]">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Colaborador</label>
                <select
                  value={filterColaborador}
                  onChange={(e) => setFilterColaborador(e.target.value)}
                  className="bg-white border border-gray-200 text-slate-800 text-xs rounded-lg p-2 focus:border-[#032b5e] outline-none"
                >
                  <option value="todos">Todos Colaboradores</option>
                  {distinctOperadores.map(op => (
                    <option key={op} value={op}>{op}</option>
                  ))}
                </select>
              </div>

              {/* Embalagem */}
              <div className="flex flex-col gap-1 w-[180px]">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Embalagem</label>
                <select
                  value={filterEmbalagem}
                  onChange={(e) => setFilterEmbalagem(e.target.value)}
                  className="bg-white border border-gray-200 text-slate-800 text-xs rounded-lg p-2 focus:border-[#032b5e] outline-none"
                >
                  <option value="todos">Todas Embalagens</option>
                  {Object.keys(EMBALAGENS_CONFIG).map(k => (
                    <option key={k} value={k}>{k}</option>
                  ))}
                </select>
              </div>

              {/* Período */}
              <div className="flex flex-col gap-1 w-[180px]">
                <label className="text-[11px] font-bold text-[var(--dim)] uppercase">Período</label>
                <select
                  value={filterPeriodo}
                  onChange={(e) => setFilterPeriodo(e.target.value as any)}
                  className="bg-white border border-gray-200 text-slate-800 text-xs rounded-lg p-2 focus:border-[#032b5e] outline-none"
                >
                  <option value="hoje">Hoje</option>
                  <option value="semana">Semana</option>
                  <option value="mes">Mês</option>
                  <option value="personalizado">Personalizado</option>
                </select>
              </div>

              {/* Custom Date Inputs */}
              {filterPeriodo === 'personalizado' && (
                <div className="flex items-center gap-2">
                  <div className="flex flex-col gap-1 w-[130px]">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Data Inicial</label>
                    <input
                      type="date"
                      value={filterDataInicio}
                      onChange={(e) => setFilterDataInicio(e.target.value)}
                      className="bg-white border border-gray-200 text-slate-800 text-xs rounded-lg p-2"
                    />
                  </div>
                  <div className="flex flex-col gap-1 w-[130px]">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Data Final</label>
                    <input
                      type="date"
                      value={filterDataFim}
                      onChange={(e) => setFilterDataFim(e.target.value)}
                      className="bg-white border border-gray-200 text-slate-800 text-xs rounded-lg p-2"
                    />
                  </div>
                </div>
              )}

              {/* Horário inputs */}
              <div className="flex items-center gap-2">
                <div className="flex flex-col gap-1 w-[80px]">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Início</label>
                  <input
                    type="text"
                    placeholder="00:00"
                    value={filterHoraInicio}
                    onChange={(e) => setFilterHoraInicio(e.target.value)}
                    className="bg-white border border-gray-200 text-slate-800 text-xs rounded-lg p-2 font-mono text-center outline-none focus:border-[#032b5e]"
                  />
                </div>
                <div className="flex flex-col gap-1 w-[80px]">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Fim</label>
                  <input
                    type="text"
                    placeholder="23:59"
                    value={filterHoraFim}
                    onChange={(e) => setFilterHoraFim(e.target.value)}
                    className="bg-white border border-gray-200 text-slate-800 text-xs rounded-lg p-2 font-mono text-center outline-none focus:border-[#032b5e]"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleApplyFilters}
                className="w-[170px] h-[40px] bg-[#032b5e] hover:bg-[#021f44] text-white font-sans font-bold rounded-lg text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all border-none"
              >
                <SlidersHorizontal className="w-4 h-4" />
                Aplicar Filtros
              </button>
              <button
                onClick={handleClearFilters}
                className="w-[120px] h-[40px] border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-sans font-bold rounded-lg text-xs uppercase tracking-wider cursor-pointer transition-all"
              >
                Limpar Filtros
              </button>
            </div>
          </section>

          {/* ── LINHA 1: KPIs (4 Cards) ── */}
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* KPI 1: Caixas */}
            <div className="bg-white p-5 rounded-xl border border-gray-200 flex flex-col justify-between shadow-sm hover:border-[#f5a623]/50 transition-all duration-300">
              <div className="flex justify-between items-start">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">📦 Caixas</span>
                  <span className="text-3xl font-extrabold text-[#032b5e] mt-1">{totalCaixas}</span>
                  <span className="text-[10px] text-gray-400 mt-0.5 font-bold uppercase">Total no período</span>
                </div>
                <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500">
                  <Box className="w-5 h-5" />
                </div>
              </div>
              <div className="h-10 w-full mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartProdutividadeDia}>
                    <Area type="monotone" dataKey="Caixas" stroke="#f5a623" fill="rgba(245,166,35,0.08)" strokeWidth={1.5} dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* KPI 2: Tempo Médio */}
            <div className="bg-white p-5 rounded-xl border border-gray-200 flex flex-col justify-between shadow-sm hover:border-emerald-500/50 transition-all duration-300">
              <div className="flex justify-between items-start">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">⏱ Tempo Médio</span>
                  <span className="text-3xl font-extrabold text-[#032b5e] mt-1 font-mono">{tempoMedioPorCaixaStr}</span>
                  <span className="text-[10px] text-gray-400 mt-0.5 font-bold uppercase">Por caixa</span>
                </div>
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                  <Clock className="w-5 h-5" />
                </div>
              </div>
              <div className="h-10 w-full mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartTempoMedioDia}>
                    <Area type="monotone" dataKey="Minutos" stroke="#22c55e" fill="rgba(34,197,94,0.08)" strokeWidth={1.5} dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* KPI 3: Produtividade */}
            <div className="bg-white p-5 rounded-xl border border-gray-200 flex flex-col justify-between shadow-sm hover:border-amber-500/50 transition-all duration-300">
              <div className="flex justify-between items-start">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">⚡ Produtividade</span>
                  <span className="text-3xl font-extrabold text-[#f5a623] mt-1 font-mono">{produtividadeCxHora} cx/h</span>
                  <span className="text-[10px] text-gray-400 mt-0.5 font-bold uppercase">Caixas por hora</span>
                </div>
                <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500">
                  <Zap className="w-5 h-5" />
                </div>
              </div>
              <div className="h-10 w-full mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartProdutividadeDia}>
                    <Area type="monotone" dataKey="Caixas" stroke="#f5a623" fill="rgba(245,166,35,0.08)" strokeWidth={1.5} dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* KPI 4: Eficiência */}
            <div className="bg-white p-5 rounded-xl border border-gray-200 flex flex-col justify-between shadow-sm hover:border-purple-500/50 transition-all duration-300">
              <div className="flex justify-between items-start">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">🎯 Eficiência</span>
                  <span className="text-3xl font-extrabold text-[#032b5e] mt-1">{eficienciaMedia}%</span>
                  <span className={`text-[10px] mt-0.5 font-bold uppercase ${eficienciaMedia >= 100 ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {eficienciaMedia >= 100 ? 'Acima da meta' : 'Abaixo da meta'}
                  </span>
                </div>
                <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-500">
                  <Target className="w-5 h-5" />
                </div>
              </div>
              <div className="h-10 w-full mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartProdutividadeDia}>
                    <Area type="monotone" dataKey="Caixas" stroke="#8b5cf6" fill="rgba(139,92,246,0.08)" strokeWidth={1.5} dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </section>

          {/* ── LINHA 2: GRID 2x2 (Produtividade por dia | Tempo médio) ── */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Produtividade por dia */}
            <div className="bg-white border border-gray-200 p-5 rounded-xl shadow-sm">
              <h3 className="font-sans font-black text-xs uppercase text-[#032b5e] tracking-wider mb-3">Produtividade por Dia</h3>
              <div className="h-[260px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartProdutividadeDia}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    <XAxis dataKey="name" stroke="#94a3b8" tickLine={false} />
                    <YAxis stroke="#94a3b8" tickLine={false} />
                    <Tooltip cursor={{ fill: 'rgba(245,166,35,0.03)' }} contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', color: '#1e293b' }} />
                    <Bar dataKey="Caixas" fill="#f5a623" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Tempo médio gasto por dia */}
            <div className="bg-white border border-gray-200 p-5 rounded-xl shadow-sm">
              <h3 className="font-sans font-black text-xs uppercase text-[#032b5e] tracking-wider mb-3">Tempo médio gasto por dia</h3>
              <div className="h-[260px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartTempoMedioDia}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    <XAxis dataKey="name" stroke="#94a3b8" tickLine={false} />
                    <YAxis stroke="#94a3b8" tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', color: '#1e293b' }} />
                    <Line type="monotone" dataKey="Minutos" stroke="#22c55e" strokeWidth={3} dot={{ r: 5, stroke: '#22c55e', strokeWidth: 2, fill: '#ffffff' }} activeDot={{ r: 7 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </section>

          {/* ── LINHA 3: GAUGE | FORMULA | RANKING EMBALAGENS ── */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Circular Gauge */}
            <div className="bg-white border border-gray-200 p-5 rounded-xl lg:col-span-4 flex flex-col justify-between items-center relative shadow-sm min-h-[300px]">
              <h3 className="font-sans font-black text-xs uppercase text-[#032b5e] tracking-wider w-full">Eficiência</h3>
              <div className="relative w-full h-[180px] flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { value: Math.min(eficienciaMedia, 150) },
                        { value: Math.max(0, 150 - eficienciaMedia) }
                      ]}
                      startAngle={180}
                      endAngle={0}
                      innerRadius={65}
                      outerRadius={85}
                      paddingAngle={0}
                      dataKey="value"
                    >
                      <Cell fill={eficienciaMedia >= 100 ? COLORS.verde : eficienciaMedia >= 80 ? COLORS.amarelo : COLORS.vermelho} />
                      <Cell fill="#f1f5f9" />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pt-8">
                  <span className="text-4xl font-extrabold text-[#032b5e]">{eficienciaMedia}%</span>
                  <span className="text-[10px] text-gray-400 font-bold uppercase mt-1">Eficiência Geral</span>
                </div>
              </div>
              <div className="flex justify-between w-full text-[10px] text-gray-400 font-bold uppercase px-2 mt-2 border-t border-gray-100 pt-2">
                <span>0%</span>
                <span className="text-emerald-500">Excelente</span>
                <span>150%</span>
              </div>
            </div>

            {/* Formula Card */}
            <div className="bg-white border border-gray-200 p-5 rounded-xl lg:col-span-3 flex flex-col justify-between shadow-sm min-h-[300px]">
              <div>
                <h3 className="font-sans font-black text-xs uppercase text-[#032b5e] tracking-wider mb-2">Fórmula</h3>
                <div className="p-3 bg-slate-50 border border-gray-100 rounded-xl text-center">
                  <span className="font-mono text-xs block text-amber-600 font-extrabold">Eficiência =</span>
                  <span className="font-mono text-[10px] block text-gray-400 mt-1 leading-normal uppercase font-bold">
                    (Tempo Esperado / Tempo Gasto) × 100
                  </span>
                </div>
              </div>
              <div className="mt-2 border-t border-gray-100 pt-3 space-y-1.5 text-xs text-gray-500">
                <div className="flex justify-between">
                  <span>Ex: Meta:</span>
                  <span className="font-mono font-bold">4:30</span>
                </div>
                <div className="flex justify-between">
                  <span>Gasto:</span>
                  <span className="font-mono font-bold">4:00</span>
                </div>
                <div className="flex justify-between font-bold text-emerald-500">
                  <span>Resultado:</span>
                  <span className="font-mono">112%</span>
                </div>
                <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-center rounded-lg font-bold text-[11px] mt-1 uppercase">
                  Acima de 100% = Excelente!
                </div>
              </div>
            </div>

            {/* Ranking Embalagens */}
            <div className="bg-white border border-gray-200 p-5 rounded-xl lg:col-span-5 flex flex-col justify-between shadow-sm min-h-[300px]">
              <h3 className="font-sans font-black text-xs uppercase text-[#032b5e] tracking-wider">Ranking das Embalagens <span className="text-[10px] text-gray-400 font-normal normal-case">(por caixas)</span></h3>
              <div className="h-[210px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart layout="vertical" data={chartRankingEmbalagens} margin={{ left: -10, right: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                    <XAxis type="number" stroke="#94a3b8" tickLine={false} />
                    <YAxis dataKey="name" type="category" stroke="#94a3b8" tickLine={false} width={80} fontSize={10} />
                    <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', color: '#1e293b' }} />
                    <Bar dataKey="value" fill="#f5a623" radius={[0, 4, 4, 0]} barSize={12} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </section>

          {/* ── LINHA 4: COMPARATIVO META x REAL | HEATMAP ── */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Comparativo Meta x Real */}
            <div className="bg-white border border-gray-200 p-5 rounded-xl shadow-sm">
              <h3 className="font-sans font-black text-xs uppercase text-[#032b5e] tracking-wider mb-2">Comparativo Meta x Real <span className="text-[10px] text-gray-400 font-normal normal-case">(caixas)</span></h3>
              <div className="h-[220px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartComparativoMetaReal}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    <XAxis dataKey="name" stroke="#94a3b8" tickLine={false} />
                    <YAxis stroke="#94a3b8" tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', color: '#1e293b' }} />
                    <Bar dataKey="Meta" fill="#f5a623" radius={[3, 3, 0, 0]} />
                    <Bar dataKey="Real" fill="#22c55e" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Heatmap de Produtividade */}
            <div className="bg-white border border-gray-200 p-5 rounded-xl shadow-sm flex flex-col justify-between">
              <h3 className="font-sans font-black text-xs uppercase text-[#032b5e] tracking-wider">Heatmap de Produtividade <span className="text-[10px] text-gray-400 font-normal normal-case">(caixas por hora)</span></h3>
              
              <div className="grid grid-cols-6 gap-2 mt-4 text-center">
                <div />
                {['SEG', 'TER', 'QUA', 'QUI', 'SEX'].map(d => (
                  <span key={d} className="text-[10px] font-black text-gray-400 uppercase tracking-wider">{d}</span>
                ))}

                {Object.entries(heatmapData).map(([hour, daysMap]) => (
                  <React.Fragment key={hour}>
                    <span className="text-xs font-bold text-gray-500 self-center">{hour}</span>
                    {Object.entries(daysMap).map(([day, level]) => (
                      <div key={day} className="flex justify-center py-2">
                        <span className={`w-4 h-4 rounded-full inline-block transition-all duration-300 hover:scale-125 cursor-pointer shadow-sm ${
                          level === 'green' ? 'bg-emerald-500 shadow-emerald-500/20' :
                          level === 'yellow' ? 'bg-[#f5a623] shadow-[#f5a623]/20' :
                          'bg-rose-500 shadow-rose-500/20'
                        }`} />
                      </div>
                    ))}
                  </React.Fragment>
                ))}
              </div>

              <div className="flex justify-end gap-3 text-[9px] text-gray-400 font-black uppercase mt-3 pt-2 border-t border-gray-100">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full inline-block" /> Alta
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 bg-[#f5a623] rounded-full inline-block" /> Média
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 bg-rose-500 rounded-full inline-block" /> Baixa
                </span>
              </div>
            </div>
          </section>

          {/* ── LINHA 5: PIZZA | LINHA EVOLUÇÃO ── */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Pizza (Distribuição do Trabalho) */}
            <div className="bg-white border border-gray-200 p-5 rounded-xl lg:col-span-4 flex flex-col justify-between shadow-sm min-h-[300px]">
              <h3 className="font-sans font-black text-xs uppercase text-[#032b5e] tracking-wider">Distribuição do Trabalho</h3>
              <div className="flex items-center justify-between gap-4 h-[210px]">
                <div className="w-[150px] h-[150px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartDistribuicaoTrabalho}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={60}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {chartDistribuicaoTrabalho.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex-1 space-y-2 text-xs">
                  {chartDistribuicaoTrabalho.slice(0, 5).map((item, idx) => (
                    <div key={item.name} className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-gray-500 font-bold truncate">
                        <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }} />
                        {item.name}
                      </span>
                      <span className="font-black text-[#032b5e]">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Linha Evolução Semanal */}
            <div className="bg-white border border-gray-200 p-5 rounded-xl lg:col-span-8 flex flex-col justify-between shadow-sm min-h-[300px]">
              <h3 className="font-sans font-black text-xs uppercase text-[#032b5e] tracking-wider">Evolução Semanal da Eficiência</h3>
              <div className="h-[210px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartEvolucaoSemanal}>
                    <defs>
                      <linearGradient id="colorEf" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f5a623" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#f5a623" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    <XAxis dataKey="name" stroke="#94a3b8" tickLine={false} />
                    <YAxis stroke="#94a3b8" tickLine={false} domain={[80, 130]} />
                    <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', color: '#1e293b' }} />
                    <Area type="monotone" dataKey="Eficiencia" stroke="#f5a623" strokeWidth={3} fillOpacity={1} fill="url(#colorEf)" dot={{ r: 4, stroke: '#f5a623', fill: '#ffffff' }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </section>

          {/* ── LINHA 6: BENTO GRID DE MÉDIAS INTELIGENTES ── */}
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            
            {/* Médias Inteligentes */}
            <div className="bg-white border border-gray-200 p-5 rounded-xl xl:col-span-2 flex flex-col justify-between h-[260px] overflow-hidden shadow-sm">
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-wider border-b border-gray-100 pb-1">Médias Inteligentes</h3>
              <div className="overflow-y-auto flex-1 mt-2 pr-1 space-y-1.5 text-xs">
                {Object.keys(EMBALAGENS_CONFIG).slice(0, 4).map(key => {
                  const matched = repackRows.filter(x => x.embalagem === key);
                  const totalMatchedSec = matched.reduce((s, r) => s + timeToSec(r.duracao), 0);
                  const totalMatchedQty = matched.reduce((s, r) => s + (Number(r.quantidade) || 1), 0);
                  const avgSec = totalMatchedQty > 0 ? Math.round(totalMatchedSec / totalMatchedQty) : 0;
                  const targetSec = EMBALAGENS_CONFIG[key].metaSec;
                  return (
                    <div key={key} className="flex justify-between items-center py-1 border-b border-gray-100">
                      <div>
                        <span className="block font-bold text-slate-800">{key}</span>
                        <span className="text-[10px] text-gray-400">Meta: {formatSecToHMS(targetSec)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-600">{avgSec > 0 ? formatSecToHMS(avgSec) : '—'}</span>
                        <span className={`w-2.5 h-2.5 rounded-full inline-block ${avgSec === 0 ? 'bg-gray-300' : avgSec <= targetSec ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Média Diária */}
            <div className="bg-white border border-gray-200 p-5 rounded-xl xl:col-span-1 flex flex-col justify-between h-[260px] shadow-sm">
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-wider border-b border-gray-100 pb-1">Média diária</h3>
              <div className="space-y-1 text-xs mt-2">
                {chartProdutividadeDia.map(item => (
                  <div key={item.name} className="flex justify-between border-b border-gray-100 py-1">
                    <span className="text-gray-500">{item.name}</span>
                    <span className="font-bold text-[#032b5e]">{item.Caixas} cx</span>
                  </div>
                ))}
              </div>
              <div className="bg-emerald-500/15 p-2 rounded-lg text-center mt-2 border border-emerald-500/30 text-emerald-600 font-extrabold text-xs">
                Média: {Math.round(chartProdutividadeDia.reduce((s,i)=>s+i.Caixas, 0) / 5)} cx/dia
              </div>
            </div>

            {/* Média por Hora */}
            <div className="bg-white border border-gray-200 p-5 rounded-xl xl:col-span-1 flex flex-col justify-between h-[260px] shadow-sm">
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-wider border-b border-gray-100 pb-1">Média por Hora</h3>
              <div className="space-y-1.5 text-xs mt-2">
                {[
                  { hour: '08h', cx: '3 cx' },
                  { hour: '09h', cx: '5 cx' },
                  { hour: '10h', cx: '6 cx' },
                  { hour: '11h', cx: '4 cx' },
                  { hour: '12h', cx: '2 cx' }
                ].map(item => (
                  <div key={item.hour} className="flex justify-between border-b border-gray-100 py-1">
                    <span className="text-gray-500">{item.hour}</span>
                    <span className="font-bold text-[#032b5e]">{item.cx}</span>
                  </div>
                ))}
              </div>
              <div className="text-[10px] text-center text-gray-400 mt-2 font-bold uppercase">Pico: 10h (6 cx)</div>
            </div>

            {/* Tempo Trabalhado */}
            <div className="bg-white border border-gray-200 p-5 rounded-xl xl:col-span-1 flex flex-col justify-between h-[260px] shadow-sm">
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-wider border-b border-gray-100 pb-1">Tempo de Repack</h3>
              <div className="space-y-3.5 mt-3 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 font-bold uppercase text-[10px]">Hoje</span>
                  <span className="text-emerald-500 font-extrabold font-mono text-sm">06h42m</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 font-bold uppercase text-[10px]">Semana</span>
                  <span className="text-amber-500 font-extrabold font-mono text-sm">31h20m</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 font-bold uppercase text-[10px]">Mês</span>
                  <span className="text-purple-500 font-extrabold font-mono text-sm">126h45m</span>
                </div>
              </div>
              <div className="text-[10px] text-center text-gray-400 border-t border-gray-100 pt-2 font-bold uppercase">Variação: +4.2% s/ meta</div>
            </div>

            {/* Melhor/Pior Desempenho */}
            <div className="bg-white border border-gray-200 p-5 rounded-xl xl:col-span-1 flex flex-col justify-between h-[260px] shadow-sm">
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-wider border-b border-gray-100 pb-1">Desempenho</h3>
              <div className="space-y-3 text-xs mt-3">
                <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                  <span className="block text-[9px] text-emerald-500 font-black uppercase">Melhor Dia (17/02)</span>
                  <span className="font-extrabold text-slate-700 mt-0.5 block">36 caixas (113%)</span>
                </div>
                <div className="p-2 bg-rose-500/10 border border-rose-500/20 rounded-lg">
                  <span className="block text-[9px] text-rose-500 font-black uppercase">Pior Dia (08/02)</span>
                  <span className="font-extrabold text-slate-700 mt-0.5 block">15 caixas (82%)</span>
                </div>
              </div>
            </div>
          </section>

          {/* ── LINHA 7: TABELA (1300px) & PAINEL LATERAL (450px) ── */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            
            {/* Tabela de Lançamentos */}
            <div className="bg-white border border-gray-200 p-5 rounded-xl lg:col-span-8 flex flex-col justify-between shadow-sm min-h-[360px] overflow-x-auto">
              <div>
                <div className="flex flex-wrap items-center justify-between gap-4 mb-4 border-b border-gray-100 pb-3">
                  <div>
                    <h3 className="font-sans font-black text-xs uppercase text-[#032b5e] tracking-wider">Histórico de Lançamentos</h3>
                    <p className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">Total de {tableFilteredRows.length} registros filtrados</p>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Pesquisar..."
                        value={tableSearch}
                        onChange={(e) => { setTableSearch(e.target.value); setCurrentPage(1); }}
                        className="bg-white border border-gray-200 text-slate-800 text-xs rounded-lg pl-9 pr-3 py-1.5 focus:border-[#032b5e] outline-none transition-colors w-[180px]"
                      />
                    </div>
                    <button
                      onClick={handleExportXLSX}
                      className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white font-sans font-bold rounded-lg text-[10px] uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer border-none"
                    >
                      <Download className="w-3 h-3 text-white" />
                      Excel
                    </button>
                    <button
                      onClick={handleExportPDF}
                      className="px-3 py-1.5 bg-rose-500 hover:bg-rose-600 text-white font-sans font-bold rounded-lg text-[10px] uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer border-none"
                    >
                      <Download className="w-3 h-3 text-white" />
                      PDF
                    </button>
                  </div>
                </div>

                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-gray-200 text-gray-500 uppercase font-bold tracking-wider text-[9px]">
                      <th className="p-2.5">Data</th>
                      <th className="p-2.5">Colaborador</th>
                      <th className="p-2.5">Embalagem</th>
                      <th className="p-2.5">Quantidade</th>
                      <th className="p-2.5">Intervalo</th>
                      <th className="p-2.5">Tempo</th>
                      <th className="p-2.5">Eficiência</th>
                      <th className="p-2.5 text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {paginatedRows.map(row => {
                      const unitMeta = EMBALAGENS_CONFIG[row.embalagem]?.metaSec || 240;
                      const expectedSec = unitMeta * (Number(row.quantidade) || 1);
                      const spentSec = timeToSec(row.duracao);
                      const eff = spentSec > 0 ? Math.round((expectedSec / spentSec) * 100) : 100;

                      return (
                        <tr 
                          key={row._docId} 
                          onClick={() => setSelectedRowId(row._docId || null)}
                          className={`hover:bg-slate-50/50 cursor-pointer transition-colors group ${selectedRowId === row._docId ? 'bg-amber-500/10 border-l-2 border-l-amber-500' : ''}`}
                        >
                          <td className="p-2.5 font-semibold text-gray-400">{row.data}</td>
                          <td className="p-2.5 font-bold text-slate-800">{row.operador || '—'}</td>
                          <td className="p-2.5 font-semibold text-gray-500">{row.embalagem}</td>
                          <td className="p-2.5 font-bold text-amber-600">{row.quantidade} un</td>
                          <td className="p-2.5 text-gray-400">{row.inicio} - {row.fim}</td>
                          <td className="p-2.5 font-mono text-slate-700 font-semibold">{row.duracao}</td>
                          <td className="p-2.5">
                            <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold ${eff >= 100 ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'}`}>
                              {eff}%
                            </span>
                          </td>
                          <td className="p-2.5 text-right">
                            <button
                              onClick={(e) => { e.stopPropagation(); handleDeleteRow(row._docId || ''); }}
                              className="p-1.5 text-gray-400 hover:text-rose-500 rounded hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer border-none bg-transparent"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                    {paginatedRows.length === 0 && (
                      <tr>
                        <td colSpan={8} className="py-8 text-center text-gray-400 font-semibold">Nenhum registro encontrado</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between border-t border-gray-100 pt-3 mt-4 text-xs text-gray-400">
                <span>
                  Mostrando <strong>{paginatedRows.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}</strong> a <strong>{Math.min(currentPage * itemsPerPage, tableFilteredRows.length)}</strong> de <strong>{tableFilteredRows.length}</strong> registros
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="p-1 rounded bg-white border border-gray-200 disabled:opacity-40 cursor-pointer text-gray-500"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="font-bold text-slate-700 px-2">Página {currentPage} de {totalPages}</span>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="p-1 rounded bg-white border border-gray-200 disabled:opacity-40 cursor-pointer text-gray-500"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Painel lateral direito (450px) -> lg:col-span-4 */}
            <div className="bg-white border border-gray-200 p-5 rounded-xl lg:col-span-4 flex flex-col justify-between shadow-sm min-h-[360px]">
              <div>
                <h3 className="font-sans font-black text-xs uppercase text-[#032b5e] tracking-wider border-b border-gray-100 pb-2 mb-3">
                  Cálculos Automáticos
                </h3>
                
                {selectedRowDetails ? (
                  <div className="space-y-3">
                    <div className="flex justify-between text-xs py-1 border-b border-gray-100">
                      <span className="text-gray-400 font-bold uppercase text-[10px]">Tempo Esperado (Meta)</span>
                      <span className="font-bold font-mono text-slate-700">{selectedRowDetails.expected}</span>
                    </div>
                    <div className="flex justify-between text-xs py-1 border-b border-gray-100">
                      <span className="text-gray-400 font-bold uppercase text-[10px]">Tempo Gasto (Real)</span>
                      <span className="font-bold font-mono text-slate-700">{selectedRowDetails.spent}</span>
                    </div>
                    <div className="flex justify-between text-xs py-1 border-b border-gray-100">
                      <span className="text-gray-400 font-bold uppercase text-[10px]">Diferença</span>
                      <div className="flex items-center gap-1">
                        <span className={`font-bold font-mono ${selectedRowDetails.diffPositive ? 'text-emerald-500' : 'text-rose-500'}`}>
                          {selectedRowDetails.diffPositive ? '-' : '+'}{selectedRowDetails.diff}
                        </span>
                        <span className={`w-2 h-2 rounded-full ${selectedRowDetails.diffPositive ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                      </div>
                    </div>
                    <div className="flex justify-between text-xs py-1 border-b border-gray-100">
                      <span className="text-gray-400 font-bold uppercase text-[10px]">Eficiência Calculada</span>
                      <span className={`font-bold ${selectedRowDetails.efficiency >= 100 ? 'text-emerald-500' : 'text-rose-500'}`}>{selectedRowDetails.efficiency}%</span>
                    </div>
                    <div className="flex justify-between text-xs py-1 border-b border-gray-100">
                      <span className="text-gray-400 font-bold uppercase text-[10px]">Caixas por Hora</span>
                      <span className="font-bold text-amber-600">{selectedRowDetails.caixasHora} un/h</span>
                    </div>
                    <div className="flex justify-between text-xs py-1 border-b border-gray-100">
                      <span className="text-gray-400 font-bold uppercase text-[10px]">Tempo Médio Real</span>
                      <span className="font-bold font-mono text-slate-700">{selectedRowDetails.tempoMedioUnit}</span>
                    </div>
                  </div>
                ) : (
                  <div className="py-12 text-center text-gray-400 text-xs font-bold uppercase">
                    Selecione um lançamento na tabela para auditar os cálculos em tempo real.
                  </div>
                )}
              </div>

              <div className="p-3.5 bg-amber-50 border border-amber-200/60 rounded-xl flex items-center gap-3 mt-4">
                <Info className="w-5 h-5 text-amber-500 shrink-0" />
                <p className="text-[10px] text-amber-800 leading-normal font-bold uppercase">
                  Os valores acima representam o cálculo do posto de trabalho e são atualizados de forma autônoma pelo sistema de B.I.
                </p>
              </div>
            </div>

          </section>

        </div>
      )}

      {activeSubTab === 'planos' && (
        <section className="space-y-4">
          <div className="bg-white border border-gray-200 p-5 rounded-xl shadow-sm">
            <h2 className="font-sans font-black text-sm uppercase text-[#032b5e] tracking-wider mb-1">Planos de Ação VPO (Meta nos últimos 4 meses)</h2>
            <p className="text-[10px] text-gray-400 font-bold uppercase mb-4">Mapeie problemas com causa raiz 4M e crie planos preventivos/corretivos.</p>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* Form */}
              <div className="lg:col-span-4 bg-slate-50 border border-gray-200 p-4 rounded-xl">
                <form onSubmit={handleAddPlan} className="space-y-3 text-xs">
                  <h3 className="font-sans font-black text-xs uppercase text-[#032b5e] tracking-wider mb-2">Novo Plano de Ação</h3>
                  
                  <div className="flex flex-col gap-1">
                    <label className="text-gray-400 uppercase font-bold text-[9px] tracking-wider">Descrição da Ação / Problema</label>
                    <textarea
                      value={apDesc}
                      onChange={(e) => setApDesc(e.target.value)}
                      placeholder="Ex: Treinar operador na máquina LATA 473..."
                      className="bg-white border border-gray-200 text-slate-800 rounded-lg p-2 h-20 resize-none focus:border-[#032b5e] outline-none"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col gap-1">
                      <label className="text-gray-400 uppercase font-bold text-[9px] tracking-wider">Causa Raiz 4M</label>
                      <select
                        value={apCausa}
                        onChange={(e: any) => setApCausa(e.target.value)}
                        className="bg-white border border-gray-200 text-slate-800 rounded-lg p-2 focus:border-[#032b5e] outline-none"
                      >
                        <option value="Método">Método</option>
                        <option value="Mão de Obra">Mão de Obra</option>
                        <option value="Máquina">Máquina</option>
                        <option value="Material">Material</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-gray-400 uppercase font-bold text-[9px] tracking-wider">Responsável</label>
                      <input
                        type="text"
                        value={apResp}
                        onChange={(e) => setApResp(e.target.value)}
                        placeholder="Nome supervisor"
                        className="bg-white border border-gray-200 text-slate-800 rounded-lg p-2 focus:border-[#032b5e] outline-none"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-gray-400 uppercase font-bold text-[9px] tracking-wider">Prazo Limite</label>
                    <input
                      type="date"
                      value={apPrazo}
                      onChange={(e) => setApPrazo(e.target.value)}
                      className="bg-white border border-gray-200 text-slate-800 rounded-lg p-2 focus:border-[#032b5e] outline-none"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full h-10 bg-[#032b5e] hover:bg-[#021f44] text-white font-sans font-bold rounded-lg uppercase tracking-wider cursor-pointer border-none transition-colors"
                  >
                    Criar Plano de Ação
                  </button>
                </form>
              </div>

              {/* List */}
              <div className="lg:col-span-8 space-y-2">
                {actionPlans.map(plan => (
                  <div key={plan._docId} className="bg-white border border-gray-200 p-4 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs shadow-sm">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-amber-500/10 text-amber-600 border border-amber-500/20 rounded font-black text-[9px] uppercase tracking-wider">
                          {plan.causaRaiz4M}
                        </span>
                        <span className="text-gray-400 text-[10px] font-bold uppercase">Criado em {plan.dataCriacao}</span>
                      </div>
                      <p className="font-sans font-black text-sm text-[#032b5e]">{plan.descricao}</p>
                      <div className="flex gap-4 text-gray-400 text-[11px] font-semibold">
                        <span>Resp: <strong className="text-slate-700">{plan.responsavel}</strong></span>
                        <span>Prazo: <strong className="text-amber-600">{plan.prazo.split('-').reverse().join('/')}</strong></span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex bg-slate-100 p-0.5 rounded-lg border border-gray-200 font-bold text-[10px]">
                        {(['Pendente', 'Em Andamento', 'Concluído'] as const).map(st => (
                          <button
                            key={st}
                            type="button"
                            onClick={() => handleChangeApStatus(plan._docId || '', st)}
                            className={`px-2.5 py-1 rounded cursor-pointer transition-colors border-none ${plan.status === st ? 'bg-[#032b5e] text-white font-bold' : 'text-gray-500 hover:text-[#032b5e] bg-transparent'}`}
                          >
                            {st}
                          </button>
                        ))}
                      </div>
                      <button
                        onClick={() => handleDeleteAp(plan._docId || '')}
                        className="p-1.5 text-gray-400 hover:text-rose-500 rounded bg-slate-50 border border-gray-200 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
                {actionPlans.length === 0 && (
                  <div className="py-12 border border-dashed border-gray-200 rounded-xl text-center text-gray-400 text-xs font-bold uppercase">
                    Nenhum Plano de Ação cadastrado ainda.
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── MODAL: NOVO REGISTRO / CRONÔMETRO ── */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white border border-gray-200 p-6 rounded-xl w-full max-w-[500px] shadow-2xl relative animate-scale-up">
            <h3 className="font-sans font-black text-base uppercase text-[#032b5e] tracking-wider border-b border-gray-100 pb-2 mb-4">Lançar Produção Repack</h3>
            
            {/* Stopwatch Section */}
            <div className="bg-slate-50 border border-gray-200 p-3 rounded-xl text-center mb-4">
              <span className="text-[9px] uppercase font-black tracking-widest text-gray-400 block">Cronômetro de Operação</span>
              <div className="text-3xl font-mono font-extrabold text-[#032b5e] my-1">
                {formatSecToHMS(timerSeconds)}
              </div>
              <div className="flex justify-center gap-2 mt-2">
                {!timerActive ? (
                  <button
                    type="button"
                    onClick={handleStartStopwatch}
                    className="px-3 py-1.5 bg-emerald-500 text-white font-bold rounded-lg text-xs flex items-center gap-1 cursor-pointer hover:bg-emerald-600 transition-colors border-none"
                  >
                    <Play className="w-3.5 h-3.5 text-white" /> Iniciar
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleStopStopwatch}
                    className="px-3 py-1.5 bg-rose-500 text-white font-bold rounded-lg text-xs flex items-center gap-1 cursor-pointer hover:bg-rose-600 transition-colors border-none"
                  >
                    <Square className="w-3.5 h-3.5 text-white" /> Parar
                  </button>
                )}
              </div>
            </div>

            <form onSubmit={handleRegister} className="space-y-3.5 text-xs">
              <div className="flex flex-col gap-1">
                <label className="text-gray-400 uppercase font-bold text-[9px] tracking-wider">Embalagem</label>
                <select
                  value={formEmbalagem}
                  onChange={(e) => setFormEmbalagem(e.target.value)}
                  className="bg-white border border-gray-200 text-slate-800 rounded-lg p-2 focus:border-[#032b5e] outline-none"
                >
                  {Object.keys(EMBALAGENS_CONFIG).map(k => (
                    <option key={k} value={k}>{EMBALAGENS_CONFIG[k].label}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-gray-400 uppercase font-bold text-[9px] tracking-wider">Quantidade (un)</label>
                  <input
                    type="number"
                    value={formQuantidade}
                    onChange={(e) => setFormQuantidade(Math.max(1, Number(e.target.value)))}
                    className="bg-white border border-gray-200 text-slate-800 rounded-lg p-2 focus:border-[#032b5e] outline-none"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-gray-400 uppercase font-bold text-[9px] tracking-wider">Operador</label>
                  <input
                    type="text"
                    value={formOperador}
                    onChange={(e) => setFormOperador(e.target.value)}
                    className="bg-white border border-gray-200 text-slate-800 rounded-lg p-2 focus:border-[#032b5e] outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-gray-400 uppercase font-bold text-[9px] tracking-wider">Hora Inicial</label>
                  <input
                    type="text"
                    placeholder="HH:MM"
                    value={formInicio}
                    onChange={(e) => setFormInicio(e.target.value)}
                    className="bg-white border border-gray-200 text-slate-800 rounded-lg p-2 font-mono focus:border-[#032b5e] outline-none"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-gray-400 uppercase font-bold text-[9px] tracking-wider">Hora Final</label>
                  <input
                    type="text"
                    placeholder="HH:MM"
                    value={formFim}
                    onChange={(e) => setFormFim(e.target.value)}
                    className="bg-white border border-gray-200 text-slate-800 rounded-lg p-2 font-mono focus:border-[#032b5e] outline-none"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-3">
                <button
                  type="submit"
                  className="flex-1 h-10 bg-[#032b5e] hover:bg-[#021f44] text-white font-sans font-bold rounded-lg uppercase tracking-wider cursor-pointer border-none transition-all"
                >
                  Registrar Produção
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 h-10 bg-slate-50 border border-gray-200 text-slate-700 hover:bg-gray-100 font-bold rounded-lg uppercase tracking-wider cursor-pointer transition-all"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
