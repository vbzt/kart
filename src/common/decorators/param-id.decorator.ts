import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export const ParamId = createParamDecorator(( args: string | undefined, context: ExecutionContext) => {
  const req = context.switchToHttp().getRequest()
  const id = req.params.id
  return id 
})