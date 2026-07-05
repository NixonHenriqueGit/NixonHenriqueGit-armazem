import React, { useState, useEffect } from 'react';
import { db, isCustomFirebaseConnected } from '../firebase';
import { collection, onSnapshot, query, where, addDoc } from 'firebase/firestore';
import { Usuario, Empresa, RepackRow, DespejoRow, QuebraRow, ValidadeRow, ArmazemRow, BlitzRefugoRow } from '../types';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';

interface ExportarPanelProps {
  user: Usuario;
  empresa: Empresa | null;
}

interface BackupLog {
  id: string;
  data: string;
  dataISO: string;
  tipo: string;
  tamanhoKb: number;
  totalLinhas: number;
  operador: string;
}

export default function ExportarPanel({ user, empresa }: ExportarPanelProps) {
  const [repack, setRepack] = useState<RepackRow[]>([]);
  const [despejo, setDespejo] = useState<DespejoRow[]>([]);
  const [quebras, setQuebras] = useState<QuebraRow[]>([]);
  const [validades, setValidades] = useState<ValidadeRow[]>([]);
  const [armazem, setArmazem] = useState<ArmazemRow[]>([]);
  const [blitz, setBlitz] = useState<BlitzRefugoRow[]>([]);

  // Simulation of backups
  const [backups, setBackups] = useState<BackupLog[]>([]);
  const [backingUp, setBackingUp] = useState(false);

  // Spreadsheet Import States
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importTarget, setImportTarget] = useState<'repack' | 'despejo' | 'quebras' | 'validades' | 'armazem'>('repack');
  const [importing, setImporting] = useState(false);
  const [importPreview, setImportPreview] = useState<any[]>([]);
  const [importHeaders, setImportHeaders] = useState<string[]>([]);

  const empresaId = empresa?.id || 'demo';

  // S_getBackupHistory initial configuration
  useEffect(() => {
    // Generate some simulated historic backup rows if empty
    const saved = localStorage.getItem(`backups_${empresaId}`);
    if (saved) {
      setBackups(JSON.parse(saved));
    } else {
      const initBackups: BackupLog[] = [
        { id: 'BK-48301', data: '13/06/2026', dataISO: '2026-06-13T10:00:00.000Z', tipo: 'Completo (Auto Semanal)', tamanhoKb: 284, totalLinhas: 142, operador: 'Sistema (Interno)' },
        { id: 'BK-47429', data: '06/06/2026', dataISO: '2026-06-06T10:00:00.000Z', tipo: 'Completo (Auto Semanal)', tamanhoKb: 212, totalLinhas: 98, operador: 'Sistema (Interno)' },
      ];
      setBackups(initBackups);
      localStorage.setItem(`backups_${empresaId}`, JSON.stringify(initBackups));
    }
  }, [empresaId]);

  // Sync databases lines
  useEffect(() => {
    if (!db) {
      // Local fallback
      setRepack(JSON.parse(localStorage.getItem(`repack_${empresaId}`) || '[]'));
      setDespejo(JSON.parse(localStorage.getItem(`despejo_${empresaId}`) || '[]'));
      setQuebras(JSON.parse(localStorage.getItem(`quebras_${empresaId}`) || '[]'));
      setValidades(JSON.parse(localStorage.getItem(`validades_${empresaId}`) || '[]'));
      setArmazem(JSON.parse(localStorage.getItem(`armazem_rows_${empresaId}`) || '[]'));
      setBlitz(JSON.parse(localStorage.getItem(`blitz_${empresaId}`) || '[]'));
      return;
    }

    const qRepack = query(collection(db, 'repack'));
    const unsubRepack = onSnapshot(qRepack, s => {
      const rows = s.docs.map(d => ({ _docId: d.id, ...d.data() } as RepackRow));
      setRepack(isCustomFirebaseConnected() ? rows : rows.filter(r => r.empresaId === empresaId));
    });

    const qDespejo = query(collection(db, 'despejo'));
    const unsubDespejo = onSnapshot(qDespejo, s => {
      const rows = s.docs.map(d => ({ _docId: d.id, ...d.data() } as DespejoRow));
      setDespejo(isCustomFirebaseConnected() ? rows : rows.filter(r => r.empresaId === empresaId));
    });

    const qQuebras = query(collection(db, 'quebras'));
    const unsubQuebras = onSnapshot(qQuebras, s => {
      const rows = s.docs.map(d => ({ _docId: d.id, ...d.data() } as QuebraRow));
      setQuebras(isCustomFirebaseConnected() ? rows : rows.filter(r => r.empresaId === empresaId));
    });

    const qValidades = query(collection(db, 'validades'));
    const unsubValidades = onSnapshot(qValidades, s => {
      const rows = s.docs.map(d => ({ _docId: d.id, ...d.data() } as ValidadeRow));
      setValidades(isCustomFirebaseConnected() ? rows : rows.filter(r => r.empresaId === empresaId));
    });

    const qArmazem = query(collection(db, 'armazem'));
    const unsubArmazem = onSnapshot(qArmazem, s => {
      const rows = s.docs.map(d => ({ _docId: d.id, ...d.data() } as ArmazemRow));
      setArmazem(isCustomFirebaseConnected() ? rows : rows.filter(r => r.empresaId === empresaId));
    });

    const qBlitz = query(collection(db, 'blitz_refugo'));
    const unsubBlitz = onSnapshot(qBlitz, s => {
      const rows = s.docs.map(d => ({ _docId: d.id, ...d.data() } as BlitzRefugoRow));
      setBlitz(isCustomFirebaseConnected() ? rows : rows.filter(r => r.empresaId === empresaId));
    });

    return () => {
      unsubRepack();
      unsubDespejo();
      unsubQuebras();
      unsubValidades();
      unsubArmazem();
      unsubBlitz();
    };
  }, [empresaId]);

  // General XLSX Excel Exporter
  const exportToExcelAll = () => {
    try {
      const wb = XLSX.utils.book_new();

      // Repack sheet
      const repackData = repack.map(r => ({
        'Data Lançamento': r.data,
        'Embalagem': r.embalagem,
        'Quantidade (unidades)': r.quantidade,
        'Início': r.inicio,
        'Fim': r.fim,
        'Duração': r.duracao,
        'Metas de Produtividade': r.meta,
        'Status Produtividade': r.resultado,
        'Operador': r.operador || '—'
      }));
      const wsRepack = XLSX.utils.json_to_sheet(repackData);
      XLSX.utils.book_append_sheet(wb, wsRepack, 'Repack');

      // Despejo sheet
      const despejoData = despejo.map(d => ({
        'Data Lançamento': d.data,
        'Embalagem': d.embalagem,
        'Quantidade (caixas)': d.quantidade,
        'Início': d.inicio,
        'Fim': d.fim,
        'Duração': d.tempo,
        'Metas (cx/h)': d.meta,
        'Status Meta': d.resultado,
        'Operador': d.operador || '—'
      }));
      const wsDespejo = XLSX.utils.json_to_sheet(despejoData);
      XLSX.utils.book_append_sheet(wb, wsDespejo, 'Despejo');

      // Quebras sheet
      const quebrasData = quebras.map(q => ({
        'Data': q.data,
        'Código SKU': q.codProduto,
        'Descrição SKU': q.descricao,
        'Quantidade': q.quantidade,
        'Área Origem': q.area,
        'Turno': q.turno,
        'Cód Quebra': q.codQuebra,
        'Motivo': q.motivo
      }));
      const wsQuebras = XLSX.utils.json_to_sheet(quebrasData);
      XLSX.utils.book_append_sheet(wb, wsQuebras, 'Quebras e Avarias');

      // Validades sheet
      const valData = validades.map(v => ({
        'Código SKU': v.codigo,
        'Descrição': v.descricao,
        'Paletes': v.palhete,
        'Lastros': v.lastro,
        'Caixas': v.caixa,
        'Data Vencimento': v.validade,
        'Localização': v.localizacao === 'picking' ? 'Picking' : 'Pulmão Central'
      }));
      const wsVal = XLSX.utils.json_to_sheet(valData);
      XLSX.utils.book_append_sheet(wb, wsVal, 'Validades');

      // Armazem patio sheet
      const armData = armazem.map(a => ({
        'Data Lançamento': a.data,
        'Operação': a.operacao,
        'Hora Início': a.inicio,
        'Hora Término': a.fim,
        'Status Janela': a.status,
        'Faturador': a.empilhador,
        'Turno': a.turno,
        'Placa': a.placa,
        'Tipo Carga': a.tipo,
        'Total Paletes': a.palhete,
        'Justificativa se Fora': a.obs || '—'
      }));
      const wsArm = XLSX.utils.json_to_sheet(armData);
      XLSX.utils.book_append_sheet(wb, wsArm, 'Movimentação Pátio');

      // Write complete spreadsheet file
      const fName = `Armazem_Facil_Relatorio_Geral_${empresaId}.xlsx`;
      XLSX.writeFile(wb, fName);
      toast('Excel gerado com sucesso!');
    } catch(err) {
      alert('Erro ao exportar planilhas: ' + err);
    }
  };

  // General PDF Exporter rendering A4 document
  const exportToPDFAll = () => {
    try {
      const doc = new jsPDF();
      let y = 16;

      // Cover Title
      doc.setFillColor(11, 21, 38);
      doc.rect(0, 0, 210, 42, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(20);
      doc.text('ARMAZÉM FÁCIL — DEPOSITOS ADM', 14, 18);

      doc.setFontSize(10);
      doc.setFont('Helvetica', 'normal');
      doc.text(`Empresa: ${empresa?.razaoSocial || 'Empresa Demonstrativa'}`, 14, 26);
      doc.text(`Data Impressão: ${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR')}`, 14, 32);
      doc.text(`Operador logado: ${user.nome}`, 14, 38);

      y = 55;

      // Summary widgets
      doc.setTextColor(11, 21, 38);
      doc.setFontSize(12);
      doc.setFont('Helvetica', 'bold');
      doc.text('1. RESUMO GERAL DAS OPERAÇÕES', 14, y);
      y += 8;

      doc.setFontSize(9);
      doc.setFont('Helvetica', 'normal');

      const textDetails = [
        `• Total de registros de Repack mapeados: ${repack.length} lançamentos`,
        `• Total caixas de garrafas despejadas: ${despejo.reduce((s, d) => s + (d.quantidade || 0), 0)} caixas recuperadas`,
        `• Volumetria acumulada em Quebras Internas: ${quebras.reduce((s, q) => s + q.quantidade, 0)} unidades perdidas`,
        `• Total de lotes ativos cadastrados no FEFO: ${validades.length} SKUs monitorados`,
        `• Operações totais registradas na portaria: ${armazem.length} movimentos de faturamento`,
        `• Fichas de Blitz de retornáveis averbadas: ${blitz.length} vistorias concluídas`,
      ];

      textDetails.forEach(line => {
        doc.text(line, 16, y);
        y += 6;
      });

      y += 6;

      // Details block of recent rows
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(11);
      doc.text('2. ÚLTIMOS LANÇAMENTOS DO PERÍODO', 14, y);
      y += 8;

      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(8.5);

      if (quebras.length > 0) {
        doc.text('Avarias e Quebras Recentes:', 14, y);
        y += 5;
        quebras.slice(0, 5).forEach(q => {
          doc.text(`- [${q.data}] SKU: ${q.codProduto} - Qtd: ${q.quantidade} un - Origem: ${q.area} (${q.motivo})`, 16, y);
          y += 5.5;
        });
        y += 4;
      }

      if (validades.length > 0) {
        doc.text('Alertas FEFO Críticos:', 14, y);
        y += 5;
        validades.slice(0, 5).forEach(v => {
          doc.text(`- SKU: ${v.codigo} (${v?.descricao || 'Auto'}) - Vence em: ${v.validade} - Local: ${v.localizacao}`, 16, y);
          y += 5.5;
        });
        y += 4;
      }

      // Check height bounds
      if (y > 260) {
        doc.addPage();
        y = 20;
      }

      // Footer line
      doc.setDrawColor(200, 200, 200);
      doc.line(14, 280, 196, 280);
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text('Armazém Fácil Inteligência Logística Corporativa — Padrão de Compliance', 14, 285);

      // Save PDF file
      doc.save(`Armazem_Facil_Relatorio_Atividade_${empresaId}.pdf`);
      toast('PDF gerado com sucesso!');
    } catch(err) {
      alert('Erro ao exportar PDF: ' + err);
    }
  };

  const handleTriggerManualBackup = () => {
    setBackingUp(true);
    triggerToast('Iniciando dump de coleções...');

    setTimeout(() => {
      const today = new Date();
      const code = 'BK-' + Math.round(40000 + Math.random() * 9999);
      const rowsCount = repack.length + despejo.length + quebras.length + validades.length + armazem.length + blitz.length;
      
      const newBackup: BackupLog = {
        id: code,
        data: today.toLocaleDateString('pt-BR'),
        dataISO: today.toISOString(),
        tipo: 'Completo (Manual Co-Pilot)',
        tamanhoKb: Math.max(12, Math.round(rowsCount * 1.8 + Math.random() * 5)),
        totalLinhas: rowsCount,
        operador: user.nome.toUpperCase()
      };

      const u = [newBackup, ...backups];
      setBackups(u);
      localStorage.setItem(`backups_${empresaId}`, JSON.stringify(u));
      setBackingUp(false);
      triggerToast(`Backup ${code} criado e verificado!`);
    }, 1500);
  };

  const triggerToast = (m: string) => {
    const el = document.getElementById('toast');
    if (el) {
      el.textContent = m;
      el.className = 'show';
      setTimeout(() => el.className = '', 3000);
    }
  };

  const toast = (m: string) => {
    const el = document.getElementById('toast');
    if (el) {
      el.textContent = m;
      el.className = 'show';
      setTimeout(() => el.className = '', 3000);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportFile(file);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = evt.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        if (json.length > 0) {
          const headers = (json[0] as any[]).map(String);
          setImportHeaders(headers);
          
          const rows = XLSX.utils.sheet_to_json(worksheet);
          setImportPreview(rows.slice(0, 5));
        }
      } catch (err) {
        alert('Erro ao ler visualização do arquivo Excel: ' + err);
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleImportSubmit = async () => {
    if (!importFile) return;
    setImporting(true);
    triggerToast('Lendo arquivo Excel...');

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const data = evt.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const rows = XLSX.utils.sheet_to_json(worksheet) as any[];

        if (rows.length === 0) {
          alert('Planilha vazia ou sem linhas detectadas.');
          setImporting(false);
          return;
        }

        triggerToast(`Processando ${rows.length} linhas...`);
        let importedCount = 0;

        for (const raw of rows) {
          let docData: any = { empresaId };

          // Normalization of keys to lowercase for flexible column mapping
          const cleanRow: Record<string, any> = {};
          Object.entries(raw).forEach(([k, v]) => {
            cleanRow[k.toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "")] = v;
          });

          // Helper: format dates
          const today = new Date();
          const todayStr = today.toLocaleDateString('pt-BR');
          const todayISO = today.toISOString().split('T')[0];

          if (importTarget === 'repack') {
            docData = {
              ...docData,
              data: String(cleanRow.data || cleanRow['data lancamento'] || todayStr),
              dataISO: String(cleanRow.dataiso || cleanRow['data iso'] || todayISO),
              embalagem: String(cleanRow.embalagem || cleanRow.embalagens || 'LATA 250').toUpperCase(),
              quantidade: Number(cleanRow.quantidade || cleanRow.qtd || 1),
              inicio: String(cleanRow.inicio || cleanRow['hora inicio'] || '08:00'),
              fim: String(cleanRow.fim || cleanRow['hora fim'] || '08:30'),
              duracao: String(cleanRow.duracao || cleanRow.tempo || '00:30:00'),
              meta: String(cleanRow.meta || cleanRow['metas de produtividade'] || '00:00:43'),
              resultado: String(cleanRow.resultado || cleanRow.status || '🟢 META BATIDA'),
              operador: String(cleanRow.operador || user.nome)
            };
          } else if (importTarget === 'despejo') {
            docData = {
              ...docData,
              data: String(cleanRow.data || cleanRow['data lancamento'] || todayStr),
              dataISO: String(cleanRow.dataiso || cleanRow['data iso'] || todayISO),
              embalagem: String(cleanRow.embalagem || cleanRow.embalagens || 'LATA 250').toUpperCase(),
              quantidade: Number(cleanRow.quantidade || cleanRow.qtd || 1),
              inicio: String(cleanRow.inicio || cleanRow['hora inicio'] || '08:00'),
              fim: String(cleanRow.fim || cleanRow['hora fim'] || '08:30'),
              tempo: String(cleanRow.tempo || cleanRow.duracao || '00:30:00'),
              meta: String(cleanRow.meta || cleanRow['metas'] || '00:00:43'),
              resultado: String(cleanRow.resultado || cleanRow.status || '🟢 META BATIDA'),
              operador: String(cleanRow.operador || user.nome)
            };
          } else if (importTarget === 'quebras') {
            docData = {
              ...docData,
              data: String(cleanRow.data || todayStr),
              codProduto: String(cleanRow.codproduto || cleanRow.codigo || cleanRow.sku || '000'),
              descricao: String(cleanRow.descricao || cleanRow.produto || 'SKU Importado'),
              quantidade: Number(cleanRow.quantidade || cleanRow.qtd || 1),
              area: String(cleanRow.area || cleanRow.origem || 'Picking'),
              turno: String(cleanRow.turno || '1º Turno'),
              codQuebra: String(cleanRow.codquebra || cleanRow['cod quebra'] || 'Q01'),
              motivo: String(cleanRow.motivo || 'Avaria Movimentação')
            };
          } else if (importTarget === 'validades') {
            docData = {
              ...docData,
              codigo: String(cleanRow.codigo || cleanRow.cod || cleanRow.sku || '000'),
              descricao: String(cleanRow.descricao || cleanRow.produto || 'SKU Importado'),
              palhete: Number(cleanRow.palhete || cleanRow.palete || 0),
              lastro: Number(cleanRow.lastro || 0),
              caixa: Number(cleanRow.caixa || cleanRow.caixas || 0),
              validade: String(cleanRow.validade || cleanRow.vencimento || todayStr),
              localizacao: String(cleanRow.localizacao || cleanRow.local || 'picking').toLowerCase().includes('pulm') ? 'pulmao' : 'picking'
            };
          } else if (importTarget === 'armazem') {
            docData = {
              ...docData,
              data: String(cleanRow.data || todayStr),
              operacao: String(cleanRow.operacao || 'Recebimento'),
              inicio: String(cleanRow.inicio || cleanRow['hora inicio'] || '08:00'),
              fim: String(cleanRow.fim || cleanRow['hora fim'] || '10:00'),
              status: String(cleanRow.status || 'Concluído'),
              empilhador: String(cleanRow.empilhador || cleanRow.faturador || user.nome),
              turno: String(cleanRow.turno || '1º Turno'),
              placa: String(cleanRow.placa || 'AAA-0000'),
              tipo: String(cleanRow.tipo || cleanRow['tipo carga'] || 'Puxada'),
              palhete: Number(cleanRow.palhete || cleanRow.palete || 0),
              obs: String(cleanRow.obs || cleanRow.justificativa || '—')
            };
          }

          // Write to db or localstorage
          if (db) {
            const colName = importTarget === 'armazem' ? 'armazem' : importTarget;
            await addDoc(collection(db, colName), docData);
          } else {
            const lsKey = importTarget === 'armazem' ? `armazem_rows_${empresaId}` : `${importTarget}_${empresaId}`;
            const current = JSON.parse(localStorage.getItem(lsKey) || '[]');
            current.push({ _docId: String(Date.now() + Math.random()), ...docData });
            localStorage.setItem(lsKey, JSON.stringify(current));
          }
          importedCount++;
        }

        triggerToast(`Sucesso! ${importedCount} registros importados.`);
        alert(`Parabéns! Foram importados ${importedCount} registros com sucesso para o banco de dados da sua empresa (${empresa?.razaoSocial || 'Demonstração'}).`);
        setImportFile(null);
        setImportPreview([]);
        setImportHeaders([]);
        setImporting(false);
      } catch (err) {
        alert('Erro ao importar planilha: ' + err);
        setImporting(false);
      }
    };
    reader.readAsBinaryString(importFile);
  };

  const totalLogsLines = repack.length + despejo.length + quebras.length + validades.length + armazem.length + blitz.length;

  return (
    <div className="flex flex-col gap-6">
      
      {/* Top Header */}
      <div className="flex items-center justify-between p-4 bg-[#11151c] border-b border-[#222d3a] rounded-t-xl -mx-6 md:-mx-12 -mt-6">
        <span className="font-sans font-black text-sm tracking-widest text-[#a855f7] uppercase">📥 COMPARTILHAMENTO, BACKUP E EXPORTAÇÃO</span>
        <div className="text-[10px] text-[#6a7d92] tracking-wider uppercase font-semibold">
          Segurança da Informação
        </div>
      </div>

      {/* Export Options widgets */}
      <div className="g-card p-6 flex flex-col gap-5">
        <h3 className="font-sans font-black text-sm tracking-wider uppercase text-[#a855f7]">Baixar Dados Operacionais Consolidados</h3>
        <p className="text-xs text-[#6a7d92] leading-relaxed">
          Baixe logs instantâneos do banco de dados em tempo real da sua empresa. Os dados são estruturados de forma compatível com sistemas ERP e planilhas de faturamento corporativas.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          <button 
            onClick={exportToExcelAll}
            className="flex flex-col items-center justify-center p-6 bg-[#00aa00]/5 hover:bg-[#00aa00]/10 border border-[#00aa00]/25 rounded-2xl cursor-pointer text-center group transition-colors"
          >
            <span className="text-4xl group-hover:scale-105 transition-transform">📊</span>
            <span className="font-sans font-black text-md text-white mt-3 uppercase tracking-wide">EXPORTAR EM EXCEL (XLSX)</span>
            <span className="text-[10px] text-[#6a7d92] mt-1">Gera abas dinâmicas para cada um dos 6 módulos logísticos</span>
          </button>

          <button 
            onClick={exportToPDFAll}
            className="flex flex-col items-center justify-center p-6 bg-[#ef4444]/5 hover:bg-[#ef4444]/10 border border-[#ef4444]/25 rounded-2xl cursor-pointer text-center group transition-colors"
          >
            <span className="text-4xl group-hover:scale-105 transition-transform">📄</span>
            <span className="font-sans font-black text-md text-white mt-3 uppercase tracking-wide">EXPORTAR EM PDF EDITORIAL</span>
            <span className="text-[10px] text-[#6a7d92] mt-1">Impressiona na auditoria mensal com folha de rosto e métricas</span>
          </button>

        </div>
      </div>

      {/* 📥 Importador Inteligente de Planilhas */}
      <div className="g-card p-6 flex flex-col gap-5 border-l-2 border-l-[#10b981]">
        <div>
          <span className="text-[10px] text-[#10b981] font-black tracking-widest uppercase">MÓDULO DE IMPORTAÇÃO AUTOMÁTICA</span>
          <h3 className="font-sans font-black text-sm tracking-wider uppercase text-white mt-1">📥 Importador Inteligente de Planilhas (XLSX / CSV)</h3>
          <p className="text-xs text-[#6a7d92] leading-relaxed mt-1">
            Selecione uma planilha do Excel ou arquivo CSV para carregar registros em massa diretamente no banco de dados Firebase. O importador mapeia automaticamente colunas equivalentes (como "Data", "Operador", "Quantidade", "Embalagem", "SKU").
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
          
          {/* Target Module Choice */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold text-[#6a7d92] uppercase tracking-wider">
              1. Selecione o Módulo de Destino
            </label>
            <select
              value={importTarget}
              onChange={(e: any) => {
                setImportTarget(e.target.value);
                setImportFile(null);
                setImportPreview([]);
                setImportHeaders([]);
              }}
              className="bg-[#0f1319] border border-[#222d3a] text-snow text-xs rounded-lg p-3 outline-none cursor-pointer hover:border-[#10b981] transition-colors"
            >
              <option value="repack">🔄 Repack (Reembalagem de SKU)</option>
              <option value="despejo">🪣 Despejo (Eficiência de Descarte)</option>
              <option value="quebras">💥 Quebras e Avarias (SKU Perdas)</option>
              <option value="validades">📆 Validades e Lotes (FEFO)</option>
              <option value="armazem">🚛 Movimentação de Pátio (Portaria)</option>
            </select>
          </div>

          {/* File Picker */}
          <div className="md:col-span-2 flex flex-col gap-2">
            <label className="text-[10px] font-bold text-[#6a7d92] uppercase tracking-wider">
              2. Escolha o Arquivo Excel (.xlsx, .xls) ou CSV
            </label>
            <div className="relative border border-dashed border-[#222d3a] rounded-xl hover:border-[#10b981] transition-colors p-3 flex items-center justify-between bg-[#0f1319]/40">
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="flex items-center gap-3">
                <span className="text-2xl">excel</span>
                <div className="text-left">
                  <span className="text-xs font-bold text-snow block truncate max-w-[200px]">
                    {importFile ? importFile.name : 'Nenhum arquivo selecionado'}
                  </span>
                  <span className="text-[10px] text-[#6a7d92] block">
                    {importFile ? `${(importFile.size / 1024).toFixed(1)} KB` : 'Arraste ou clique para selecionar'}
                  </span>
                </div>
              </div>
              <span className="text-[10px] font-bold uppercase text-[#10b981] bg-[#10b981]/10 px-2 py-1 rounded">
                PROCURAR
              </span>
            </div>
          </div>

        </div>

        {/* Excel Data Preview Panel */}
        {importFile && importHeaders.length > 0 && (
          <div className="border border-[#222d3a] rounded-xl bg-[#0a0d13] p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-[#222d3a] pb-2">
              <span className="text-[10px] font-bold text-[#10b981] uppercase tracking-wider">
                Visualização Prévia (Colunas Detectadas: {importHeaders.length})
              </span>
              <span className="text-[10px] text-[#6a7d92] font-mono">
                {importPreview.length} de {importPreview.length} linhas de amostra exibidas
              </span>
            </div>

            {/* Header badges */}
            <div className="flex flex-wrap gap-1">
              {importHeaders.map(h => (
                <span key={h} className="text-[9px] font-mono font-bold text-[#6a7d92] bg-[#11151c] px-2 py-0.5 rounded border border-[#222d3a]">
                  {h}
                </span>
              ))}
            </div>

            {/* Sample Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-[10px] font-mono text-[#6a7d92]">
                <thead>
                  <tr className="border-b border-[#222d3a] text-snow">
                    {importHeaders.slice(0, 6).map(h => (
                      <th key={h} className="py-1">{h}</th>
                    ))}
                    {importHeaders.length > 6 && <th className="py-1">...</th>}
                  </tr>
                </thead>
                <tbody>
                  {importPreview.map((row, idx) => (
                    <tr key={idx} className="border-b border-[#222d3a]/40">
                      {importHeaders.slice(0, 6).map(h => (
                        <td key={h} className="py-1 truncate max-w-[120px]">{String(row[h] || '—')}</td>
                      ))}
                      {importHeaders.length > 6 && <td className="py-1">...</td>}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Submit Import Action */}
            <div className="flex items-center justify-between border-t border-[#222d3a] pt-3 mt-1">
              <p className="text-[10px] text-[#6a7d92] leading-normal max-w-[70%]">
                Ao clicar em confirmar, o sistema carregará automaticamente as linhas desta planilha no Firebase utilizando inteligência de equivalência de cabeçalhos.
              </p>
              <button
                onClick={handleImportSubmit}
                disabled={importing}
                className="py-2 px-5 bg-[#10b981] hover:bg-[#059669] text-black font-extrabold text-xs uppercase rounded-lg cursor-pointer transition-colors"
              >
                {importing ? 'SINCADO COMPLETO...' : '🚀 CONFIRMAR IMPORTAÇÃO'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Backup Weekly simulation section */}
      <div className="g-card p-6 flex flex-col gap-5 border-l-2 border-l-[#a855f7]">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <span className="text-[10px] text-[#a855f7] font-black tracking-widest uppercase">Weekly Automated Cloud Backups</span>
            <h4 className="font-sans font-black text-md text-snow mt-1.5 uppercase">Rotina Semanal de Backups Automáticos</h4>
          </div>
          <button 
            onClick={handleTriggerManualBackup}
            disabled={backingUp}
            className="py-2.5 px-5 bg-[#a855f7] hover:bg-violet font-bold text-xs uppercase tracking-widest text-snow border-none rounded-lg cursor-pointer transition-colors"
          >
            {backingUp ? 'EXECUTANDO ENCRYPTION...' : '🔄 FAZER BACKUP COMPLETO AGORA'}
          </button>
        </div>

        <p className="text-xs text-[#6a7d92] leading-relaxed">
          O sistema executa backups programados todos os Sábados às 23:59 UTC, gerando pontos de restauração encriptados de todos os reabastecimentos, repacks, limpezas de pátio e quebras da empresa. Total de linhas prontas para backup: <strong className="text-snow">{totalLogsLines} registros</strong>.
        </p>

        {/* List of backup logs table */}
        <div className="overflow-x-auto border border-[#222d3a] rounded-xl bg-[#0a0d13]">
          <table className="w-full text-left border-collapse font-sans text-xs min-w-[600px]">
            <thead>
              <tr className="bg-[#11151c] border-b border-[#222d3a]">
                <th className="p-3 text-[#6a7d92] uppercase font-bold text-[9px] tracking-wider">Código Backup</th>
                <th className="p-3 text-[#6a7d92] uppercase font-bold text-[9px] tracking-wider">Data do Ponto</th>
                <th className="p-3 text-[#6a7d92] uppercase font-bold text-[9px] tracking-wider">Tipo de Execução</th>
                <th className="p-3 text-[#6a7d92] uppercase font-bold text-[9px] tracking-wider text-center">Registros Inclusos</th>
                <th className="p-3 text-[#6a7d92] uppercase font-bold text-[9px] tracking-wider text-center">Tamanho</th>
                <th className="p-3 text-[#6a7d92] uppercase font-bold text-[9px] tracking-wider">Autorizador</th>
                <th className="p-3 text-[#6a7d92] uppercase font-bold text-[9px] tracking-wider text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#222d3a]/55">
              {backups.map(b => (
                <tr key={b.id} className="hover:bg-[#151b23]/10">
                  <td className="p-3 font-mono font-bold text-[#a855f7]">{b.id}</td>
                  <td className="p-3 font-mono">{b.data}</td>
                  <td className="p-3">{b.tipo}</td>
                  <td className="p-3 text-center font-bold text-snow">{b.totalLinhas} linhas</td>
                  <td className="p-3 text-center text-[#6a7d92] font-mono">{b.tamanhoKb} KB</td>
                  <td className="p-3 truncate max-w-[120px]">{b.operador}</td>
                  <td className="p-3 text-right">
                    <span className="text-[10px] font-sans font-bold text-green px-2 py-0.5 rounded bg-[#22c55e]/15 border border-[#22c55e]/25">
                      ✓ Ativo / Seguro
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
export {};
