// step-1: 使用原生js的方法去创建dom节点
// const dom = document.createElement('div');
// dom.id = 'app'
// document.getElementById('root').append(dom);

// const textNode = document.createTextNode('');
// textNode.nodeValue = 'Hello World!';
// dom.append(textNode);

// step-2: 使用Vdom的方式去创建dom节点
// const textEl = {
//     type: 'TEXT_ELEMENT',
//     props: {
//         nodeValue: 'Hello World!',
//         children: []
//     }
// }

// const el = {
//     type: 'div',
//     props: {
//         id: 'app',
//         children: [textEl]
//     }
// }

// const dom = document.createElement(el.type);
// dom.id = el.props.id;
// document.getElementById('root').append(dom);

// const textNode = document.createTextNode('');
// textNode.nodeValue = textEl.props.nodeValue;
// dom.append(textNode);

// step-3: Vdom动态生成
// const createTextNode = (text) => {
//     return {
//         type: 'TEXT_ELEMENT',
//         props: {
//             nodeValue: text,
//             children: []
//         }
//     }
// }

// const createEl = (type, props, ...children) => {
//     return {
//         type,
//         props: {
//             ...props,
//             children
//         }
//     }
// }

// const textEl = createTextNode('Hello World!');
// const el = createEl('div', {id: 'app'}, textEl);

// const dom = document.createElement(el.type);
// dom.id = el.props.id;
// document.getElementById('root').append(dom);

// const textNode = document.createTextNode('');
// textNode.nodeValue = textEl.props.nodeValue;
// dom.append(textNode);

// step-4: 使用render函数渲染dom
// const createTextNode = (text) => {
//     return {
//         type: 'TEXT_ELEMENT',
//         props: {
//             nodeValue: text,
//             children: []
//         }
//     }
// }

// const createEl = (type, props, ...children) => {
//     return {
//         type,
//         props: {
//             ...props,
//             children: children.map(child => typeof child === 'string' ? createTextNode(child) : child)
//         }
//     }
// }

// const render = (app, container) => {
//     // 创建dom节点
//     const dom = app.type === 'TEXT_ELEMENT' 
//         ? document.createTextNode('') 
//         : document.createElement(app.type)

//     // 设置dom属性，props
//     Object.keys(app.props).forEach(key => {
//         if(key !== 'children'){
//             dom[key] = app.props[key]
//         }
//     })

//     // 渲染子节点（递归)
//     app.props.children.forEach(child => {
//         render(child, dom)
//     })

//     // 将dom节点添加到根节点上
//     container.append(dom)
// }

// const App = createEl('div', {id: 'app'}, 'Hello World! ', 'react');
// render(App, document.getElementById('root'))

// step-5: 使用ReactDom.render()渲染dom
import ReactDom from './croe/ReactDom.js';
import App from './App.js';

ReactDom.creatRoot(document.getElementById('root')).render(App)


