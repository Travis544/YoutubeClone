import { Message, PubSub } from '@google-cloud/pubsub';

class TopicSubscriber {
    pubSubClient: PubSub
    constructor() {
        this.pubSubClient = new PubSub({ keyFilename: 'key.json' })
    }

    async subscribeTo(topicNameOrId: string, subscriptionNameOrId: string, callback: (message: Message) => void) {
        // Creates a new subscription
        const subscription = this.pubSubClient
            .topic(topicNameOrId).subscription(subscriptionNameOrId)
        console.log(`Subscription ${subscriptionNameOrId} created.`);
        subscription.on('message', callback);
    }
}

export default TopicSubscriber