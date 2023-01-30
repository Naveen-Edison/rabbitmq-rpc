var amqp = require('amqplib/callback_api');

amqp.connect('amqp://localhost', function(error0, connection) {
    if (error0) {
        throw error0;
    }
    connection.createChannel(function(error1, channel) {
        if (error1) {
            throw error1;
        }
        channel.assertQueue('', {
            exclusive: true
        }, function(error2, q) {
            if (error2) {
                throw error2;
            }
            var correlationId = generateUuid();
            var num = parseInt(1);


            for (var i = 0; i < 1; i++) {
                num = i;
                console.log(' [x] Requesting fib(%d)', num);

                channel.consume(q.queue, function(msg) {
                    if (msg.properties.correlationId == correlationId) {
                        console.log(' [.] Got %s', msg.content.toString());
                        setTimeout(function() {
                            connection.close();
                            process.exit(0)
                        }, 5000);
                    }
                }, {
                    noAck: true
                });

                channel.sendToQueue('rpc_queue1',
                    Buffer.from(num.toString()), {
                        correlationId: correlationId,
                        replyTo: q.queue
                    });
            }


        });
    });
});

function generateUuid() {
    return Math.random().toString() +
        Math.random().toString() +
        Math.random().toString();
}