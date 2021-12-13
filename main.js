const app = document.querySelector("#app");

app.innerHTML = `
    <div class="todos">
        <div class="todos-header">
            <h3 class="todos-title">Lista de tareas</h3>
            <div>
                <p>Te quedan <span class="todos-count">0</span> tarea(s) por realizar!! </p>
                <button type="button" class="todos-clear" style="display:none;" >Borra Completados</button>
            </div>
        </div>
        <form class="todos-form" name="todos">
            <input type="text" placeholder="Agregar tarea" name="todo">
            <small>No has ingresado nada</small>
        </form>
        <ul class="todos-list">
        </ul>
    </div>
`;

//* LOCAL STORAGE

const saveState = (list) => {
  localStorage.setItem("list", JSON.stringify(list));
};
const loadState = () => {
  localStorage.getItem(JSON.parse("list"));
};

//?Selectores

const root = document.querySelector(".todos");
const list = root.querySelector(".todos-list"); // Esto está hecho a proposito para que el query tenga un ratio de busqueda mas acotado
const count = root.querySelector(".todos-count");
const clear = root.querySelector(".todos-clear");
const form = document.forms.todos; //Acceder con object notation es mucho mas performante que el query selector
const input = form.elements.todo; //Acceder con object notation es mucho mas performante que el query selector

let state = JSON.parse(localStorage.getItem("list")) || [];

//?HANDLERS VIEW
const renderTodos = (todos) => {
  let listString = "";
  todos.forEach((todo, index) => {
    listString += `
        <li data-id="${index}" ${todo.complete ? 'class="todo-complete"' : ""}>
            <input type="checkbox" ${todo.complete ? "checked" : ""}>
            <span>${todo.label}</span>
            <button type="button"></button>
        </li>
      `;
  });
  list.innerHTML = listString;
  clear.style.display = todos.filter((todo) => todo.complete).length
    ? "block"
    : "none";
  count.innerText = state.filter((todo) => !todo.complete).length;
};

//?HANDLERS
const addTodo = (e) => {
  e.preventDefault();
  const label = input.value.trim();
  const complete = false;
  if (label.length === 0) {
    form.classList.add("error");
    return;
  }
  form.classList.remove("error");
  state = [
    ...state,
    {
      label,
      complete,
    },
  ];

  // Copia todo el array y agrega la nueva tarea con su label y su estado complete en false

  // console.log(state);
  //RENDERIZADO DE LOS TODOS
  renderTodos(state);
  saveState(state);
  input.value = "";
};

//Update toDo
//Actualizar el complete
const updateToDo = (e) => {
  // podría poner {target} para desestructurar el evento y traerme solo el target
  console.log(e.target);
  // Busco el li padre de este checkbox que tiene el dataset con el id que necesito
  const id = Number(e.target.parentNode.dataset.id);
  const complete = e.target.checked; // Indica si la tarea ha sido completada o no
  state = state.map((toDo, index) => {
    if (index === id) {
      return { ...toDo, complete }; //Actualizamelo
    }
    return toDo; //Devolvemelo igual si no cambio el estado del checked
  });
  console.log(state);
  renderTodos(state);
  saveState(state);
};

const editToDo = ({ target }) => {
  if (target.nodeName.toLowerCase() !== "span") return;
  const id = Number(target.parentNode.dataset.id);
  const currentLabel = state[id].label;
  const input = document.createElement("input");
  input.type = "text";
  input.value = currentLabel;

  const handlerEdit = (e) => {
    e.stopPropagation();
    const label = e.target.value;
    if (label !== currentLabel) {
      state = state.map((todo, index) => {
        if (id === index) {
          return {
            ...todo,
            label,
          };
        }
        return todo;
      });
      renderTodos(state);
      saveState(state);
    }

    e.target.display = "none";
    e.target.removeEventListener("change", handlerEdit);
  };

  const handlerBlur = ({ target }) => {
    target.display = "none";
    input.remove();
    target.removeEventListener("blur", handlerEdit);
  };

  input.addEventListener("change", handlerEdit);
  input.addEventListener("blur", handlerBlur);
  target.parentNode.appendChild(input);
  input.focus(); // Para que cuando hago dobleclick ya quede habilitado para escribir
};

const deleteToDo = ({ target }) => {
  if (target.nodeName.toLowerCase() !== "button") return;
  console.log("botonazo");
  const id = Number(target.parentNode.dataset.id);

  if (
    window.confirm(
      `¿Estás seguro que deseas eliminar el elemento " ${target.previousElementSibling.innerHTML} "?`
    )
  ) {
    state = state.filter((el, index) => index !== id);
    renderTodos(state);
    saveState(state);
  }
};

const clearAll = () => {
  const completed = state.filter((todo) => todo.complete).length;
  if (completed.length === 0) return;
  if (
    window.confirm(
      "¿Esta seguro de que desea eliminar todas las tareas seleccionadas?"
    )
  ) {
    state = state.filter((todo) => !todo.complete);
    renderTodos(state);
    saveState(state);
  }
};

//?ENTRY POINT - PUNTO DE ENTRADA A LA APP ---- INICIALIZADOR

function init() {
  renderTodos(state);
  form.addEventListener("submit", addTodo);
  list.addEventListener("change", updateToDo); // se dispara cuando cambia el estado del checkbox
  list.addEventListener("click", deleteToDo);
  clear.addEventListener("click", clearAll);
  list.addEventListener("dblclick", editToDo);
}

//RUN THE APPPPPPPP!!!!!!!!! BE NUCBER!!!!
init();
