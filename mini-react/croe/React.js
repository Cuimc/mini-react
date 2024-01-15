const createTextNode = (text) => {
    return {
        type: "TEXT_ELEMENT",
        props: {
            nodeValue: text,
            children: [],
        },
    };
};

const createElement = (type, props, ...children) => {
    return {
        type,
        props: {
            ...props,
            children: children.map((child) =>
                typeof child === "string" ? createTextNode(child) : child
            ),
        },
    };
};

const render = (el, container) => {
    newxtFiberOfUtil = {
        dom: container,
        props: {
            children: [el],
        },
    };

    root = newxtFiberOfUtil;
};

/**
 * requestIdleCallback API可以获取到浏览器的空闲时间的
 * 可以利用这个api来优化渲染
 *
 * 思路：利用while来监控浏览器的空闲时间，如果空闲时间大于1，则进行dom的挂载渲染等操作，
 * 反之则递归requestIdleCallback来检测浏览器是否有空闲时间了。
 *
 * 问题：因为利用浏览器的空闲时间来渲染dom的话会出现一个问题：根据链表渲染，渲染了一半后没有空闲时间了，
 * 此时页面会卡主只显示一半的dom。
 * 解决思路：优化边创建边渲染，而是吧所有的dom都创建完成后，统一添加到根节点上去。
 */
let root = null;
let newxtFiberOfUtil = null;
function workLoop(deadline) {
    let shouldYield = false;
    while (!shouldYield && newxtFiberOfUtil) {
        newxtFiberOfUtil = preformFiberOfUtil(newxtFiberOfUtil);

        shouldYield = deadline.timeRemaining() < 1;
    }

    // 当newxtFiberOfUtil为false的时候就表示链表结束了，在此时可以执行挂载操作
    // 挂载到根节点，所以要获取到根节点，即在render中根节点
    if (!newxtFiberOfUtil && root) {
        commitRoot();
    }

    requestIdleCallback(workLoop);
}

function commitRoot() {
    commitWork(root.child);
    root = null;
}

function commitWork(fiber) {
    if (!fiber) return;
    // 这里要理解函数组件，函数组件在结构中是 先函数组件 -> 子节点（正常节点）
    // 所以这里的parent实际指向函数组件，是没有dom的
    // 因此要循环往上查找真实的parent，将函数组件的子节点添加上去。
    let fiberParent = fiber.parent;
    while (!fiberParent.dom) {
        fiberParent = fiberParent.parent;
    }
    // 由于函数组件也会在链表中，所以要判断dom是否存在，存在即渲染
    if (fiber.dom) {
        fiberParent.dom.append(fiber.dom);
    }
    commitWork(fiber.child);
    commitWork(fiber.sibling);
}

function createDom(type) {
    return type === "TEXT_ELEMENT"
        ? document.createTextNode("")
        : document.createElement(type);
}
function updateProps(props, dom) {
    Object.keys(props).forEach((key) => {
        if (key !== "children") {
            dom[key] = props[key];
        }
    });
}

// 将vdom转化成链表，设置好指针
function initChildren(fiber, children) {
    let prevChild = null; // 表示设置的上一个的子节点
    children.forEach((item, index) => {
        // 由于要链表的设计需要一个父节点来查找叔叔节点，所以需要再子节点的vdom上添加一个父节点的标识，来连接到叔叔节点上
        // 但是由于子节点（item）是我们之前设计的vdom，如果直接在vdom上设置父节点的话，就会破坏原有的结构。
        // 所以需要新创建一个对象来表达对应关系
        const newWork = {
            type: item.type,
            props: item.props,
            child: null,
            sibling: null,
            parent: fiber,
            dom: null,
        };

        if (index === 0) {
            fiber.child = newWork;
        } else {
            prevChild.sibling = newWork;
        }
        prevChild = newWork;
    });
}

function updateFunctionComponent(fiber) {
    // 此处是获取fiber的子节点们，建立链表，但由于函数组件执行后返回的节点才是子节点，所以需要进行判断并使用数组包裹
    const children = [fiber.type()];

    initChildren(fiber, children);
}

function updateHostComponent(fiber) {
    if (!fiber.dom) {
        // 1. 创建 dom、挂载dom
        const dom = (fiber.dom = createDom(fiber.type));

        // 2. 设置 props
        updateProps(fiber.props, dom);
    }

    const children = fiber.props.children;
    initChildren(fiber, children);
}

// 在有空闲时间的情况下进行dom的渲染
function preformFiberOfUtil(fiber) {
    // 判断fiber的type是否是function,是的话表示fiber是个函数组件，
    // 因为函数组件执行后本身就是dom所以不需要再创建dom
    const isFunctionComponent = typeof fiber.type === "function";
    if (isFunctionComponent) {
        updateFunctionComponent(fiber);
    } else {
        updateHostComponent(fiber);
    }

    // 4. 将下一个要执行的work返回回去
    if (fiber.child) {
        return fiber.child;
    }

    // 多层dom嵌套的情况下，要层层往上找parent的sibling
    let nextFiber = fiber;
    while (nextFiber) {
        if (nextFiber.sibling) {
            return nextFiber.sibling;
        }
        nextFiber = nextFiber.parent;
    }
}

// 需要递归work.parent，否则如果work.parent的层级嵌套过深，则只会拿到一层的sibling
// function findParent(fiber) {
//     if (!fiber.parent) {
//         return;
//     }

//     return fiber.parent?.sibling || findParent(fiber.parent);
// }

requestIdleCallback(workLoop);

const React = {
    render,
    createElement,
};

export default React;
