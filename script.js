/* =========================================================
   FORMULÁRIO DE CONTATO — Dra. Ana Beatriz Ferreira
   Validação + Envio via Web3Forms
   ========================================================= */

(function () {
  'use strict';

  /* ── Referências aos elementos ───────────────────────────── */
  const form       = document.getElementById('form-contato');
  const btnEnviar  = document.getElementById('btn-form-enviar');
  const feedback   = document.getElementById('form-feedback');
  const fbIcone    = feedback.querySelector('.form-feedback-icone');
  const fbMsg      = feedback.querySelector('.form-feedback-msg');

  /* Campos obrigatórios: [id do input, id do span de erro, label amigável] */
  const CAMPOS_OBRIGATORIOS = [
    { id: 'input-nome',     erroId: 'erro-nome',     label: 'Nome completo' },
    { id: 'input-telefone', erroId: 'erro-telefone', label: 'Telefone / WhatsApp' },
    { id: 'input-email',    erroId: 'erro-email',    label: 'E-mail' },
  ];

  /* ── Helpers de validação ────────────────────────────────── */

  function validarEmail(valor) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor.trim());
  }

  function validarTelefone(valor) {
    return /^[\d\s()\-+]{8,}$/.test(valor.trim());
  }

  /**
   * Valida um campo individual.
   * Retorna true se válido; false e exibe erro se inválido.
   */
  function validarCampo(campo) {
    const el     = document.getElementById(campo.id);
    const erroEl = document.getElementById(campo.erroId);
    const valor  = el.value.trim();
    let mensagem = '';

    el.classList.remove('invalido', 'valido');
    erroEl.textContent = '';

    if (!valor) {
      mensagem = campo.label + ' é obrigatório.';
    } else if (campo.id === 'input-email' && !validarEmail(valor)) {
      mensagem = 'Informe um e-mail válido.';
    } else if (campo.id === 'input-telefone' && !validarTelefone(valor)) {
      mensagem = 'Informe um telefone válido (ex: (11) 99999-9999).';
    }

    if (mensagem) {
      el.classList.add('invalido');
      erroEl.textContent = mensagem;
      return false;
    }

    el.classList.add('valido');
    return true;
  }

  /** Valida todos os campos obrigatórios e retorna true se todos passarem. */
  function validarFormulario() {
    let valido = true;
    CAMPOS_OBRIGATORIOS.forEach(function (campo) {
      if (!validarCampo(campo)) valido = false;
    });
    return valido;
  }

  /* ── Validação em tempo real (blur + input) ──────────────── */
  CAMPOS_OBRIGATORIOS.forEach(function (campo) {
    const el = document.getElementById(campo.id);
    el.addEventListener('blur', function () {
      validarCampo(campo);
    });
    el.addEventListener('input', function () {
      if (el.classList.contains('invalido')) {
        validarCampo(campo);
      }
    });
  });

  /* ── Controle visual do botão ────────────────────────────── */

  function setCarregando(estado) {
    const icone = btnEnviar.querySelector('.btn-form-icone');
    const texto = btnEnviar.querySelector('.btn-form-texto');

    if (estado) {
      btnEnviar.disabled = true;
      icone.innerHTML = '<span class="btn-spinner"></span>';
      texto.textContent = 'Enviando...';
    } else {
      btnEnviar.disabled = false;
      icone.textContent = '\uD83D\uDCE4';
      texto.textContent = 'Enviar mensagem';
    }
  }

  /* ── Exibe o banner de feedback ──────────────────────────── */

  function exibirFeedback(tipo, mensagem) {
    feedback.hidden = false;
    feedback.className = 'form-feedback ' + tipo;
    fbIcone.textContent = tipo === 'sucesso' ? '\u2705' : '\u274C';
    fbMsg.textContent   = mensagem;
    feedback.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function ocultarFeedback() {
    feedback.hidden = true;
    feedback.className = 'form-feedback';
    fbMsg.textContent   = '';
    fbIcone.textContent = '';
  }

  /* ── Envio via Web3Forms ─────────────────────────────────── */

  form.addEventListener('submit', async function (evento) {
    evento.preventDefault();
    ocultarFeedback();

    /* 1. Validação client-side */
    if (!validarFormulario()) {
      exibirFeedback('erro', 'Por favor, corrija os campos destacados em vermelho antes de enviar.');
      var primeiro = document.querySelector('.form-input.invalido');
      if (primeiro) primeiro.focus();
      return;
    }

    /* 2. Envia para a API do Web3Forms */
    setCarregando(true);

    try {
      var dados  = new FormData(form);
      var objeto = {};
      dados.forEach(function (valor, chave) {
        objeto[chave] = valor;
      });

      var resposta = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(objeto)
      });

      var json = await resposta.json();

      if (resposta.ok && json.success) {
        exibirFeedback(
          'sucesso',
          'Mensagem enviada com sucesso! Responderei em até 24 horas úteis. Obrigada pelo contato!'
        );
        form.reset();
        form.querySelectorAll('.valido').forEach(function (el) {
          el.classList.remove('valido');
        });
      } else {
        throw new Error(json.message || 'Erro desconhecido da API.');
      }
    } catch (erro) {
      console.error('[Formulário] Erro ao enviar:', erro);
      exibirFeedback(
        'erro',
        'Não foi possível enviar sua mensagem no momento. Tente novamente ou entre em contato pelo WhatsApp.'
      );
    } finally {
      setCarregando(false);
    }
  });

})();
