/* ============================================================
   SCRIPT.JS — Amanda Balestra Psicóloga
   
   Módulos:
   1. Configurações (edite aqui os links do Google Calendar)
   2. Inicialização dos ícones Lucide
   3. Header: sombra ao rolar + link ativo
   4. Menu mobile (hamburguer)
   5. Modal de agendamento (Google Calendar)
   6. Formulário de contato (EmailJS)
   7. Animações de entrada (Intersection Observer)
   8. Máscara de telefone
   ============================================================ */


/* ============================================================
   1. CONFIGURAÇÕES
   
   ⚠️  EDITE ESTAS VARIÁVEIS para personalizar o site:
   ============================================================ */
const CONFIG = {

  // --- GOOGLE CALENDAR ---
  // PASSO A PASSO para configurar o agendamento:
  //
  // OPÇÃO A — Google Calendar Appointment Scheduling (recomendado, gratuito):
  //   1. Acesse https://calendar.google.com
  //   2. Clique em "+ Criar" → "Horário de consulta disponível"
  //   3. Configure os horários disponíveis
  //   4. Clique em "Abrir página de reserva" → copie a URL
  //   5. Cole a URL abaixo em GOOGLE_CALENDAR_URL
  //
  // OPÇÃO B — Embed do Google Calendar normal:
  //   1. Acesse https://calendar.google.com → Configurações do calendário
  //   2. Seção "Integrar calendário" → copie o link do iframe
  //   3. Cole abaixo
  //
  GOOGLE_CALENDAR_URL: 'https://calendar.google.com/calendar/appointments/schedules/SEU_LINK_AQUI',
  // Quando GOOGLE_CALENDAR_URL não estiver configurado, o modal mostra
  // apenas o botão de WhatsApp como alternativa.

  // --- WHATSAPP ---
  // Substitua pelo número real com DDD e código do país (55 = Brasil)
  WHATSAPP_NUMBER: '5511999999999',
  WHATSAPP_MESSAGE: 'Olá, gostaria de agendar uma consulta.',

  // --- EMAILJS (para o formulário de contato) ---
  // PASSO A PASSO para configurar o envio de e-mails:
  //   1. Acesse https://www.emailjs.com e crie uma conta gratuita
  //   2. Em "Email Services", conecte seu Gmail ou outro provedor
  //   3. Em "Email Templates", crie um template com as variáveis:
  //      {{from_name}}, {{from_email}}, {{phone}}, {{message}}
  //   4. Copie o PUBLIC KEY em "Account" → "API Keys"
  //   5. Copie o SERVICE ID e TEMPLATE ID dos itens criados
  //   6. Cole os valores abaixo
  //
  EMAILJS_PUBLIC_KEY:  'SUA_PUBLIC_KEY_AQUI',
  EMAILJS_SERVICE_ID:  'SEU_SERVICE_ID_AQUI',
  EMAILJS_TEMPLATE_ID: 'SEU_TEMPLATE_ID_AQUI',
};


/* ============================================================
   2. INICIALIZAÇÃO DOS ÍCONES LUCIDE
   Lucide é carregado via CDN no HTML. Esta linha ativa todos
   os elementos <i data-lucide="..."> na página.
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  lucide.createIcons();

  // Inicializa todos os módulos após o DOM estar pronto
  initHeader();
  initMobileMenu();
  initFadeInObserver();
  initPhoneMask();
  initEmailJS();
});


/* ============================================================
   3. HEADER: SOMBRA AO ROLAR + LINK DE NAV ATIVO
   ============================================================ */
function initHeader() {
  const header = document.getElementById('header');
  const navLinks = document.querySelectorAll('.nav-link');

  // Adiciona sombra no header quando o usuário rola a página
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 10);
    atualizarLinkAtivo();
  });

  // Atualiza qual link do menu está "ativo" com base na seção visível
  function atualizarLinkAtivo() {
    const secoes = ['inicio', 'sobre', 'abordagem', 'servicos', 'contato'];
    let secaoAtual = '';

    secoes.forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      // Se o topo da seção já passou 30% da viewport, ela é a ativa
      if (el.getBoundingClientRect().top < window.innerHeight * 0.3) {
        secaoAtual = id;
      }
    });

    navLinks.forEach(link => {
      const href = link.getAttribute('href')?.replace('#', '');
      link.classList.toggle('active', href === secaoAtual);
    });
  }
}


/* ============================================================
   4. MENU MOBILE (hamburguer)
   ============================================================ */
function initMobileMenu() {
  const btn = document.getElementById('hamburger');
  const menu = document.getElementById('mobileMenu');

  btn.addEventListener('click', () => {
    const aberto = btn.classList.toggle('open');
    menu.classList.toggle('open', aberto);
    btn.setAttribute('aria-expanded', aberto);
  });
}

// Fecha o menu mobile (chamada pelos links do menu)
function fecharMenu() {
  document.getElementById('hamburger').classList.remove('open');
  document.getElementById('mobileMenu').classList.remove('open');
}


/* ============================================================
   5. MODAL DE AGENDAMENTO
   
   Carrega o Google Calendar dentro de um iframe no modal.
   Se a URL não estiver configurada, mostra mensagem orientando.
   ============================================================ */
function abrirAgendamento() {
  const overlay = document.getElementById('modalAgendamento');
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden'; // impede rolagem do fundo

  carregarCalendario();
}

function fecharAgendamento() {
  const overlay = document.getElementById('modalAgendamento');
  overlay.classList.remove('open');
  document.body.style.overflow = ''; // restaura rolagem
}

// Fecha o modal ao clicar no overlay (fora do card)
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('modalAgendamento').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) fecharAgendamento();
  });

  // Fecha com a tecla Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') fecharAgendamento();
  });
});

// Carrega o iframe do Google Calendar
let calendarioCarregado = false;
function carregarCalendario() {
  if (calendarioCarregado) return; // só carrega uma vez

  const container = document.getElementById('calendarContainer');
  const url = CONFIG.GOOGLE_CALENDAR_URL;

  // Verifica se a URL foi configurada
  if (!url || url.includes('SEU_LINK_AQUI')) {
    // URL não configurada: exibe instrução ao desenvolvedor
    container.innerHTML = `
      <div style="padding: 2rem; text-align: center; color: #7a6e68;">
        <p style="font-size: 1.1rem; margin-bottom: 1rem;">
          📅 Para ativar o agendamento online, configure a URL do Google Calendar no arquivo <strong>script.js</strong>.
        </p>
        <p style="font-size: 0.875rem;">
          Veja as instruções no início do script.js → <code>CONFIG.GOOGLE_CALENDAR_URL</code>
        </p>
      </div>
    `;
    return;
  }

  // Cria o iframe com a URL do Google Calendar
  const iframe = document.createElement('iframe');
  iframe.src = url;
  iframe.title = 'Agendar consulta — Google Calendar';
  iframe.allow = 'fullscreen';
  iframe.onload = () => { calendarioCarregado = true; };

  container.innerHTML = ''; // remove o loading
  container.appendChild(iframe);
}


/* ============================================================
   6. FORMULÁRIO DE CONTATO (EmailJS)
   
   EmailJS permite enviar e-mails diretamente do navegador,
   sem precisar de back-end. Plano gratuito: 200 emails/mês.
   
   Para ativar:
   1. Configure os valores em CONFIG (topo deste arquivo)
   2. Inclua o SDK do EmailJS adicionando esta tag no <head> do HTML:
      <script src="https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js"></script>
   ============================================================ */
function initEmailJS() {
  // Só inicializa se a chave pública estiver configurada
  if (typeof emailjs !== 'undefined' && !CONFIG.EMAILJS_PUBLIC_KEY.includes('SUA_')) {
    emailjs.init(CONFIG.EMAILJS_PUBLIC_KEY);
  }
}

// Chamada pelo botão "Enviar Mensagem"
async function enviarMensagem() {
  const nome      = document.getElementById('nome').value.trim();
  const email     = document.getElementById('email').value.trim();
  const telefone  = document.getElementById('telefone').value.trim();
  const mensagem  = document.getElementById('mensagem').value.trim();
  const feedback  = document.getElementById('formFeedback');

  // Validação básica
  if (!nome || !email || !mensagem) {
    mostrarFeedback(feedback, 'error', '⚠️ Por favor, preencha Nome, E-mail e Mensagem.');
    return;
  }

  if (!validarEmail(email)) {
    mostrarFeedback(feedback, 'error', '⚠️ Por favor, insira um e-mail válido.');
    return;
  }

  const btn = document.querySelector('#contatoForm .btn--primary');
  btn.disabled = true;
  btn.textContent = 'Enviando...';

  // Verifica se o EmailJS está configurado e disponível
  if (typeof emailjs === 'undefined' || CONFIG.EMAILJS_PUBLIC_KEY.includes('SUA_')) {
    // Fallback: abre o cliente de e-mail nativo do usuário
    const assunto = encodeURIComponent(`Contato do site — ${nome}`);
    const corpo   = encodeURIComponent(
      `Nome: ${nome}\nE-mail: ${email}\nTelefone: ${telefone}\n\nMensagem:\n${mensagem}`
    );
    window.location.href = `mailto:contato@amandabalestra.com.br?subject=${assunto}&body=${corpo}`;

    mostrarFeedback(
      feedback, 'success',
      '✅ Abrindo seu aplicativo de e-mail... Se não abriu, envie diretamente para contato@amandabalestra.com.br'
    );
    btn.disabled = false;
    btn.textContent = 'Enviar Mensagem';
    return;
  }

  // Envia via EmailJS
  try {
    await emailjs.send(CONFIG.EMAILJS_SERVICE_ID, CONFIG.EMAILJS_TEMPLATE_ID, {
      from_name:  nome,
      from_email: email,
      phone:      telefone,
      message:    mensagem,
    });

    mostrarFeedback(feedback, 'success', '✅ Mensagem enviada com sucesso! Em breve entrarei em contato.');
    // Limpa o formulário após envio
    document.getElementById('nome').value = '';
    document.getElementById('email').value = '';
    document.getElementById('telefone').value = '';
    document.getElementById('mensagem').value = '';

  } catch (err) {
    console.error('Erro ao enviar e-mail:', err);
    mostrarFeedback(feedback, 'error', '❌ Erro ao enviar. Tente pelo WhatsApp ou envie e-mail diretamente.');
  }

  btn.disabled = false;
  btn.textContent = 'Enviar Mensagem';
}

// Exibe o feedback de sucesso ou erro
function mostrarFeedback(el, tipo, texto) {
  el.className = `form-feedback ${tipo}`;
  el.textContent = texto;
  // Rola até o feedback para que o usuário veja
  el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Valida formato de e-mail
function validarEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}


/* ============================================================
   7. ANIMAÇÕES DE ENTRADA (Intersection Observer)
   
   Adiciona a classe .fade-in em elementos que devem aparecer
   ao entrar na viewport, e .visible quando isso acontece.
   ============================================================ */
function initFadeInObserver() {
  // Seleciona os elementos que devem animar
  const alvosDiretos = document.querySelectorAll(
    '.section-icon, .section-title, .section-subtitle, ' +
    '.hero__title, .hero__subtitle, .hero__desc, .hero__card, ' +
    '.sobre__photo-wrap, .sobre__info, ' +
    '.abordagem__grid .card, .abordagem__quote, ' +
    '.service-card, .sinais, ' +
    '.contato__info, .contato__form-wrap, ' +
    '.footer__brand, .footer__nav, .footer__contact'
  );

  // Adiciona a classe base de animação
  alvosDiretos.forEach(el => el.classList.add('fade-in'));

  // Cria o observer
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target); // anima só uma vez
        }
      });
    },
    { threshold: 0.12 } // dispara quando 12% do elemento está visível
  );

  alvosDiretos.forEach(el => observer.observe(el));
}


/* ============================================================
   8. MÁSCARA DE TELEFONE
   
   Formata automaticamente o campo telefone: (00) 00000-0000
   ============================================================ */
function initPhoneMask() {
  const input = document.getElementById('telefone');
  if (!input) return;

  input.addEventListener('input', (e) => {
    let v = e.target.value.replace(/\D/g, ''); // remove não-dígitos
    if (v.length > 11) v = v.slice(0, 11);

    // Aplica a máscara
    if (v.length <= 2)       v = v.replace(/^(\d{0,2})/, '($1');
    else if (v.length <= 6)  v = v.replace(/^(\d{2})(\d{0,4})/, '($1) $2');
    else if (v.length <= 10) v = v.replace(/^(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
    else                     v = v.replace(/^(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');

    e.target.value = v;
  });
}
