document.addEventListener('DOMContentLoaded', function () {
    const calendarEl = document.getElementById('calendar');
    const formEl = document.getElementById('booking-form');
    const timeSelect = document.getElementById('time');
    const selectedDateLabel = document.getElementById('selected-date');

    let agendamentos = [
        { date: '2025-05-20', time: '10:00' },
        { date: '2025-05-20', time: '14:00' },
        { date: '2025-05-21', time: '09:00' }
    ];

    function formatarHora(hora) {
        return hora.toString().padStart(2, '0') + ':00';
    }

    function gerarHorariosDisponiveis(dataSelecionada) {
        const data = new Date(dataSelecionada);
        const diaSemana = data.getDay();
        let horariosDisponiveis = [];

        if (diaSemana >= 1 && diaSemana <= 5) {
            for (let h = 8; h <= 11; h++) {
                horariosDisponiveis.push(formatarHora(h));
            }
            for (let h = 13; h <= 21; h++) {
                horariosDisponiveis.push(formatarHora(h));
            }
        } else if (diaSemana === 6) {
            for (let h = 9; h <= 18; h++) {
                horariosDisponiveis.push(formatarHora(h));
            }
        }

        return horariosDisponiveis;
    }

    const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        locale: 'pt-br',
        selectable: true,
        dateClick: function (info) {
            const dataSelecionada = info.dateStr;
            selectedDateLabel.textContent = dataSelecionada;

            const diaSelecionado = new Date(dataSelecionada).getDay();
            if (diaSelecionado === 0) {
                alert("⚠️ Domingo não está disponível para agendamentos.");
                return;
            }

            formEl.style.display = 'block';
            window.scrollTo({
                top: document.body.scrollHeight,
                behavior: 'smooth'
            });

            const horariosAgendados = agendamentos
                .filter(a => a.date === dataSelecionada)
                .map(a => a.time);

            const horariosDisponiveis = gerarHorariosDisponiveis(dataSelecionada);

            timeSelect.innerHTML = '';

            horariosDisponiveis.forEach(hora => {
                const option = document.createElement('option');
                option.value = hora;
                option.textContent = horariosAgendados.includes(hora)
                    ? `${hora} (Indisponível)`
                    : hora;
                option.disabled = horariosAgendados.includes(hora);
                timeSelect.appendChild(option);
            });

            sessionStorage.setItem("selectedDate", dataSelecionada);
        }
    });

    calendar.render();

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

        const jaAgendado = agendamentos.some(a => a.date === data && a.time === hora);
        if (jaAgendado) {
            alert("⚠️ Este horário acabou de ser reservado por outra pessoa. Escolha outro horário.");
            return;
        }

        agendamentos.push({ date: data, time: hora });

        alert(`✅ Agendamento confirmado com sucesso!\n\n👤 Nome: ${nome}\n📅 Data: ${data}\n⏰ Hora: ${hora}\n📞 Telefone: ${telefone}`);

        this.reset();
        formEl.style.display = 'none';
        sessionStorage.removeItem("selectedDate");
    });
});
