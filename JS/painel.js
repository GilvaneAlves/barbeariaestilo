// Configuração do Firebase (substitua pelos seus dados reais)
const firebaseConfig = {
  apiKey: "AIzaSyAvzq9MGYRWg2Wlh3kb7VhvJ7Hw_g98Bnc",
  authDomain: "barber-90dee.firebaseapp.com",
  databaseURL: "https://barber-90dee-default-rtdb.firebaseio.com",
  projectId: "barber-90dee",
  storageBucket: "barber-90dee.appspot.com",
  messagingSenderId: "837339106776",
  appId: "1:837339106776:web:ea921be933612312a4f6ad",
  measurementId: "G-8EBY1LE1XP"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const database = firebase.database();

// Verifica se o barbeiro está logado
auth.onAuthStateChanged(user => {
  if (!user) {
    alert("Você precisa estar logado para acessar o painel.");
    window.location.href = "login.html";
  } else {
    carregarAgendamentos();
  }
});

// Função para carregar agendamentos
function carregarAgendamentos() {
  const tabela = document.querySelector("#agendamentos-table tbody");
  tabela.innerHTML = "";

  database.ref("agendamentos").once("value", snapshot => {
    if (snapshot.exists()) {
      const dados = snapshot.val();

      Object.keys(dados).forEach(id => {
        const agendamento = dados[id];

        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${agendamento.nome}</td>
          <td>${agendamento.telefone}</td>
          <td>${agendamento.data}</td>
          <td>${agendamento.hora}</td>
          <td><button onclick="cancelarAgendamento('${id}')">Cancelar</button></td>
        `;
        tabela.appendChild(tr);
      });
    } else {
      const tr = document.createElement("tr");
      tr.innerHTML = `<td colspan="5" style="text-align: center;">Nenhum agendamento encontrado.</td>`;
      tabela.appendChild(tr);
    }
  });
}

// Função para cancelar agendamento
function cancelarAgendamento(id) {
  if (confirm("Deseja realmente cancelar este agendamento?")) {
    database.ref("agendamentos/" + id).remove()
      .then(() => {
        alert("Agendamento cancelado com sucesso.");
        carregarAgendamentos(); // Atualiza a tabela
      })
      .catch(error => {
        alert("Erro ao cancelar agendamento: " + error.message);
      });
  }
}

// Botão de logout
document.getElementById("logout").addEventListener("click", () => {
  auth.signOut().then(() => {
    window.location.href = "login.html";
  });
});
