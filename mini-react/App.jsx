import React from './croe/React.js'

let fooNum = 1
const Foo = () => {
    const update = React.update()
    function handleClick() {
        fooNum++
        update()
    }
    console.log("Foo")
    return (
        <div>
            foo: {fooNum}
            <button onClick={handleClick}>click</button>
        </div>
    )
}

let barNum = 1
let childNum = 1
const Bar = () => {
    const update = React.update()
    function handleClick() {
        barNum++
        update()
    }
    console.log("Bar")

    function Child() {
        const update = React.update()
        function handleClick() {
            childNum++
            update()
        }
        console.log("child")
        return (
            <div>child: {childNum} <button onClick={handleClick}>click child</button></div>
        )
    }
    return (
        <div>
            bar: {barNum}
            <Child></Child>
            <button onClick={handleClick}>click</button>
        </div>
    )
}

let appNum = 1
const App = () => {
    const update = React.update()
    function handleClick() {
        appNum++
        update()
    }
    console.log("APP")
    return (
        <div id='app'>
            hello React： {appNum}
            <button onClick={handleClick}>click</button>
            <Foo></Foo>
            <Bar></Bar>
        </div>
    )
}


export default App