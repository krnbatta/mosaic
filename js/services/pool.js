import WorkerThread from './workerThread';
import WorkerTask from './workerTask';

let instance = null;
class Pool {
    constructor() {
        if (!instance) {
            instance = this;
            this.taskQueue = []; //tasks queue
            this.workerQueue = []; //workers queue
            this.poolSize = navigator.hardwareConcurrency || 4; //set pool size equal to no of cores, if navigator object available or 4.
        }
        return instance;
    }
    createWorkerTask(script, callback, msg) {
        return new WorkerTask(script, callback, msg);
    }
    addWorkerTask(script, callback, msg) {
        let workerTask = this.createWorkerTask(script, callback, msg);
        if (this.workerQueue.length > 0) {
            var workerThread = this.workerQueue.shift(); // get the worker from the front of the queue
            workerThread.run(workerTask);
        } else {
            this.taskQueue.push(workerTask); // no free workers
        }
    }
    init() {
        for (var i = 0; i < this.poolSize; i++) { // create 'poolSize' number of worker threads
            this.workerQueue.push(new WorkerThread(this));
        }
        return this;
    }
    freeWorkerThread(workerThread) {
        if (this.taskQueue.length > 0) {
            var workerTask = this.taskQueue.shift(); // don't put back in queue, but execute next task
            workerThread.run(workerTask);
        } else {
            workerThread.worker.terminate(); //terminate worker if no task at hand
            this.workerQueue.unshift(workerThread);
        }
    }
}

let pool = (new Pool()).init();
export default pool;
