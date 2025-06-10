document.addEventListener('DOMContentLoaded', function () {
  // Inicialização Firebase (compatível com firebase-app-compat e firebase-database-compat)
  const db = firebase.database();

  const calendarEl = document.getElementById('calendar');
  const formEl = document.getElementById('booking-form');
  const timeSelect = document.getElementById('time');
  const selectedDateLabel = document.getElementById('selected-date');

  // Formatar hora para "HH:00"
  function formatarHora(hora) {
    return hora.toString().padStart(2, '0') + ':00';
  }

  // Gerar horários conforme dia da semana
  function gerarHorariosDisponiveis(dataSelecionada) {
    const data = new Date(dataSelecionada);
    const diaSemana = data.getDay();
    let horariosDisponiveis = [];

    if (diaSemana >= 1 && diaSemana <= 5) {
      for (let h = 8; h <= 11; h++) horariosDisponiveis.push(formatarHora(h));
      for (let h = 13; h <= 21; h++) horariosDisponiveis.push(formatarHora(h));
    } else if (diaSemana === 6) {
      for (let h = 9; h <= 18; h++) horariosDisponiveis.push(formatarHora(h));
    }
    return horariosDisponiveis;
  }

  // Busca agendamentos da data no Firebase
  function pegarAgendamentosPorData(dataSelecionada) {
    return db.ref('agendamentos')
      .orderByChild('data')
      .equalTo(dataSelecionada)
      .once('value')
      .then(snapshot => {
        const agendamentos = [];
        snapshot.forEach(childSnapshot => {
          agendamentos.push(childSnapshot.val());
        });
        return agendamentos;
      });
  }

  // Inicializa FullCalendar
  const calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: 'dayGridMonth',
    locale: 'pt-br',
    selectable: true,
    dateClick: function (info) {
      const dataSelecionada = info.dateStr;
      selectedDateLabel.textContent = dataSelecionada;

      const diaSemana = new Date(dataSelecionada).getDay();
      if (diaSemana === 0) {
        alert("⚠️ Domingo não está disponível para agendamentos.");
        formEl.style.display = 'none';
        return;
      }

      formEl.style.display = 'block';
      window.scrollTo({
        top: document.body.scrollHeight,
        behavior: 'smooth'
      });

      // Buscar agendamentos já feitos para a data selecionada
      pegarAgendamentosPorData(dataSelecionada).then(agendamentos => {
        const horariosAgendados = agendamentos.map(a => a.hora);
        const horariosDisponiveis = gerarHorariosDisponiveis(dataSelecionada);

        timeSelect.innerHTML = ''; // limpar opções

        horariosDisponiveis.forEach(hora => {
          const option = document.createElement('option');
          option.value = hora;
          if (horariosAgendados.includes(hora)) {
            option.textContent = `${hora} (Indisponível)`;
            option.disabled = true;
          } else {
            option.textContent = hora;
            option.disabled = false;
          }
          timeSelect.appendChild(option);
        });

        sessionStorage.setItem("selectedDate", dataSelecionada);
      });
    }
  });

  calendar.render();

  // Evento submit do formulário de agendamento
  document.getElementById('form-agendamento').addEventListener('submit', function (e) {
    e.preventDefault();

    const nome = document.getElementById('name').value.trim();
    const telefone = document.getElementById('phone').value.trim();
    const hora = document.getElementById('time').value;
    const data = sessionStorage.getItem("selectedDate");

    if (!data || !hora || !nome || !telefone) {
      alert("❌ Por favor, preencha todos os campos antes de confirmar o agendamento.");
      return;
    }

    // Antes de salvar, verificar novamente se o horário está disponível no Firebase
    pegarAgendamentosPorData(data).then(agendamentos => {
      const horariosAgendados = agendamentos.map(a => a.hora);

      if (horariosAgendados.includes(hora)) {
        alert("⚠️ Este horário já foi reservado por outra pessoa. Por favor, escolha outro horário.");
        return;
      }

      // Salvar agendamento no Firebase
      const novoAgendamentoRef = db.ref('agendamentos').push();
      novoAgendamentoRef.set({
        nome: nome,
        telefone: telefone,
        data: data,
        hora: hora
      }).then(() => {
        alert(`✅ Agendamento confirmado com sucesso!\n\n👤 Nome: ${nome}\n📅 Data: ${data}\n⏰ Hora: ${hora}\n📞 Telefone: ${telefone}`);

        this.reset();
        formEl.style.display = 'none';
        sessionStorage.removeItem("selectedDate");
      }).catch(error => {
        alert("Erro ao salvar agendamento: " + error.message);
      });
    });
  });
});
