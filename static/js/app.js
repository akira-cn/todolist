const removeSVG = `
  <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 22 22" style="enable-background:new 0 0 22 22;" xml:space="preserve">
    <rect width="22" height="22"/>
    <g>
      <path d="M16.1,3.6h-1.9V3.3c0-1.3-1-2.3-2.3-2.3h-1.7C8.9,1,7.8,2,7.8,3.3v0.2H5.9c-1.3,0-2.3,1-2.3,2.3v1.3c0,0.5,0.4,0.9,0.9,1v10.5c0,1.3,1,2.3,2.3,2.3h8.5c1.3,0,2.3-1,2.3-2.3V8.2c0.5-0.1,0.9-0.5,0.9-1V5.9C18.4,4.6,17.4,3.6,16.1,3.6z M9.1,3.3c0-0.6,0.5-1.1,1.1-1.1h1.7c0.6,0,1.1,0.5,1.1,1.1v0.2H9.1V3.3z M16.3,18.7c0,0.6-0.5,1.1-1.1,1.1H6.7c-0.6,0-1.1-0.5-1.1-1.1V8.2h10.6V18.7z M17.2,7H4.8V5.9c0-0.6,0.5-1.1,1.1-1.1h10.2c0.6,0,1.1,0.5,1.1,1.1V7z"/>
      <path d="M11,18c-0.4,0-0.6-0.3-0.6-0.6v-6.8c0-0.4,0.3-0.6,0.6-0.6s0.6,0.3,0.6,0.6v6.8C11.6,17.7,11.4,18,11,18z"/>
      <path d="M8,18c-0.4,0-0.6-0.3-0.6-0.6v-6.8c0-0.4,0.3-0.6,0.6-0.6c0.4,0,0.6,0.3,0.6,0.6v6.8C8.7,17.7,8.4,18,8,18z"/>
      <path d="M14,18c-0.4,0-0.6-0.3-0.6-0.6v-6.8c0-0.4,0.3-0.6,0.6-0.6c0.4,0,0.6,0.3,0.6,0.6v6.8C14.6,17.7,14.3,18,14,18z"/>
    </g>
  </svg>
`;

const completeSVG = `
  <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 22 22" style="enable-background:new 0 0 22 22;" xml:space="preserve">
    <rect y="0" width="22" height="22"/>
    <g>
      <path d="M9.7,14.4L9.7,14.4c-0.2,0-0.4-0.1-0.5-0.2l-2.7-2.7c-0.3-0.3-0.3-0.8,0-1.1s0.8-0.3,1.1,0l2.1,2.1l4.8-4.8c0.3-0.3,0.8-0.3,1.1,0s0.3,0.8,0,1.1l-5.3,5.3C10.1,14.3,9.9,14.4,9.7,14.4z"/>
    </g>
  </svg>
`;

const storageKey = 'todolist';

function createTodoItem(container, text, state = 'todo') {
  const item = document.createElement('li');
  item.className = state;
  item.innerHTML = `${text}<div class="buttons">
  <button class="remove">${removeSVG}</button><button class="complete">${completeSVG}</button>
</div>`;
  container.insertBefore(item, container.children[0]);

  const removeBtn = item.querySelector('button.remove');
  const completeBtn = item.querySelector('button.complete');

  removeBtn.addEventListener('click', () => {
    removeItem(item);
  });
  completeBtn.addEventListener('click', () => {
    if(item.className === 'todo') {
      completeItem(item);
    } else {
      uncompleteItem(item);
    }
  });

  saveItems(container);

  return item;
}

function completeItem(item) {
  const parent = item.parentNode;
  const completedItem = parent.querySelector('li.completed');
  if(completedItem) {
    parent.insertBefore(item, completedItem);
  } else {
    parent.appendChild(item);
  }
  item.className = 'completed';

  saveItems(parent);
}

function uncompleteItem(item) {
  const parent = item.parentNode;
  parent.insertBefore(item, parent.children[0]);
  item.className = 'todo';

  saveItems(parent);
}

function removeItem(item) {
  const parent = item.parentNode;
  parent.removeChild(item);

  saveItems(parent);
}

function saveItems(list) {
  const items = Array.from(list.querySelectorAll('li'));
  const data = items.map((item) => {
    return {state: item.className, text: item.innerText};
  });
  localStorage.setItem(storageKey, JSON.stringify(data));
}

function loadItems(list) {
  let data = localStorage.getItem(storageKey);
  if(data) {
    data = JSON.parse(data).reverse();
  } else {
    data = [];
  }
  data.forEach(({state, text}) => createTodoItem(list, text, state));
}

const list = document.querySelector('ul.todolist');
const addItemBtn = document.getElementById('addItem');
const itemText = document.getElementById('itemText');

loadItems(list);

addItemBtn.addEventListener('click', () => {
  const value = itemText.value;
  if(value) {
    createTodoItem(list, value);
    itemText.value = '';
    itemText.focus();
  }
});

window.addEventListener('keydown', (event) => {
  const code = event.code;
  if(code === 'Enter' || code === 'NumpadEnter') {
    addItemBtn.click();
  }
});
