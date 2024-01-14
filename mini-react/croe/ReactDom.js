import React from "./React.js";

const ReactDom = {
    creatRoot: (container) => {
        return {
            render(el) {
                React.render(el, container);
            },
        };
    },
};

export default ReactDom;
