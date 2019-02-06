const _craft = document.getElementById("plane");
const _tips = document.getElementById("tips-container");
const _controllerContainer = document.getElementById("controller-container");
const _mapContainer = document.getElementById("map-container");
const timeForTips = 5;
let ifAnimation = false;
let enermyCount = 0;

let enermyPool = [];
let bulletPool = [];

async function gameStart() {
    bindEvent();
}


async function bindEvent() {
    await readyToStart(_tips);
    new craftController({
        _container: _controllerContainer,
        _craft: _craft
    }).init(createBullet)
    createEnermy();
}

/**
 * 敌军的工具方法，用于被调用生成敌对对象
 */
function createEnermy(time = 3000) {
    console.log("create")
    let timer = setInterval(() => {
        if (enermyPool.length < 3) {
            let temp = new EnermyObj({
                _container: _mapContainer
            })
            enermyPool.push(temp)
        } else {
            clearInterval(timer)
        }
    }, time)
}

/**
 * 子弹的工具方法，用于被调用生成子弹
 */
function createBullet(_x) {
    let temp = new BulletObj({
        // _bulletContainer,
        _mapContainer,
        _code: renderRandom(),
        _x
    });
    bulletPool.push(temp);
}
window.requestAnimationFrame(function () {
    check();
})

/**
 * 命中判定
 */
async function check() {
    for (let i = 0; i < bulletPool.length; i++) {
        for (let j = 0; j < enermyPool.length; j++) {
            if (bulletPool[i] && enermyPool[j] && bulletPool[i]["_x"] && bulletPool[i]["_y"] && enermyPool[j]["_x"] && enermyPool[j]["_y"]) {
                let standard = enermyPool[j]["size"].split("p")[0] / 2;
                let _bulletX = bulletPool[i]["_x"].split("p")[0],
                    _bulletY = bulletPool[i]["_y"].split("p")[0],
                    _enermyX = +enermyPool[j]["_x"].split("p")[0] + standard,
                    _enermyY = +enermyPool[j]["_y"].split("p")[0] + standard;
                let a = Math.abs(_bulletX - _enermyX),
                    b = Math.abs(_bulletY - _enermyY);
                if (a <= standard && b <= standard) {
                    let _life = enermyPool[j].hitted();
                    bulletPool[i].deleteSelf()
                    if (_life == 0) {
                        enermyPool[j].destroy();
                        enermyPool.splice(j, 1)
                        createEnermy(1000);
                    }
                }
            }
        }
    }
    window.requestAnimationFrame(function () {
        check();
    })
}





// 控制敌对对象
/**
 * 敌对对象
 */
class EnermyObj {
    constructor({
        _container,
        _code = renderRandom()
    }) {
        this._container = _container;
        this._code = _code;
        this._dom = null;
        this._life = undefined;
        this._horizentalFlag = 1;
        this._verticalFlag = 1;
        this._horizentalK = 10;
        this._verticalK = 8;
        this._x = 0;
        this._y = 0;
        this.size = 0;
        this.init();
    }
    async init() {
        await this.birthEnermy();
        this._dom = document.getElementById(this._code);
        this.size = window.getComputedStyle(this._dom).width;

        // window.requestAnimationFrame(this.updatePosition.bind(this))
        setInterval(() => {
            this.updatePosition();
        }, 38)
    }

    async birthEnermy() {
        return new Promise(res => {
            let _dom = document.createElement("div");
            _dom.setAttribute("class", "enermy-item");
            _dom.setAttribute("id", this._code);
            let {
                _size,
                _color,
                _life,
                _position: {
                    _left,
                    _top
                }
            } = this.getBirth();
            _dom.style.width = _size;
            _dom.style.height = _size;
            _dom.style.backgroundColor = _color;
            _dom.innerText = _life;
            _dom.style.left = _left == 100 ? `${100-_size.split("v")[0]}vw` : _left;
            _dom.style.top = _top;
            this._container.appendChild(_dom);
            this._life = _life;
            res();
        })
    }
    /**
     * 出生配置
     */
    getBirth() {
        return {
            _size: this.birthSize(),
            _color: this.birthColor(),
            _life: this.birthLife(),
            _position: this.birthPosition()
        }
    }

    /**
     * 控制对象出生时的的大小，
     * 范围：15vw～40vw
     */
    birthSize() {
        let _size = Math.round(Math.random() * 25 + 15)
        return `${_size}vw`
    }
    /**
     * 控制对象出生时的的颜色
     */
    birthColor() {
        let _r = Math.round(Math.random() * 255);
        let _g = Math.round(Math.random() * 155) + 100;
        let _b = Math.round(Math.random() * 255);
        return `rgb(${_r},${_g},${_b})`
    }
    /**
     * 控制对象出生时的血量
     * 范围：10~500
     */
    birthLife() {
        let _life = Math.round(Math.random() * 490) + 10
        return _life
    }
    /**
     * 控制对象出生时的位置
     */
    birthPosition() {
        let _flag = Math.round(Math.random() * 100)
        let _height = this._container.offsetHeight * 0.3
        let _top = Math.round(Math.random() * _height)
        if (_flag < 50) {
            // left
            this._horizentalFlag = 1
            return {
                _top: `${_top}px`,
                _left: "0vw"
            }
        } else {
            // right
            this._horizentalFlag = -1
            return {
                _top: `${_top}px`,
                _left: 100
            }
        }
    }


    updateHorizon(_left, _right) {
        return (+_left + this._horizentalFlag * this._horizentalK) + "px";
    }
    updateVertival(_top, _bottom) {
        let _nowTop = window.getComputedStyle(this._dom).top.split("p")[0],
            _standardTop = window.getComputedStyle(this._container).height.split("p")[0];
        if (_nowTop < _standardTop * 0.2 && this._verticalFlag == -1) {
            // 设置最高边界
            this._verticalFlag = 1;
            let _r = Math.round(Math.random() * 0.4) + 0.8
            this._verticalK = 10 * _r;
        }
        return (+_top + this._verticalFlag * this._verticalK) + "px";
    }


    /**
     * 更新对象的位置
     */
    updatePosition() {
        let _left = window.getComputedStyle(this._dom).left.split("p")[0],
            _top = window.getComputedStyle(this._dom).top.split("p")[0],
            _right = window.getComputedStyle(this._dom).right.split("p")[0],
            _bottom = window.getComputedStyle(this._dom).bottom.split("p")[0];
        if (_left >= 0 && _right >= 0 && _bottom >= 0 && _top >= 0) {
            this._x = this.updateHorizon(_left, _right);
            this._y = this.updateVertival(_top, _bottom);
            this._dom.style.left = this._x;
            this._dom.style.top = this._y;
        } else {
            let randomK = Math.round(Math.random() * 10),
                randomDir = Math.round(Math.random());
            if (_left < 0) {
                // 边界判断，依次进行临界值赋值，随机赋值移动系数，更改方向标志位
                this._dom.style.left = `0px`;
                if (randomK > 6) {
                    let _r = Math.round(Math.random() * 0.2) + 0.3
                    this._horizentalK *= _r;
                } else {
                    let _r = Math.round(Math.random() * 0.2) + 1
                    this._horizentalK *= _r;
                }
                if (this._horizentalK < 5) {
                    let _r = Math.round(Math.random() * 0.2) + 1.0
                    this._horizentalK = 8 * _r;
                }
                this._horizentalFlag = 1
            }
            if (_right < 0) {
                this._dom.style.left = +window.getComputedStyle(this._container).width.split("p")[0] - window.getComputedStyle(this._dom).width.split("p")[0] + "px";
                if (randomK > 6) {
                    let _r = Math.round(Math.random() * 0.2) + 0.3
                    this._horizentalK *= _r;
                } else {
                    let _r = Math.round(Math.random() * 0.2) + 1
                    this._horizentalK *= _r;
                }
                if (this._horizentalK < 5) {
                    let _r = Math.round(Math.random() * 0.2) + 1.0
                    this._horizentalK = 8 * _r;
                }
                this._horizentalFlag = -1
            }
            if (_bottom < 0) {
                this._dom.style.top = +window.getComputedStyle(this._container).height.split("p")[0] - window.getComputedStyle(this._dom).height.split("p")[0] + "px";
                if (randomK > 6) {
                    // 减速
                    let _r = Math.round(Math.random() * 0.2) + 0.3
                    this._verticalK *= _r;
                } else {
                    // 加速
                    let _r = Math.round(Math.random() * 0.2) + 1
                    this._verticalK *= _r;
                }
                if (this._verticalK < 2) {
                    // 限制最低速
                    let _r = Math.round(Math.random() * 0.2) + 1
                    this._verticalK = 10 * _r;
                }
                this._verticalFlag = -1
                if (randomDir) {
                    this._horizentalFlag = -1
                } else {
                    this._horizentalFlag = 1
                }
            }
        }

    }

    /**
     * 控制对象是否被击中
     */
    hitted() {
        this._life--;
        this._dom.innerText = this._life;
        return this._life;
    }
    /**
     * 控制对象没有生命值自我摧毁
     */
    destroy() {
        let self = this;
        this._dom.classList.add("disappear");
        this._container.removeChild(this._dom)
    }
    /**
     * 控制对象自我摧毁后进行分裂
     */
    separate() {}
}






// 子弹对象
/**
 * 子弹对象，每个子弹都是对象，需要计算其每时每刻的位置，用于判断是否击中目标
 */
class BulletObj {
    constructor({
        // _bulletContainer,
        _mapContainer,
        _code = renderRandom(),
        _x = 0
    }) {
        this._code = _code;
        this._x = `${_x}px`;
        this._y = 0;
        this.time = 60;
        this.baseTime = 10;
        this.dom = null;
        this._container = _mapContainer;
        // baseTime 基本时间，ms，time越多，basetime越低，就越精细即帧数越多
        this.init();
    }

    async init() {
        await this.appendToContainer(this._container);
        this.dom = document.getElementById(this._code);
        this.launch();
    }

    /**
     * 将dom添加进container
     */
    async appendToContainer() {
        return new Promise(res => {
            // let dom = `<span class="bullet" id=${this._code}></span>`;
            let dom = document.createElement("span");
            dom.setAttribute("class", "bullet");
            dom.setAttribute("id", this._code);
            this._container.appendChild(dom);
            res();
        })
    }

    /**
     * 在x/y轴方向上进行移动
     */
    async launch() {
        // 范围650~-30
        for (let i = 0; i <= this.time; i++) {
            setTimeout(() => {
                let _containerHeight = this._container.offsetHeight - 30;
                let _y = `${_containerHeight - (100 / this.time) * i / 100 * (_containerHeight+30)}px`;
                this._y = _y;
                this.dom.style.display = "inline-block";
                this.dom.style.top = this._y;
                this.dom.style.left = this._x;
                if (this._y == "-30px") {
                    this.deleteSelf();
                }
            }, i * this.baseTime)
        }
    }

    /**
     * 击中或超出范围的自动删除
     */
    deleteSelf() {
        if (document.getElementById(this._code)) {
            this.dom.style.display = "none"
            this._container.removeChild(this.dom)
        }
    }
}



// craft对象
/**
 * craft对象
 * _container: 控制区的dom
 * _craft: 飞机的dom
 */
class craftController {
    constructor({
        _container,
        _craft
    }) {
        this._container = _container;
        this._craft = _craft;
        this._x = 0;
        this.timer = null;
        this.fn = null;
        this._craft.style.display = "inline-block";
    }
    /**
     * 后续事件绑定方法的入口
     */
    init(fn) {
        this.fn = fn;
        this.touchStart();
    }

    /**
     * 按下事件，并在次设置interval，用于模拟保持按住的状态
     */
    touchStart() {
        this._container.addEventListener("touchstart", (e) => {
            this.ifTouchStart = true;
            e.preventDefault();
            this.craftMove();
            this.updatePosition(e);
            this.timer = setInterval(() => {
                this.fn(this._x)
            }, 60)
        })
    }

    /**
     * craft的touchmove等方法
     * touchmove只用于更新坐标
     */
    craftMove() {
        document.ontouchmove = (e) => {
            this.touchMoveCB(e)
        }
        document.addEventListener("touchend", (e) => {
            document.ontouchmove = null;
            clearInterval(this.timer)
            this.timer = null;
        })
    }

    /**
     * touchmove的回调
     */
    touchMoveCB(e) {
        this.updatePosition(e)
    }

    /**
     * 将飞机更新到鼠标点击位置
     */
    updatePosition(e) {
        let _tempX = e.targetTouches[0].clientX;
        let _width = this._craft.width / 2;
        let _moveX = _tempX - _width;
        if (_tempX >= 0 && _tempX <= this._container.offsetWidth) {
            this._x = _moveX;
            this._craft.style.left = `${this._x}px`;
        }
    }
}



// tips的方法
async function readyToStart(_dom) {
    return new Promise(resolve => {
        _dom.onclick = (e) => {
            e.preventDefault();
            if (!ifAnimation) {
                ifAnimation = true;
                tipsController(_dom, timeForTips, resolve)
            }
        };
    })
}

/** 
 * 控制tips时间的入口，也可以判断tips是否结束
 */
async function tipsController(_dom, _t, resolve) {
    await changeTips(_dom, _t);
    _dom.style.display = "none";
    resolve();
}

/**
 * 切换点击开始的文字信息，最终display:none后，开始游戏
 */
async function changeTips(_dom, _t) {
    let _final = (_t - 1) * 1200;
    return new Promise(res => {
        for (let i = 0; i < _t; i++) {
            setTimeout(() => {
                timer = i * 1200;
                let str = switchTips(i)
                new Promise(res2 => {
                    _dom.classList.remove("ready-to-start")
                    _dom.innerText = str
                    // 若是同步操作，实际上是会remove失败，即使是使用了promise，怀疑是因为间隔时间太短了，屏幕的刷新时间太长（60hz），反应前就完成了操作
                    setTimeout(() => {
                        res2()
                    }, 100)
                }).then(res2 => {
                    _dom.classList.add("ready-to-start")
                    if (timer == _final) {
                        setTimeout(() => {
                            res();
                        }, 1000)
                    }
                })
            }, i * 1200)
        }
    })
}


/**
 * 给切换tips用的工具方法
 * */
function switchTips(n) {
    switch (n) {
        case 0:
            return str = "GLHF!"
        case 1:
            return str = "3"
        case 2:
            return str = "2"
        case 3:
            return str = "1"
        case 4:
            return str = "开始"
    }
}



/**
 * 随机生成一个码
 */
function renderRandom() {
    let strArr = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"];
    let code = [];
    for (let i = 0; i < 8; i++) {
        let tempWordIndex = Math.round(Math.random() * 25)
        let tempNumber = Math.round(Math.random() * 9)
        let toUpperFlag = Math.round(Math.random() * 9)
        let numberOrWord = Math.round(Math.random())
        if (numberOrWord) {
            code.push(tempNumber)
        } else {
            if (toUpperFlag <= 5) {
                code.push(strArr[tempWordIndex].toUpperCase())
            } else {
                code.push(strArr[tempWordIndex])
            }
        }
    }
    return code.join('')
}






gameStart();