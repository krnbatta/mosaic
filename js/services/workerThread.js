// runner work tasks in the pool
class WorkerThread {
    constructor(parentPool) {
        this.parentPool = parentPool;
        this.workerTask = {};
    }
    run(workerTask) {
        this.workerTask = workerTask;
        if (this.workerTask.script != null) {
            let worker = new Worker(workerTask.script); // create a new web worker
            worker.addEventListener('message', this.dummyCallback.bind(this), false);
            worker.postMessage(workerTask.startMessage);
            this.worker = worker;
        }
    }
    // for now assume we only get a single callback from a worker
    // which also indicates the end of this worker.
    dummyCallback(event) {
        this.workerTask.callback(event); // pass to original callback
        this.parentPool.freeWorkerThread(this); // we should use a seperate thread to add the worker
    }
}

export default WorkerThread;
