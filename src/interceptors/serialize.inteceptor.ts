import { CallHandler, ExecutionContext, NestInterceptor, UseInterceptors } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { map, Observable } from 'rxjs';

interface ClassConstructor {
    new (...args: any[]): {}
}

export function Serialize(dto: any) {
    return UseInterceptors(new SerializeInterceptor(dto));
}

export class SerializeInterceptor implements NestInterceptor {
  constructor(private dto: any) {}
  intercept(context: ExecutionContext, handler: CallHandler): Observable<any> {
    //run something before a request is handler
    //by the request handler
    //console.log('I am running before the handler', context);

    return handler.handle().pipe(
      map((data: any) => {
        //Run something before the response is sent out
        //console.log('I am running before response is sent out',data);
        return plainToClass(this.dto, data, {
          excludeExtraneousValues: true, //just share with expose
        });
      }),
    );
  }
}
