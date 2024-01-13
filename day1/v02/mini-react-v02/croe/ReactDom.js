import React from './React.js';

const ReactDom = {
    creatRoot: (container) => {
        return {
            render(app){
                React.render(app, container)
            }
        }
    }
}

export default ReactDom