import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { IoAdapter } from '@nestjs/platform-socket.io';

export class CustomIoAdapter extends IoAdapter {
  createIOServer(port: number, options?: any): any {
    const server = super.createIOServer(port, options);

    return server;
  }
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useWebSocketAdapter(new CustomIoAdapter(app));

  app.enableCors({
    origin: 'http://localhost:4200',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true, 
  });

  var server = require('http').Server(app);
  var io=require('socket.io')(server);

  io.on('connection',function(socket){
    console.log('A user connected');
    socket.emit('test event', 'here is some data');
  })

  server.listen(3000,()=>{
    console.log("Socket.io server is listening on port 3000");
  })

}

bootstrap();
