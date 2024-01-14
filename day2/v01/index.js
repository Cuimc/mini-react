// 基于requestIdleCallback实现一个任务调度器
// window.requestIdleCallback() 方法插入一个函数，这个函数将在浏览器空闲时期被调用。
// 使用while来重复检测是否有空闲时间，然后递归调用调度器
let taskId = 1;
function workLoop(deadline) {
    let shouldYield = false;
    while (!shouldYield) {
        taskId++;

        console.log(`taskId:${taskId}`);
        shouldYield = deadline.timeRemaining() < 1;
    }

    requestIdleCallback(workLoop);
}

requestIdleCallback(workLoop);
