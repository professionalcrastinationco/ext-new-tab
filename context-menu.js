// Context Menu Class
class ContextMenu {
  constructor({ target = null, menuItems = [], mode = "dark" }) {
    this.target = target;
    this.menuItems = menuItems;
    this.mode = mode;
    this.targetNode = this.getTargetNode();
    this.menuItemsNode = this.getMenuItemsNode();
    this.isOpened = false;
  }

  getTargetNode() {
    const nodes = document.querySelectorAll(this.target);

    if (nodes && nodes.length !== 0) {
      return nodes;
    } else {
      console.error(`getTargetNode :: "${this.target}" target not found`);
      return [];
    }
  }

  getMenuItemsNode() {
    const nodes = [];

    if (!this.menuItems) {
      console.error("getMenuItemsNode :: Please enter menu items");
      return [];
    }

    this.menuItems.forEach((data, index) => {
      const item = this.createItemMarkup(data);
      item.firstChild.setAttribute(
        "style",
        `animation-delay: ${index * 0.08}s`
      );
      nodes.push(item);
    });

    return nodes;
  }

  createItemMarkup(data) {
    const button = document.createElement("BUTTON");
    const item = document.createElement("LI");

    button.innerHTML = data.content;
    button.classList.add("contextMenu-button");
    item.classList.add("contextMenu-item");

    if (data.divider) item.setAttribute("data-divider", data.divider);
    item.appendChild(button);

    if (data.events && data.events.length !== 0) {
      Object.entries(data.events).forEach((event) => {
        const [key, value] = event;
        button.addEventListener(key, value);
      });
    }

    return item;
  }

  renderMenu() {
    const menuContainer = document.createElement("UL");

    menuContainer.classList.add("contextMenu");
    menuContainer.setAttribute("data-theme", this.mode);

    this.menuItemsNode.forEach((item) => menuContainer.appendChild(item));

    return menuContainer;
  }

  closeMenu(menu) {
    if (this.isOpened) {
      this.isOpened = false;
      menu.remove();
    }
  }

  init() {
    const contextMenu = this.renderMenu();
    document.addEventListener("click", () => this.closeMenu(contextMenu));
    window.addEventListener("blur", () => this.closeMenu(contextMenu));
    document.addEventListener("contextmenu", (e) => {
      this.targetNode.forEach((target) => {
        if (!e.target.contains(target)) {
          contextMenu.remove();
        }
      });
    });

    this.targetNode.forEach((target) => {
      target.addEventListener("contextmenu", (e) => {
        e.preventDefault();
        this.isOpened = true;

        const { clientX, clientY } = e;
        document.body.appendChild(contextMenu);

        const positionY =
          clientY + contextMenu.scrollHeight >= window.innerHeight
            ? window.innerHeight - contextMenu.scrollHeight - 20
            : clientY;
        const positionX =
          clientX + contextMenu.scrollWidth >= window.innerWidth
            ? window.innerWidth - contextMenu.scrollWidth - 20
            : clientX;

        contextMenu.setAttribute(
          "style",
          `--width: ${contextMenu.scrollWidth}px;
          --height: ${contextMenu.scrollHeight}px;
          --top: ${positionY}px;
          --left: ${positionX}px;`
        );
      });
    });
  }
}

// Dynamic context menu for elements
function createDynamicContextMenu(element, menuItems, mode = "dark") {
  const contextMenu = document.createElement("UL");
  contextMenu.classList.add("contextMenu");
  contextMenu.setAttribute("data-theme", mode);

  menuItems.forEach((data, index) => {
    const button = document.createElement("BUTTON");
    const item = document.createElement("LI");

    button.innerHTML = data.content;
    button.classList.add("contextMenu-button");
    button.setAttribute("style", `animation-delay: ${index * 0.08}s`);
    item.classList.add("contextMenu-item");

    if (data.divider) item.setAttribute("data-divider", data.divider);
    item.appendChild(button);

    if (data.events) {
      Object.entries(data.events).forEach(([key, value]) => {
        button.addEventListener(key, value);
      });
    }

    contextMenu.appendChild(item);
  });

  return contextMenu;
}

function showContextMenu(e, menuItems, mode = "dark") {
  e.preventDefault();
  e.stopPropagation();

  // Remove any existing context menus
  document.querySelectorAll('.contextMenu').forEach(menu => menu.remove());

  const contextMenu = createDynamicContextMenu(e.target, menuItems, mode);
  document.body.appendChild(contextMenu);

  const { clientX, clientY } = e;

  const positionY =
    clientY + contextMenu.scrollHeight >= window.innerHeight
      ? window.innerHeight - contextMenu.scrollHeight - 20
      : clientY;
  const positionX =
    clientX + contextMenu.scrollWidth >= window.innerWidth
      ? window.innerWidth - contextMenu.scrollWidth - 20
      : clientX;

  contextMenu.setAttribute(
    "style",
    `--width: ${contextMenu.scrollWidth}px;
    --height: ${contextMenu.scrollHeight}px;
    --top: ${positionY}px;
    --left: ${positionX}px;`
  );

  // Close menu on click or blur
  const closeMenu = () => {
    contextMenu.remove();
    document.removeEventListener("click", closeMenu);
    window.removeEventListener("blur", closeMenu);
  };

  setTimeout(() => {
    document.addEventListener("click", closeMenu);
    window.addEventListener("blur", closeMenu);
  }, 100);
}
