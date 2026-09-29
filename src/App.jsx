import { useState, useEffect } from "react";
import { db } from "./firebase";
import {
  collection, onSnapshot, addDoc, updateDoc, doc,
} from "firebase/firestore";

// ─── Styles — PsicoApp (roxo/lavanda) ────────────────────────────────────────
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Inter', sans-serif; background: #F3EEFF; color: #1A1030; }

  .app { min-height: 100vh; display: flex; flex-direction: column; }
  .app-shell { display: flex; flex: 1; min-height: 0; }

  /* ── Sidebar ── */
  .sidebar {
    width: 240px; flex-shrink: 0; background: #2D1B69;
    display: flex; flex-direction: column;
    position: fixed; top: 0; left: 0; bottom: 0;
    z-index: 200; box-shadow: 2px 0 16px rgba(45,27,105,0.25);
  }
  .sidebar-brand { padding: 28px 24px 20px; border-bottom: 1px solid rgba(255,255,255,0.08); }
  .sidebar-brand-name { font-size: 18px; font-weight: 700; color: #fff; letter-spacing: -0.4px; }
  .sidebar-brand-sub { font-size: 11px; color: rgba(255,255,255,0.4); margin-top: 3px; }
  .sidebar-user { padding: 14px 24px; border-bottom: 1px solid rgba(255,255,255,0.06); }
  .sidebar-user-name { font-size: 13px; font-weight: 600; color: #fff; }
  .sidebar-user-role { font-size: 11px; color: rgba(255,255,255,0.45); margin-top: 2px; display: flex; align-items: center; gap: 5px; }
  .sidebar-role-dot { width: 6px; height: 6px; border-radius: 50%; background: #C084FC; flex-shrink: 0; }
  .sidebar-nav { flex: 1; padding: 14px 10px; display: flex; flex-direction: column; gap: 2px; }
  .sidebar-item {
    display: flex; align-items: center; gap: 11px;
    padding: 10px 14px; border-radius: 8px;
    cursor: pointer; font-size: 14px; font-weight: 500;
    color: rgba(255,255,255,0.55);
    transition: background 0.15s, color 0.15s;
    border: none; background: none;
    font-family: 'Inter', sans-serif; width: 100%; text-align: left;
  }
  .sidebar-item:hover { background: rgba(255,255,255,0.08); color: #fff; }
  .sidebar-item.active { background: rgba(192,132,252,0.2); color: #E9D5FF; font-weight: 600; }
  .sidebar-item-icon { font-size: 16px; width: 20px; text-align: center; }
  .sidebar-footer { padding: 14px 10px; border-top: 1px solid rgba(255,255,255,0.06); }
  .btn-logout {
    width: 100%; background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.12); color: rgba(255,255,255,0.6);
    border-radius: 8px; padding: 10px 14px; font-size: 13px;
    cursor: pointer; font-family: 'Inter', sans-serif; text-align: left;
    transition: background 0.15s;
  }
  .btn-logout:hover { background: rgba(255,255,255,0.12); color: #fff; }

  /* ── Área principal ── */
  .main-area { margin-left: 240px; flex: 1; display: flex; flex-direction: column; min-height: 100vh; }
  .topbar {
    background: #fff; border-bottom: 1px solid #E8D5FF;
    padding: 0 32px; height: 56px;
    display: flex; align-items: center; justify-content: space-between;
    position: sticky; top: 0; z-index: 100;
  }
  .topbar-title { font-size: 15px; font-weight: 600; color: #2D1B69; }
  .topbar-badge { background: #F3EEFF; color: #6B3FA0; border-radius: 20px; padding: 4px 12px; font-size: 12px; font-weight: 600; border: 1px solid #E8D5FF; }
  .main-content { flex: 1; padding: 32px; }

  /* ── Login ── */
  .login-wrap {
    min-height: 100vh; display: flex; align-items: center; justify-content: center;
    background: linear-gradient(135deg, #2D1B69 0%, #6B3FA0 100%);
    padding: 40px 20px;
  }
  .login-card { background: #fff; border-radius: 16px; padding: 44px 40px; max-width: 440px; width: 100%; box-shadow: 0 8px 48px rgba(45,27,105,0.25); }
  .login-icon { width: 56px; height: 56px; background: #2D1B69; color: #fff; border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 22px; font-weight: 700; margin: 0 auto 18px; }
  .login-title { font-size: 22px; font-weight: 700; color: #2D1B69; text-align: center; margin-bottom: 6px; }
  .login-sub { font-size: 13px; color: #7C6A9A; text-align: center; margin-bottom: 28px; line-height: 1.5; }
  .login-error { background: #FEF0EF; color: #D04848; border-radius: 8px; padding: 10px 14px; font-size: 13px; margin-bottom: 14px; text-align: center; }
  .login-success { background: #F3EEFF; color: #6B3FA0; border-radius: 8px; padding: 10px 14px; font-size: 13px; margin-bottom: 14px; text-align: center; font-weight: 600; }

  /* ── Formulários ── */
  .field-group { margin-bottom: 16px; }
  .field-label { display: block; font-size: 13px; font-weight: 600; color: #3A2D55; margin-bottom: 6px; }
  .field-input {
    width: 100%; border: 1.5px solid #E8D5FF; border-radius: 8px;
    padding: 10px 14px; font-size: 14px; font-family: 'Inter', sans-serif;
    color: #1A1030; background: #FAF7FF; outline: none; transition: border-color 0.15s;
  }
  .field-input:focus { border-color: #6B3FA0; background: #fff; }
  .field-textarea {
    width: 100%; border: 1.5px solid #E8D5FF; border-radius: 8px;
    padding: 10px 14px; font-size: 14px; font-family: 'Inter', sans-serif;
    color: #1A1030; background: #FAF7FF; outline: none;
    resize: vertical; min-height: 90px; line-height: 1.6;
  }
  .field-textarea:focus { border-color: #6B3FA0; background: #fff; }
  .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; }

  /* ── Botões ── */
  .btn-primary { background: #2D1B69; color: #fff; border: none; border-radius: 8px; padding: 12px 28px; font-size: 14px; font-weight: 600; font-family: 'Inter', sans-serif; cursor: pointer; width: 100%; transition: background 0.2s; }
  .btn-primary:hover { background: #1e1147; }
  .btn-secondary { background: #fff; color: #6B3FA0; border: 1.5px solid #D8B4FE; border-radius: 8px; padding: 10px 20px; font-size: 14px; font-weight: 600; font-family: 'Inter', sans-serif; cursor: pointer; transition: all 0.2s; }
  .btn-secondary:hover { background: #F3EEFF; }
  .btn-danger { background: #FEF0EF; color: #D04848; border: 1.5px solid #D04848; border-radius: 8px; padding: 10px 20px; font-size: 14px; font-weight: 600; font-family: 'Inter', sans-serif; cursor: pointer; }
  .link-btn { background: none; border: none; color: #6B3FA0; font-size: 14px; font-weight: 600; cursor: pointer; font-family: 'Inter', sans-serif; text-decoration: underline; }
  .back-btn { display: flex; align-items: center; gap: 6px; font-size: 14px; color: #6B3FA0; font-weight: 600; cursor: pointer; margin-bottom: 20px; background: none; border: none; font-family: 'Inter', sans-serif; }
  .success-msg { background: #F3EEFF; color: #6B3FA0; border-radius: 8px; padding: 10px 14px; font-size: 13px; font-weight: 600; margin-bottom: 16px; border: 1px solid #E8D5FF; }

  /* ── Abas login ── */
  .role-tabs { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 24px; }
  .role-tab { padding: 11px; border: 1.5px solid #E8D5FF; border-radius: 8px; cursor: pointer; text-align: center; transition: all 0.15s; background: #FAF7FF; font-size: 13px; font-weight: 600; color: #7C6A9A; font-family: 'Inter', sans-serif; }
  .role-tab.active { border-color: #6B3FA0; background: #F3EEFF; color: #6B3FA0; }
  .divider { display: flex; align-items: center; gap: 12px; margin: 18px 0; }
  .divider-line { flex: 1; height: 1px; background: #E8D5FF; }
  .divider-text { font-size: 12px; color: #B09DC0; }

  /* ── Cards ── */
  .page-title { font-size: 22px; font-weight: 700; color: #2D1B69; margin-bottom: 24px; }
  .card { background: #fff; border-radius: 12px; padding: 24px; border: 1px solid #E8D5FF; margin-bottom: 20px; }
  .card-title { font-size: 15px; font-weight: 700; color: #2D1B69; margin-bottom: 16px; display: flex; align-items: center; gap: 8px; }
  .stat-card { background: #fff; border-radius: 12px; padding: 20px; border: 1px solid #E8D5FF; }
  .stat-value { font-size: 26px; font-weight: 700; color: #2D1B69; }
  .stat-label { font-size: 12px; color: #7C6A9A; margin-top: 4px; }

  /* ── Pacientes ── */
  .paciente-row { display: flex; align-items: center; gap: 14px; padding: 14px 16px; border: 1px solid #E8D5FF; border-radius: 10px; margin-bottom: 10px; cursor: pointer; transition: all 0.15s; }
  .paciente-row:hover { border-color: #6B3FA0; background: #FAF7FF; }
  .paciente-avatar { width: 40px; height: 40px; border-radius: 50%; background: #F3EEFF; display: flex; align-items: center; justify-content: center; font-size: 15px; font-weight: 700; color: #6B3FA0; flex-shrink: 0; border: 1px solid #E8D5FF; }
  .paciente-nome { font-size: 14px; font-weight: 600; color: #1A1030; }
  .paciente-info { font-size: 12px; color: #7C6A9A; }

  /* ── Badges ── */
  .badge { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 12px; font-weight: 600; }
  .badge-purple { background: #F3EEFF; color: #6B3FA0; border: 1px solid #E8D5FF; }
  .badge-green { background: #E6F7EE; color: #1A7A45; }
  .badge-rose { background: #FEF0EF; color: #D04848; }
  .badge-amber { background: #FEF3C7; color: #92400E; }

  /* ── Sessões ── */
  .sessao-card { border: 1px solid #E8D5FF; border-left: 3px solid #6B3FA0; border-radius: 8px; padding: 16px; margin-bottom: 12px; }
  .sessao-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
  .sessao-data { font-size: 13px; font-weight: 600; color: #2D1B69; }
  .sessao-nota { font-size: 14px; color: #3A2D55; line-height: 1.6; }

  /* ── Consultas ── */
  .consulta-item { display: flex; align-items: center; gap: 14px; padding: 14px; border: 1px solid #E8D5FF; border-radius: 10px; margin-bottom: 10px; }
  .consulta-data { background: #F3EEFF; border-radius: 8px; padding: 8px 12px; text-align: center; min-width: 58px; }
  .consulta-dia { font-size: 20px; font-weight: 700; color: #2D1B69; line-height: 1; }
  .consulta-mes { font-size: 11px; color: #6B3FA0; font-weight: 600; }
  .consulta-info { flex: 1; }
  .consulta-tipo { font-size: 14px; font-weight: 600; color: #1A1030; }
  .consulta-hora { font-size: 13px; color: #7C6A9A; }

  /* ── Agenda form ── */
  .agenda-form { display: grid; grid-template-columns: 1fr 1fr 1fr auto; gap: 12px; align-items: end; margin-bottom: 20px; }
  .section-divider { font-size: 11px; font-weight: 700; color: #6B3FA0; text-transform: uppercase; letter-spacing: 0.6px; margin: 20px 0 12px; padding-bottom: 8px; border-bottom: 1px solid #E8D5FF; }

  /* ── Anamnese / plano ── */
  .obs-box { background: #F3EEFF; border-radius: 8px; padding: 14px; font-size: 13px; color: #2D1B69; line-height: 1.6; border: 1px solid #E8D5FF; }
  .info-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #F3EEFF; font-size: 14px; gap: 16px; }
  .info-label { color: #7C6A9A; flex-shrink: 0; }
  .info-value { font-weight: 600; text-align: right; }

  /* ── Módulos futuros (placeholder) ── */
  .modulo-futuro { border: 2px dashed #D8B4FE; border-radius: 12px; padding: 28px; text-align: center; margin-bottom: 16px; }
  .modulo-futuro-icon { font-size: 28px; margin-bottom: 10px; }
  .modulo-futuro-titulo { font-size: 15px; font-weight: 600; color: #6B3FA0; margin-bottom: 6px; }
  .modulo-futuro-desc { font-size: 13px; color: #7C6A9A; line-height: 1.5; }

  /* ── Responsive ── */
  @media (max-width: 768px) {
    .sidebar { width: 64px; }
    .sidebar-brand, .sidebar-user { display: none; }
    .sidebar-item span { display: none; }
    .sidebar-item { justify-content: center; padding: 12px; }
    .main-area { margin-left: 64px; }
    .main-content { padding: 20px 16px; }
    .grid-2, .grid-3 { grid-template-columns: 1fr; }
    .agenda-form { grid-template-columns: 1fr 1fr; }
  }
`;

// ─── Helpers ──────────────────────────────────────────────────────────────────
const MESES = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
function mesLabel(dataStr) { return MESES[parseInt(dataStr.split("/")[1]) - 1] || ""; }

// ─── LOGIN ────────────────────────────────────────────────────────────────────
function Login({ onLogin, users, onCadastro }) {
  const [tela, setTela] = useState("login");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  // Cadastro paciente
  const [cpNome, setCpNome] = useState("");
  const [cpEmail, setCpEmail] = useState("");
  const [cpTelefone, setCpTelefone] = useState("");
  const [cpSenha, setCpSenha] = useState("");
  const [cpSenha2, setCpSenha2] = useState("");
  const [cpCep, setCpCep] = useState("");
  const [cpRua, setCpRua] = useState("");
  const [cpNumero, setCpNumero] = useState("");
  const [cpBairro, setCpBairro] = useState("");
  const [cpCidade, setCpCidade] = useState("");
  const [cpEstado, setCpEstado] = useState("");
  const [cpCepLoading, setCpCepLoading] = useState(false);
  const [cpCepErro, setCpCepErro] = useState("");

  const buscarCep = async (cep) => {
    const cepLimpo = cep.replace(/\D/g, "");
    if (cepLimpo.length !== 8) return;
    setCpCepLoading(true); setCpCepErro("");
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
      const data = await res.json();
      if (data.erro) { setCpCepErro("CEP não encontrado."); }
      else {
        setCpRua(data.logradouro || "");
        setCpBairro(data.bairro || "");
        setCpCidade(data.localidade || "");
        setCpEstado(data.uf || "");
      }
    } catch { setCpCepErro("Erro ao buscar CEP."); }
    finally { setCpCepLoading(false); }
  };

  // Cadastro psicólogo
  const [cnNome, setCnNome] = useState("");
  const [cnEmail, setCnEmail] = useState("");
  const [cnCrp, setCnCrp] = useState("");
  const [cnTelefone, setCnTelefone] = useState("");
  const [cnSenha, setCnSenha] = useState("");
  const [cnSenha2, setCnSenha2] = useState("");
  const [cnEspecialidade, setCnEspecialidade] = useState("");

  const handleLogin = () => {
    const user = users.find(u => u.email === email && u.senha === senha);
    if (user) { setErro(""); onLogin(user); }
    else setErro("E-mail ou senha incorretos.");
  };

  const handleCadastroPaciente = () => {
    if (!cpNome || !cpEmail || !cpSenha) { setErro("Preencha todos os campos obrigatórios."); return; }
    if (cpSenha !== cpSenha2) { setErro("As senhas não coincidem."); return; }
    if (users.find(u => u.email === cpEmail)) { setErro("E-mail já cadastrado."); return; }
    onCadastro({ nome: cpNome, email: cpEmail, telefone: cpTelefone, senha: cpSenha, role: "paciente", endereco: { cep: cpCep, rua: cpRua, numero: cpNumero, bairro: cpBairro, cidade: cpCidade, estado: cpEstado } });
    setSucesso("Cadastro realizado! Faça login para acessar.");
    setTela("login"); setEmail(""); setSenha(""); setErro("");
  };

  const handleCadastroPsi = () => {
    if (!cnNome || !cnEmail || !cnCrp || !cnSenha) { setErro("Preencha todos os campos obrigatórios."); return; }
    if (cnSenha !== cnSenha2) { setErro("As senhas não coincidem."); return; }
    if (users.find(u => u.email === cnEmail)) { setErro("E-mail já cadastrado."); return; }
    onCadastro({ nome: cnNome, email: cnEmail, crp: cnCrp, telefone: cnTelefone, especialidade: cnEspecialidade, senha: cnSenha, role: "psicologo" });
    setSucesso("Cadastro realizado! Faça login para acessar.");
    setTela("login"); setEmail(""); setSenha(""); setErro("");
  };

  return (
    <div className="login-wrap">
      <div className="login-card">
        <div className="login-icon">P</div>
        <h1 className="login-title">PsicoApp</h1>
        {tela === "login" && (
          <>
            <p className="login-sub">Plataforma de gestão para psicólogos e pacientes</p>
            {sucesso && <div className="login-success">✓ {sucesso}</div>}
            {erro && <div className="login-error">{erro}</div>}
            <div className="field-group"><label className="field-label">E-mail</label><input className="field-input" type="email" placeholder="seu@email.com" value={email} onChange={e => setEmail(e.target.value)} /></div>
            <div className="field-group"><label className="field-label">Senha</label><input className="field-input" type="password" placeholder="••••••••" value={senha} onChange={e => setSenha(e.target.value)} onKeyDown={e => e.key === "Enter" && handleLogin()} /></div>
            <button className="btn-primary" onClick={handleLogin}>Entrar</button>
            <div className="divider"><div className="divider-line" /><span className="divider-text">Ainda não tem conta?</span><div className="divider-line" /></div>
            <div className="grid-2" style={{ gap: 10 }}>
              <button className="btn-secondary" onClick={() => { setTela("cadastro-paciente"); setErro(""); setSucesso(""); }}>Sou Paciente</button>
              <button className="btn-secondary" onClick={() => { setTela("cadastro-psi"); setErro(""); setSucesso(""); }}>Sou Psicólogo</button>
            </div>
          </>
        )}
        {tela === "cadastro-paciente" && (
          <>
            <p className="login-sub">Cadastro de Paciente</p>
            {erro && <div className="login-error">{erro}</div>}
            <div className="field-group"><label className="field-label">Nome completo *</label><input className="field-input" placeholder="Seu nome completo" value={cpNome} onChange={e => setCpNome(e.target.value)} /></div>
            <div className="field-group"><label className="field-label">E-mail *</label><input className="field-input" type="email" placeholder="seu@email.com" value={cpEmail} onChange={e => setCpEmail(e.target.value)} /></div>
            <div className="field-group"><label className="field-label">Telefone</label><input className="field-input" type="tel" placeholder="(00) 00000-0000" value={cpTelefone} onChange={e => setCpTelefone(e.target.value)} /></div>

            <div className="section-divider" style={{ marginTop: 8 }}>Endereço</div>
            <div className="field-group">
              <label className="field-label">CEP</label>
              <div style={{ display: "flex", gap: 8 }}>
                <input className="field-input" placeholder="00000-000" value={cpCep}
                  onChange={e => { setCpCep(e.target.value); buscarCep(e.target.value); }}
                  style={{ flex: 1 }} maxLength={9} />
                {cpCepLoading && <span style={{ fontSize: 12, color: "#7C6A9A", alignSelf: "center" }}>Buscando...</span>}
              </div>
              {cpCepErro && <span style={{ fontSize: 12, color: "#D04848" }}>{cpCepErro}</span>}
            </div>
            <div className="field-group"><label className="field-label">Rua / Logradouro</label><input className="field-input" placeholder="Nome da rua" value={cpRua} onChange={e => setCpRua(e.target.value)} /></div>
            <div className="grid-2">
              <div className="field-group"><label className="field-label">Número</label><input className="field-input" placeholder="Ex: 123" value={cpNumero} onChange={e => setCpNumero(e.target.value)} /></div>
              <div className="field-group"><label className="field-label">Bairro</label><input className="field-input" placeholder="Nome do bairro" value={cpBairro} onChange={e => setCpBairro(e.target.value)} /></div>
            </div>
            <div className="grid-2">
              <div className="field-group"><label className="field-label">Cidade</label><input className="field-input" placeholder="Nome da cidade" value={cpCidade} onChange={e => setCpCidade(e.target.value)} /></div>
              <div className="field-group"><label className="field-label">Estado (UF)</label><input className="field-input" placeholder="Ex: SP" value={cpEstado} onChange={e => setCpEstado(e.target.value)} maxLength={2} /></div>
            </div>

            <div className="section-divider" style={{ marginTop: 8 }}>Acesso</div>
            <div className="field-group"><label className="field-label">Senha *</label><input className="field-input" type="password" placeholder="Mínimo 6 caracteres" value={cpSenha} onChange={e => setCpSenha(e.target.value)} /></div>
            <div className="field-group"><label className="field-label">Confirmar senha *</label><input className="field-input" type="password" placeholder="Repita a senha" value={cpSenha2} onChange={e => setCpSenha2(e.target.value)} /></div>
            <button className="btn-primary" onClick={handleCadastroPaciente}>Criar conta</button>
            <div style={{ textAlign: "center", marginTop: 16 }}><button className="link-btn" onClick={() => { setTela("login"); setErro(""); }}>← Voltar ao login</button></div>
          </>
        )}
        {tela === "cadastro-psi" && (
          <>
            <p className="login-sub">Cadastro de Psicólogo</p>
            {erro && <div className="login-error">{erro}</div>}
            <div className="field-group"><label className="field-label">Nome completo *</label><input className="field-input" placeholder="Ex: Dr. Carlos Mendes" value={cnNome} onChange={e => setCnNome(e.target.value)} /></div>
            <div className="field-group"><label className="field-label">CRP *</label><input className="field-input" placeholder="Ex: CRP-06 123456" value={cnCrp} onChange={e => setCnCrp(e.target.value)} /></div>
            <div className="field-group"><label className="field-label">Abordagem terapêutica</label><input className="field-input" placeholder="Ex: TCC, Psicanálise, Humanista..." value={cnEspecialidade} onChange={e => setCnEspecialidade(e.target.value)} /></div>
            <div className="field-group"><label className="field-label">E-mail *</label><input className="field-input" type="email" placeholder="seu@email.com" value={cnEmail} onChange={e => setCnEmail(e.target.value)} /></div>
            <div className="field-group"><label className="field-label">Telefone</label><input className="field-input" type="tel" placeholder="(00) 00000-0000" value={cnTelefone} onChange={e => setCnTelefone(e.target.value)} /></div>
            <div className="field-group"><label className="field-label">Senha *</label><input className="field-input" type="password" placeholder="Mínimo 6 caracteres" value={cnSenha} onChange={e => setCnSenha(e.target.value)} /></div>
            <div className="field-group"><label className="field-label">Confirmar senha *</label><input className="field-input" type="password" placeholder="Repita a senha" value={cnSenha2} onChange={e => setCnSenha2(e.target.value)} /></div>
            <button className="btn-primary" onClick={handleCadastroPsi}>Criar conta</button>
            <div style={{ textAlign: "center", marginTop: 16 }}><button className="link-btn" onClick={() => { setTela("login"); setErro(""); }}>← Voltar ao login</button></div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── PACIENTE DASHBOARD ───────────────────────────────────────────────────────
function PacienteDashboard({ user, pacientes, onLogout }) {
  const [aba, setAba] = useState("inicio");
  const pac = pacientes.find(p => p.userId === user.id);
  const proximaConsulta = pac?.consultas?.[0];

  const anamneseVazia = {
    queixa: "", historico: "", medicamentos: "", diagnosticosAnteriores: "",
    tempoTratamento: "", objetivoTerapia: "", dormieBem: "", usoSubstancias: "",
  };
  const [anamneseEdit, setAnamneseEdit] = useState(pac?.anamnese ? { ...anamneseVazia, ...pac.anamnese } : anamneseVazia);
  const [anamneseSaved, setAnamneseSaved] = useState(false);

  const salvarAnamnese = async () => {
    if (!pac) return;
    await updateDoc(doc(db, "pacientes_psi", pac.id), { anamnese: anamneseEdit });
    setAnamneseSaved(true);
    setTimeout(() => setAnamneseSaved(false), 3000);
  };

  const menu = [
    { id: "inicio", icon: "🏠", label: "Início" },
    { id: "anamnese", icon: "📋", label: "Minha Anamnese" },
    { id: "sessoes", icon: "📓", label: "Minhas Sessões" },
    { id: "consultas", icon: "📅", label: "Consultas" },
    { id: "plano", icon: "🎯", label: "Plano Terapêutico" },
  ];

  const abaAtual = menu.find(m => m.id === aba)?.label || "PsicoApp";

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="sidebar-brand-name">PsicoApp</div>
          <div className="sidebar-brand-sub">Meu espaço terapêutico</div>
        </div>
        <div className="sidebar-user">
          <div className="sidebar-user-name">{user.nome.split(" ")[0]}</div>
          <div className="sidebar-user-role"><span className="sidebar-role-dot" />Paciente</div>
        </div>
        <nav className="sidebar-nav">
          {menu.map(m => (
            <button key={m.id} className={`sidebar-item${aba === m.id ? " active" : ""}`} onClick={() => setAba(m.id)}>
              <span className="sidebar-item-icon">{m.icon}</span><span>{m.label}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar-footer">
          <button className="btn-logout" onClick={onLogout}>Sair</button>
        </div>
      </aside>
      <div className="main-area">
        <div className="topbar">
          <span className="topbar-title">{abaAtual}</span>
          <span className="topbar-badge">Paciente</span>
        </div>
        <div className="main-content">
          {aba === "inicio" && (
            <>
              <h1 className="page-title">Olá, {user.nome.split(" ")[0]}!</h1>
              <div className="grid-3">
                <div className="stat-card"><div className="stat-value">{pac?.sessoes?.length || 0}</div><div className="stat-label">📓 Sessões realizadas</div></div>
                <div className="stat-card"><div className="stat-value">{pac?.consultas?.length || 0}</div><div className="stat-label">📅 Próximas consultas</div></div>
                <div className="stat-card"><div className="stat-value">{pac?.anamnese ? "✓" : "—"}</div><div className="stat-label">📋 Anamnese preenchida</div></div>
              </div>
              {proximaConsulta && (
                <div className="card">
                  <div className="card-title">📅 Próxima sessão agendada</div>
                  <div className="consulta-item">
                    <div className="consulta-data"><div className="consulta-dia">{proximaConsulta.data.split("/")[0]}</div><div className="consulta-mes">{mesLabel(proximaConsulta.data)}</div></div>
                    <div className="consulta-info"><div className="consulta-tipo">{proximaConsulta.tipo}</div><div className="consulta-hora">🕐 {proximaConsulta.hora}</div></div>
                    <span className="badge badge-purple">Confirmada</span>
                  </div>
                </div>
              )}
              {!pac && <div className="card"><p style={{ color: "#7C6A9A" }}>Seu cadastro está sendo configurado pelo psicólogo. Em breve suas informações aparecerão aqui.</p></div>}
            </>
          )}

          {aba === "anamnese" && (
            <>
              <h1 className="page-title">📋 Minha Anamnese</h1>
              <div className="card">
                {anamneseSaved && <div className="success-msg">✓ Anamnese salva com sucesso!</div>}
                <div className="field-group">
                  <label className="field-label">Queixa principal — o que te trouxe à terapia?</label>
                  <textarea className="field-textarea" value={anamneseEdit.queixa} onChange={e => setAnamneseEdit(a => ({ ...a, queixa: e.target.value }))} placeholder="Descreva com suas palavras o que te motivou a buscar ajuda..." />
                </div>
                <div className="field-group">
                  <label className="field-label">Histórico de saúde mental (tratamentos anteriores, internações, etc.)</label>
                  <textarea className="field-textarea" value={anamneseEdit.historico} onChange={e => setAnamneseEdit(a => ({ ...a, historico: e.target.value }))} placeholder="Ex: Já fiz terapia antes, tomei antidepressivos..." />
                </div>
                <div className="field-group">
                  <label className="field-label">Diagnósticos anteriores (se houver)</label>
                  <input className="field-input" value={anamneseEdit.diagnosticosAnteriores} onChange={e => setAnamneseEdit(a => ({ ...a, diagnosticosAnteriores: e.target.value }))} placeholder="Ex: Ansiedade, depressão, TDAH... ou nenhum" />
                </div>
                <div className="field-group">
                  <label className="field-label">Medicamentos em uso</label>
                  <input className="field-input" value={anamneseEdit.medicamentos} onChange={e => setAnamneseEdit(a => ({ ...a, medicamentos: e.target.value }))} placeholder="Ex: Nenhum, ou liste os medicamentos" />
                </div>
                <div className="grid-2">
                  <div className="field-group">
                    <label className="field-label">Você dorme bem?</label>
                    <select className="field-input" value={anamneseEdit.dormieBem} onChange={e => setAnamneseEdit(a => ({ ...a, dormieBem: e.target.value }))}>
                      <option value="">Selecione</option>
                      <option>Sim, durmo bem</option>
                      <option>Tenho dificuldade para dormir</option>
                      <option>Durmo demais</option>
                      <option>Sono muito irregular</option>
                    </select>
                  </div>
                  <div className="field-group">
                    <label className="field-label">Uso de substâncias (álcool, etc.)</label>
                    <select className="field-input" value={anamneseEdit.usoSubstancias} onChange={e => setAnamneseEdit(a => ({ ...a, usoSubstancias: e.target.value }))}>
                      <option value="">Selecione</option>
                      <option>Não uso</option>
                      <option>Uso social/ocasional</option>
                      <option>Uso frequente</option>
                      <option>Prefiro não informar</option>
                    </select>
                  </div>
                </div>
                <div className="field-group">
                  <label className="field-label">Objetivo com a terapia</label>
                  <textarea className="field-textarea" value={anamneseEdit.objetivoTerapia} onChange={e => setAnamneseEdit(a => ({ ...a, objetivoTerapia: e.target.value }))} placeholder="O que você espera alcançar com o tratamento?" />
                </div>
                <div className="field-group">
                  <label className="field-label">Há quanto tempo sente esses sintomas?</label>
                  <input className="field-input" value={anamneseEdit.tempoTratamento} onChange={e => setAnamneseEdit(a => ({ ...a, tempoTratamento: e.target.value }))} placeholder="Ex: Alguns meses, mais de um ano..." />
                </div>
                <button className="btn-primary" onClick={salvarAnamnese}>Salvar anamnese</button>
              </div>
            </>
          )}

          {aba === "sessoes" && (
            <>
              <h1 className="page-title">📓 Minhas Sessões</h1>
              {pac?.sessoes?.length ? pac.sessoes.slice().reverse().map((s, i) => (
                <div className="sessao-card" key={i}>
                  <div className="sessao-header">
                    <span className="sessao-data">{s.data} — {s.hora}</span>
                    <span className="badge badge-purple">{s.tipo || "Sessão"}</span>
                  </div>
                  {s.notaPaciente && <div className="obs-box" style={{ marginTop: 8 }}>💬 {s.notaPaciente}</div>}
                  {!s.notaPaciente && <p style={{ fontSize: 13, color: "#7C6A9A" }}>Sem anotação do paciente para esta sessão.</p>}
                </div>
              )) : <div className="card"><p style={{ color: "#7C6A9A" }}>Nenhuma sessão registrada ainda.</p></div>}
            </>
          )}

          {aba === "consultas" && (
            <>
              <h1 className="page-title">📅 Minhas Consultas</h1>
              <div className="card">
                {pac?.consultas?.length ? pac.consultas.map((c, i) => (
                  <div className="consulta-item" key={i}>
                    <div className="consulta-data"><div className="consulta-dia">{c.data.split("/")[0]}</div><div className="consulta-mes">{mesLabel(c.data)}</div></div>
                    <div className="consulta-info"><div className="consulta-tipo">{c.tipo}</div><div className="consulta-hora">🕐 {c.hora}</div></div>
                    <span className="badge badge-purple">Confirmada</span>
                  </div>
                )) : <p style={{ color: "#7C6A9A" }}>Nenhuma consulta agendada.</p>}
              </div>
            </>
          )}

          {aba === "plano" && (
            <>
              <h1 className="page-title">🎯 Plano Terapêutico</h1>
              {pac?.planoTerapeutico ? (
                <div className="card">
                  <div className="info-row"><span className="info-label">Abordagem</span><span className="info-value">{pac.planoTerapeutico.abordagem}</span></div>
                  <div className="info-row"><span className="info-label">Objetivo geral</span><span className="info-value">{pac.planoTerapeutico.objetivo}</span></div>
                  <div className="info-row"><span className="info-label">Frequência</span><span className="info-value">{pac.planoTerapeutico.frequencia}</span></div>
                  {pac.planoTerapeutico.metas?.length > 0 && (
                    <>
                      <div className="section-divider">Metas terapêuticas</div>
                      {pac.planoTerapeutico.metas.map((m, i) => (
                        <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 10, fontSize: 14 }}>
                          <span style={{ color: "#6B3FA0", fontWeight: 700, flexShrink: 0 }}>{i + 1}.</span>
                          <span style={{ color: "#3A2D55" }}>{m}</span>
                        </div>
                      ))}
                    </>
                  )}
                  {pac.planoTerapeutico.observacoes && (
                    <><div className="section-divider">Observações</div><div className="obs-box">{pac.planoTerapeutico.observacoes}</div></>
                  )}
                </div>
              ) : <div className="card"><p style={{ color: "#7C6A9A" }}>Seu plano terapêutico ainda não foi elaborado pelo psicólogo.</p></div>}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── PSICÓLOGO DASHBOARD ──────────────────────────────────────────────────────
function PsicologoDashboard({ user, pacientes, onLogout }) {
  const [aba, setAba] = useState("inicio");
  const [pacSelecionado, setPacSelecionado] = useState(null);
  const [subAba, setSubAba] = useState("anamnese");
  const [planoEdit, setPlanoEdit] = useState(null);
  const [saved, setSaved] = useState(false);
  const [novaConsulta, setNovaConsulta] = useState({ data: "", hora: "", tipo: "Sessão de terapia" });
  const [novaSessao, setNovaSessao] = useState({ data: "", hora: "", tipo: "Sessão de terapia", evolucao: "", notaPaciente: "" });
  const [sessaoSaved, setSessaoSaved] = useState(false);

  const menu = [
    { id: "inicio", icon: "🏠", label: "Início" },
    { id: "pacientes", icon: "👥", label: "Pacientes" },
    { id: "agenda", icon: "📅", label: "Agenda" },
    { id: "modulos", icon: "🔧", label: "Módulos" },
    { id: "perfil", icon: "👤", label: "Meu Perfil" },
  ];

  const abrirPaciente = (pac) => {
    setPacSelecionado(pac);
    setSubAba("anamnese");
    setPlanoEdit(pac.planoTerapeutico ? { ...pac.planoTerapeutico } : {
      abordagem: user.especialidade || "", objetivo: "", frequencia: "Semanal",
      metas: [""], observacoes: "",
    });
    setSaved(false);
    setAba("paciente-detalhe");
  };

  const salvarPlano = async () => {
    if (!pacSelecionado) return;
    await updateDoc(doc(db, "pacientes_psi", pacSelecionado.id), { planoTerapeutico: planoEdit });
    setSaved(true); setTimeout(() => setSaved(false), 3000);
  };

  const adicionarConsulta = async (pacId) => {
    if (!novaConsulta.data || !novaConsulta.hora) return;
    const [ano, mes, dia] = novaConsulta.data.split("-");
    const pacAtual = pacientes.find(p => p.id === pacId);
    if (!pacAtual) return;
    await updateDoc(doc(db, "pacientes_psi", pacId), {
      consultas: [...(pacAtual.consultas || []), { ...novaConsulta, data: `${dia}/${mes}/${ano}` }],
    });
    setNovaConsulta({ data: "", hora: "", tipo: "Sessão de terapia" });
  };

  const registrarSessao = async (pacId) => {
    if (!novaSessao.data || !novaSessao.hora || !novaSessao.evolucao) return;
    const [ano, mes, dia] = novaSessao.data.split("-");
    const pacAtual = pacientes.find(p => p.id === pacId);
    if (!pacAtual) return;
    await updateDoc(doc(db, "pacientes_psi", pacId), {
      sessoes: [...(pacAtual.sessoes || []), { ...novaSessao, data: `${dia}/${mes}/${ano}` }],
    });
    setNovaSessao({ data: "", hora: "", tipo: "Sessão de terapia", evolucao: "", notaPaciente: "" });
    setSessaoSaved(true); setTimeout(() => setSessaoSaved(false), 3000);
  };

  const todasConsultas = pacientes.flatMap(p => (p.consultas || []).map(c => ({ ...c, paciente: p.nome })));
  const abaLabel = aba === "paciente-detalhe" ? "Pacientes" : (menu.find(m => m.id === aba)?.label || "");

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="sidebar-brand-name">PsicoApp</div>
          <div className="sidebar-brand-sub">Gestão Clínica</div>
        </div>
        <div className="sidebar-user">
          <div className="sidebar-user-name">{user.nome.split(" ")[0]}</div>
          <div className="sidebar-user-role"><span className="sidebar-role-dot" />Psicólogo(a)</div>
        </div>
        <nav className="sidebar-nav">
          {menu.map(m => (
            <button key={m.id} className={`sidebar-item${(aba === m.id || (aba === "paciente-detalhe" && m.id === "pacientes")) ? " active" : ""}`}
              onClick={() => { setAba(m.id); setPacSelecionado(null); }}>
              <span className="sidebar-item-icon">{m.icon}</span><span>{m.label}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar-footer">
          <button className="btn-logout" onClick={onLogout}>Sair</button>
        </div>
      </aside>

      <div className="main-area">
        <div className="topbar">
          <span className="topbar-title">{abaLabel}</span>
          <span className="topbar-badge">Psicólogo(a)</span>
        </div>
        <div className="main-content">

          {aba === "inicio" && (
            <>
              <h1 className="page-title">Olá, {user.nome.split(" ")[0]}!</h1>
              <div className="grid-3">
                <div className="stat-card"><div className="stat-value">{pacientes.length}</div><div className="stat-label">👥 Pacientes ativos</div></div>
                <div className="stat-card"><div className="stat-value">{todasConsultas.length}</div><div className="stat-label">📅 Consultas agendadas</div></div>
                <div className="stat-card"><div className="stat-value">{pacientes.flatMap(p => p.sessoes || []).length}</div><div className="stat-label">📓 Sessões registradas</div></div>
              </div>
              <div className="card">
                <div className="card-title">👥 Pacientes recentes</div>
                {pacientes.length ? pacientes.map(p => (
                  <div className="paciente-row" key={p.id} onClick={() => abrirPaciente(p)}>
                    <div className="paciente-avatar">{p.nome[0]}</div>
                    <div style={{ flex: 1 }}>
                      <div className="paciente-nome">{p.nome}</div>
                      <div className="paciente-info">{p.anamnese?.queixa ? `Queixa: ${p.anamnese.queixa.slice(0, 60)}...` : "Anamnese não preenchida"}</div>
                    </div>
                    <span className={`badge ${p.planoTerapeutico ? "badge-green" : "badge-rose"}`}>{p.planoTerapeutico ? "Plano ativo" : "Sem plano"}</span>
                  </div>
                )) : <p style={{ color: "#7C6A9A", fontSize: 14 }}>Nenhum paciente cadastrado ainda.</p>}
              </div>
            </>
          )}

          {aba === "pacientes" && !pacSelecionado && (
            <>
              <h1 className="page-title">👥 Pacientes</h1>
              {pacientes.length ? pacientes.map(p => (
                <div className="paciente-row" key={p.id} onClick={() => abrirPaciente(p)}>
                  <div className="paciente-avatar">{p.nome[0]}</div>
                  <div style={{ flex: 1 }}>
                    <div className="paciente-nome">{p.nome}</div>
                    <div className="paciente-info">{p.email} · {(p.sessoes || []).length} sessões</div>
                  </div>
                  <span className={`badge ${p.planoTerapeutico ? "badge-green" : "badge-rose"}`}>{p.planoTerapeutico ? "Plano ativo" : "Sem plano"}</span>
                </div>
              )) : <div className="card"><p style={{ color: "#7C6A9A" }}>Nenhum paciente cadastrado ainda.</p></div>}
            </>
          )}

          {aba === "paciente-detalhe" && pacSelecionado && (() => {
            const pac = pacientes.find(p => p.id === pacSelecionado.id);
            if (!pac) return null;
            return (
              <>
                <button className="back-btn" onClick={() => { setAba("pacientes"); setPacSelecionado(null); }}>← Voltar</button>
                <h1 className="page-title">{pac.nome}</h1>
                <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
                  {["anamnese", "sessoes", "plano", "agenda"].map(s => (
                    <button key={s} className={subAba === s ? "btn-primary" : "btn-secondary"}
                      style={{ width: "auto", padding: "8px 18px", fontSize: 13 }} onClick={() => setSubAba(s)}>
                      {{ anamnese: "📋 Anamnese", sessoes: "📓 Sessões", plano: "🎯 Plano", agenda: "📅 Agenda" }[s]}
                    </button>
                  ))}
                </div>

                {subAba === "anamnese" && (
                  <div className="card">
                    <div className="card-title">📋 Anamnese do paciente</div>
                    {pac.endereco && (pac.endereco.rua || pac.endereco.cidade) && (
                      <>
                        <div className="section-divider">Endereço</div>
                        {pac.endereco.rua && <div className="info-row"><span className="info-label">Logradouro</span><span className="info-value">{pac.endereco.rua}{pac.endereco.numero ? `, ${pac.endereco.numero}` : ""}</span></div>}
                        {pac.endereco.bairro && <div className="info-row"><span className="info-label">Bairro</span><span className="info-value">{pac.endereco.bairro}</span></div>}
                        {pac.endereco.cidade && <div className="info-row"><span className="info-label">Cidade / UF</span><span className="info-value">{pac.endereco.cidade}{pac.endereco.estado ? ` — ${pac.endereco.estado}` : ""}</span></div>}
                        {pac.endereco.cep && <div className="info-row"><span className="info-label">CEP</span><span className="info-value">{pac.endereco.cep}</span></div>}
                        <div className="section-divider">Dados clínicos</div>
                      </>
                    )}
                    {pac.anamnese ? Object.entries({
                      queixa: "Queixa principal", historico: "Histórico de saúde mental",
                      diagnosticosAnteriores: "Diagnósticos anteriores", medicamentos: "Medicamentos",
                      dormieBem: "Qualidade do sono", usoSubstancias: "Uso de substâncias",
                      objetivoTerapia: "Objetivo com a terapia", tempoTratamento: "Tempo com sintomas",
                    }).map(([k, label]) => pac.anamnese[k] ? (
                      <div key={k} className="info-row">
                        <span className="info-label">{label}</span>
                        <span className="info-value" style={{ maxWidth: "60%" }}>{pac.anamnese[k]}</span>
                      </div>
                    ) : null) : <p style={{ color: "#7C6A9A" }}>Anamnese não preenchida pelo paciente.</p>}
                  </div>
                )}

                {subAba === "sessoes" && (
                  <div className="card">
                    <div className="card-title">📓 Registro de sessões</div>
                    {sessaoSaved && <div className="success-msg">✓ Sessão registrada com sucesso!</div>}
                    <div className="section-divider">Nova sessão</div>
                    <div className="agenda-form">
                      <div className="field-group" style={{ marginBottom: 0 }}><label className="field-label">Data</label><input className="field-input" type="date" value={novaSessao.data} onChange={e => setNovaSessao(n => ({ ...n, data: e.target.value }))} /></div>
                      <div className="field-group" style={{ marginBottom: 0 }}><label className="field-label">Hora</label><input className="field-input" type="time" value={novaSessao.hora} onChange={e => setNovaSessao(n => ({ ...n, hora: e.target.value }))} /></div>
                      <div className="field-group" style={{ marginBottom: 0 }}><label className="field-label">Tipo</label>
                        <select className="field-input" value={novaSessao.tipo} onChange={e => setNovaSessao(n => ({ ...n, tipo: e.target.value }))}>
                          <option>Sessão de terapia</option>
                          <option>Avaliação psicológica</option>
                          <option>Devolutiva</option>
                        </select>
                      </div>
                      <div />
                    </div>
                    <div className="field-group"><label className="field-label">Evolução / anotação do psicólogo *</label><textarea className="field-textarea" value={novaSessao.evolucao} onChange={e => setNovaSessao(n => ({ ...n, evolucao: e.target.value }))} placeholder="Registro clínico da sessão (visível apenas para o psicólogo)..." /></div>
                    <button className="btn-primary" style={{ marginBottom: 20 }} onClick={() => registrarSessao(pac.id)}>+ Registrar sessão</button>
                    <div className="section-divider">Sessões anteriores ({(pac.sessoes || []).length})</div>
                    {(pac.sessoes || []).length ? [...(pac.sessoes || [])].reverse().map((s, i) => (
                      <div className="sessao-card" key={i}>
                        <div className="sessao-header">
                          <span className="sessao-data">{s.data} — {s.hora}</span>
                          <span className="badge badge-purple">{s.tipo}</span>
                        </div>
                        <div className="sessao-nota">{s.evolucao}</div>
                      </div>
                    )) : <p style={{ color: "#7C6A9A", fontSize: 14 }}>Nenhuma sessão registrada ainda.</p>}
                  </div>
                )}

                {subAba === "plano" && (
                  <div className="card">
                    <div className="card-title">🎯 Plano Terapêutico</div>
                    {saved && <div className="success-msg">✓ Plano salvo com sucesso!</div>}
                    <div className="field-group"><label className="field-label">Abordagem terapêutica</label><input className="field-input" value={planoEdit?.abordagem || ""} onChange={e => setPlanoEdit(p => ({ ...p, abordagem: e.target.value }))} placeholder="Ex: TCC, Psicanálise, Humanista..." /></div>
                    <div className="field-group"><label className="field-label">Objetivo geral do tratamento</label><input className="field-input" value={planoEdit?.objetivo || ""} onChange={e => setPlanoEdit(p => ({ ...p, objetivo: e.target.value }))} placeholder="Ex: Redução dos sintomas de ansiedade..." /></div>
                    <div className="field-group"><label className="field-label">Frequência das sessões</label>
                      <select className="field-input" value={planoEdit?.frequencia || "Semanal"} onChange={e => setPlanoEdit(p => ({ ...p, frequencia: e.target.value }))}>
                        <option>Semanal</option><option>Quinzenal</option><option>Mensal</option><option>Duas vezes por semana</option>
                      </select>
                    </div>
                    <div className="section-divider">Metas terapêuticas</div>
                    {(planoEdit?.metas || [""]).map((meta, i) => (
                      <div key={i} className="field-group">
                        <label className="field-label">Meta {i + 1}</label>
                        <input className="field-input" value={meta} onChange={e => setPlanoEdit(p => ({ ...p, metas: p.metas.map((m, j) => j === i ? e.target.value : m) }))} placeholder={`Ex: ${i === 0 ? "Identificar gatilhos ansiosos" : i === 1 ? "Desenvolver estratégias de regulação emocional" : "Meta terapêutica"}`} />
                      </div>
                    ))}
                    <button className="btn-secondary" style={{ marginBottom: 16 }} onClick={() => setPlanoEdit(p => ({ ...p, metas: [...(p.metas || []), ""] }))}>+ Adicionar meta</button>
                    <div className="field-group"><label className="field-label">Observações clínicas</label><textarea className="field-textarea" value={planoEdit?.observacoes || ""} onChange={e => setPlanoEdit(p => ({ ...p, observacoes: e.target.value }))} placeholder="Anotações gerais sobre o caso..." /></div>
                    <button className="btn-primary" onClick={salvarPlano}>Salvar plano terapêutico</button>
                  </div>
                )}

                {subAba === "agenda" && (
                  <div className="card">
                    <div className="card-title">📅 Agendar sessão</div>
                    <div className="agenda-form">
                      <div className="field-group" style={{ marginBottom: 0 }}><label className="field-label">Data</label><input className="field-input" type="date" value={novaConsulta.data} onChange={e => setNovaConsulta(n => ({ ...n, data: e.target.value }))} /></div>
                      <div className="field-group" style={{ marginBottom: 0 }}><label className="field-label">Hora</label><input className="field-input" type="time" value={novaConsulta.hora} onChange={e => setNovaConsulta(n => ({ ...n, hora: e.target.value }))} /></div>
                      <div className="field-group" style={{ marginBottom: 0 }}><label className="field-label">Tipo</label>
                        <select className="field-input" value={novaConsulta.tipo} onChange={e => setNovaConsulta(n => ({ ...n, tipo: e.target.value }))}>
                          <option>Sessão de terapia</option><option>Primeira consulta</option><option>Avaliação psicológica</option><option>Devolutiva</option>
                        </select>
                      </div>
                      <button className="btn-primary" style={{ width: "auto", alignSelf: "flex-end" }} onClick={() => adicionarConsulta(pac.id)}>+ Agendar</button>
                    </div>
                    <div className="section-divider">Sessões agendadas</div>
                    {(pac.consultas || []).map((c, i) => (
                      <div className="consulta-item" key={i}>
                        <div className="consulta-data"><div className="consulta-dia">{c.data.split("/")[0]}</div><div className="consulta-mes">{mesLabel(c.data)}</div></div>
                        <div className="consulta-info"><div className="consulta-tipo">{c.tipo}</div><div className="consulta-hora">🕐 {c.hora}</div></div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            );
          })()}

          {aba === "agenda" && (
            <>
              <h1 className="page-title">📅 Agenda Geral</h1>
              <div className="card">
                {todasConsultas.length ? todasConsultas.map((c, i) => (
                  <div className="consulta-item" key={i}>
                    <div className="consulta-data"><div className="consulta-dia">{c.data.split("/")[0]}</div><div className="consulta-mes">{mesLabel(c.data)}</div></div>
                    <div className="consulta-info"><div className="consulta-tipo">{c.paciente}</div><div className="consulta-hora">🕐 {c.hora} · {c.tipo}</div></div>
                    <span className="badge badge-purple">Agendada</span>
                  </div>
                )) : <p style={{ color: "#7C6A9A" }}>Nenhuma sessão agendada.</p>}
              </div>
            </>
          )}

          {aba === "modulos" && (
            <>
              <h1 className="page-title">🔧 Módulos</h1>
              <p style={{ fontSize: 14, color: "#7C6A9A", marginBottom: 24 }}>Módulos adicionais disponíveis para implantação futura.</p>
              <div className="modulo-futuro">
                <div className="modulo-futuro-icon">💰</div>
                <div className="modulo-futuro-titulo">Gestão Financeira</div>
                <div className="modulo-futuro-desc">Controle de cobranças por sessão, emissão de recibos, relatório de receita mensal e histórico de pagamentos por paciente.</div>
              </div>
              <div className="modulo-futuro">
                <div className="modulo-futuro-icon">📊</div>
                <div className="modulo-futuro-titulo">Relatórios e Prontuários</div>
                <div className="modulo-futuro-desc">Geração de prontuários em PDF, relatórios de evolução terapêutica e exportação de dados clínicos.</div>
              </div>
              <div className="modulo-futuro">
                <div className="modulo-futuro-icon">📱</div>
                <div className="modulo-futuro-titulo">Comunicação com o Paciente</div>
                <div className="modulo-futuro-desc">Envio de lembretes de sessão via WhatsApp ou e-mail, tarefas entre sessões e diário de humor do paciente.</div>
              </div>
              <div className="modulo-futuro">
                <div className="modulo-futuro-icon">🧪</div>
                <div className="modulo-futuro-titulo">Testes Psicológicos</div>
                <div className="modulo-futuro-desc">Aplicação digital de escalas e testes padronizados (PHQ-9, GAD-7, BDI, etc.) com correção automática.</div>
              </div>
            </>
          )}

          {aba === "perfil" && (
            <>
              <h1 className="page-title">👤 Meu Perfil</h1>
              <div className="card">
                <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
                  <div style={{ width: 60, height: 60, borderRadius: "50%", background: "#F3EEFF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 700, color: "#6B3FA0", border: "1px solid #E8D5FF" }}>{user.nome[0]}</div>
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: "#2D1B69" }}>{user.nome}</div>
                    <div style={{ fontSize: 13, color: "#7C6A9A" }}>{user.email}</div>
                    {user.crp && <span className="badge badge-purple" style={{ marginTop: 6, display: "inline-block" }}>{user.crp}</span>}
                  </div>
                </div>
                <div className="section-divider">Informações profissionais</div>
                {user.telefone && <div className="info-row"><span className="info-label">Telefone</span><span className="info-value">{user.telefone}</span></div>}
                {user.especialidade && <div className="info-row"><span className="info-label">Abordagem</span><span className="info-value">{user.especialidade}</span></div>}
                {user.crp && <div className="info-row"><span className="info-label">CRP</span><span className="info-value">{user.crp}</span></div>}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [pacientes, setPacientes] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const unsubUsers = onSnapshot(collection(db, "users_psi"), (snap) => {
      setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setCarregando(false);
    });
    const unsubPacientes = onSnapshot(collection(db, "pacientes_psi"), (snap) => {
      setPacientes(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => { unsubUsers(); unsubPacientes(); };
  }, []);

  const handleCadastro = async (dados) => {
    const userRef = await addDoc(collection(db, "users_psi"), dados);
    if (dados.role === "paciente") {
      await addDoc(collection(db, "pacientes_psi"), {
        userId: userRef.id, nome: dados.nome, email: dados.email,
        consultas: [], sessoes: [], planoTerapeutico: null, anamnese: null,
      });
    }
  };

  if (carregando) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#F3EEFF" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 48, height: 48, background: "#2D1B69", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 700, color: "#fff", margin: "0 auto 16px" }}>P</div>
          <p style={{ color: "#7C6A9A", fontSize: 14 }}>Carregando PsicoApp...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{styles}</style>
      <div className="app">
        {!user && <Login onLogin={setUser} users={users} onCadastro={handleCadastro} />}
        {user?.role === "paciente" && <PacienteDashboard user={user} pacientes={pacientes} onLogout={() => setUser(null)} />}
        {user?.role === "psicologo" && <PsicologoDashboard user={user} pacientes={pacientes} onLogout={() => setUser(null)} />}
      </div>
    </>
  );
}
