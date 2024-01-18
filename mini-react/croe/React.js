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
            children: children.map((child) => {
                const isTextNode =
                    typeof child === "string" || typeof child === "number";
                return isTextNode ? createTextNode(child) : child;
            }),
        },
    };
};

const render = (el, container) => {
    wipRoot = {
        dom: container,
        props: {
            children: [el],
        },
    };

    nextFiberOfUnit = wipRoot;
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
let wipRoot = null;
let currentRoot = null;
let wipFiber = null;
let nextFiberOfUnit = null;
let deletions = [];
function workLoop(deadline) {
    let shouldYield = false;
    while (!shouldYield && nextFiberOfUnit) {
        nextFiberOfUnit = preformFiberOfUnit(nextFiberOfUnit);

        /**
         * 优化：只更新组件。
         * @description 获取结束位置
         * update执行后，nextFiberOfUnit = wipRoot 的值就是要更新的组件。
         * 执行preformFiberOfUnit后会拿到下一个要更新的组件，这时将wipRoot.sibling.type 与 nextFiberOfUnit.type 进行对比
         * 如果相同则表示到了结束位置，然后将nextFiberOfUnit赋值null结束循环。
         */
        if (wipRoot?.sibling?.type === nextFiberOfUnit?.type) {
            nextFiberOfUnit = null;
        }

        shouldYield = deadline.timeRemaining() < 1;
    }

    // 当nextFiberOfUtil为false的时候就表示链表结束了，在此时可以执行挂载操作
    // 挂载到根节点，所以要获取到根节点，即在render中根节点
    if (!nextFiberOfUnit && wipRoot) {
        commitRoot();
    }

    requestIdleCallback(workLoop);
}

function commitRoot() {
    deletions.forEach(commitDeletion);
    commitWork(wipRoot.child);
    currentRoot = wipRoot;
    wipRoot = null;
    deletions = [];
}

function commitDeletion(fiber) {
    // step1.直接删除节点
    // 问题：如果是函数组件的话，函数组件的dom是null
    // 解决：需要递归查找子节点
    // fiber.parent.dom.removeChild(fiber.dom)

    // step2.递归查找子节点
    // 问题：函数组件查找到子节点后，因为函数组件dom为null，执行删除时会发现fiber.parent.dom为null，同样有问题
    // 解决：循环查找dom不为null的父节点
    // if (fiber.dom) {
    //     fiber.parent.dom.removeChild(fiber.dom);
    // } else {
    //     commitDeletion(fiber.child);
    // }

    // step3.循环查找dom不为null的父节点
    if (fiber.dom) {
        let fiberParent = fiber.parent;
        while (!fiberParent.dom) {
            fiberParent = fiberParent.parent;
        }
        fiberParent.dom.removeChild(fiber.dom);
    } else {
        commitDeletion(fiber.child);
    }
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
    // props更新：更新dom
    if (fiber.effectTag === "placement") {
        if (fiber.dom) {
            fiberParent.dom.append(fiber.dom);
        }
    } else if (fiber.effectTag === "update") {
        // 更新的话，需要旧的props和新的props
        updateProps(fiber.dom, fiber.props, fiber.alertnate?.props);
    }

    commitWork(fiber.child);
    commitWork(fiber.sibling);
}

function createDom(type) {
    return type === "TEXT_ELEMENT"
        ? document.createTextNode("")
        : document.createElement(type);
}
function updateProps(dom, nextProps, prevProps) {
    // 1. old有  new没有  删除操作
    Object.keys(prevProps).forEach((key) => {
        if (key !== "children") {
            if (!(key in nextProps)) {
                dom.removeAttribute(key);
            }
        }
    });
    // 2. new有  old没有  新增操作
    // 3. new有  old有    修改操作
    Object.keys(nextProps).forEach((key) => {
        if (key !== "children") {
            if (nextProps[key] !== prevProps[key]) {
                if (key.startsWith("on")) {
                    const eventType = key.slice("2").toLocaleLowerCase();
                    dom.removeEventListener(eventType, prevProps[key]);
                    dom.addEventListener(eventType, nextProps[key]);
                }
                dom[key] = nextProps[key];
            }
        }
    });
}

// 将vdom转化成链表，设置好指针
function reconcileChildren(fiber, children) {
    let oldFiber = fiber.alertnate?.child;
    let prevChild = null; // 表示设置的上一个的子节点
    children.forEach((item, index) => {
        // 由于要链表的设计需要一个父节点来查找叔叔节点，所以需要再子节点的vdom上添加一个父节点的标识，来连接到叔叔节点上
        // 但是由于子节点（item）是我们之前设计的vdom，如果直接在vdom上设置父节点的话，就会破坏原有的结构。
        // 所以需要新创建一个对象来表达对应关系

        // 判断标签是否相同，相同则表示更新，不相同则表示删除或新增
        const isSameTag = oldFiber && oldFiber.type === item.type;
        let newWork = null;
        if (isSameTag) {
            newWork = {
                type: item.type,
                props: item.props,
                child: null,
                sibling: null,
                parent: fiber,
                dom: oldFiber.dom, // 这里是因为更新，不牵扯dom的变化，所以使用old即可
                effectTag: "update",
                alertnate: oldFiber,
            };
        } else {
            // 添加新的节点，如果item是false，直接过
            if (item) {
                newWork = {
                    type: item.type,
                    props: item.props,
                    child: null,
                    sibling: null,
                    parent: fiber,
                    dom: null,
                    effectTag: "placement",
                };
            }

            // step1.删除老的节点
            // 问题：如果有多个子节点的话，这种方式只能删除一个
            // 解决：使用while循环查找子节点的sibling，有的话则继续删除
            // if (oldFiber) {
            //     deletions.push(oldFiber);
            // }

            // step2.循环查找子节点的sibling
            while (oldFiber) {
                deletions.push(oldFiber);
                oldFiber = oldFiber.sibling;
            }
        }

        // 如果有多个子节点的
        if (oldFiber) {
            oldFiber = oldFiber.sibling;
        }

        if (index === 0) {
            fiber.child = newWork;
        } else {
            prevChild.sibling = newWork;
        }

        // 由于child有false的情况，所以要进行一下判断
        if (newWork) {
            prevChild = newWork;
        }
    });
}

function updateFunctionComponent(fiber) {
    // console.log("fiber", fiber);
    wipFiber = fiber;
    // 此处是获取fiber的子节点们，建立链表，但由于函数组件执行后返回的节点才是子节点，所以需要进行判断并使用数组包裹
    const children = [fiber.type(fiber.props)];

    reconcileChildren(fiber, children);
}

function updateHostComponent(fiber) {
    if (!fiber.dom) {
        // 1. 创建 dom、挂载dom
        const dom = (fiber.dom = createDom(fiber.type));

        // 2. 设置 props
        updateProps(dom, fiber.props, {});
    }

    const children = fiber.props.children;
    reconcileChildren(fiber, children);
}

// 在有空闲时间的情况下进行dom的渲染
function preformFiberOfUnit(fiber) {
    // debugger;

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

// 更新props
function update() {
    let currentFiber = wipFiber;
    /**
     * 优化：只更新组件。
     * @description 获取要更新组件的起始点
     * 这里使用了闭包。在app.jsx中可以看到，当执行updateFunctionComponent时，会调用函数组件，获取到闭包函数
     * 这样就很巧妙的将currentFiber给存了起来，也就是当前函数组件的数据。
     *
     * 然后当我们执行闭包函数的时候，就会拿到要更新组件的旧dom树。
     * 重新赋值给nextFiberOfUnit后，会重新执行更新逻辑
     */
    return () => {
        wipRoot = {
            ...currentFiber,
            alertnate: currentFiber,
        };

        // 更新的时候，给nextFiberOfUtil赋值，会重新启动preformFiberOfUnit函数
        nextFiberOfUnit = wipRoot;
    };
}

const React = {
    update,
    render,
    createElement,
};

export default React;
