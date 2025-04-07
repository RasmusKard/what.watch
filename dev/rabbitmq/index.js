import { connect } from "amqplib";

const connection = await connect("amqp://rabbitmq", (err0, conn) => {
  if (err0) throw err0;

  conn.createChannel((err1, channel) => {
    if (err1) throw err1;

    const queue = "hello";
    const msg = "hello word";

    channel.assertQueue(queue, { durable: false });

    channel.sendToQueue(queue, Buffer.from(msg));
    console.log(" [x] Sent %s", msg);
  });
});
