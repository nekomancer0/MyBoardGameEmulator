var BoardGame = /** @class */ (function () {
    function BoardGame(width, height, editable) {
        this.metadatas = [];
        this.pawns = [];
        this.items = [];
        this.width = width;
        this.height = height;
        this.editable = editable;
    }
    BoardGame.prototype.addData = function (metadata) {
        this.metadatas.push(metadata);
    };
    BoardGame.prototype.addPawn = function (pawn) {
        this.pawns.push(pawn);
    };
    BoardGame.prototype.removePawn = function (team, n) {
        this.pawns = this.pawns.filter(function (p) { return !(p.team === team && p.number === n); });
    };
    BoardGame.prototype.removeData = function (position) {
        this.metadatas = this.metadatas.filter(function (m) { return m.position !== position; });
    };
    BoardGame.prototype.getData = function (position) {
        for (var _i = 0, _a = this.metadatas; _i < _a.length; _i++) {
            var metadata = _a[_i];
            if (metadata.position.x === position.x &&
                metadata.position.y === position.y)
                return metadata;
        }
    };
    BoardGame.prototype.init = function (context) {
        context.innerHTML = "";
        var cols = [];
        var items = [];
        for (var i = 1; i <= this.width; i++) {
            var col = document.createElement("div");
            col.classList.add("col");
            col.classList.add("col-".concat(i));
            cols.push({ el: col, n: i });
        }
        for (var _i = 0, cols_1 = cols; _i < cols_1.length; _i++) {
            var col = cols_1[_i];
            for (var i = 1; i <= this.height; i++) {
                var item = document.createElement("div");
                item.classList.add("item");
                item.classList.add("item-".concat(i));
                col.el.appendChild(item);
                items.push({ position: { x: col.n, y: i }, el: item });
            }
            context.appendChild(col.el);
        }
        this.metadatas.forEach(function (m) {
            items.forEach(function (i) {
                // console.log("Metadata:", m);
                // console.log("Item:", i);
                var isSame = i.position.x === m.position.x && i.position.y === m.position.y;
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
    };
    BoardGame.prototype.listenClick = function () {
        var _this = this;
        if (!this.editable)
            return;
        var selectColor = document.querySelector(".select-color");
        var state = "empty";
        var states = ["blue", "red", "wall", "empty", "must", "power"];
        selectColor.addEventListener("click", function (ev) {
            var next = states[states.indexOf(state) + 1];
            if (next) {
                selectColor.classList.remove(state);
                state = next;
            }
            else {
                selectColor.classList.remove(state);
                state = states[0];
            }
            selectColor.classList.add(state);
        });
        this.items.forEach(function (item) {
            item.el.addEventListener("click", function (ev) {
                if (_this.getData(item.position))
                    _this.removeData(item.position);
                _this.addData({ position: item.position, name: state });
                item.el.className = "item item-".concat(item.position.y, " ").concat(state);
            });
        });
    };
    return BoardGame;
}());
var game = new BoardGame(14, 22);
var context = document.querySelector(".context");
$.getJSON("backup.json", function (data) {
    for (var _i = 0, data_1 = data; _i < data_1.length; _i++) {
        var metadata = data_1[_i];
        game.addData(metadata);
    }
    game.init(context);
    game.listenClick();
});
if (game.editable) {
    var buttonGet = document.querySelector(".get");
    var buttonSet = document.querySelector(".set");
    var textarea_1 = document.querySelector("textarea");
    buttonGet.addEventListener("click", function (ev) {
        textarea_1.value = JSON.stringify(game.metadatas);
    });
    buttonSet.addEventListener("click", function (ev) {
        var textarea = document.querySelector("textarea");
        game.metadatas = JSON.parse(textarea.value);
        game.init(context);
        game.listenClick();
    });
}
