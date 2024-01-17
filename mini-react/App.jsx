import React from './croe/React.js'

let num = 1
let id = "id1"
function Counter() {
    function handleClick() {
        num++
        React.update()
    }
    return (
        <div id={id}>
            组件函数: {num}
            <button onClick={handleClick}>click</button>
        </div>
    )
}

const App = () => {
    return (
        <div id='app'>
            hello React
            <Counter></Counter>
        </div>
    )
}


export default App