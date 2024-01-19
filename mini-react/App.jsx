import React from './croe/React.js'

const Foo = () => {
    const [count, setCount] = React.useState(10)
    const [bar, setBar] = React.useState(false)
    function handleClick() {
        setCount((c) => c + 1)
        setBar(() => !bar)
    }

    return (
        <div>
            {count}
            <div>
                {bar ? 'true' : 'false'}
            </div>
            {/* <div>{num}</div> */}
            <button onClick={handleClick}>click</button>
        </div>
    )
}

const Bar = () => {
    const [bar, setBar] = React.useState('bar')
    function handleClick() {
        setBar(() => bar + 'bar')
    }

    return (
        <div>
            bar: {bar}
            <button onClick={handleClick}>click</button>
        </div>
    )
}


const App = () => {


    // console.log("APP")
    return (
        <div id='app'>
            hello React：
            {/* {appNum} */}
            <Foo></Foo>
            {/* <Bar></Bar> */}
        </div>
    )
}


export default App