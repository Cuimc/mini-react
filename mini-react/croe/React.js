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
    newxtWorkOfUtil = {
        dom: container,
        props: {
            children: [el],
        },
    };

    // 创建dom节点
    // const dom =
    //     el.type === "TEXT_ELEMENT"
    //         ? document.createTextNode("")
    //         : document.createElement(el.type);

    // 设置dom属性，props
    // Object.keys(el.props).forEach((key) => {
    //     if (key !== "children") {
    //         dom[key] = el.props[key];
    //     }
    // });

    // 渲染子节点（递归)
    // el.props.children.forEach((child) => {
    //     render(child, container);
    // });

    // 将dom节点添加到根节点上
    // container.append(dom);
};

let newxtWorkOfUtil = null;
function workLoop(deadline) {
    let shouldYield = false;
    while (!shouldYield && newxtWorkOfUtil) {
        console.log("newxtWorkOfUtil111", newxtWorkOfUtil);
        newxtWorkOfUtil = preformWorkOfUtil(newxtWorkOfUtil);
        // console.log("newxtWorkOfUtil222", newxtWorkOfUtil);

        shouldYield = deadline.timeRemaining() < 1;
    }

    requestIdleCallback(workLoop);
}

function preformWorkOfUtil(work) {
    // debugger;
    if (!work.dom) {
        // 1. 创建 dom
        const dom = (work.dom =
            work.type === "TEXT_ELEMENT"
                ? document.createTextNode("")
                : document.createElement(work.type));

        work.parent.dom.append(dom);

        // 2. 设置 props
        Object.keys(work.props).forEach((key) => {
            if (key !== "children") {
                dom[key] = work.props[key];
            }
        });
    }

    // 3. 将vdom转化成链表，设置好指针
    const children = work.props.children;
    let prevChild = null; // 表示设置的上一个的子节点
    children.forEach((child, index) => {
        // 由于要链表的设计需要一个父节点来查找叔叔节点，所以需要再子节点的vdom上添加一个父节点的标识，来连接到叔叔节点上
        // 但是由于子节点（item）是我们之前设计的vdom，如果直接在vdom上设置父节点的话，就会破坏原有的结构。
        // 所以需要新创建一个对象来表达对应关系
        const newWork = {
            type: child.type,
            props: child.props,
            child: null,
            sibling: null,
            parent: work,
            dom: null,
        };

        if (index === 0) {
            work.child = newWork;
        } else {
            prevChild.sibling = newWork;
        }
        prevChild = newWork;
    });

    // 4. 将下一个要执行的work返回回去
    if (work.child) {
        return work.child;
    }

    if (work.sibling) {
        return work.sibling;
    }

    return work.parent?.sibling;
}

requestIdleCallback(workLoop);

const React = {
    render,
    createElement,
};

export default React;
