
import { parentPort, workerData } from 'worker_threads';
import { BoundedActorCritic } from './bounded-a2c-ddp-system.js';

const { workerId, config, model } = workerData;

// Initialize worker model
const actorCritic = BoundedActorCritic.deserialize(model);

// Worker training loop
async function trainWorker(experiences) {
    try {
        const trainingResult = await actorCritic.train(experiences);
        
        parentPort.postMessage({
            type: 'training_complete',
            workerId,
            result: trainingResult,
            gradients: extractGradients(actorCritic),
            complexity: actorCritic.getComplexityScore()
        });
    } catch (error) {
        parentPort.postMessage({
            type: 'training_error',
            workerId,
            error: error.message
        });
    }
}

// Extract gradients for synchronization
function extractGradients(model) {
    return {
        actor: model.actor.serialize(),
        critic: model.critic.serialize()
    };
}

// Handle messages from main thread
parentPort.on('message', (message) => {
    switch (message.type) {
        case 'train':
            trainWorker(message.experiences);
            break;
        case 'sync_model':
            Object.assign(actorCritic, BoundedActorCritic.deserialize(message.model));
            parentPort.postMessage({ type: 'sync_complete', workerId });
            break;
        case 'shutdown':
            process.exit(0);
            break;
    }
});

// Signal initialization complete
parentPort.postMessage({ type: 'initialized', workerId });
