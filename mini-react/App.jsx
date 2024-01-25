import React from './croe/React.js'

const Foo = () => {
    const [count, setCount] = React.useState(10)
    const [bar, setBar] = React.useState(false)
    function handleClick() {
        setCount((c) => c + 1)
        setBar(() => !bar)
    }

    React.useEffect(() => {
        console.log("init")

        return () => {
            console.log('cleanup-0')
        }
    }, [])

    React.useEffect(() => {
        console.log("init:", bar)

        return () => {
            console.log('cleanup-1')
        }
    }, [bar])

    React.useEffect(() => {
        console.log("count:", count)

        return () => {
            console.log('cleanup-2')
        }
    }, [count])

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


const Fooo = () => {
    console.log("foo")
    const [count, setCount] = React.useState(10)
    const [count2, setCount2] = React.useState(20)
    function handleClick1() {
        console.log("213")
        setCount((c) => c + 1)
    }
    function handleClick2() {
        setCount2((b) => b + "bar")
    }

    React.useEffect(() => {
        console.log('count', count)
    }, [count])

    // React.useEffect(() => {
    //     console.log('init')
    // }, [])

    return (
        <div>
            Foo: {count}
            <div>
                Foo2: {count2}
            </div>
            <button onClick={handleClick1}>click1</button>
            <button onClick={handleClick2}>click2</button>
        </div>
    )
}


// const App = () => {

//     // console.log("APP")
//     return (
//         <div id='app'>
//             hello React：
//             {/* {appNum} */}
//             <Fooo></Fooo>
//             {/* <Bar></Bar> */}
//         </div>
//     )
// }

const App = () => {
    console.log("app")
    const [num, setNum] = React.useState(12)
    function handleClick3() {
        setNum((c) => c + 1)
    }
    return (
        <div id='app'>
            hello React: {num}
            <button onClick={handleClick3}>click</button>
            <Fooo></Fooo>
        </div>
    )
}


export default App