const createTextNode = (text) => {
    return {
        type: "TEXT_ELEMENT",
        props: {
            nodeValue: text,
            children: [],
        },
    };
};

const createEl = (type, props, ...children) => {
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

const render = (app, container) => {
    // 创建dom节点
    const dom =
        app.type === "TEXT_ELEMENT"
            ? document.createTextNode("")
            : document.createElement(app.type);

    // 设置dom属性，props
    Object.keys(app.props).forEach((key) => {
        if (key !== "children") {
            dom[key] = app.props[key];
        }
    });

    // 渲染子节点（递归)
    app.props.children.forEach((child) => {
        render(child, container);
    });

    // 将dom节点添加到根节点上
    container.append(dom);
};

const React = {
    render,
    createEl,
};

export default React;
