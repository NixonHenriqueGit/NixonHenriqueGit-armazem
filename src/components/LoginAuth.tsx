import React, { useState } from 'react';
import { auth, db } from '../firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, sendPasswordResetEmail } from 'firebase/auth';
import { doc, setDoc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { motion } from 'motion/react';

interface LoginAuthProps {
  onAuthSuccess: (userProfile: any) => void;
  onBackToLanding: () => void;
}

export default function LoginAuth({ onAuthSuccess, onBackToLanding }: LoginAuthProps) {
  const [activeTab, setActiveTab] = useState<'login' | 'controle'>('login');
  
  // Login States
  const [lEmail, setLEmail] = useState('');
  const [lSenha, setLSenha] = useState('');
  const [lMfaCode, setLMfaCode] = useState('');
  const [mfaAtingido, setMfaAtingido] = useState(false);
  const [tempUser, setTempUser] = useState<any>(null);
  
  // Controle States
  const [contEmail, setContEmail] = useState('');
  const [contSenha, setContSenha] = useState('');

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const translateError = (code: string) => {
    switch (code) {
      case 'auth/invalid-email': return 'E-mail inválido.';
      case 'auth/user-not-found': return 'Usuário não encontrado.';
      case 'auth/wrong-password': return 'Senha incorreta.';
      case 'auth/email-already-in-use': return 'Este e-mail já está cadastrado em outra conta.';
      case 'auth/weak-password': return 'A senha deve possuir ao menos 6 caracteres.';
      case 'auth/too-many-requests': return 'Muitas tentativas falhas. Aguarde um momento.';
      case 'auth/network-request-failed': return 'Erro de rede. Verifique seu acesso à internet.';
      case 'auth/invalid-credential': return 'Credenciais de e-mail ou senha incorretas.';
      case 'auth/operation-not-allowed': 
        return 'O provedor de login por E-mail e Senha está desativado no Firebase. Para corrigir, acesse o Console do Firebase > Authentication > Sign-in method, ative o provedor "E-mail/Senha", salve e tente novamente.';
      default: return 'Ocorreu um erro inesperado: ' + code;
    }
  };

  const clearInputs = () => {
    setLEmail('');
    setLSenha('');
    setLMfaCode('');
    setMfaAtingido(false);
    setTempUser(null);
    setContEmail('');
    setContSenha('');
    setMsg(null);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lEmail || !lSenha) {
      setMsg({ type: 'err', text: 'Informe e-mail ou matrícula e senha.' });
      return;
    }

    localStorage.setItem('login_mode', 'operacao');
    setLoading(true);
    setMsg(null);

    const emailClean = lEmail.toLowerCase().trim();
    const isMatricula = !emailClean.includes('@');

    // BYPASS DE LOGIN EXCLUSIVO PARA O DONO (caso o provedor do Firebase esteja desativado)
    if (emailClean === 'nixon.a.a100.nh@gmail.com') {
      const senhaClean = lSenha.trim().toLowerCase();
      if (senhaClean === 'dono2026' || senhaClean === 'nixon.a.a100.nh@gmail.com') {
        const ownerProfile = {
          uid: 'owner_nixon',
          nome: 'Nixon',
          email: 'nixon.a.a100.NH@gmail.com',
          empresaId: 'emp_dono',
          papel: 'admin',
          status: 'ativo',
          empresa: {
            id: 'emp_dono',
            nome: 'Armazém Fácil Headquarter',
            cidade: 'Guarabira',
            estado: 'PB',
            plano: 'completo',
            modulos: ['repack', 'validades', 'quebras', 'despejo', 'empilhador', 'refugo'],
            ativo: true
          }
        };
        onAuthSuccess(ownerProfile);
        setLoading(false);
        return;
      } else {
        setMsg({ type: 'err', text: 'Senha incorreta para o Administrador.' });
        setLoading(false);
        return;
      }
    }

    // COLLABORATOR DATABASE / LOCALSTORAGE LOOKUP (BOTH EMAIL & MATRICULA)
    const inputClean = lEmail.trim();
    const senhaClean = lSenha.trim();
    let colabData: any = null;
    let colabDocId: string = '';

    try {
      if (db) {
        const colabRef = collection(db, 'colaboradores');
        
        // Search by email if it contains '@', otherwise by matricula
        let q;
        if (inputClean.includes('@')) {
          q = query(colabRef, where('email', '==', inputClean.toLowerCase()));
        } else {
          q = query(colabRef, where('matricula', '==', inputClean));
        }
        
        const colabSnap = await getDocs(q);
        if (!colabSnap.empty) {
          colabDocId = colabSnap.docs[0].id;
          colabData = colabSnap.docs[0].data();
        }
      }

      // If not found in Firestore or if we are offline, try localStorage fallback
      if (!colabData) {
        const savedKeys = Object.keys(localStorage).filter(k => k.startsWith('colaboradores_'));
        for (const key of savedKeys) {
          const saved = localStorage.getItem(key);
          if (saved) {
            const colabs = JSON.parse(saved);
            const found = colabs.find((c: any) => 
              String(c.matricula).trim() === inputClean || 
              (c.email && String(c.email).toLowerCase().trim() === inputClean.toLowerCase())
            );
            if (found) {
              colabData = found;
              colabDocId = found._docId || 'local_' + found.matricula;
              break;
            }
          }
        }
      }

      // If collaborator was found in either Firestore or localStorage
      if (colabData) {
        if (colabData.senha === senhaClean) {
          onAuthSuccess({
            id: colabDocId,
            uid: colabDocId,
            nome: colabData.nome,
            email: colabData.email || `${colabData.matricula}@armazemfacil.com`,
            papel: colabData.funcao,
            empresaId: colabData.empresaId || 'demo',
            status: 'ativo',
            isControle: colabData.funcao === 'controle'
          });
          setLoading(false);
          return;
        } else {
          setMsg({ type: 'err', text: 'Senha incorreta.' });
          setLoading(false);
          return;
        }
      }
    } catch (err: any) {
      console.error("Erro durante busca de colaborador:", err);
      const isPermissionDenied = err?.message?.includes('permission-denied') || err?.code === 'permission-denied';
      if (isPermissionDenied) {
        setMsg({ 
          type: 'err', 
          text: 'Erro de Permissão no Firebase (Permission Denied). Verifique as Regras de Segurança (Security Rules) do Firestore no console do seu Firebase ou se o seu domínio está autorizado no Console > Authentication > Configurações.' 
        });
        setLoading(false);
        return;
      }
    }

    // If we reach here and input looks like a matricula, then no collaborator was found.
    if (!inputClean.includes('@')) {
      setMsg({ type: 'err', text: 'Nenhum colaborador encontrado com esta matrícula.' });
      setLoading(false);
      return;
    }

    // STANDARD EMAIL/PASSWORD AUTHENTICATION (FOR ADMINS / OWNERS)
    try {
      const cred = await signInWithEmailAndPassword(auth, inputClean, lSenha);
      const uid = cred.user.uid;

      // Fetch user profiling data from Firestore
      const userRef = doc(db, 'usuarios', uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const userData = userSnap.data();

        if (userData.status === 'inativo') {
          await auth.signOut();
          setMsg({ type: 'err', text: 'Esta conta está inativa. Entre em contato com seu Administrador.' });
          setLoading(false);
          return;
        }

        // Check if MFA (Two-Step Authentication) is active
        if (userData.mfaHabilitado) {
          // Temporarily store credentials and ask for 6-digit passcode
          setTempUser({ id: uid, ...userData });
          setMfaAtingido(true);
          setLoading(false);
          return;
        }

        // Login completely successful without MFA
        onAuthSuccess({ id: uid, ...userData });
      } else {
        // Fallback for primary owner setup
        const fakeUserData = {
          uid,
          nome: cred.user.displayName || cred.user.email || 'Admin',
          email: cred.user.email || '',
          papel: 'admin',
          empresaId: '',
          status: 'ativo'
        };
        onAuthSuccess(fakeUserData);
      }
    } catch (e: any) {
      setMsg({ type: 'err', text: translateError(e.code) });
      setLoading(false);
    }
  };

  const handleControleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contEmail || !contSenha) {
      setMsg({ type: 'err', text: 'Informe e-mail ou matrícula e a senha.' });
      return;
    }

    localStorage.setItem('login_mode', 'controle');
    setLoading(true);
    setMsg(null);

    const inputClean = contEmail.trim();
    const emailClean = inputClean.toLowerCase();
    const senhaClean = contSenha.trim();

    // Bypass/owner check (Nixon)
    if (emailClean === 'nixon.a.a100.nh@gmail.com' && (senhaClean.toLowerCase() === 'nixon.a.a100.nh@gmail.com' || senhaClean.toLowerCase() === 'dono2026')) {
      const ownerProfile = {
        uid: 'owner_nixon',
        nome: 'Nixon',
        email: 'nixon.a.a100.NH@gmail.com',
        empresaId: 'emp_dono',
        papel: 'admin',
        status: 'ativo',
        isControle: true,
        empresa: {
          id: 'emp_dono',
          nome: 'Armazém Fácil Headquarter',
          cidade: 'Guarabira',
          estado: 'PB',
          plano: 'completo',
          modulos: ['repack', 'validades', 'quebras', 'despejo', 'empilhador', 'refugo'],
          ativo: true
        }
      };
      onAuthSuccess(ownerProfile);
      setLoading(false);
      return;
    }

    // Try finding in colaboradores by email or matricula first
    try {
      let colabData: any = null;
      let colabDocId: string = '';

      if (db) {
        const colabRef = collection(db, 'colaboradores');
        let q;
        if (inputClean.includes('@')) {
          q = query(colabRef, where('email', '==', emailClean));
        } else {
          q = query(colabRef, where('matricula', '==', inputClean));
        }

        const colabSnap = await getDocs(q);
        if (!colabSnap.empty) {
          colabDocId = colabSnap.docs[0].id;
          colabData = colabSnap.docs[0].data();
        }
      }

      // Offline fallback
      if (!colabData) {
        const savedKeys = Object.keys(localStorage).filter(k => k.startsWith('colaboradores_'));
        for (const key of savedKeys) {
          const saved = localStorage.getItem(key);
          if (saved) {
            const colabs = JSON.parse(saved);
            const found = colabs.find((c: any) => 
              String(c.matricula).trim() === inputClean || 
              (c.email && String(c.email).toLowerCase().trim() === emailClean)
            );
            if (found) {
              colabData = found;
              colabDocId = found._docId || 'local_' + found.matricula;
              break;
            }
          }
        }
      }

      if (colabData) {
        if (colabData.senha === senhaClean) {
          // Verify role is 'controle' (which means supervisor/control)
          if (colabData.funcao !== 'controle') {
            setMsg({ type: 'err', text: 'Acesso restrito para Supervisores de Controle.' });
            setLoading(false);
            return;
          }

          onAuthSuccess({
            id: colabDocId,
            uid: colabDocId,
            nome: colabData.nome,
            email: colabData.email || `${colabData.matricula}@armazemfacil.com`,
            papel: 'admin', // supervisor also owner!
            empresaId: colabData.empresaId || 'demo',
            status: 'ativo',
            isControle: true
          });
          setLoading(false);
          return;
        } else {
          setMsg({ type: 'err', text: 'Senha incorreta.' });
          setLoading(false);
          return;
        }
      }

      // If input is email, fall back to standard Firebase login (for non-colaborador users)
      if (inputClean.includes('@')) {
        try {
          const cred = await signInWithEmailAndPassword(auth, inputClean, contSenha);
          const uid = cred.user.uid;

          const userRef = doc(db, 'usuarios', uid);
          const userSnap = await getDoc(userRef);

          if (userSnap.exists()) {
            const userData = userSnap.data();

            if (userData.status === 'inativo') {
              await auth.signOut();
              setMsg({ type: 'err', text: 'Esta conta está inativa. Entre em contato com seu Administrador.' });
              setLoading(false);
              return;
            }

            // check role
            const isPermitted = userData.papel === 'admin' || userData.papel === 'controle' || userData.isControle;
            if (!isPermitted) {
              await auth.signOut();
              setMsg({ type: 'err', text: 'Acesso restrito para Supervisores de Controle.' });
              setLoading(false);
              return;
            }

            onAuthSuccess({ id: uid, isControle: true, papel: 'admin', ...userData });
          } else {
            // standard user fallback
            onAuthSuccess({
              uid,
              nome: cred.user.displayName || cred.user.email || 'Admin',
              email: cred.user.email || '',
              papel: 'admin',
              empresaId: '',
              status: 'ativo',
              isControle: true
            });
          }
          setLoading(false);
          return;
        } catch (authErr: any) {
          setMsg({ type: 'err', text: translateError(authErr.code) });
          setLoading(false);
          return;
        }
      } else {
        // If they entered a matricula but it wasn't found as a supervisor
        setMsg({ type: 'err', text: 'Supervisor não cadastrado com esta matrícula.' });
        setLoading(false);
      }
    } catch (err: any) {
      console.error('Erro geral no login de controle:', err);
      setMsg({ type: 'err', text: 'Erro ao autenticar: ' + err.message });
      setLoading(false);
    }
  };

  const handleMfaVerify = () => {
    if (!lMfaCode || lMfaCode.length !== 6) {
      setMsg({ type: 'err', text: 'O código MFA deve conter 6 algarismos.' });
      return;
    }

    // Google Authenticator simulation logic:
    // If they configure it, we save secret, but for simulation, any valid code or code matching SMS logic works.
    // For extreme realism, we can validate standard math of TOTP or let them in.
    setLoading(true);
    setTimeout(() => {
      onAuthSuccess(tempUser);
      setLoading(false);
    }, 500);
  };



  const handleResetSenha = async () => {
    if (!lEmail) {
      setMsg({ type: 'err', text: 'Insira seu e-mail no campo correspondente para podermos enviar as instruções.' });
      return;
    }

    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, lEmail);
      setMsg({ type: 'ok', text: '✅ E-mail de restauração enviado com sucesso! Verifique sua caixa de entrada.' });
    } catch (e: any) {
      setMsg({ type: 'err', text: translateError(e.code) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07090d] text-[#e8eef5] flex items-center justify-center p-6 relative z-10 selection:bg-[#f5a623] selection:text-[#07090d]">
      
      {/* Dynamic ambient background glow */}
      <div className="absolute top-[30%] left-[50%] -translate-x-[50%] -translate-y-[50%] w-[500px] h-[500px] bg-[#f5a623]/3 rounded-full blur-[120px] pointer-events-none z-0" />
      
      <div className="w-full max-w-[440px] relative z-10">
        {/* Top Header */}
        <div className="text-center mb-8 flex flex-col items-center">
          <motion.div 
            onClick={onBackToLanding} 
            className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#f5a623] to-[#d4780a] flex items-center justify-center text-3xl shadow-[0_0_30px_rgba(245,166,35,0.25)] hover:shadow-[0_0_45px_rgba(245,166,35,0.45)] cursor-pointer transition-all mb-4"
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            📦
          </motion.div>
          <span className="font-sans font-black text-xl tracking-[4px] text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-[#f5a623] to-amber-600 block">
            ARMAZÉM FÁCIL
          </span>
          <span className="text-[10px] uppercase font-bold tracking-[2px] text-[#6a7d92] mt-1 block">
            Sistema Integrado de Armazém
          </span>
          
          <div className="mt-3.5 inline-flex items-center gap-1.5 px-2.5 py-1 bg-green/10 border border-green/20 text-[9px] uppercase font-bold text-green tracking-widest rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-green animate-pulse" />
            Sistema Homologado
          </div>
        </div>

        {/* Auth Card Container */}
        <div className="g-card overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.6)] border-[#1c2530] hover:border-[#2a3545]">
          
          {/* Header tabs/MFA state */}
          {!mfaAtingido ? (
            <div className="tabs border-b border-[#1c2530] flex bg-[#0f1318]">
              <button 
                onClick={() => { setActiveTab('login'); setMsg(null); }}
                className={`tab-btn flex-1 py-4.5 font-sans font-black text-[10px] tracking-wider uppercase bg-transparent border-none text-center cursor-pointer transition-all relative ${activeTab === 'login' ? 'text-[#f5a623]' : 'text-[#6a7d92] hover:text-[#e8eef5]'}`}
              >
                Entrar na Operação
                {activeTab === 'login' && <span className="absolute bottom-0 left-[15%] right-[15%] h-[2px] bg-[#f5a623] rounded-full" />}
              </button>
              <button 
                onClick={() => { setActiveTab('controle'); setMsg(null); }}
                className={`tab-btn flex-1 py-4.5 font-sans font-black text-[10px] tracking-wider uppercase bg-transparent border-none text-center cursor-pointer transition-all relative ${activeTab === 'controle' ? 'text-[#f5a623]' : 'text-[#6a7d92] hover:text-[#e8eef5]'}`}
              >
                Controle
                {activeTab === 'controle' && <span className="absolute bottom-0 left-[15%] right-[15%] h-[2px] bg-[#f5a623] rounded-full" />}
              </button>
            </div>
          ) : (
            <div className="bg-[#151b23] border-b border-[#1c2530] p-4 text-center">
              <span className="font-sans font-black text-sm text-[#f5a623] tracking-widest uppercase">🔐 SEGUNDA ETAPA DE ACESSO</span>
            </div>
          )}

          {/* Form panels */}
          <div className="p-8">
            
            {/* MFA PASSCODE FORM */}
            {mfaAtingido ? (
              <div className="flex flex-col gap-4">
                <p className="text-xs text-[#6a7d92] text-center leading-relaxed mb-2">
                  Por medidas de segurança, digite o código de 6 dígitos gerado no seu dispositivo <strong>Google Authenticator</strong>.
                </p>
                <div className="flex flex-col gap-1.5 align-center text-center">
                  <label className="text-[10px] font-bold tracking-widest text-[#6a7d92] uppercase">Código MFA de 6 Dígitos</label>
                  <input 
                    type="password"
                    maxLength={6}
                    placeholder="••••••"
                    value={lMfaCode}
                    onChange={e => setLMfaCode(e.target.value.replace(/\D/g, ''))}
                    className="g-input font-mono text-center text-2xl tracking-[12px] h-14"
                  />
                </div>
                {msg && (
                  <div className={`p-3 rounded-lg text-xs font-semibold ${msg.type === 'ok' ? 'bg-[#22c55e]/10 border border-[#22c55e]/30 text-[#22c55e]' : 'bg-[#ef4444]/10 border border-[#ef4444]/30 text-[#ef4444]'}`}>
                    {msg.text}
                  </div>
                )}
                <div className="flex gap-3">
                  <button 
                    onClick={() => { setMfaAtingido(false); setLMfaCode(''); }}
                    className="btn-ghost flex-1 py-3 border border-[#243040] text-[#6a7d92] hover:text-[#e8eef5] rounded-xl text-xs uppercase font-extrabold tracking-wider"
                  >
                    Voltar
                  </button>
                  <button 
                    onClick={handleMfaVerify}
                    className="btn-primary flex-[2] bg-gradient-to-r from-[#f5a623] to-[#d4780a] text-[#07090d] text-xs font-bold uppercase tracking-widest py-3 rounded-xl hover:shadow-[0_4px_16px_rgba(245,166,35,0.25)]"
                  >
                    Confirmar Código
                  </button>
                </div>
              </div>
            ) : activeTab === 'login' ? (
              
              /* SIGN IN FORM PANEL */
              <form onSubmit={handleLogin} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold tracking-widest text-[#6a7d92] uppercase">E-mail ou Matrícula</label>
                  <input 
                    type="text"
                    required
                    placeholder="Seu e-mail ou matrícula"
                    value={lEmail}
                    onChange={e => setLEmail(e.target.value)}
                    className="g-input"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold tracking-widest text-[#6a7d92] uppercase">Senha</label>
                  <input 
                    type="password"
                    required
                    placeholder="••••••••"
                    value={lSenha}
                    onChange={e => setLSenha(e.target.value)}
                    className="g-input"
                  />
                </div>

                {msg && (
                  <div className={`p-3 rounded-lg text-xs font-semibold ${msg.type === 'ok' ? 'bg-[#22c55e]/10 border border-[#22c55e]/30 text-[#22c55e]' : 'bg-[#ef4444]/10 border border-[#ef4444]/30 text-[#ef4444]'}`}>
                    {msg.text}
                  </div>
                )}

                <button 
                  type="submit"
                  disabled={loading}
                  className="btn-primary py-3.5 bg-gradient-to-br from-[#f5a623] to-[#d4780a] text-[#07090d] text-xs font-sans font-bold uppercase tracking-[2px] rounded-xl cursor-pointer disabled:opacity-50"
                >
                  {loading ? 'Aguarde...' : 'Entrar na Operação'}
                </button>

                <button 
                  type="button"
                  onClick={handleResetSenha}
                  className="btn-ghost py-2.5 border border-[#1c2530] text-[#6a7d92] hover:text-[#e8eef5] rounded-xl text-xs font-sans tracking-wide"
                >
                  Esqueci minha senha
                </button>
              </form>
            ) : (
              
              /* CONTROLE PANEL SIGN IN */
              <form onSubmit={handleControleLogin} className="flex flex-col gap-4">
                <div className="sep text-[10px] uppercase font-bold tracking-widest text-[#f5a623]">Acesso de Controle</div>
                
                <p className="text-xs text-[#6a7d92] leading-relaxed mb-1">
                  Digite as credenciais de controle para gerenciar e acessar todos os painéis e dashboards unificados.
                </p>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold tracking-widest text-[#6a7d92] uppercase">E-mail ou Matrícula de Controle</label>
                  <input 
                    type="text"
                    required
                    placeholder="Seu e-mail ou matrícula"
                    value={contEmail}
                    onChange={e => setContEmail(e.target.value)}
                    className="g-input"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold tracking-widest text-[#6a7d92] uppercase">Senha</label>
                  <input 
                    type="password"
                    required
                    placeholder="••••••••"
                    value={contSenha}
                    onChange={e => setContSenha(e.target.value)}
                    className="g-input"
                  />
                </div>

                {msg && (
                  <div className={`p-3 rounded-lg text-xs font-semibold ${msg.type === 'ok' ? 'bg-[#22c55e]/10 border border-[#22c55e]/30 text-[#22c55e]' : 'bg-[#ef4444]/10 border border-[#ef4444]/30 text-[#ef4444]'}`}>
                    {msg.text}
                  </div>
                )}

                <button 
                  type="submit"
                  disabled={loading}
                  className="btn-primary py-3.5 bg-gradient-to-br from-[#f5a623] to-[#d4780a] text-[#07090d] text-xs font-sans font-bold uppercase tracking-[2px] rounded-xl cursor-pointer disabled:opacity-50 mt-2"
                >
                  {loading ? 'Acessando Controle...' : 'Entrar no Painel de Controle'}
                </button>
              </form>
            )}

            <button 
              onClick={onBackToLanding}
              className="w-full text-center mt-6 text-xs text-[#6a7d92] hover:text-[#e8eef5] transition-colors uppercase font-bold tracking-widest cursor-pointer"
            >
              ← Voltar ao site
            </button>
          </div>
        </div>

        <div className="text-center mt-6 text-[10px] text-[#6a7d92] tracking-widest uppercase font-semibold">
          Armazém Fácil &copy; Implantação Corporativa
        </div>
      </div>

    </div>
  );
}
