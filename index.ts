type Position = { x: number; y: number };
type Name = "blue" | "red" | "wall" | "empty" | "power" | "must";

type Metadata = {
  position: Position;
  name: Name;
};

type Pawn = {
  position: Position;
  number: 1 | 2 | 3 | 4 | 5;
  team: "red" | "blue";
};

class BoardGame {
  width: number;
  height: number;
  metadatas: Metadata[] = [];
  pawns: Pawn[] = [];
  items: { el: HTMLDivElement; position: Position }[] = [];
  editable?: boolean;

  constructor(width: number, height: number, editable?: boolean) {
    this.width = width;
    this.height = height;
    this.editable = editable;
  }

  addData(metadata: Metadata) {
    this.metadatas.push(metadata);
  }

  addPawn(pawn: Pawn) {
    this.pawns.push(pawn);
  }

  removePawn(team: "blue" | "red", n: 1 | 2 | 3 | 4 | 5) {
    this.pawns = this.pawns.filter((p) => !(p.team === team && p.number === n));
  }

  removeData(position: Position) {
    this.metadatas = this.metadatas.filter((m) => m.position !== position);
  }

  getData(position: Position): Metadata | undefined {
    for (let metadata of this.metadatas) {
      if (
        metadata.position.x === position.x &&
        metadata.position.y === position.y
      )
        return metadata;
    }
  }

  init(context: HTMLDivElement) {
    context.innerHTML = "";

    let cols: { el: HTMLDivElement; n: number }[] = [];
    let items: { el: HTMLDivElement; position: Position }[] = [];

    for (let i = 1; i <= this.width; i++) {
      let col = document.createElement("div");
      col.classList.add("col");
      col.classList.add(`col-${i}`);

      cols.push({ el: col, n: i });
    }

    for (let col of cols) {
      for (let i = 1; i <= this.height; i++) {
        let item = document.createElement("div");
        item.classList.add("item");
        item.classList.add(`item-${i}`);

        col.el.appendChild(item);
        items.push({ position: { x: col.n, y: i }, el: item });
      }

      context.appendChild(col.el);
    }

    this.metadatas.forEach((m) => {
      items.forEach((i) => {
        // console.log("Metadata:", m);
        // console.log("Item:", i);

        let isSame =
          i.position.x === m.position.x && i.position.y === m.position.y;

        if (isSame) {
          switch (m.name) {
            case "blue":
              i.el.classList.add("blue");
              break;
            case "red":
              i.el.classList.add("red");
              break;
            case "wall":
              i.el.classList.add("wall");
              break;

            case "must":
              i.el.classList.add("must");
              break;
            case "power":
              i.el.classList.add("power");
              break;
          }
        }
      });
    });

    this.items = items;
  }

  listenClick() {
    if (!this.editable) return;
    let selectColor = document.querySelector(".select-color")!;
    let state: Name = "empty";
    let states: Name[] = ["blue", "red", "wall", "empty", "must", "power"];

    selectColor.addEventListener("click", (ev) => {
      let next = states[states.indexOf(state) + 1];
      if (next) {
        selectColor.classList.remove(state);
        state = next;
      } else {
        selectColor.classList.remove(state);
        state = states[0];
      }

      selectColor.classList.add(state);
    });

    this.items.forEach((item) => {
      item.el.addEventListener("click", (ev) => {
        if (this.getData(item.position)) this.removeData(item.position);
        this.addData({ position: item.position, name: state });

        item.el.className = `item item-${item.position.y} ${state}`;
      });
    });
  }
}

let game = new BoardGame(14, 22);

let context: HTMLDivElement = document.querySelector(".context")!;

$.getJSON("backup.json", function (data) {
  for (let metadata of data) {
    game.addData(metadata);
  }

  game.init(context);
  game.listenClick();
});

if (game.editable) {
  let buttonGet: HTMLButtonElement = document.querySelector(".get")!;
  let buttonSet: HTMLButtonElement = document.querySelector(".set")!;
  let textarea = document.querySelector("textarea")!;

  buttonGet.addEventListener("click", (ev) => {
    textarea.value = JSON.stringify(game.metadatas);
  });

  buttonSet.addEventListener("click", (ev) => {
    let textarea = document.querySelector("textarea")!;
    game.metadatas = JSON.parse(textarea.value);

    game.init(context);
    game.listenClick();
  });
}
